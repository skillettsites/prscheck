/**
 * Second pass on public-facing notes.
 *
 * Two genuine problems left after the first pass:
 *
 * - **Oldham's note is now factually wrong as well as leaky.** It described the
 *   ward list as combining a council report with a commercial aggregator's
 *   eleven-ward listing. That list has since been corrected to the nine wards
 *   the designation notice actually names, so the note describes data we no
 *   longer hold, and names the aggregator while doing it.
 * - **Redcar's note is 405 characters**, well over the length that reads
 *   sensibly inline on a council page. It is mine, from earlier today.
 *
 * Everything else flagged was a false positive: fee amounts containing "404" or
 * "403", and legitimate mentions of an NRLA members' discount on a licence fee.
 * Those are left alone rather than mangled to satisfy a regex.
 */
import { readFileSync, writeFileSync } from "node:fs";

const path = "src/data/licensing-schemes.json";
const data = JSON.parse(readFileSync(path, "utf8"));

const REPLACEMENTS = {
  "Oldham Metropolitan Borough Council":
    "This scheme covers designated areas within nine wards rather than whole wards, and the council's street list is published for guidance only, so a street missing from it may still be included. Check the exact address on the council's own map.",
  "Redcar and Cleveland":
    "The South Bank selective licensing designation expired on 24 March 2024 and no successor has been designated, so no selective licence is currently required. A new East Cleveland scheme has been asked for but is only at the evidence-gathering stage.",
};

for (const [council, note] of Object.entries(REPLACEMENTS)) {
  const c = data.find((x) => x.council === council);
  if (!c) {
    console.log(`SKIPPED, not found: ${council}`);
    continue;
  }
  console.log(`${council}: ${c.notes.length} -> ${note.length} chars`);
  c.notes = note;
}

writeFileSync(path, JSON.stringify(data, null, 2) + "\n");

// Final scan. The patterns here describe HOW research was done, which is never
// something a paying reader should see. Fee amounts and landlord-association
// discounts are deliberately not matched.
const LEAK = /\bLPL\b|\bKamma\b|\d{3}'d\b|blocks fetchers|to fetcher|\bcited\b|re-verify|legislate|londonpropertylicensing|sitemap|control query|User-Agent|Wayback|moderngov/i;
const leaks = [];
for (const c of data) {
  if (c.notes && LEAK.test(c.notes)) leaks.push(`${c.council}: ${c.notes.slice(0, 110)}`);
  for (const s of c.schemes ?? []) {
    if (s.areaDescription && LEAK.test(s.areaDescription)) leaks.push(`${c.council} (area): ${s.areaDescription.slice(0, 110)}`);
  }
}
const long = data.filter((c) => c.notes && c.notes.length > 300);
console.log(`\nresearch shorthand still in public text: ${leaks.length}`);
for (const l of leaks) console.log(`  ${l}`);
console.log(`notes over 300 characters: ${long.length}`);
for (const c of long) console.log(`  ${c.council} (${c.notes.length})`);
