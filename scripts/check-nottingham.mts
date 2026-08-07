/**
 * Spot-check that Nottingham's licence register actually improves answers.
 *
 * Nottingham publishes no street or postcode list for its designated area, so
 * its genuinely partial wards could only ever answer "check the boundary". The
 * register of licences ISSUED is not the boundary, but a postcode where the
 * council has already granted selective licences is strong evidence, so it
 * supports "likely required" and nothing stronger.
 */
import { determine, SCHEMES } from "../src/lib/licensing";

const scheme = SCHEMES.find((c) => c.gss === "E06000018")?.schemes?.find((s) => s.licensedPostcodes?.length);
const sample = scheme?.licensedPostcodes ?? [];
console.log(`licensed-register postcodes held: ${sample.length}`);
console.log(`sample: ${sample.slice(0, 5).join(", ")}\n`);

const CASES: Array<[string, string | null, string]> = [
  // A ward the council grades as fully covered: definite, no postcode needed.
  ["Radford", null, "ward the council places wholly inside"],
  // A ward absent from the statutory notice: definite no.
  ["Bilborough", null, "ward absent from the statutory notice"],
  // A genuinely partial ward, WITHOUT a register hit: must still hedge.
  ["Meadows", "NG2 9ZZ", "partial ward, postcode not in the register"],
  // A genuinely partial ward, WITH a register hit: should now say likely.
  ["Meadows", sample[0] ?? null, "partial ward, postcode IS in the register"],
];

for (const [ward, postcode, why] of CASES) {
  const d = determine("E06000018", { occupants: 2, households: 1, wardName: ward, postcode });
  const verdicts = (d?.selective ?? []).map((a) => a.verdict);
  console.log(`${ward.padEnd(12)} ${String(postcode ?? "-").padEnd(10)} -> ${verdicts.join(", ") || "none"}   (${why})`);
}
