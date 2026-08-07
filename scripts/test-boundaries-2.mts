/**
 * Verify the newly added boundaries against real postcodes.
 *
 * West Northamptonshire matters most: it was the last live scheme we could not
 * resolve at all, and its geometry was derived by georeferencing a polygon out
 * of a PDF rather than fetched from a service, so it deserves the most
 * scepticism. The research validated it to 0.09m mean error against the ONS
 * council boundary drawn on the same sheet; these checks confirm it puts real
 * addresses on the right side.
 *
 * Note "Daventry" in that designation means the former Daventry DISTRICT, not
 * Daventry town, which sits about 13km outside the polygon.
 *
 * Run with: npx tsx scripts/test-boundaries-2.mts
 */
import { boundaryTest, SCHEMES, getCouncilByGss } from "../src/lib/licensing";

const CASES: Array<{ postcode: string; gss: string; expect: "in" | "out" | "either"; why: string }> = [
  // West Northamptonshire: Northampton inner wards in, outlying towns out.
  { postcode: "NN1 5DB", gss: "E06000062", expect: "in", why: "Northampton Castle ward" },
  { postcode: "NN2 6AA", gss: "E06000062", expect: "in", why: "Kingsley / Semilong" },
  { postcode: "NN5 6AA", gss: "E06000062", expect: "in", why: "Duston" },
  { postcode: "NN11 4AA", gss: "E06000062", expect: "out", why: "Daventry town, ~13km outside the polygon" },
  { postcode: "NN13 6AA", gss: "E06000062", expect: "out", why: "Brackley, well outside" },
  { postcode: "NN12 6AA", gss: "E06000062", expect: "out", why: "Towcester, outside" },
  // Nottingham: the designation is not city-wide.
  { postcode: "NG7 1AB", gss: "E06000018", expect: "in", why: "Radford, a fully covered ward" },
  { postcode: "NG8 4GY", gss: "E06000018", expect: "out", why: "Bilborough, absent from the statutory notice" },
  { postcode: "NG11 8NB", gss: "E06000018", expect: "out", why: "Clifton, no licences under the current scheme" },
];

interface PostcodeResult {
  result?: { latitude: number; longitude: number; admin_ward: string };
}

let checked = 0;
let mismatches = 0;

for (const c of CASES) {
  const res = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(c.postcode)}`);
  if (!res.ok) {
    console.log(`${c.postcode.padEnd(9)} lookup failed (${res.status})`);
    continue;
  }
  const { result } = (await res.json()) as PostcodeResult;
  if (!result) continue;

  const council = getCouncilByGss(c.gss);
  const schemes = (SCHEMES.find((s) => s.gss === c.gss)?.schemes ?? []).filter(
    (s) => s.status === "active" || s.status === "upcoming",
  );

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
      `${c.postcode.padEnd(9)} ${String(council?.name).slice(0, 24).padEnd(25)} ${side.padEnd(4)} ` +
        `${String(Math.round(v.distance)).padStart(6)}m  ${v.nearEdge ? "NEAR-EDGE" : "definite "}  ` +
        `${ok ? "ok" : `MISMATCH, expected ${c.expect}`}  (${c.why})`,
    );
  }
  if (!reported) console.log(`${c.postcode.padEnd(9)} no boundary held for ${council?.name} (${result.admin_ward})`);
}

console.log(`\n${checked} coordinate tests, ${mismatches} mismatches`);
if (mismatches > 0) process.exit(1);
