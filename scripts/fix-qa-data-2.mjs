/**
 * Remaining low-severity QA fixes to the data.
 *
 * 1. Tower Hamlets' checker link used http://. The same URL serves 200 over
 *    https, so there is no reason to send a landlord over plain HTTP from a
 *    paid product.
 * 2. "Sept" appears once where every other date uses "Sep".
 */
import { readFileSync, writeFileSync } from "node:fs";

const path = "src/data/licensing-schemes.json";
const data = JSON.parse(readFileSync(path, "utf8"));

let upgraded = 0;
let months = 0;

for (const council of data) {
  for (const field of ["sourceUrl"]) {
    if (typeof council[field] === "string" && council[field].startsWith("http://")) {
      council[field] = council[field].replace(/^http:\/\//, "https://");
      upgraded++;
    }
  }
  if (typeof council.notes === "string" && /\bSept\b/.test(council.notes)) {
    council.notes = council.notes.replace(/\bSept\b/g, "Sep");
    months++;
  }
  for (const scheme of council.schemes ?? []) {
    for (const field of ["sourceUrl", "checkerUrl"]) {
      if (typeof scheme[field] === "string" && scheme[field].startsWith("http://")) {
        console.log(`${council.council} ${field}: upgraded to https`);
        scheme[field] = scheme[field].replace(/^http:\/\//, "https://");
        upgraded++;
      }
    }
    if (typeof scheme.areaDescription === "string" && /\bSept\b/.test(scheme.areaDescription)) {
      scheme.areaDescription = scheme.areaDescription.replace(/\bSept\b/g, "Sep");
      months++;
    }
  }
}

writeFileSync(path, JSON.stringify(data, null, 2) + "\n");
console.log(`http:// links upgraded to https: ${upgraded}`);
console.log(`"Sept" normalised to "Sep": ${months}`);
