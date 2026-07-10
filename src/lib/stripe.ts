import Stripe from "stripe";

let stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripe) {
    const key = (process.env.STRIPE_SECRET_KEY ?? "").replace(/\\n$/, "").trim();
    if (!key) throw new Error("STRIPE_SECRET_KEY not configured");
    stripe = new Stripe(key);
  }
  return stripe;
}

export const LICENCE_CHECK_PRICE_PENCE = 999;
export const LICENCE_CHECK_NAME = "Landlord Licence Check";
export const LICENCE_CHECK_DESCRIPTION =
  "Property-specific licensing determination: selective, additional and mandatory HMO licensing, scheme dates and fees, penalty exposure, and an action plan. Delivered instantly with a permanent link.";
