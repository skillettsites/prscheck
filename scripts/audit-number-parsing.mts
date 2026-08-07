/**
 * Audit how the house-number matcher reads every restriction in the dataset.
 *
 * A silent mis-parse is the most dangerous defect in this product: it turns a
 * designated property into a confident "not in a designated area". This walks
 * every street entry that carries a restriction, parses it, and flags the two
 * shapes that indicate a misread rather than a genuine restriction:
 *
 *  - the council's text names BOTH parities but every parsed range came out
 *    with the same one, which means a parity word was attributed to the wrong
 *    span;
 *  - the text is unparseable, which is safe but worth counting.
 *
 * Run with: npx tsx scripts/audit-number-parsing.mts
 */
import { SCHEMES, parseNumberRanges, numberInDesignation } from "../src/lib/licensing";

let withNumbers = 0;
let unparseable = 0;
let bothParitiesNamed = 0;
let suspectSingleParity = 0;
let coveredNumbers = 0;
const suspects: string[] = [];

for (const council of SCHEMES) {
  for (const scheme of council.schemes ?? []) {
    if (scheme.status !== "active" && scheme.status !== "upcoming") continue;
    for (const street of scheme.streets ?? []) {
      if (!street.numbers) continue;
      withNumbers++;
      const text = street.numbers.toLowerCase();
      const ranges = parseNumberRanges(street.numbers);
      if (!ranges) {
        unparseable++;
        continue;
      }
      // Count how many house numbers the parse actually admits, so a regression
      // that quietly narrows coverage shows up as a falling number.
      for (const r of ranges) {
        if (r.to === Number.MAX_SAFE_INTEGER) continue;
        for (let n = r.from; n <= r.to; n++) {
          if (r.parity === "all" || (n % 2 === 0 ? "even" : "odd") === r.parity) coveredNumbers++;
        }
      }
      const namesOdd = /\bodds?\b/.test(text);
      const namesEven = /\bevens?\b/.test(text);
      if (!namesOdd || !namesEven) continue;
      bothParitiesNamed++;
      const parities = new Set(ranges.map((r) => r.parity));
      if (parities.size === 1 && !parities.has("all")) {
        suspectSingleParity++;
        if (suspects.length < 10) suspects.push(`${council.council}: "${street.name}" ${JSON.stringify(street.numbers)}`);
      }
    }
  }
}

console.log(`street entries carrying a house-number restriction: ${withNumbers}`);
console.log(`  unparseable, so answered "check with the council": ${unparseable}`);
console.log(`  council text names BOTH odd and even:              ${bothParitiesNamed}`);
console.log(`  ...of which parsed to a SINGLE parity (a misread): ${suspectSingleParity}`);
console.log(`house numbers admitted by the parse in total:        ${coveredNumbers.toLocaleString()}`);

if (suspects.length) {
  console.log("\nSuspect entries:");
  for (const s of suspects) console.log(`  ${s}`);
}

// Spot-check the exact cases the review found broken, end to end.
const REGRESSIONS: Array<[string, string, boolean]> = [
  ["1 - 103 Odd (Incl) 2 - 100 Even (Incl)", "50", true],
  ["24 - 96 Even (Incl) 79 - 97 Odd (Incl)", "50", true],
  ["168-392a evens & 223-257 odds", "200", true],
  ["1 to 42 (odds/evens)", "20", true],
  ["44 1-10 DELLA ROBBIA HOUSE", "44", true],
];
let ok = 0;
for (const [numbers, house, expected] of REGRESSIONS) {
  if (numberInDesignation(numbers, house) === expected) ok++;
  else console.log(`REGRESSION: ${numbers} / ${house}`);
}
console.log(`\nreview regression cases passing: ${ok}/${REGRESSIONS.length}`);
if (suspectSingleParity > 0 || ok < REGRESSIONS.length) process.exit(1);
