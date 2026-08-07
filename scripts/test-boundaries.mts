/**
 * Check the published-boundary matching against real postcodes.
 *
 * Fetches live coordinates from postcodes.io and tests them against the
 * councils' own designation geometry, printing which side of the boundary each
 * lands and how far from the edge. Run this after regenerating boundaries: a
 * simplification or projection error shows up here as a postcode flipping side.
 *
 * Run with: npx tsx scripts/test-boundaries.mts
 */
import { boundaryTest, SCHEMES, getCouncilByGss } from "../src/lib/licensing";

const CASES: Array<{ postcode: string; gss: string; expect: "in" | "out" | "either"; why: string }> = [
  // Liverpool: the 2022 designation covers ~38 of 64 wards, notably the inner core.
  { postcode: "L8 0SP", gss: "E08000012", expect: "in", why: "Toxteth, well inside the designated core" },
  { postcode: "L6 1HR", gss: "E08000012", expect: "in", why: "Kensington, inside" },
  { postcode: "L25 5JF", gss: "E08000012", expect: "out", why: "Woolton, outer suburb well beyond the area" },
  // Corrected after checking rather than assuming: this postcode is in Greenbank
  // Park ward, which IS designated, and which the boundary research measured as
  // 84% inside. An earlier expectation of "out" here was my guess, not the data.
  { postcode: "L18 1HQ", gss: "E08000012", expect: "in", why: "Greenbank Park ward, designated" },
  { postcode: "L24 1YD", gss: "E08000012", expect: "out", why: "Speke, south of the designated area" },
  // Tower Hamlets: three designated polygons only, not the whole borough.
  { postcode: "E1 5QJ", gss: "E09000030", expect: "either", why: "Whitechapel, near a designated area" },
  { postcode: "E14 9GE", gss: "E09000030", expect: "out", why: "Isle of Dogs, outside the three designations" },
  // Gedling: five small designated areas.
  { postcode: "NG4 2NN", gss: "E07000173", expect: "either", why: "Netherfield, a designated area" },
  { postcode: "NG14 6JX", gss: "E07000173", expect: "out", why: "rural Gedling, far outside" },
];

interface PostcodeResult {
  result?: { latitude: number; longitude: number; admin_ward: string };
}

let checked = 0;
let mismatches = 0;

for (const c of CASES) {
  const res = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(c.postcode)}`);
  if (!res.ok) {
    console.log(`${c.postcode.padEnd(9)} POSTCODE LOOKUP FAILED (${res.status})`);
    continue;
  }
  const { result } = (await res.json()) as PostcodeResult;
  if (!result) continue;

  const council = getCouncilByGss(c.gss);
  const schemes = (SCHEMES.find((s) => s.gss === c.gss)?.schemes ?? []).filter((s) => s.status === "active");

  let reported = false;
  for (const scheme of schemes) {
    const v = boundaryTest(c.gss, scheme, result.latitude, result.longitude);
    if (!v) continue;
    reported = true;
    checked++;
    const side = v.inside ? "in" : "out";
    const ok = c.expect === "either" || c.expect === side;
    if (!ok) mismatches++;
    console.log(
      `${c.postcode.padEnd(9)} ${String(council?.name).padEnd(26)} ${side.padEnd(4)} ` +
        `${String(Math.round(v.distance)).padStart(6)}m from edge  ${v.nearEdge ? "NEAR-EDGE (hedges)" : "definite".padEnd(18)}  ` +
        `${ok ? "ok" : `MISMATCH, expected ${c.expect}`}  (${c.why})`,
    );
  }
  if (!reported) console.log(`${c.postcode.padEnd(9)} no boundary held for any active scheme at ${council?.name}`);
}

console.log(`\n${checked} coordinate tests, ${mismatches} mismatches`);
if (mismatches > 0) process.exit(1);
