/**
 * One-off: reconcile the Newcastle research against the records we actually hold.
 *
 * The research brief described our three ACTIVE-looking area schemes, but the
 * data holds four: the third is the 2026 renewal already recorded as
 * `upcoming`. So the agent's "Record 3 duplicates Record 1" finding is an
 * artefact of the brief, not a data fault, and its separately reported "fourth
 * designation we are missing" is that same upcoming record.
 *
 * This drops the duplicate entry and points the 2026 designation at the record
 * it corrects, matching on the date we hold (1 October, from the council's web
 * page) while letting the merge correct it to the date the designation
 * instrument itself states (30 September).
 */
import { readFileSync, writeFileSync } from "node:fs";

const path = "scripts/incoming/areas-newcastle.json";
const doc = JSON.parse(readFileSync(path, "utf8"));

const kept = [];
const seen = new Set();
for (const s of doc.schemes) {
  const key = `${s.inForce?.start}|${s.inForce?.end}`;
  if (seen.has(key)) {
    console.log(`Dropped duplicate entry: ${String(s.match?.describedAs).slice(0, 60)}`);
    continue;
  }
  seen.add(key);
  kept.push(s);
}

for (const s of kept) {
  // The 2026 designation: match our existing upcoming record by its recorded
  // start, then let inForce.start correct it to the statutory date.
  if (s.inForce?.start === "2026-09-30") {
    s.match.start = "2026-10-01";
    console.log("2026 designation: matching on 2026-10-01, will correct start to 2026-09-30");
  }
}

doc.schemes = kept;
writeFileSync(path, JSON.stringify(doc, null, 2) + "\n");
console.log(`${kept.length} entries kept.`);
