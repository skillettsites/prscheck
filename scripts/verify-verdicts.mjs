// Verdict regression check for the licensing scope rules.
//
// Runs as `prebuild`, so a breach fails `npm run build` and the Vercel deploy
// with it. That matters more than usual here: the rules it guards depend on
// `hasLapsed`/`hasCommenced`, which compare against today's date, so this decays
// on the calendar rather than on a code change and cannot rely on someone
// remembering to run it.
//
// Run directly: npm run verify:verdicts
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

// Import the rules rather than restating them. Hardcoding the verdict lists let
// the guard and the engine encode DIFFERENT rules: the sweep still listed
// likely-required as definite after the engine stopped treating it that way, and
// passed only because it swept with every ward null, which makes likely-required
// unreachable. Same literal, two sources of truth, no failure.
const { determine, penaltiesFor, DEFINITE_VERDICTS, POSITIVE_VERDICTS } = await import("../src/lib/licensing.ts");

/**
 * Two severities, because this runs as `prebuild` and therefore gates deploys.
 *
 * `failures` are wrong ANSWERS: the engine broke a licensing rule. Those block
 * the build, which is the point of the gate.
 *
 * `warnings` are conditions of the DATASET and the calendar, not of the code:
 * no Welsh council with a live additional scheme, no England council running
 * both types, a fixture whose designation commenced this morning. Blocking on
 * those would stop an unrelated hotfix from deploying because a scheme's end
 * date passed overnight, so they are shouted about and allowed through. The
 * sweep below is the real guard and it is a hard failure.
 */
let failures = 0;
let warnings = 0;
const check = (label, got, want) => {
  const ok = got === want;
  if (!ok) failures++;
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}: got "${got}", expected "${want}"`);
};
const warn = (message) => {
  warnings++;
  console.log(`  WARN  ${message}`);
};

// WARN, not exit(1). This is the `prebuild` script and every named fixture
// depends on a designation still being live. The Welsh one is Cardiff, whose
// additional scheme ends 2028-02-01; the last Welsh additional designations run
// to 2031-03-31, so this is not imminent, but hard-failing here would mean that
// the day the last one lapses every production build breaks, hotfixes included,
// for a dataset condition rather than a code fault. Same policy as every other
// fixture check here. The sweep at the end is the hard guard and needs no
// fixture, and the catastrophic-join check below still exits non-zero.
// Placed after `warn` because const is not hoisted.
const missingFixtures = [!eng && "England additional", !wal && "Wales additional", !engSel && "England selective"].filter(
  Boolean,
);
if (missingFixtures.length) {
  warn(`no live scheme for: ${missingFixtures.join(", ")}. Those named fixtures assert nothing today.`);
}

const runWard = (gss, occupants, households, wardName = null) =>
  determine(gss, {
    occupants,
    households,
    wardName,
    street: null,
    streetSource: "",
    houseNumber: null,
    postcode: null,
    latitude: null,
    longitude: null,
  });
const run = (gss, occupants, households) => runWard(gss, occupants, households, null);

// Guard against a fixture that yields no scheme at all: every "not downgraded"
// assertion below is a negative check and would pass on an empty array.
const needScheme = (label, list) => {
  if (!list || list.length === 0) {
    warn(`${label}: no scheme returned, so this fixture asserts nothing today`);
    return false;
  }
  return true;
};

// Each named-fixture block is guarded, because its fixture can legitimately be
// absent (see missingFixtures above) and dereferencing it would crash the build.
if (eng) {
  console.log(`\nEngland (${eng.council}):`);
  const single = run(eng.gss, 1, 1);
  needScheme("England fixture returns an additional scheme", single.additional);
  check("1 occupant / 1 household -> additional verdict", single.additional[0]?.verdict, "not-applicable");
  check("1 occupant / 1 household -> mandatory required", String(single.mandatoryHmo.required), "false");

  const small = run(eng.gss, 3, 3);
  const smallOk = POSITIVE_VERDICTS.includes(small.additional[0]?.verdict);
  check("3 occupants / 3 households (small HMO) -> positive verdict kept", String(smallOk), "true");

  const mand = run(eng.gss, 5, 3);
  check("5 occupants / 3 households -> additional superseded", mand.additional[0]?.verdict, "not-applicable");
  check("5 occupants / 3 households -> mandatory required", String(mand.mandatoryHmo.required), "true");
}

if (engSel) {
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
    warn("no England council with both scheme types live, so this fixture asserts nothing today");
  } else {
    const small = run(both.gss, 3, 3);
    if (needScheme("both-scheme fixture returns an additional scheme", small.additional)) {
      const addPositive = POSITIVE_VERDICTS.includes(small.additional[0]?.verdict);
      check("3 occupants / 3 households -> additional still positive", String(addPositive), "true");
    }
    if (needScheme("both-scheme fixture returns a selective scheme", small.selective)) {
      check("3 occupants / 3 households -> selective stands down", small.selective[0]?.verdict, "not-applicable");
    }
  }
}

// NOT gated on a fixture: penaltiesFor takes only the nation and reads
// national-rules.json, so it needs no live scheme. Gating it on `eng && wal`
// meant the England assertions would disappear along with the Wales fixture,
// and the "varies" sentinel fallthrough this block exists to catch would ship
// green.
{
  // Penalties are nation-specific and were hardcoded to England's for everyone,
  // so the paid Welsh report quoted a £40,000 civil penalty and a 24-month rent
  // repayment order, neither of which exists in Wales.
  console.log("\nPenalties by nation:");
  // Straight from penaltiesFor rather than through determine(), so these hold
  // whether or not a council fixture happens to be available.
  const engP = penaltiesFor("england");
  const walP = penaltiesFor("wales");
  // Pinned to exact values on BOTH nations. Asserting only that Wales differs
  // from England let the label fall through to the "varies" sentinel if
  // fixedPenaltyGBP were removed from the JSON: the report would print "varies"
  // under "Fixed penalty notice per offence", the email would read "fixed
  // penalties of varies", and the gate would still say ALL CHECKS PASSED.
  check("England civil penalty label", engP.civilPenaltyLabel, "£40,000");
  check("England RRO months", String(engP.rroMonths), "24");
  check("Wales civil penalty label", walP.civilPenaltyLabel, "£150-£250");
  check("Wales RRO months", String(walP.rroMonths), "12");
  check("Wales criminal fine", walP.criminalFine, "unlimited");
}

if (wal) {
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
    const definite = d.additional.some((a) => DEFINITE_VERDICTS.includes(a.verdict));
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
  // Keyed by council, not by scheme: counting per scheme inflated the number and
  // let one multi-scheme council (Conwy) fill most of the truncated sample.
  const breachedCouncils = { selective: new Set(), additional: new Set(), risk: new Set(), double: new Set() };
  let downgradesSeen = { selective: 0, additional: 0 };
  let swept = 0;

  for (const rec of sArr) {
    const council = byGss.get(rec.gss);
    if (!council) continue;
    // Sweep WITH the designated wards, not just with wardName null. A null ward
    // makes `likely-required` unreachable, so a sweep without wards cannot see
    // the 38 double-licensing cases that the DEFINITE_VERDICTS rule exists to
    // prevent, and passed clean while they were live.
    const wards = [
      null,
      ...new Set(
        (rec.schemes || [])
          .filter((s) => s.status === "active" || s.status === "upcoming")
          .flatMap((s) => s.wards || []),
      ),
    ];
    for (const [occ, hh] of combos) {
      for (const ward of wards) {
      // Scotland and NI return null: they have no Housing Act 2004 powers.
      const d = runWard(rec.gss, occ, hh, ward);
      if (!d) continue;
      swept++;
      const isMandatory = occ >= 5 && hh >= 2;
      const isSmall = !isMandatory && occ >= 3 && hh >= 2;
      const mandatorySupersedes = isMandatory && council.nation === "england";
      const definiteAdditional = d.additional.some((a) => DEFINITE_VERDICTS.includes(a.verdict));

      // Asserted in BOTH directions. Checking only the assessments that are
      // already not-applicable proves stand-downs are lawful but never that a
      // required one happened, so deleting the whole stand-down branch passed
      // the sweep clean.
      // `isHmo`, not `isSmall`. The engine gates additionalCovers on "is an HMO
      // at all" so that the Wales 5+/2+ band is covered; leaving this at isSmall
      // meant that adding a live selective scheme to any Welsh council with an
      // additional one would report "stood down without cause" and, since this
      // is the prebuild script, block every deploy of the site.
      const isHmo = isSmall || isMandatory;
      const shouldStandDown = mandatorySupersedes || (isHmo && definiteAdditional);
      for (const a of d.selective) {
        if (a.verdict === "not-in-area") continue; // geography, exempt either way
        const stoodDown = a.verdict === "not-applicable";
        if (stoodDown) downgradesSeen.selective++;
        if (stoodDown !== shouldStandDown) {
          breachedCouncils.selective.add(
            `${council.name}${ward ? ` [${ward}]` : ""} @ ${occ}/${hh} (${stoodDown ? "stood down without cause" : "should have stood down"})`,
          );
        }
      }
      // Additional licensing is out of scope for a let that is not a small HMO,
      // and never for the Welsh mandatory-occupancy case where the storey test
      // decides. Both directions again.
      const additionalShould = !isSmall && (mandatorySupersedes || !isMandatory);
      for (const a of d.additional) {
        if (a.verdict === "not-in-area") continue;
        const stoodDown = a.verdict === "not-applicable";
        if (stoodDown) downgradesSeen.additional++;
        if (stoodDown !== additionalShould) {
          breachedCouncils.additional.add(
            `${council.name}${ward ? ` [${ward}]` : ""} @ ${occ}/${hh} (${stoodDown ? "stood down without cause" : "should have stood down"})`,
          );
        }
      }
      // DOUBLE-LICENSING, checked independently of DEFINITE_VERDICTS.
      //
      // Every other rule here derives its expectation from the same constants
      // the engine uses, which catches drift but makes those rules tautological:
      // narrowing DEFINITE_VERDICTS to ["required"] moves the engine and the
      // expectation together and the sweep stays green, which is exactly what
      // happened. This one states the outcome a landlord must never see, in its
      // own terms: additional licensing covers small HMOs, selective covers lets
      // that are NOT licensable as HMOs, so no property can be told it needs
      // both. The two verdict names below are deliberately literal, because they
      // define "the report asserts a licence is needed" rather than restating an
      // engine rule.
      const asserts = (a) => a.verdict === "required" || a.verdict === "likely-required";
      if (d.additional.some(asserts) && d.selective.some(asserts)) {
        breachedCouncils.double.add(
          `${council.name}${ward ? ` [${ward}]` : ""} @ ${occ}/${hh} (additional=[${d.additional.map((a) => a.verdict)}] selective=[${d.selective.map((a) => a.verdict)}])`,
        );
      }

      // hasAnyLicenceRisk must agree with what the report actually shows. Keying
      // this off the mandatory flags alone only ever fired at 5/3, so it asserted
      // nothing for small HMOs and passed clean while `selectiveRisk` wrongly
      // excluded them, which is the bug the flag was previously fixed for.
      // Comparing against the surviving verdicts covers every occupancy.
      const anyPositive =
        d.selective.some((a) => POSITIVE_VERDICTS.includes(a.verdict)) ||
        d.additional.some((a) => POSITIVE_VERDICTS.includes(a.verdict));
      const expectedRisk = d.mandatoryHmo.required || d.mandatoryHmo.conditional || anyPositive;
      if (d.hasAnyLicenceRisk !== expectedRisk) {
        breachedCouncils.risk.add(
          `${council.name}${ward ? ` [${ward}]` : ""} @ ${occ}/${hh} (flag ${d.hasAnyLicenceRisk}, verdicts say ${expectedRisk})`,
        );
      }
      }
    }
  }

  // A floor on the swept count, because a gss drift between councils.json and
  // licensing-schemes.json would shrink the sweep silently while still printing
  // PASS. England + Wales is 318 of the 361 records; Scotland and NI are not
  // licensable under the Housing Act 2004 and return null.
  const MIN_SWEEP = 900;
  // A CATASTROPHIC join break is a hard failure, not a warning. Every breach set
  // is empty when nothing is swept, so with an unreadable or mismatched dataset
  // the script would otherwise print PASS four times, "ALL CHECKS PASSED", and
  // exit 0 having asserted nothing at all. A modest shortfall stays a warning,
  // because that is dataset drift rather than a fault.
  const CATASTROPHIC = 100;
  console.log(`  swept ${swept} council/occupancy pairs (Scotland and NI correctly excluded)`);
  if (swept < CATASTROPHIC) {
    failures++;
    console.log(`  FAIL  only ${swept} pairs swept: the councils.json / licensing-schemes.json join is broken, so nothing below was actually tested`);
  } else if (swept < MIN_SWEEP) {
    warn(`only ${swept} pairs swept, expected at least ${MIN_SWEEP}: check the councils.json / licensing-schemes.json join`);
  }
  console.log(`  observed ${downgradesSeen.selective} selective and ${downgradesSeen.additional} additional stand-downs`);
  if (swept >= CATASTROPHIC && downgradesSeen.selective === 0 && downgradesSeen.additional === 0) {
    // Thousands of pairs and not one stand-down means the rules are not running.
    failures++;
    console.log("  FAIL  no stand-downs observed across the whole sweep, so the stand-down rules are not being exercised");
  } else if (downgradesSeen.selective === 0 || downgradesSeen.additional === 0) {
    warn("one stand-down type was never observed, so that rule asserts nothing today");
  }
  for (const [name, set] of Object.entries(breachedCouncils)) {
    const list = [...set];
    if (list.length === 0) {
      console.log(`  PASS  no unlawful ${name} outcome`);
    } else {
      failures++;
      console.log(`  FAIL  ${list.length} unlawful ${name} outcome(s): ${list.slice(0, 5).join(", ")}${list.length > 5 ? " ..." : ""}`);
    }
  }
}

if (warnings > 0) {
  console.log(`\n${warnings} WARNING(S): a fixture or the dataset no longer covers what it used to. Not blocking.`);
}
console.log(failures === 0 ? "ALL CHECKS PASSED" : `${failures} CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
