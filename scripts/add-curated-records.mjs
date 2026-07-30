/**
 * Write curated licensing records for councils confirmed by reading their own
 * pages, and only those. Run once; re-running is a no-op for councils already
 * present.
 *
 * Every record here was judged by a person reading the council's own words,
 * because the classifier cannot separate "runs a scheme" from "consulted on
 * one", "rejected one" or "had one end". Councils where the wording was
 * genuinely ambiguous are deliberately NOT written: East Riding (its page says
 * an additional scheme "operates in Goole" while the surrounding text reads as
 * though it has lapsed with existing licences grandfathered), Stoke, Preston,
 * Hyndburn, Sheffield and West Lindsey all need a human decision first.
 *
 * A record with `schemes: []` means "we checked and there is nothing", which is
 * a genuine result: councilSummary() reports hasData true with zero schemes, so
 * the site can say "no blanket scheme here" as fact rather than saying it blind.
 */

import { readFileSync, writeFileSync } from "node:fs";

const VERIFIED = "2026-07-30";
const FILE = "src/data/licensing-schemes.json";
const COUNCILS = "src/data/councils.json";

// Councils that state on their own site that they run neither scheme.
// `quote` is the sentence relied on, kept so the judgement is auditable.
const NO_SCHEME = [
  ["Amber Valley", "https://www.ambervalley.gov.uk/housing/private-rented-housing/houses-in-multiple-occupancy.aspx",
    "Amber Valley Borough Council currently does not operate any selective licensing schemes."],
  ["Blaby", "https://www.blaby.gov.uk/housing/private-housing/houses-in-multiple-occupation/",
    "Blaby District Council does not currently operate any Additional or Selective Licensing schemes for rental properties."],
  ["Breckland", "https://www.breckland.gov.uk/article/3788/Houses-in-Multiple-Occupation-HMOs",
    "Breckland council does not operate an additional or selective licensing scheme."],
  ["Chichester", "https://www.chichester.gov.uk/housing-in-multiple-occupation",
    "Chichester District Council does not run selective or additional licensing schemes."],
  ["Cumberland", "https://www.cumberland.gov.uk/housing/housing-advice/houses-multiple-occupation-hmos",
    "Cumberland Council does not currently operate: additional HMO licensing schemes; selective licensing for other private rented properties."],
  ["Derby", "https://www.derby.gov.uk/trading-standards-environmental-health/environmental-health/housing",
    "Derby City Council does not currently operate any Additional HMO Licensing or Selective Licensing schemes."],
  ["Derbyshire Dales", "https://www.derbyshiredales.gov.uk/environment/housing-health-safety-survey-private-rented-properties",
    "We do not operate Landlord Accreditation or Landlord Forums currently for this sector, nor Selective Licensing."],
  ["Erewash", "https://www.erewash.gov.uk/housing/privately-rented-homes/houses-multiple-occupation-hmos/index.html",
    "The Council do not currently operate any Additional License or Selective Licencing schemes."],
  ["Horsham", "https://www.horsham.gov.uk/licensing/public-licensing-registers/hmo-register",
    "Horsham District Council does not operate an additional or selective licensing scheme at present."],
  ["North Kesteven", "https://www.n-kesteven.gov.uk/private-sector-housing-enforcement-policy",
    "At the time of writing there are no additional or selective licensing requirements in place in the district."],
  ["Rother", "https://www.rother.gov.uk/environmental-health/private-rented-housing/houses-in-multiple-occupation/",
    "Rother District Council does not currently operate either an additional or selective licensing scheme."],
  ["Rushcliffe", "https://www.rushcliffe.gov.uk/environmental-health/licensing/other-licences/houses-in-multiple-occupation/",
    "In Rushcliffe, there is currently no additional or selective licensing."],
  ["Spelthorne", "https://www.spelthorne.gov.uk/page/1881/houses-multiple-occupation-hmo-landlords",
    "Spelthorne operates the mandatory licensing scheme under Part 2 of the Housing Act 2004, but does not currently operate any additional or selective licensing schemes."],
  ["Wiltshire", "https://www.wiltshire.gov.uk/article/10426/16-0-Houses-in-Multiple-Occupation-HMO",
    "There are currently no declared Additional or Selective Licencing schemes in Wiltshire."],
  ["West Suffolk", "https://www.westsuffolk.gov.uk/Business/Licensing-and-regulation/Licensing/hmo.cfm",
    "The council has not sought to adopt additional or selective licensing."],
  // Only reachable after correcting its host: Wikidata pointed at
  // www.southribble.gov.uk, which 301s to the apex.
  ["South Ribble", "https://southribble.gov.uk/",
    "South Ribble Borough Council has not designated any part of its district as subject to selective licensing of residential accommodation."],
];

// Councils with a confirmed live designation, or a live consultation.
const WITH_SCHEMES = [
  {
    name: "Doncaster",
    notes:
      'Council states: "We currently operate one selective licensing scheme in Doncaster, covering the designated area of Hexthorpe." The separate Edlington scheme ended 6 February 2023.',
    schemes: [
      {
        type: "selective",
        status: "active",
        // The page gives the designation date, not the date the scheme came
        // into force, so start is left null rather than guessed.
        start: null,
        end: null,
        coverage: "areas",
        areaDescription:
          "One designated area covering Hexthorpe. The Council designated the Hexthorpe area for selective licensing on 15 November 2021. The former Edlington designation ended 6 February 2023 and no longer applies.",
        feeApprox: null,
        sourceUrl: "https://www.doncaster.gov.uk/services/business-investment/selective-licensing",
        verified: VERIFIED,
      },
    ],
  },
  {
    name: "Bolton",
    notes: "Consultation stage only. No designation made at the time of checking.",
    schemes: [
      {
        type: "additional",
        status: "proposed",
        start: null,
        end: null,
        coverage: "borough-wide",
        areaDescription:
          "Public consultation launched 2 February 2026 on a proposed additional licensing scheme. If approved it would apply across the whole of Bolton to shared rented housing. Not yet designated.",
        feeApprox: null,
        sourceUrl:
          "https://www.bolton.gov.uk/news/article/1992/bolton-council-launches-consultation-on-proposals-to-improve-standards-in-shared-rented-housing",
        verified: VERIFIED,
      },
    ],
  },
  {
    name: "Bournemouth, Christchurch and Poole",
    notes: "Consultation stage only. No designation made at the time of checking.",
    schemes: [
      {
        type: "additional",
        status: "proposed",
        start: null,
        end: null,
        coverage: "areas",
        areaDescription:
          "Discretionary licensing consultation covering a proposed additional licensing scheme for non-mandatory HMOs across BCP, plus selective licensing area analysis. Not yet designated.",
        feeApprox: null,
        sourceUrl:
          "https://www.bcpcouncil.gov.uk/news-hub/news-articles/local-residents-encouraged-to-have-their-say-on-discretionary-licensing",
        verified: VERIFIED,
      },
    ],
  },
];

const councils = JSON.parse(readFileSync(COUNCILS, "utf8"));
const byName = new Map(councils.map((c) => [c.name.toLowerCase(), c]));
const schemes = JSON.parse(readFileSync(FILE, "utf8"));
const have = new Set(schemes.map((s) => s.gss));

const added = [];
const missed = [];

function lookup(name) {
  const c = byName.get(name.toLowerCase());
  if (!c) missed.push(name);
  return c;
}

for (const [name, sourceUrl, quote] of NO_SCHEME) {
  const c = lookup(name);
  if (!c || have.has(c.gss)) continue;
  schemes.push({
    council: c.name,
    gss: c.gss,
    schemes: [],
    notes: `Checked ${VERIFIED}: the council states it operates neither a selective nor an additional licensing scheme. Quoted: "${quote}"`,
    sourceUrl,
    verified: VERIFIED,
  });
  added.push(`${c.name} (no scheme)`);
}

for (const entry of WITH_SCHEMES) {
  const c = lookup(entry.name);
  if (!c || have.has(c.gss)) continue;
  schemes.push({ council: c.name, gss: c.gss, schemes: entry.schemes, notes: entry.notes });
  added.push(`${c.name} (${entry.schemes.map((s) => `${s.type}/${s.status}`).join(", ")})`);
}

schemes.sort((a, b) => a.council.localeCompare(b.council, "en-GB"));
writeFileSync(FILE, JSON.stringify(schemes, null, 2) + "\n");

console.log(`  added ${added.length} records, total now ${schemes.length}`);
for (const a of added) console.log(`    + ${a}`);
if (missed.length) console.log(`\n  NAME NOT MATCHED (skipped): ${missed.join(", ")}`);
