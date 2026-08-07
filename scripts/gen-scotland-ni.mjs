#!/usr/bin/env node
/**
 * Generates licensing records for all Scottish and Northern Irish councils.
 *
 * These are NOT researched council by council, and deliberately so. Selective
 * and additional licensing are creatures of the Housing Act 2004, which by
 * s.270(11) "extends to England and Wales only". No Scottish or NI council can
 * designate one, so the answer is settled by statute rather than by looking at
 * 43 websites. Each record says so, cites the section, and points the user at
 * the regime that does apply to them.
 *
 * Without these records the engine reports "we hold no data" for Scotland and
 * NI, which reads to a user as a failed search when in fact the answer is
 * known and definite.
 *
 *   node scripts/gen-scotland-ni.mjs        # writes scripts/incoming/batch-17.json
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const COUNCILS = JSON.parse(fs.readFileSync(path.join(ROOT, "src/data/councils.json"), "utf8"));
const RULES = JSON.parse(fs.readFileSync(path.join(ROOT, "src/data/national-rules.json"), "utf8"));

const S270 = "https://www.legislation.gov.uk/ukpga/2004/34/section/270";
const VERIFIED = "2026-08-05";

const NOTES = {
  scotland:
    "No council in Scotland can run selective or additional licensing, because the Housing Act 2004 does not extend to Scotland. Instead every landlord must register with the council, and an HMO housing three or more people from three or more households needs an HMO licence.",
  "northern-ireland":
    "No council in Northern Ireland can run selective or additional licensing, because the Housing Act 2004 does not extend there. Landlords must join the landlord registration scheme, and an HMO housing more than two households needs a licence from the NIHMO Unit.",
};

function research(nation, council) {
  const d = nation === "scotland" ? RULES.scotland : RULES.ni;
  const reg = d.registration;
  const hmo = d.hmo;
  const common =
    `RESOLVED BY STATUTE, NOT BY PER-COUNCIL RESEARCH, and that distinction matters. ` +
    `Selective licensing (Housing Act 2004 Part 3) and additional HMO licensing (Part 2 s.56) exist only where that Act applies. ` +
    `Section 270(11) provides that "this Act extends to England and Wales only" (${S270}). ` +
    `${council} therefore has no legal power to designate either scheme, so this is a definite answer rather than an absence of evidence, ` +
    `and it cannot change without primary legislation at Westminster. ` +
    `${d.discretionaryLicensing.note} `;

  if (nation === "scotland") {
    return (
      common +
      `WHAT DOES APPLY INSTEAD. (1) LANDLORD REGISTRATION under the Antisocial Behaviour etc. (Scotland) Act 2004 Part 8: ${reg.criteria}. ` +
      `Registration lasts ${reg.renewalYears} years and costs about £${reg.feesGBP.principalPerCouncil} per council plus £${reg.feesGBP.perProperty} per property ` +
      `(no per-property fee where the property is a licensed HMO), with a £${reg.feesGBP.lateFee} late fee and a maximum penalty of £${reg.penaltyMax.toLocaleString()}. ` +
      `(2) HMO LICENSING under the Housing (Scotland) Act 2006 Part 5 s.125: ${hmo.criteria}. ` +
      `Licences typically run ${hmo.licenceDurationYearsTypical} years, the fee is set by each council, and the maximum penalty is £${hmo.penaltyMax.toLocaleString()}. ` +
      `NOTE THE THRESHOLD DIFFERENCE: Scotland's HMO test is THREE or more people from three or more households, which is broader than England's mandatory five. ` +
      `TRAP EXPLICITLY EXCLUDED: ${d.discretionaryLicensing.doNotConfuse} ` +
      `Enhanced Enforcement Areas are the single most likely thing to be mistaken for selective licensing in Scotland, because they are area-designated and housing-related, but they confer no licence requirement on any landlord.`
    );
  }
  return (
    common +
    `WHAT DOES APPLY INSTEAD. (1) LANDLORD REGISTRATION under the Private Tenancies (Northern Ireland) Order 2006 art.65A: ${reg.criteria}. ` +
    `Registration lasts ${reg.durationYears} years and costs £${reg.feesGBP.online} online or £${reg.feesGBP.paper} on paper, ` +
    `with a £${reg.penalties.fixedPenaltyGBP} fixed penalty or a court fine up to £${reg.penalties.courtFineMaxGBP.toLocaleString()}. ` +
    `ADMINISTRATION CHANGED RECENTLY: ${reg.administeredBy}. ` +
    `(2) HMO LICENSING under the Houses in Multiple Occupation Act (Northern Ireland) 2016 s.1: ${hmo.criteria}. ` +
    `${hmo.administeredBy}, so a landlord in ${council} does not apply to their own council. ` +
    `Licences run ${hmo.licenceDurationYears} years. ${hmo.feesGBP.note} ` +
    `Penalties run to a £${hmo.penalties.fixedPenaltyGBP.toLocaleString()} fixed penalty and £${hmo.penalties.summaryConvictionMaxGBP.toLocaleString()} on summary conviction. ` +
    `NOTE THE THRESHOLD DIFFERENCE: ${hmo.thresholdNote} ` +
    `PLANNING: ${hmo.planningNote}`
  );
}

const out = COUNCILS.filter((c) => c.nation === "scotland" || c.nation === "northern-ireland").map((c) => ({
  council: c.name,
  gss: c.gss,
  schemes: [],
  notes: NOTES[c.nation],
  research: research(c.nation, c.name),
  sourceUrl: S270,
  verified: VERIFIED,
}));

const target = path.join(ROOT, "scripts/incoming/batch-17.json");
fs.writeFileSync(target, JSON.stringify(out, null, 2) + "\n", "utf8");
console.log(`wrote ${target}: ${out.length} records`);
console.log(`  scotland: ${out.filter((r) => r.gss.startsWith("S")).length}`);
console.log(`  n.ireland: ${out.filter((r) => r.gss.startsWith("N")).length}`);
console.log(`  longest notes: ${Math.max(...out.map((r) => r.notes.length))} chars (max 300)`);
