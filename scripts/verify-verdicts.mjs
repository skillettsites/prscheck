// Verdict regression check for the additional-licensing scope rules.
// Run: npx tsx scripts/verify-verdicts.mjs   (or via the npm script)
//
// Guards the three cases that have each been wrong at least once:
//  1. non-HMO let under a live additional scheme must not be badged "required"
//  2. England mandatory HMO supersedes additional licensing
//  3. WALES mandatory occupancy does NOT supersede it, because the storey test
//     decides, and downgrading there reported a licensable HMO as needing nothing
import { readFileSync } from "fs";

const schemes = JSON.parse(readFileSync(new URL("../src/data/licensing-schemes.json", import.meta.url), "utf8"));
const councils = JSON.parse(readFileSync(new URL("../src/data/councils.json", import.meta.url), "utf8"));
const sArr = Array.isArray(schemes) ? schemes : Object.values(schemes);
const cArr = Array.isArray(councils) ? councils : councils.councils || [];
const byGss = new Map(cArr.map((c) => [c.gss, c]));

// Mirror `determine`'s own filter, which drops schemes whose end date has passed
// even while the recorded status still reads "active" (Harrow, Salford). Picking
// a lapsed scheme as the fixture returned an empty `additional[]`, and the Wales
// guard below is a `!== "not-applicable"` check, so it would have passed on
// nothing at all and silently stopped guarding.
// `hasLapsed` is a UTC date-STRING compare (`scheme.end < today()`), so a scheme
// ending today is still live. Comparing Date objects instead made it lapsed, and
// on the day the last live scheme for a nation ends this would drop the fixture
// and exit 1 for no reason. Same comparison, same result.
const todayIso = new Date().toISOString().slice(0, 10);
const notLapsed = (s) => !s.end || !(s.end < todayIso);
const liveAdditional = (rec) =>
  (rec.schemes || []).some(
    (s) => s.type === "additional" && (s.status === "active" || s.status === "upcoming") && notLapsed(s),
  );
const liveSelective = (rec) =>
  (rec.schemes || []).some(
    (s) => s.type === "selective" && (s.status === "active" || s.status === "upcoming") && notLapsed(s),
  );

const pick = (nation, pred = liveAdditional) =>
  sArr.find((r) => pred(r) && (byGss.get(r.gss) || {}).nation === nation);

const eng = pick("england");
const wal = pick("wales");
const engSel = pick("england", liveSelective);

console.log("Fixtures:");
console.log(`  England council with a live additional scheme: ${eng ? eng.council : "NONE FOUND"}`);
console.log(`  Wales   council with a live additional scheme: ${wal ? wal.council : "NONE FOUND"}`);
console.log(`  England council with a live selective scheme : ${engSel ? engSel.council : "NONE FOUND"}`);

if (!eng || !wal || !engSel) {
  console.log("\nFAIL: a fixture could not be found, so these checks would pass on nothing.");
  process.exit(1);
}

const { determine } = await import("../src/lib/licensing.ts");

let failures = 0;
const check = (label, got, want) => {
  const ok = got === want;
  if (!ok) failures++;
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}: got "${got}", expected "${want}"`);
};

const run = (gss, occupants, households) =>
  determine(gss, {
    occupants,
    households,
    wardName: null,
    street: null,
    streetSource: "",
    houseNumber: null,
    postcode: null,
    latitude: null,
    longitude: null,
  });

// Guard against a fixture that yields no scheme at all: every "not downgraded"
// assertion below is a negative check and would pass on an empty array.
const needScheme = (label, list) => {
  if (!list || list.length === 0) {
    failures++;
    console.log(`  FAIL  ${label}: no scheme returned, the check would pass on nothing`);
    return false;
  }
  return true;
};

{
  console.log(`\nEngland (${eng.council}):`);
  const single = run(eng.gss, 1, 1);
  needScheme("England fixture returns an additional scheme", single.additional);
  check("1 occupant / 1 household -> additional verdict", single.additional[0]?.verdict, "not-applicable");
  check("1 occupant / 1 household -> mandatory required", String(single.mandatoryHmo.required), "false");

  const small = run(eng.gss, 3, 3);
  const smallOk = ["required", "likely-required", "check-boundary", "upcoming"].includes(small.additional[0]?.verdict);
  check("3 occupants / 3 households (small HMO) -> positive verdict kept", String(smallOk), "true");

  const mand = run(eng.gss, 5, 3);
  check("5 occupants / 3 households -> additional superseded", mand.additional[0]?.verdict, "not-applicable");
  check("5 occupants / 3 households -> mandatory required", String(mand.mandatoryHmo.required), "true");
}

{
  console.log(`\nEngland selective (${engSel.council}):`);
  const mand = run(engSel.gss, 5, 3);
  if (needScheme("selective fixture returns a scheme", mand.selective)) {
    check("5 occupants / 3 households -> selective downgraded", mand.selective[0]?.verdict, "not-applicable");
  }
  const ordinary = run(engSel.gss, 2, 1);
  if (needScheme("selective fixture returns a scheme for an ordinary let", ordinary.selective)) {
    const kept = ordinary.selective[0]?.verdict !== "not-applicable";
    check("2 occupants / 1 household -> selective verdict kept", String(kept), "true");
  }
}

// A council running BOTH scheme types: a small HMO the additional scheme covers
// is licensable under Part 2, so the selective verdict must stand down. Without
// this the report showed both badges and told the buyer to apply for both.
const both = sArr.find(
  (r) => liveAdditional(r) && liveSelective(r) && (byGss.get(r.gss) || {}).nation === "england",
);
{
  console.log(`\nEngland both schemes (${both ? both.council : "NONE FOUND"}):`);
  if (!both) {
    failures++;
    console.log("  FAIL  no England council with both scheme types live, check would pass on nothing");
  } else {
    const small = run(both.gss, 3, 3);
    if (needScheme("both-scheme fixture returns an additional scheme", small.additional)) {
      const addPositive = ["required", "likely-required", "check-boundary", "upcoming"].includes(
        small.additional[0]?.verdict,
      );
      check("3 occupants / 3 households -> additional still positive", String(addPositive), "true");
    }
    if (needScheme("both-scheme fixture returns a selective scheme", small.selective)) {
      check("3 occupants / 3 households -> selective stands down", small.selective[0]?.verdict, "not-applicable");
    }
  }
}

{
  console.log(`\nWales (${wal.council}):`);
  const mand = run(wal.gss, 5, 3);
  needScheme("Wales fixture returns an additional scheme", mand.additional);
  const kept = mand.additional.length > 0 && mand.additional[0]?.verdict !== "not-applicable";
  check("5 occupants / 3 households -> additional verdict NOT downgraded", String(kept), "true");
  check("5 occupants / 3 households -> mandatory required (England test)", String(mand.mandatoryHmo.required), "false");
  check("5 occupants / 3 households -> mandatory conditional (storeys)", String(mand.mandatoryHmo.conditional), "true");
  check("5 occupants / 3 households -> hasAnyLicenceRisk", String(mand.hasAnyLicenceRisk), "true");

  const single = run(wal.gss, 1, 1);
  check("1 occupant / 1 household -> additional not applicable", single.additional[0]?.verdict, "not-applicable");
}

// A HEDGED additional verdict must not stand selective down. Birmingham's
// additional scheme is borough-wide, so it returns "required" and passes either
// way; the bug only shows on a council whose additional designation is
// street/area-level, where the verdict is "check-boundary".
{
  // Named fixtures below are illustrative. The real guard is the sweep, which
  // asserts the rule over every council and cannot be silently disarmed by a
  // scheme's start date arriving or a designation being re-typed.
  const hedged = sArr.find((r) => {
    if (!liveAdditional(r) || !liveSelective(r)) return false;
    if ((byGss.get(r.gss) || {}).nation !== "england") return false;
    const d = run(r.gss, 3, 3);
    if (!d) return false;
    const definite = d.additional.some((a) => a.verdict === "required" || a.verdict === "likely-required");
    return !definite && d.additional.some((a) => a.verdict === "check-boundary");
  });
  console.log(`\nHedged additional verdict (${hedged ? hedged.council : "none in data today"}):`);
  if (hedged) {
    const d = run(hedged.gss, 3, 3);
    const selDowngraded = d.selective.some((a) => a.verdict === "not-applicable");
    check("check-boundary additional does NOT stand selective down", String(selDowngraded), "false");
  } else {
    console.log("  none today; the sweep below covers this rule regardless");
  }
}

/**
 * Dataset-wide invariant sweep.
 *
 * Single fixtures kept going vacuous: one picked a council that also had a
 * definite scheme, another depended on a designation that commences on a known
 * date, and a third asserted a negative that an empty array satisfied. These
 * run the rule against every council at three occupancies, so a fixture cannot
 * quietly stop qualifying, and they name the council when they fail.
 */
{
  console.log("\nInvariant sweep (all councils x 1/1, 3/3, 5/3):");
  const combos = [
    [1, 1],
    [3, 3],
    [5, 3],
  ];
  const breaches = { selective: [], additional: [], risk: [] };
  let downgradesSeen = { selective: 0, additional: 0 };

  for (const rec of sArr) {
    const council = byGss.get(rec.gss);
    if (!council) continue;
    for (const [occ, hh] of combos) {
      const d = run(rec.gss, occ, hh);
      if (!d) continue;
      const isMandatory = occ >= 5 && hh >= 2;
      const isSmall = !isMandatory && occ >= 3 && hh >= 2;
      const mandatorySupersedes = isMandatory && council.nation === "england";
      const definiteAdditional = d.additional.some((a) => a.verdict === "required" || a.verdict === "likely-required");

      for (const a of d.selective) {
        if (a.verdict !== "not-applicable") continue;
        downgradesSeen.selective++;
        // Only two lawful reasons to void a selective scheme.
        const lawful = mandatorySupersedes || (isSmall && definiteAdditional);
        if (!lawful) breaches.selective.push(`${council.name} @ ${occ}/${hh}`);
      }
      for (const a of d.additional) {
        if (a.verdict !== "not-applicable") continue;
        downgradesSeen.additional++;
        // Additional licensing is only out of scope for a let that is not a
        // small HMO, and never for the Welsh mandatory-occupancy case where the
        // storey test decides.
        const lawful = !isSmall && (mandatorySupersedes || !isMandatory);
        if (!lawful) breaches.additional.push(`${council.name} @ ${occ}/${hh}`);
      }
      // A property that needs, or may need, a mandatory licence must never be
      // reported as carrying no licence risk.
      if ((d.mandatoryHmo.required || d.mandatoryHmo.conditional) && !d.hasAnyLicenceRisk) {
        breaches.risk.push(`${council.name} @ ${occ}/${hh}`);
      }
    }
  }

  console.log(`  observed ${downgradesSeen.selective} selective and ${downgradesSeen.additional} additional stand-downs`);
  if (downgradesSeen.selective === 0 || downgradesSeen.additional === 0) {
    failures++;
    console.log("  FAIL  no stand-downs observed at all, so the rules below assert nothing");
  }
  for (const [name, list] of Object.entries(breaches)) {
    if (list.length === 0) {
      console.log(`  PASS  no unlawful ${name} outcome across ${sArr.length} councils`);
    } else {
      failures++;
      console.log(`  FAIL  ${list.length} unlawful ${name} outcome(s): ${list.slice(0, 5).join(", ")}${list.length > 5 ? " ..." : ""}`);
    }
  }
}

console.log(failures === 0 ? "\nALL CHECKS PASSED" : `\n${failures} CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
