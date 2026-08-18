/**
 * Rent Repayment Orders: the facts, and the arithmetic the tribunal actually does.
 *
 * This is the engine behind the tenant side of the site, so every figure here
 * is sourced and every one of them is deliberately conservative.
 *
 * The trap this file exists to avoid: a Rent Repayment Order is capped at 24
 * months' rent, so it is very easy to build a calculator that tells a tenant on
 * £1,500 a month they can claim £36,000. Tribunals do not award that. The
 * Upper Tribunal set out the method in Acheampong v Roman [2022] UKUT 239 (LC):
 * take the whole rent for the relevant period, deduct the part that paid for
 * utilities the tenant alone consumed, then apply a percentage reflecting the
 * seriousness of the offence, then adjust for the section 44(4) factors. In
 * Acheampong itself the result was 75% of rent-after-utilities, and awards for
 * straightforward licensing breaches are commonly reported below that.
 *
 * So we publish a band, never a single maximum figure, and we show the working.
 * A tenant who reads "you could claim £36,000" and receives £9,000 was misled
 * by us; a tenant who reads "£8,000 to £15,000, here is how that is worked out"
 * was not.
 */

export interface RroSource {
  label: string;
  url: string;
}

/**
 * The statutory frame. Each entry is supported by the sources listed below and
 * none of it is inferred.
 */
export const RRO_FACTS = {
  /** Housing and Planning Act 2016 s.44 to s.45, as amended by the Renters'
   *  Rights Act 2025 for offences committed on or after 1 May 2026. */
  maxMonths: 24,
  /** The pre-uplift cap, which still governs an offence that ENDED before the
   *  uplift date. Getting this wrong doubles the number we show a tenant. */
  maxMonthsBeforeUplift: 12,
  upliftDate: "2026-05-01",
  /** Housing and Planning Act 2016 s.41: an occupier must apply within two
   *  years of the offence. For a continuing offence, the last date it was
   *  committed must fall inside that window. */
  applicationWindowMonths: 24,
  /** Housing and Planning Act 2016 s.43. The criminal standard, in a civil
   *  tribunal, which is precisely why evidence of the designation matters. */
  standardOfProof: "beyond reasonable doubt",
  /** The tribunal may make an order without any conviction or civil penalty
   *  having been imposed first. */
  convictionRequired: false,
  applicationForm: "RRO1",
  tribunal: "First-tier Tribunal (Property Chamber), Residential Property",
} as const;

/**
 * The offences a rent repayment order can be made for.
 *
 * Housing and Planning Act 2016 s.40(3) as amended. The two marked
 * `licensingOffence` are the ones the PRSCheck determination engine speaks to.
 * The rest are listed because a tenant needs the whole list to know whether
 * they have a different claim, and because implying our two are the only two
 * would be its own kind of false claim.
 */
export const RRO_OFFENCES: {
  offence: string;
  statute: string;
  licensingOffence: boolean;
}[] = [
  { offence: "Control or management of an unlicensed HMO", statute: "Housing Act 2004 s.72(1)", licensingOffence: true },
  { offence: "Control or management of an unlicensed house (selective licensing)", statute: "Housing Act 2004 s.95(1)", licensingOffence: true },
  { offence: "Eviction or harassment of an occupier", statute: "Protection from Eviction Act 1977 s.1", licensingOffence: false },
  { offence: "Using or threatening violence to secure entry", statute: "Criminal Law Act 1977 s.6", licensingOffence: false },
  { offence: "Failure to comply with an improvement notice", statute: "Housing Act 2004 s.30", licensingOffence: false },
  { offence: "Failure to comply with a prohibition order", statute: "Housing Act 2004 s.32", licensingOffence: false },
  { offence: "Breach of a banning order", statute: "Housing and Planning Act 2016 s.21", licensingOffence: false },
  { offence: "Knowingly or recklessly misusing a ground for possession", statute: "Housing Act 1988 s.16J(1)", licensingOffence: false },
  { offence: "Breach of the re-letting and re-marketing restrictions", statute: "Housing Act 1988 s.16J(2)", licensingOffence: false },
  { offence: "Continuing breach of the tenancy reform provisions", statute: "Housing Act 1988 s.16J(3)", licensingOffence: false },
];

/**
 * The defences that stop a licensing offence being an offence at all.
 *
 * These belong on the tenant pages prominently, not buried. A tenant who spends
 * the tribunal fee on a claim against a landlord with a pending licence
 * application has been failed by us, and a landlord reading the same fact needs
 * to know the route out exists.
 */
export const RRO_DEFENCES: { defence: string; statute: string; detail: string }[] = [
  {
    defence: "A licence application was already in",
    statute: "Housing Act 2004 s.72(4), s.95(3)",
    detail:
      "No offence is committed if an application for a licence had been duly made and was still effective, or a temporary exemption notice was in force, for the whole of the period complained about.",
  },
  {
    defence: "Reasonable excuse",
    statute: "Housing Act 2004 s.72(5), s.95(4)",
    detail:
      "It is a defence that the landlord had a reasonable excuse for the property being unlicensed. The tribunal decides what counts, and simply not knowing about the scheme has repeatedly failed as an excuse.",
  },
];

/**
 * What the tribunal must weigh when fixing the amount.
 * Housing and Planning Act 2016 s.44(4).
 */
export const RRO_SECTION_44_FACTORS: string[] = [
  "The conduct of the landlord and of the tenant",
  "The financial circumstances of the landlord",
  "Whether the landlord has ever been convicted of an offence to which the rent repayment order provisions apply",
];

export const RRO_SOURCES: RroSource[] = [
  { label: "Rent Repayment Orders: guidance for tenants (GOV.UK)", url: "https://www.gov.uk/guidance/rent-repayment-orders-guidance-for-tenants" },
  { label: "Apply for a rent repayment order: Form RRO1 (GOV.UK)", url: "https://www.gov.uk/government/publications/apply-for-a-rent-repayment-order-form-rro1" },
  { label: "Housing and Planning Act 2016, Chapter 4 (rent repayment orders)", url: "https://www.legislation.gov.uk/ukpga/2016/22/part/2/chapter/4" },
  { label: "Housing Act 2004 s.72 (unlicensed HMO offence)", url: "https://www.legislation.gov.uk/ukpga/2004/34/section/72" },
  { label: "Housing Act 2004 s.95 (unlicensed house offence)", url: "https://www.legislation.gov.uk/ukpga/2004/34/section/95" },
  { label: "Acheampong v Roman [2022] UKUT 239 (LC)", url: "https://www.bailii.org/uk/cases/UKUT/LC/2022/239.html" },
];

/**
 * The award band, as percentages of rent after the utilities deduction.
 *
 * Not invented. `high` is the percentage the Upper Tribunal itself arrived at
 * in Acheampong for an unlicensed HMO; `low` and `typical` sit inside the range
 * commonly reported for straightforward licensing breaches. We show low to high
 * and label `typical` as a midpoint, never as a prediction, because section
 * 44(4) means the real answer turns on facts about the landlord we do not hold.
 */
export const AWARD_BAND = { low: 0.4, typical: 0.6, high: 0.75 } as const;

export interface RroInput {
  /** Rent actually paid, per month, by the applicant. */
  monthlyRent: number;
  /** The part of that rent covering utilities the tenant alone consumed. */
  utilitiesPerMonth?: number;
  /** How many months the property was let unlicensed while they lived there. */
  monthsUnlicensed: number;
  /**
   * True where the unlicensed period ENDED before 1 May 2026, which keeps the
   * old 12-month cap. A period still running on or after that date takes 24.
   */
  offenceEndedBeforeUplift?: boolean;
}

export interface RroEstimate {
  /** The cap that applies, in months: 24, or 12 for a pre-uplift offence. */
  capMonths: number;
  /** Months actually claimable: the unlicensed period, capped. */
  claimableMonths: number;
  /** Months the tenant entered that the cap removed, so the cut is visible. */
  monthsCapped: number;
  /** Rent paid across the claimable months. */
  grossRent: number;
  /** The Acheampong step 2 deduction. */
  utilitiesDeducted: number;
  /** Step 2 result: the figure the percentage is applied to. */
  rentAfterUtilities: number;
  /** The statutory ceiling. Shown, but never as "what you will get". */
  statutoryMaximum: number;
  low: number;
  typical: number;
  high: number;
  /** True when the inputs are too incomplete to estimate anything. */
  incomplete: boolean;
}

const round = (n: number) => Math.round(n * 100) / 100;

/**
 * Estimate a rent repayment order using the Acheampong v Roman method.
 *
 * Deliberately returns a band. There is no honest single number: section 44(4)
 * turns the final figure on the landlord's conduct, finances and record, none
 * of which a postcode and a rent can tell us.
 */
export function estimateRro(input: RroInput): RroEstimate {
  const rent = Number.isFinite(input.monthlyRent) ? Math.max(0, input.monthlyRent) : 0;
  const utilities = Number.isFinite(input.utilitiesPerMonth ?? 0) ? Math.max(0, input.utilitiesPerMonth ?? 0) : 0;
  const months = Number.isFinite(input.monthsUnlicensed) ? Math.max(0, Math.floor(input.monthsUnlicensed)) : 0;

  const capMonths = input.offenceEndedBeforeUplift ? RRO_FACTS.maxMonthsBeforeUplift : RRO_FACTS.maxMonths;
  const claimableMonths = Math.min(months, capMonths);
  const monthsCapped = Math.max(0, months - claimableMonths);

  // Utilities cannot exceed the rent: a tenant who enters £900 rent and £1,000
  // of utilities should see zero, not a negative claim presented as a credit.
  const netMonthly = Math.max(0, rent - Math.min(utilities, rent));

  const grossRent = round(rent * claimableMonths);
  const rentAfterUtilities = round(netMonthly * claimableMonths);
  const utilitiesDeducted = round(grossRent - rentAfterUtilities);

  return {
    capMonths,
    claimableMonths,
    monthsCapped,
    grossRent,
    utilitiesDeducted,
    rentAfterUtilities,
    statutoryMaximum: rentAfterUtilities,
    low: round(rentAfterUtilities * AWARD_BAND.low),
    typical: round(rentAfterUtilities * AWARD_BAND.typical),
    high: round(rentAfterUtilities * AWARD_BAND.high),
    incomplete: rent <= 0 || claimableMonths <= 0,
  };
}

/** Whole pounds, which is how every tribunal decision states an award. */
export function gbp(n: number): string {
  return `£${Math.round(n).toLocaleString("en-GB")}`;
}

/**
 * Whether a nation's tenants have the rent repayment order route at all.
 *
 * The Housing Act 2004 licensing offences extend to England and Wales only
 * (s.270(11)), and national-rules.json records the 24-month uplift as
 * England-only, with Wales at 12. Scotland and Northern Ireland have neither
 * the licensing offences nor the order, so a tenant there must not be shown a
 * claim they cannot make.
 */
export function rroAvailable(nation: string): boolean {
  return nation === "england" || nation === "wales";
}

/**
 * The cap for a nation, read from the licensing engine's own penalty summary
 * rather than assumed to be 24.
 *
 * Passed in rather than imported so this module stays free of the licensing
 * dataset and can be unit-reasoned about on its own.
 */
export function capMonthsForNation(rroMonthsFromPenalties: number): number {
  return rroMonthsFromPenalties > 0 ? rroMonthsFromPenalties : 0;
}
