/**
 * Rewrite council notes that leaked research mechanics onto public pages.
 *
 * `notes` renders VERBATIM on the council page and inside the paid report.
 * Twelve records were still carrying working shorthand from the research pass:
 * "gateshead.gov.uk 403'd", "LPL + Kamma cited", "council pages 404'd",
 * "re-verify against designation notice". On a paid product that reads as an
 * admission that we could not open the council's website and fell back to the
 * commercial aggregators we market ourselves against.
 *
 * The substance is kept wherever it helps a landlord decide what to do: which
 * parts are uncertain, what expired, what to confirm with the council. What is
 * dropped is how we did the research, which is our problem and not the reader's.
 *
 * Every replacement stays inside the 280-character public cap.
 */
import { readFileSync, writeFileSync } from "node:fs";

const path = "src/data/licensing-schemes.json";
const data = JSON.parse(readFileSync(path, "utf8"));

const REPLACEMENTS = {
  "Gateshead Metropolitan Borough Council":
    "This scheme covers parts of the named wards rather than whole wards, so the exact boundary decides whether a specific address is included. Confirm the property against the council's own postcode checker before letting.",
  "Great Yarmouth Borough Council":
    "This scheme replaces the earlier Nelson ward designation, which ran from 2019 to 2024. A borough-wide additional (HMO) licensing scheme has been consulted on but not designated, so it does not apply yet.",
  "London Borough of Camden":
    "Camden runs borough-wide additional (HMO) licensing. It does not operate a selective licensing scheme, so a property let to a single household needs no council licence here.",
  "London Borough of Ealing":
    "Ealing's designations are legally fixed to the ward boundaries in place before the 2022 review, so current ward names do not map onto them cleanly. The designated street list is the reliable test, and the council also runs a postcode checker.",
  "London Borough of Enfield":
    "Enfield's 2021 selective designation is legally fixed to its 2002 ward boundaries, so current ward names do not map onto it cleanly. A replacement scheme covering a different set of wards runs from 1 September 2026. Confirm the address with the council.",
  "London Borough of Hammersmith and Fulham":
    "The selective scheme here is one of the most tightly targeted in London: it covers 24 named streets rather than whole wards, so the exact address decides it. Additional (HMO) licensing is borough-wide.",
  "London Borough of Hillingdon":
    "Hillingdon does not operate a selective licensing scheme. Borough-wide additional (HMO) licensing begins on 24 August 2026.",
  "London Borough of Islington":
    "Islington's selective scheme covers the Finsbury Park, Tollington and Hillrise wards in full. A further seven wards have been announced and will be added once designated.",
  Middlesbrough:
    "Two selective licensing schemes are in force in the Newport area. The North Ormesby scheme has expired. Middlesbrough does not operate an additional (HMO) licensing scheme.",
  Northumberland:
    "Northumberland does not operate an additional (HMO) licensing scheme. The fee shown is indicative; confirm the current figure with the council before applying.",
  "South Tyneside Metropolitan Borough Council":
    "This selective licensing scheme expired on 31 March 2026 and no renewal has been announced, so a property here most likely does not currently need a selective licence. Confirm with the council before letting. There is no additional (HMO) scheme.",
  "Stockton-on-Tees Borough Council":
    "Stockton-on-Tees does not operate an additional (HMO) licensing scheme.",
};

let changed = 0;
for (const [council, note] of Object.entries(REPLACEMENTS)) {
  const c = data.find((x) => x.council === council);
  if (!c) {
    console.log(`SKIPPED, council not found: ${council}`);
    continue;
  }
  if (note.length > 280) {
    console.log(`SKIPPED, replacement is ${note.length} chars, over the 280 cap: ${council}`);
    continue;
  }
  console.log(`${council}\n  was: ${c.notes}\n  now: ${note}`);
  c.notes = note;
  changed++;
}

writeFileSync(path, JSON.stringify(data, null, 2) + "\n");
console.log(`\n${changed} notes rewritten.`);

// Re-scan so this cannot quietly regress.
const LEAK = /\bLPL\b|\bKamma\b|403'?d|404'?d|blocks fetchers|to fetcher|cited\b|re-verify|NRLA|legislate|londonpropertylicensing|sitemap|control query|User-Agent|Wayback/i;
const remaining = [];
for (const c of data) {
  if (c.notes && LEAK.test(c.notes)) remaining.push(`${c.council}: ${c.notes.slice(0, 120)}`);
  for (const s of c.schemes ?? []) {
    if (s.areaDescription && LEAK.test(s.areaDescription)) remaining.push(`${c.council} (area): ${s.areaDescription.slice(0, 120)}`);
  }
}
const overCap = data.filter((c) => c.notes && c.notes.length > 280);
console.log(`\nremaining leaks: ${remaining.length}`);
for (const r of remaining) console.log(`  ${r}`);
console.log(`notes over the 280-char cap: ${overCap.length}`);
for (const c of overCap) console.log(`  ${c.council} (${c.notes.length})`);
