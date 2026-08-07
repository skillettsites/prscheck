/**
 * Checks the house-number matcher against restriction text taken verbatim from
 * real council designation schedules, including their typos.
 *
 * The dangerous failure here is silent: a mis-parsed range becomes a confident
 * "no licence needed" for a landlord who needs one.
 *
 * This imports the REAL parser rather than mirroring it. An earlier version kept
 * its own copy, which is how the whitespace-separated parity bug stayed green in
 * tests while failing on live data for thousands of properties. A test that
 * mirrors the code under test only proves the mirror is self-consistent.
 *
 * Run with: npx tsx scripts/test-number-ranges.mts
 */
import { numberInDesignation } from "../src/lib/licensing";

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

  // Councils separate opposite-parity ranges with WHITESPACE, not punctuation.
  // Reading one parity for the whole string stamped "odd" onto the even range
  // and told 2,739 designated properties they were outside their scheme.
  ["1 - 103 Odd (Incl) 2 - 100 Even (Incl)", "50", true, "Burnley Reed Street, even inside the even span"],
  ["1 - 103 Odd (Incl) 2 - 100 Even (Incl)", "51", true, "odd inside the odd span"],
  ["1 - 103 Odd (Incl) 2 - 100 Even (Incl)", "105", false, "past both spans"],
  ["1 - 103 Odd (Incl) 2 - 100 Even (Incl)", "102", false, "even past the even span"],
  ["24 - 96 Even (Incl) 79 - 97 Odd (Incl)", "50", true, "Burnley Plumbe Street"],
  ["24 - 96 Even (Incl) 79 - 97 Odd (Incl)", "81", true],
  ["24 - 96 Even (Incl) 79 - 97 Odd (Incl)", "23", false],
  ["168-392a evens & 223-257 odds", "200", true, "Burnley Colne Road, ampersand separator"],
  ["168-392a evens & 223-257 odds", "225", true],
  ["168-392a evens & 223-257 odds", "201", false, "odd, but outside the odd span"],

  // "(odds/evens)" is an explicit instruction to include BOTH. Matching "odds"
  // first read it as odd-only and excluded every even property on the street.
  ["1 to 42 (odds/evens)", "20", true, "Manchester Ben Street"],
  ["1 to 42 (odds/evens)", "21", true],
  ["1 to 42 (odds/evens)", "44", false],
  ["1 to 42 (odd and even)", "20", true],

  // A standalone number alongside a span names one exact house and must survive.
  ["44 1-10 DELLA ROBBIA HOUSE", "44", true, "Wirral Clifton Road, 44 is the address the entry names"],
  ["44 1-10 DELLA ROBBIA HOUSE", "5", true, "inside the span"],
  ["44 1-10 DELLA ROBBIA HOUSE", "46", false],
  ["1, 1a, 3 (odd) 44 to 156 (even)", "3", true, "Burnley New Hall Street"],
  ["1, 1a, 3 (odd) 44 to 156 (even)", "44", true],
  ["1, 1a, 3 (odd) 44 to 156 (even)", "156", true],
  ["1, 1a, 3 (odd) 44 to 156 (even)", "45", false, "odd inside the even-only span"],
  ["11- 39 (odds) 22 and 40", "22", true, "Burnley Bivel Street"],
  ["11- 39 (odds) 22 and 40", "40", true],
  ["11- 39 (odds) 22 and 40", "13", true],
  ["1 to 119 (odd) 4, 22 to 38, 42 to 132 (even)", "4", true, "Burnley Brougham Street"],
  ["1 to 119 (odd) 4, 22 to 38, 42 to 132 (even)", "119", true],

  // Salford writes the parity BEFORE its span. An unbounded forward look reads
  // the NEXT clause's parity word and stamps it on this range.
  ["odds 77 to 119, evens 34 to 182", "79", true, "Salford Barton Lane, odd in the odd span"],
  ["odds 77 to 119, evens 34 to 182", "34", true, "even in the even span"],
  // 78 is even and inside 34-182, so it IS covered. An earlier expectation of
  // false here was my error, not the parser's.
  ["odds 77 to 119, evens 34 to 182", "78", true, "even inside the even span"],
  ["odds 77 to 119, evens 34 to 182", "184", false, "even past the even span"],
  ["odds 77 to 119, evens 34 to 182", "35", false, "odd below the odd span, wrong parity for the even one"],
  ["odds 77 to 119, evens 34 to 182", "121", false, "odd past the odd span"],
  ["odds 1-69, evens 2-44", "3", true, "Salford Trafford Road"],
  ["odds 1-69, evens 2-44", "44", true],
  ["odds 1-69, evens 2-44", "46", false],

  // Council text too mangled to read must refuse rather than pick one reading.
  ["2, to 16, 34 to 72 to 104, 112 to 124", "8", null, "dangling and chained 'to'"],
  ["to 16", "8", null],

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

/** [restriction text, house number, expected verdict, optional note] */
type Case = [string, string | null, boolean | null, string?];

let pass = 0;
const failures: Array<{ numbers: string; house: string | null; expected: boolean | null; got: boolean | null; note?: string }> = [];
for (const [numbers, house, expected, note] of CASES as Case[]) {
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
