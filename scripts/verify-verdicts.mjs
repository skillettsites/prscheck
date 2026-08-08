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
const notLapsed = (s) => !s.end || new Date(s.end) >= new Date();
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

console.log(failures === 0 ? "\nALL CHECKS PASSED" : `\n${failures} CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
