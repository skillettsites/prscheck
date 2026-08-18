import Stripe from "stripe";
import { copyFor, type Audience } from "@/lib/audience";

let stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripe) {
    const key = (process.env.STRIPE_SECRET_KEY ?? "").replace(/\\n$/, "").trim();
    if (!key) throw new Error("STRIPE_SECRET_KEY not configured");
    stripe = new Stripe(key);
  }
  return stripe;
}

/**
 * Price and naming for a checkout, by audience.
 *
 * Reads from the audience module so there is exactly one place a price lives.
 * The old single-product constants are kept below because the landlord product
 * is unchanged and other code imports them.
 */
export function productFor(audience: Audience): { pricePence: number; name: string; description: string } {
  const c = copyFor(audience);
  return { pricePence: c.pricePence, name: c.productName, description: c.productDescription };
}

export const LICENCE_CHECK_PRICE_PENCE = copyFor("landlord").pricePence;
export const LICENCE_CHECK_NAME = copyFor("landlord").productName;
export const LICENCE_CHECK_DESCRIPTION = copyFor("landlord").productDescription;

export const RRO_REPORT_PRICE_PENCE = copyFor("tenant").pricePence;
export const RRO_REPORT_NAME = copyFor("tenant").productName;
