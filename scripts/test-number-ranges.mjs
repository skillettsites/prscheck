/**
 * Checks the house-number matcher against restriction text taken verbatim from
 * real council designation schedules, including their typos.
 *
 * This exists because the dangerous failure here is silent: a mis-parsed range
 * turns into a confident "no licence needed" for a landlord who needs one.
 * Run with: node scripts/test-number-ranges.mjs
 */

// Mirror of the parser in src/lib/licensing.ts. Kept in step by this test:
// if you change the parser, change it here and the cases below must still pass.
function parseNumberRanges(text) {
  if (!text) return null;
  const t = String(text).toLowerCase().replace(/[‐-―]/g, "-");
  if (/@|https?:|\b\d{5,}\b|\b(contact|email|e-mail|phone|call|enquir|telephone)\b/.test(t)) return null;
  const ranges = [];
  for (const clause of t.split(/[,;]|\sand\s/)) {
    const parity = /\bodds?\b/.test(clause) ? "odd" : /\bevens?\b/.test(clause) ? "even" : "all";
    const spanRe = /([0-9]+)[a-z]?\s*(?:to|-|–)\s*([0-9]+)[a-z]?/g;
    let m;
    let matchedSpan = false;
    while ((m = spanRe.exec(clause)) !== null) {
      matchedSpan = true;
      const a = parseInt(m[1], 10);
      const b = parseInt(m[2], 10);
      ranges.push({ from: Math.min(a, b), to: Math.max(a, b), parity });
    }
    if (matchedSpan) continue;
    const bareRe = /\b([0-9]+)[a-z]?\b/g;
    while ((m = bareRe.exec(clause)) !== null) {
      const n = parseInt(m[1], 10);
      ranges.push({ from: n, to: n, parity: "all" });
    }
  }
  return ranges.length > 0 ? ranges : null;
}

function houseNumberValue(s) {
  if (!s) return null;
  const m = String(s).trim().match(/^([0-9]+)/);
  if (!m) return null;
  const n = parseInt(m[1], 10);
  return Number.isFinite(n) ? n : null;
}

function numberInDesignation(numbers, houseNumber) {
  const n = houseNumberValue(houseNumber);
  if (n === null) return null;
  const ranges = parseNumberRanges(numbers);
  if (!ranges) return null;
  const parity = n % 2 === 0 ? "even" : "odd";
  return ranges.some((r) => n >= r.from && n <= r.to && (r.parity === "all" || r.parity === parity));
}

// [restriction text, house number, expected verdict]
// null means "cannot tell", which the engine must surface as check-with-council.
const CASES = [
  // Manchester, verbatim including the council's own typos and missing spaces
  ["433ato 519 (odd)", "433a", true],
  ["433ato 519 (odd)", "519", true],
  ["433ato 519 (odd)", "521", false],
  ["433ato 519 (odd)", "434", false, "even number inside the span is still outside an odds designation"],
  ["12 to 80(even)", "80", true],
  ["12 to 80(even)", "13", false],
  ["12 to 80(even)", "82", false],
  ["2 to 2", "2", true],
  ["2 to 2", "4", false],
  ["173a to 147 (odd)", "151", true, "council wrote the range backwards"],
  ["1-160 (All)", "37", true],
  ["1-160 (All)", "161", false],

  // Sefton, multi-clause with named buildings mixed in
  ["Edith Villas, Oxford House, Sefton Villas, Numbers 7-23 Odds, 20-48 Evens", "21", true],
  ["Edith Villas, Oxford House, Sefton Villas, Numbers 7-23 Odds, 20-48 Evens", "48", true],
  ["Edith Villas, Oxford House, Sefton Villas, Numbers 7-23 Odds, 20-48 Evens", "25", false],
  ["Edith Villas, Oxford House, Sefton Villas, Numbers 7-23 Odds, 20-48 Evens", "22", true],
  ["Numbers 1-41 Odds, 2-60 Evens", "43", false, "complements the additional-scheme range on the same street"],
  ["Numbers 43-187 Odds, 62-160 Evens", "43", true],

  // Scarborough
  ["just 2a, 2b and 2c evens", "2a", true],
  ["just 2a, 2b and 2c evens", "4", false],
  ["1 to 6", "6", true],
  ["1 to 6", "7", false],

  // Leicester, verbatim: two spans of OPPOSITE parity joined by "and", plus the
  // council's own stray hyphen. Reading one parity for the whole string would
  // tell number 2 of a designated street that it is outside the scheme.
  ["1 -3 odd and 2 - 4 - even", "2", true],
  ["1 -3 odd and 2 - 4 - even", "3", true],
  ["1 -3 odd and 2 - 4 - even", "6", false],
  ["1 -3 odd and 2 - 4 - even", "5", false],
  ["11 -61 odd and 94 - 96 even", "94", true],
  ["11 -61 odd and 94 - 96 even", "61", true],
  ["11 -61 odd and 94 - 96 even", "62", false],

  // Must refuse to answer: instructions, not schedules
  ["email landlord.licensing@salford.gov.uk to check", "12", null],
  ["Contact the council on 0161 234 5000 to confirm", "12", null],
  ["See the map at https://example.gov.uk/map", "12", null],
  ["Including flats, suffixed and sub-addresses", "12", null],
  ["flats included", "12", null],

  // Must refuse to answer: no usable house number
  ["1-160 (All)", "Rose Cottage", null],
  ["1-160 (All)", null, null],
  ["1-160 (All)", "", null],
];

let pass = 0;
const failures = [];
for (const [numbers, house, expected, note] of CASES) {
  const got = numberInDesignation(numbers, house);
  if (got === expected) pass++;
  else failures.push({ numbers, house, expected, got, note });
}

console.log(`${pass}/${CASES.length} passed`);
if (failures.length) {
  console.log("\nFAILURES:");
  for (const f of failures) {
    console.log(`  numbers=${JSON.stringify(f.numbers)} house=${JSON.stringify(f.house)}`);
    console.log(`    expected ${f.expected}, got ${f.got}${f.note ? ` (${f.note})` : ""}`);
  }
  process.exit(1);
}
