/**
 * End-to-end checks of `determine()` against the real merged street schedules.
 *
 * Every case below uses a street and house number taken from a council's actual
 * published designation, so these fail if the data, the parser, or the
 * provenance gating regresses.
 *
 * Run with: npx tsx scripts/test-street-determination.mts
 */
import { determine, SCHEMES } from "../src/lib/licensing";

type Verdict = "required" | "likely-required" | "check-boundary" | "not-in-area" | "upcoming";

interface Case {
  what: string;
  gss: string;
  street: string;
  houseNumber: string | null;
  streetSource: "os" | "epc-numbered" | "epc-derived" | "manual";
  /** Expected verdict on the SELECTIVE scheme whose schedule names this street. */
  expect: Verdict;
}

// Pull a real designated street + range straight out of the merged data so the
// cases cannot drift away from what we actually shipped.
function firstStreetWithNumbers(gss: string): { name: string; numbers: string } | null {
  const c = SCHEMES.find((s) => s.gss === gss);
  for (const sc of c?.schemes ?? []) {
    for (const st of sc.streets ?? []) {
      if (st.numbers) return { name: st.name, numbers: st.numbers };
    }
  }
  return null;
}

const manchester = firstStreetWithNumbers("E08000003");
console.log(`Manchester sample designation: ${manchester?.name} -> ${manchester?.numbers}\n`);

const CASES: Case[] = [
  // Sefton Bootle: whole-street designations, so the number is irrelevant.
  {
    what: "Sefton, designated street, numbered address",
    gss: "E08000014",
    street: "Aintree Road",
    houseNumber: "12",
    streetSource: "epc-numbered",
    expect: "required",
  },
  {
    what: "Sefton, street not designated, numbered address gives a definite no",
    gss: "E08000014",
    street: "Nonexistent Avenue",
    houseNumber: "12",
    streetSource: "epc-numbered",
    expect: "not-in-area",
  },
  {
    what: "Sefton, street not designated, but the street name was a guess (Rose Cottage case)",
    gss: "E08000014",
    street: "Nonexistent Avenue",
    houseNumber: null,
    streetSource: "epc-derived",
    expect: "check-boundary",
  },
  // Ashfield: the council's schedule misspells Priestsic Road as "Preistsic Road".
  {
    what: "Ashfield, correctly spelled street vs the council's typo, must not assert a no",
    gss: "E07000170",
    street: "Priestsic Road",
    houseNumber: "20",
    streetSource: "os",
    expect: "check-boundary",
  },
  // North Yorkshire: compound entry "Durham Street and Place" was split at ingest.
  {
    what: "Scarborough, street recovered from a split compound entry",
    gss: "E06000065",
    street: "Durham Place",
    houseNumber: "3",
    streetSource: "epc-numbered",
    expect: "required",
  },
];

/**
 * Cases for the area-level answers: postcode lists, ward-level certainty inside
 * a map-drawn designation, derived ward lists, and indicative street lists.
 * Each one exists because getting it wrong produces a confident wrong answer.
 */
interface AreaCase {
  what: string;
  gss: string;
  postcode?: string | null;
  wardName?: string | null;
  street?: string | null;
  houseNumber?: string | null;
  streetSource?: "os" | "epc-numbered" | "epc-derived" | "manual";
  latitude?: number | null;
  longitude?: number | null;
  expect: Verdict;
}

const AREA_CASES: AreaCase[] = [
  {
    what: "County Durham, designated postcode",
    gss: "E06000047",
    postcode: "DH2 1BP",
    expect: "required",
  },
  {
    what: "County Durham, postcode the council says straddles the boundary, must not answer yes or no",
    gss: "E06000047",
    postcode: "DH2 2DP",
    expect: "check-boundary",
  },
  {
    what: "Nottingham, ward the council places wholly inside a map-drawn designation",
    gss: "E06000018",
    wardName: "Radford",
    expect: "required",
  },
  {
    what: "Nottingham, ward absent from the statutory notice, so wholly outside",
    gss: "E06000018",
    wardName: "Bilborough",
    expect: "not-in-area",
  },
  {
    what: "Nottingham, genuinely partial ward must still hedge",
    gss: "E06000018",
    wardName: "Meadows",
    expect: "check-boundary",
  },
  {
    what: "Liverpool, ward inside the derived list",
    gss: "E08000012",
    wardName: "Anfield",
    expect: "likely-required",
  },
  {
    what: "Liverpool, ward outside a GEOMETRY-DERIVED list must never be a definite no",
    gss: "E08000012",
    wardName: "Penny Lane",
    expect: "check-boundary",
  },
  {
    what: "Newcastle, a PARTIAL street schedule must not override a matching ward list",
    gss: "E08000021",
    // The 2021 designation names 3 wards but only 5 streets, because only one of
    // its three sub-areas publishes a schedule. Trusting the schedule turned
    // "your ward is designated" into a confident no, so supplying MORE
    // information about the property made its answer worse.
    wardName: "Byker",
    street: "Raby Street",
    houseNumber: "10",
    streetSource: "os",
    expect: "likely-required",
  },
  {
    what: "Liverpool, coordinate inside the council's own published boundary",
    gss: "E08000012",
    // L18 1HQ, Greenbank Park ward. Verified inside, 208m from the nearest edge.
    latitude: 53.385287,
    longitude: -2.924117,
    expect: "required",
  },
  {
    what: "Liverpool, coordinate far outside the published boundary",
    gss: "E08000012",
    // Central Manchester: same country, nowhere near the designation.
    latitude: 53.4808,
    longitude: -2.2426,
    expect: "not-in-area",
  },
  {
    what: "Liverpool, no coordinate supplied, must fall back rather than assume outside",
    gss: "E08000012",
    wardName: "Anfield",
    expect: "likely-required",
  },
  {
    what: "Rotherham, street on an INDICATIVE list is likely, not certain",
    gss: "E08000018",
    street: "Fitzwilliam Road",
    houseNumber: "10",
    streetSource: "epc-numbered",
    expect: "likely-required",
  },
];

let pass = 0;
let extra = 0;
const failures: string[] = [];

for (const c of AREA_CASES) {
  extra++;
  const d = determine(c.gss, {
    occupants: 2,
    households: 1,
    wardName: c.wardName ?? null,
    postcode: c.postcode ?? null,
    street: c.street ?? null,
    houseNumber: c.houseNumber ?? null,
    streetSource: c.streetSource ?? null,
    latitude: c.latitude ?? null,
    longitude: c.longitude ?? null,
  });
  const verdicts = [...(d?.selective ?? []), ...(d?.additional ?? [])].map((a) => a.verdict);
  if (verdicts.includes(c.expect as never)) pass++;
  else failures.push(`  ${c.what}\n    expected ${c.expect}, got [${verdicts.join(", ") || "none"}]`);
}

for (const c of CASES) {
  const d = determine(c.gss, {
    occupants: 2,
    households: 1,
    wardName: null,
    street: c.street,
    houseNumber: c.houseNumber,
    streetSource: c.streetSource,
  });
  const all = [...(d?.selective ?? []), ...(d?.additional ?? [])];
  const verdicts = all.map((a) => a.verdict);
  const got = verdicts.includes(c.expect as never)
    ? c.expect
    : (verdicts[0] ?? "none");
  if (got === c.expect) pass++;
  else failures.push(`  ${c.what}\n    expected ${c.expect}, got [${verdicts.join(", ") || "none"}]`);
}

// Manchester is designated entirely by number range: verify both directions on
// a real range, and that an unnumbered address refuses to answer.
if (manchester) {
  const gss = "E08000003";
  // "Bank Street -> 12 to 72 (even)" at time of writing. Derive the probes from
  // the real range so the test tracks the data rather than a hardcoded street.
  const m = manchester.numbers.match(/([0-9]+)\s*(?:to|-)\s*([0-9]+)/);
  const lo = m ? parseInt(m[1], 10) : null;
  const hi = m ? parseInt(m[2], 10) : null;
  const evenOnly = /\beven/i.test(manchester.numbers);
  const oddOnly = /\bodd/i.test(manchester.numbers);
  const probes: Array<[string | null, Verdict, string]> = [
    [null, "likely-required", "no house number, must refuse to place it"],
  ];
  if (lo !== null && hi !== null) {
    probes.push([String(lo), "required", "first number in the designated range"]);
    probes.push([String(hi + 2), "not-in-area", "past the end of the designated range"]);
    if (evenOnly) probes.push([String(lo + 1), "not-in-area", "wrong parity inside the span"]);
    if (oddOnly) probes.push([String(lo + 1), "not-in-area", "wrong parity inside the span"]);
  }
  for (const [num, expect, why] of probes) {
    extra++;
    const d = determine(gss, {
      occupants: 2,
      households: 1,
      wardName: null,
      street: manchester.name,
      houseNumber: num,
      streetSource: "epc-numbered",
    });
    const verdicts = (d?.selective ?? []).map((a) => a.verdict);
    if (verdicts.includes(expect as never)) pass++;
    else
      failures.push(
        `  Manchester ${manchester.name} number=${num} (range "${manchester.numbers}", ${why})\n    expected ${expect}, got [${verdicts.join(", ")}]`,
      );
  }
}

const total = CASES.length + extra;
console.log(`${pass}/${total} passed`);
if (failures.length) {
  console.log("\nFAILURES:");
  console.log(failures.join("\n"));
  process.exit(1);
}
