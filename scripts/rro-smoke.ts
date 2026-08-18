/**
 * Smoke test for the rent repayment order arithmetic.
 *
 * Run with `npx tsx scripts/rro-smoke.ts`. It asserts rather than prints, so a
 * regression in the cap, the utilities deduction or the award band fails loudly
 * instead of quietly changing what a tenant is told their claim is worth.
 */
import { estimateRro, gbp, AWARD_BAND, RRO_FACTS } from "../src/lib/rro";

let failures = 0;
function check(label: string, actual: unknown, expected: unknown) {
  const ok = actual === expected;
  if (!ok) failures++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}  got=${String(actual)} want=${String(expected)}`);
}

// The 24-month cap bites, and the cut is visible.
const over = estimateRro({ monthlyRent: 1200, utilitiesPerMonth: 150, monthsUnlicensed: 30 });
check("cap applied", over.capMonths, RRO_FACTS.maxMonths);
check("claimable months capped at 24", over.claimableMonths, 24);
check("months removed by cap reported", over.monthsCapped, 6);
check("gross rent = 1200 x 24", over.grossRent, 28800);
check("utilities deducted = 150 x 24", over.utilitiesDeducted, 3600);
check("rent after utilities", over.rentAfterUtilities, 25200);
check("low = 40% of net", over.low, 25200 * AWARD_BAND.low);
check("high = 75% of net", over.high, 25200 * AWARD_BAND.high);

// The naive figure this whole module exists to avoid publishing.
check("naive 30-month figure is NOT what we show", over.high === 1200 * 30, false);

// Pre-uplift offences keep the 12-month cap.
const pre = estimateRro({ monthlyRent: 900, monthsUnlicensed: 20, offenceEndedBeforeUplift: true });
check("pre-uplift cap is 12", pre.capMonths, RRO_FACTS.maxMonthsBeforeUplift);
check("pre-uplift claimable months", pre.claimableMonths, 12);
check("pre-uplift net", pre.rentAfterUtilities, 10800);

// Utilities can never exceed the rent and produce a negative claim.
const silly = estimateRro({ monthlyRent: 900, utilitiesPerMonth: 1000, monthsUnlicensed: 12 });
check("utilities clamped to rent", silly.rentAfterUtilities, 0);
check("no negative award", silly.low, 0);

// Garbage in, zero out, flagged incomplete rather than rendered.
for (const [label, input] of [
  ["negative rent", { monthlyRent: -500, monthsUnlicensed: 12 }],
  ["zero months", { monthlyRent: 1200, monthsUnlicensed: 0 }],
  ["NaN", { monthlyRent: NaN, monthsUnlicensed: NaN }],
] as const) {
  check(`${label} flagged incomplete`, estimateRro(input).incomplete, true);
}

// Formatting is whole pounds, as tribunal decisions state awards.
check("gbp rounds to whole pounds", gbp(25199.6), "£25,200");

console.log(failures === 0 ? "\nAll RRO checks passed." : `\n${failures} RRO check(s) FAILED.`);
process.exit(failures === 0 ? 0 : 1);
