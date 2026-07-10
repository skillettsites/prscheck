import { NextRequest, NextResponse } from "next/server";
import { getStripe, LICENCE_CHECK_PRICE_PENCE, LICENCE_CHECK_NAME, LICENCE_CHECK_DESCRIPTION } from "@/lib/stripe";
import { getCouncilByGss } from "@/lib/licensing";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const origin = req.headers.get("origin") || "https://prscheck.co.uk";

    const postcode = String(body.postcode ?? "").trim().toUpperCase();
    const address = String(body.address ?? "").trim();
    const gss = String(body.gss ?? "").trim();
    const ward = String(body.ward ?? "").trim();
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
    // Wales/Scotland/NI use national registration regimes with a deterministic
    // answer we give away free. Only England has per-council schemes worth paying for.
    if (council.nation !== "england") {
      return NextResponse.json({ error: "england_only" }, { status: 400 });
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
