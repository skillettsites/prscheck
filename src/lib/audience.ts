/**
 * Who the visitor is, and what that changes.
 *
 * PRSCheck answers one question, "is this property licensed", for two people
 * with opposite interests in the answer. The landlord wants to be compliant and
 * is buying certainty plus an action plan. The tenant wants to know whether
 * their landlord committed an offence, and is buying evidence for a claim worth
 * thousands. Same determination engine, same dataset, two products.
 *
 * Kept as a tiny module rather than scattered conditionals because the audience
 * decides pricing, copy, the report shape, the email and the schema, and those
 * were previously going to drift apart the moment one of them was edited.
 */

export type Audience = "landlord" | "tenant";

export const AUDIENCES: Audience[] = ["landlord", "tenant"];

/** Whitelisting parse. Anything unrecognised is a landlord, which is the
 *  existing behaviour and the cheaper product, so a bad value never upsells. */
export function parseAudience(v: unknown): Audience {
  return v === "tenant" ? "tenant" : "landlord";
}

export interface AudienceCopy {
  audience: Audience;
  /** Product name on the Stripe line item and the report header. */
  productName: string;
  pricePence: number;
  priceLabel: string;
  /** Stripe line-item description prefix. */
  productDescription: string;
  /** The question the visitor arrived with, in their own words. */
  question: string;
  /** The button that starts checkout. */
  cta: string;
  /** Hub page for this audience. */
  hub: string;
  /** The check page, pre-set to this audience. */
  checkHref: string;
}

export const LANDLORD: AudienceCopy = {
  audience: "landlord",
  productName: "Landlord Licence Check",
  pricePence: 799,
  priceLabel: "£7.99",
  productDescription:
    "Property-specific licensing determination: selective, additional and mandatory HMO licensing, scheme dates and fees, penalty exposure, and an action plan. Delivered instantly with a permanent link.",
  question: "Does my rental property need a licence?",
  cta: "Get my licence report",
  hub: "/landlords",
  checkHref: "/check",
};

export const TENANT: AudienceCopy = {
  audience: "tenant",
  productName: "Rent Repayment Order Evidence Report",
  // £29, not £7.99. The landlord is buying an answer they could eventually get
  // free from the council; the tenant is buying dated, sourced evidence for a
  // tribunal claim that has to be proved beyond reasonable doubt and is
  // typically worth thousands. Pricing them the same undersold the tenant
  // report and told the buyer it was worth as little as a postcode lookup.
  pricePence: 2900,
  priceLabel: "£29",
  productDescription:
    "Evidence pack for a Rent Repayment Order: whether the property required a licence, the council designation it falls under with dates and source, your claim calculated on the Acheampong v Roman method, and the Form RRO1 route. Delivered instantly with a permanent link.",
  question: "Should my home have been licensed, and can I claim my rent back?",
  cta: "Get my evidence report",
  hub: "/tenants",
  checkHref: "/check?for=tenant",
};

export function copyFor(audience: Audience): AudienceCopy {
  return audience === "tenant" ? TENANT : LANDLORD;
}
