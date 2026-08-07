/**
 * One-off: turn Nottingham's ward-coverage table into definite answers.
 *
 * Nottingham's scheme is drawn as a polygon with no street or postcode
 * schedule, so it could only ever say "check the boundary". But two council
 * documents pin most of it down at ward level, and they carry different
 * evidential weight, which decides how each is used:
 *
 * - The **Public Notice** is the statutory document. It names the fifteen wards
 *   the designation covers "some or all of". Any ward absent from that list is
 *   outside the scheme on the council's own statutory statement, so those are
 *   safe to answer "not in area".
 * - The **Executive Board appendix** grades each ward Full / Part / None, but it
 *   describes the PROPOSED scheme. A proposal can change before designation, so
 *   it is used only for "Full" wards, where the effect is to assert a licence IS
 *   required. That is the safe direction to be wrong in; using its "None" rows
 *   to clear a landlord would not be.
 *
 * Net effect: 5 wards answer a definite no, 7 a definite yes, and only the 8
 * genuinely partial wards keep hedging.
 */
import { readFileSync, writeFileSync } from "node:fs";

const path = "scripts/incoming/areas-nottingham.json";
const doc = JSON.parse(readFileSync(path, "utf8"));
const scheme = doc.schemes[0];
const ons = JSON.parse(readFileSync("src/data/wards.json", "utf8"))["E06000018"];

const norm = (s) =>
  s.toLowerCase().replace(/&amp;/g, "and").replace(/&/g, "and").replace(/['’.]/g, "").replace(/[^a-z0-9]+/g, " ").trim();

// Verbatim from the Public Notice: the wards the designation covers some or all of.
const NOTICE_WARDS = [
  "Aspley", "Basford", "Berridge", "Bulwell", "Bulwell Forest", "Castle", "Dales",
  "Hyson Green & Arboretum", "Leen Valley", "Lenton & Wollaton East", "Mapperley",
  "Meadows", "Radford", "Sherwood", "St Anns",
];
// Verbatim from Executive Board Appendix 2, the rows graded "Full".
const FULL_WARDS = [
  "Berridge", "Castle", "Hyson Green & Arboretum", "Lenton & Wollaton East",
  "Mapperley", "Radford", "St Anns",
];

// Resolve every name to its current ONS spelling, so nothing is applied on a
// name the matcher will not recognise ("St Anns" vs ONS "St. Ann's").
function toOns(name) {
  const hit = ons.find((w) => norm(w) === norm(name));
  return hit ?? null;
}

const noticeResolved = NOTICE_WARDS.map(toOns);
const unresolvedNotice = NOTICE_WARDS.filter((_, i) => !noticeResolved[i]);
const fullResolved = FULL_WARDS.map(toOns);
const unresolvedFull = FULL_WARDS.filter((_, i) => !fullResolved[i]);

if (unresolvedNotice.length || unresolvedFull.length) {
  console.error("Unresolved against ONS:", [...unresolvedNotice, ...unresolvedFull].join(", "));
  process.exit(1);
}

const inNotice = new Set(noticeResolved.map(norm));
const excluded = ons.filter((w) => !inNotice.has(norm(w)));

scheme.fullWards = fullResolved;
scheme.excludedWards = excluded;

writeFileSync(path, JSON.stringify(doc, null, 2) + "\n");
console.log(`fullWards (${fullResolved.length}): ${fullResolved.join(", ")}`);
console.log(`excludedWards (${excluded.length}): ${excluded.join(", ")}`);
console.log(`still hedging: ${ons.length - fullResolved.length - excluded.length} genuinely partial wards`);
