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

const liveAdditional = (rec) =>
  (rec.schemes || []).some((s) => s.type === "additional" && (s.status === "active" || s.status === "upcoming"));

const pick = (nation) =>
  sArr.find((r) => liveAdditional(r) && (byGss.get(r.gss) || {}).nation === nation);

const eng = pick("england");
const wal = pick("wales");

console.log("Fixtures:");
console.log(`  England council with a live additional scheme: ${eng ? eng.council : "NONE FOUND"}`);
console.log(`  Wales   council with a live additional scheme: ${wal ? wal.council : "NONE FOUND"}`);

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

if (eng) {
  console.log(`\nEngland (${eng.council}):`);
  const single = run(eng.gss, 1, 1);
  check("1 occupant / 1 household -> additional verdict", single.additional[0]?.verdict, "not-applicable");
  check("1 occupant / 1 household -> mandatory required", String(single.mandatoryHmo.required), "false");

  const small = run(eng.gss, 3, 3);
  const smallOk = ["required", "likely-required", "check-boundary", "upcoming"].includes(small.additional[0]?.verdict);
  check("3 occupants / 3 households (small HMO) -> positive verdict kept", String(smallOk), "true");

  const mand = run(eng.gss, 5, 3);
  check("5 occupants / 3 households -> additional superseded", mand.additional[0]?.verdict, "not-applicable");
  check("5 occupants / 3 households -> mandatory required", String(mand.mandatoryHmo.required), "true");
}

if (wal) {
  console.log(`\nWales (${wal.council}):`);
  const mand = run(wal.gss, 5, 3);
  const kept = mand.additional[0]?.verdict !== "not-applicable";
  check("5 occupants / 3 households -> additional verdict NOT downgraded", String(kept), "true");
  check("5 occupants / 3 households -> mandatory required (England test)", String(mand.mandatoryHmo.required), "false");
  check("5 occupants / 3 households -> mandatory conditional (storeys)", String(mand.mandatoryHmo.conditional), "true");
  check("5 occupants / 3 households -> hasAnyLicenceRisk", String(mand.hasAnyLicenceRisk), "true");

  const single = run(wal.gss, 1, 1);
  check("1 occupant / 1 household -> additional not applicable", single.additional[0]?.verdict, "not-applicable");
}

console.log(failures === 0 ? "\nALL CHECKS PASSED" : `\n${failures} CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
