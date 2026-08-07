import { NextRequest, NextResponse } from "next/server";
import { getStripe, LICENCE_CHECK_PRICE_PENCE, LICENCE_CHECK_NAME, LICENCE_CHECK_DESCRIPTION } from "@/lib/stripe";
import { getCouncilByGss, hasCouncilLicensingPowers } from "@/lib/licensing";

export const runtime = "nodejs";

/**
 * Re-derive the council and ward from the postcode, server-side.
 *
 * Returns null if the lookup is unavailable, in which case the caller falls back
 * to what the client sent. That is deliberate: postcodes.io being briefly down
 * should not stop someone buying a report, and every other guard (council must
 * exist in our data, nation must have licensing powers) still applies.
 */
async function resolveFromPostcode(postcode: string): Promise<{ gss: string; ward: string | null } | null> {
  try {
    const res = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(postcode)}`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      result?: { codes?: { admin_district?: string }; admin_ward?: string | null };
    };
    const gss = json.result?.codes?.admin_district;
    if (!gss) return null;
    return { gss, ward: json.result?.admin_ward ?? null };
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const origin = req.headers.get("origin") || "https://prscheck.co.uk";

    const postcode = String(body.postcode ?? "").trim().toUpperCase();
    const address = String(body.address ?? "").trim();
    // The council and ward the client claims. Both are re-derived from the
    // postcode below and only used as a fallback, because a mismatched pair
    // would produce a paid report whose verdict is for one council while the
    // postcode printed at the top of it belongs to another.
    const claimedGss = String(body.gss ?? "").trim();
    const claimedWard = String(body.ward ?? "").trim();
    // From the address picker. Resolves street-level designations, which are
    // ~35 of the live schemes and cannot be answered from a postcode alone.
    const street = String(body.street ?? "").trim();
    // Provenance of that street. Whitelisted here so a spoofed value cannot
    // promote a guessed street into one trusted to rule a designation out.
    const rawSource = String(body.streetSource ?? "").trim();
    const streetSource =
      rawSource === "os" || rawSource === "epc-numbered" || rawSource === "epc-derived" ? rawSource : "";
    // House number. Manchester designates entirely by number range, so without
    // this the answer there can never be better than "check your house number".
    const houseNumber = String(body.houseNumber ?? "").trim().slice(0, 12);
    // Postcode centroid, for testing against councils' own published
    // designation boundaries. Range-checked to the UK rather than trusted, so a
    // malformed or spoofed coordinate cannot land a property inside a polygon.
    const latRaw = Number(body.latitude);
    const lonRaw = Number(body.longitude);
    const inUk = Number.isFinite(latRaw) && Number.isFinite(lonRaw) && latRaw >= 49 && latRaw <= 61 && lonRaw >= -9 && lonRaw <= 2;
    const latitude = inUk ? latRaw : null;
    const longitude = inUk ? lonRaw : null;
    const occupants = Number(body.occupants ?? 0);
    const households = Number(body.households ?? 0);
    const attribution = (body.attribution ?? {}) as Record<string, string>;

    if (!postcode) return NextResponse.json({ error: "postcode_required" }, { status: 400 });
    if (!occupants || occupants < 1 || occupants > 50) {
      return NextResponse.json({ error: "occupants_required" }, { status: 400 });
    }
    if (!households || households < 1 || households > occupants) {
      return NextResponse.json({ error: "households_invalid" }, { status: 400 });
    }
    // Resolve the council and ward from the postcode ourselves rather than
    // trusting what the browser sent. Everything else about the property is
    // already validated or whitelisted server-side, but the council decided the
    // whole answer while arriving unchecked.
    const resolved = await resolveFromPostcode(postcode);
    const gss = resolved?.gss || claimedGss;
    const ward = resolved?.ward ?? claimedWard;

    const council = getCouncilByGss(gss);
    if (!council) return NextResponse.json({ error: "council_unknown" }, { status: 400 });
    // Scotland and NI have no council licensing powers at all (Housing Act 2004
    // s.270(11)), so their answer is deterministic and we give it away free.
    // Wales does have them, and nine of its twenty-two councils run live
    // schemes, several county-wide, so a Welsh property-specific report is worth
    // exactly what an English one is. Selling England only meant showing a Welsh
    // landlord a real scheme answer and then refusing to complete the job.
    if (!hasCouncilLicensingPowers(council.nation)) {
      return NextResponse.json({ error: "unsupported_nation" }, { status: 400 });
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      allow_promotion_codes: true,
      line_items: [
        {
          price_data: {
            currency: "gbp",
            unit_amount: LICENCE_CHECK_PRICE_PENCE,
            product_data: {
              name: LICENCE_CHECK_NAME,
              description: `${address ? address + ", " : ""}${postcode} (${council.name})`,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        product: "licence_check",
        postcode,
        address,
        gss,
        ward,
        // The street resolves street-level designations, which a postcode
        // cannot. Carried through Stripe metadata so the report can use it,
        // with its provenance, since an unsourced street may only confirm a
        // designation and never rule one out.
        street: street || "",
        street_source: streetSource,
        house_number: houseNumber,
        lat: latitude === null ? "" : String(latitude),
        lon: longitude === null ? "" : String(longitude),
        occupants: String(occupants),
        households: String(households),
        utm_source: attribution.utm_source ?? "",
        utm_medium: attribution.utm_medium ?? "",
        utm_campaign: attribution.utm_campaign ?? "",
        referrer_source: attribution.referrer_source ?? "",
        landing_page: attribution.landing_page ?? "",
      },
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/check?postcode=${encodeURIComponent(postcode)}&checkout=cancelled`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("checkout error", err);
    return NextResponse.json({ error: "checkout_failed" }, { status: 500 });
  }
}
