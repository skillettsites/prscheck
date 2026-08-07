/**
 * Split street names whose words ran together during transcription.
 *
 * Manchester's designation tables lost spaces in a handful of cells:
 * "ErnocroftGrove", "LongfordStreet", "PeterboroughStreet". Ordnance Survey
 * returns "Ernocroft Grove", so these never match exactly.
 *
 * They are not currently dangerous: `streetNearMiss` sees a one-edit difference
 * and withholds the confident negative, so the answer degrades to "check the
 * boundary" rather than "you are clear". But a hedge is a worse answer than the
 * definite one we could give, on a report someone paid for, so fixing the data
 * converts each of these back into a real answer.
 *
 * Only splits before a known thoroughfare suffix, so a genuine single-word name
 * is left alone.
 *
 * Usage: node scripts/fix-runtogether-streets.mjs [--dry]
 */
import { readFileSync, writeFileSync } from "node:fs";

const DRY = process.argv.includes("--dry");
const path = "src/data/licensing-schemes.json";
const data = JSON.parse(readFileSync(path, "utf8"));

const SUFFIXES = [
  "Road", "Street", "Lane", "Avenue", "Close", "Drive", "Place", "Court", "Crescent",
  "Gardens", "Grove", "Terrace", "Walk", "Square", "Row", "Mews", "Parade", "Way", "Hill",
  "Bank", "Park", "Rise", "View", "Green", "Vale", "Mount",
];
// "ErnocroftGrove" -> "Ernocroft Grove". Requires a lowercase letter immediately
// before the capitalised suffix, so "Longford Street" and "STREET" are untouched.
const RE = new RegExp(`([a-z])(${SUFFIXES.join("|")})$`);

let fixed = 0;
const examples = [];
for (const council of data) {
  for (const scheme of council.schemes ?? []) {
    for (const street of scheme.streets ?? []) {
      const next = String(street.name).replace(RE, "$1 $2");
      if (next === street.name) continue;
      examples.push(`${council.council}: "${street.name}" -> "${next}"`);
      street.name = next;
      fixed++;
    }
  }
}

console.log(`run-together street names split: ${fixed}`);
for (const e of examples) console.log(`  ${e}`);

if (DRY) {
  console.log("\nDry run, nothing written.");
} else {
  writeFileSync(path, JSON.stringify(data, null, 2) + "\n");
  console.log("\nWritten.");
}
