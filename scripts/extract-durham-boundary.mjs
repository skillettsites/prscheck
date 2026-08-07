/**
 * One-off: lift County Durham's 21 straddling postcodes out of the research
 * prose into their own field.
 *
 * The council publishes these separately and explicitly refuses to say yes or
 * no on them. Left inside `boundaryDescription`, they would fall through to
 * "not in the designated postcode list", which reads as a no for properties
 * that may well need a licence.
 */
import { readFileSync, writeFileSync } from "node:fs";

const path = "scripts/incoming/areas-county-durham.json";
const doc = JSON.parse(readFileSync(path, "utf8"));
const scheme = doc.schemes[0];

const m = (scheme.boundaryDescription || "").match(/yes\/no:\s*([^.]+)\./);
if (!m) {
  console.error("Could not find the straddling-postcode sentence.");
  process.exit(1);
}

const POSTCODE = /^[A-Z]{1,2}[0-9][A-Z0-9]?\s*[0-9][A-Z]{2}$/;
const list = m[1]
  .split(",")
  .map((x) => x.trim().toUpperCase())
  .filter((x) => POSTCODE.test(x));

scheme.boundaryPostcodes = list;

const designated = new Set((scheme.postcodes || []).map((x) => x.replace(/[^A-Z0-9]/g, "")));
const overlap = list.filter((x) => designated.has(x.replace(/[^A-Z0-9]/g, "")));

writeFileSync(path, JSON.stringify(doc, null, 2) + "\n");
console.log(`boundaryPostcodes extracted: ${list.length}`);
console.log(list.join(", "));
console.log(`overlap with the designated list (must be 0): ${overlap.length}`);
