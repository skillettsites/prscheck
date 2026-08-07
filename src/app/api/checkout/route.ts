import { NextRequest, NextResponse } from "next/server";
import { getStripe, LICENCE_CHECK_PRICE_PENCE, LICENCE_CHECK_NAME, LICENCE_CHECK_DESCRIPTION } from "@/lib/stripe";
import { getCouncilByGss, hasCouncilLicensingPowers } from "@/lib/licensing";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const origin = req.headers.get("origin") || "https://prscheck.co.uk";

    const postcode = String(body.postcode ?? "").trim().toUpperCase();
    const address = String(body.address ?? "").trim();
    const gss = String(body.gss ?? "").trim();
    const ward = String(body.ward ?? "").trim();
    // From the address picker. Resolves street-level designations, which are
    // ~35 of the live schemes and cannot be answered from a postcode alone.
    const street = String(body.street ?? "").trim();
    // Provenance of that street. Only "os" is authoritative enough to rule a
    // designation out; anything else is whitelisted away so a spoofed value
    // cannot turn a guess into a confident "no licence needed".
    const rawSource = String(body.streetSource ?? "").trim();
    const streetSource = rawSource === "os" || rawSource === "epc" ? rawSource : "";
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
