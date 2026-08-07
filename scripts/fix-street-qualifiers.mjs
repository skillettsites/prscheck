/**
 * Move restrictions out of street NAMES and into the numbers field.
 *
 * Councils put three different kinds of thing in a trailing parenthetical, and
 * none of them belongs in the name:
 *
 *   "Locket Road (odds)"            a parity restriction
 *   "Derby Road (odd numbers only)" the same
 *   "Queens Drive (Acton)"          a locality disambiguating two same-named roads
 *   "New Lane (Longden Terrace)"    a sub-area
 *
 * Ordnance Survey returns the bare street name, so an exact comparison against
 * the qualified form never matched and every property on those streets was
 * answered "not in a designated area". Ealing's two designated Queens Drives
 * were both affected, across a 1,437-street schedule.
 *
 * The engine now strips the parenthetical when matching, which fixes the
 * locality cases on its own. But a parity restriction stripped and forgotten
 * would silently widen the designation to the whole street, so this moves it
 * into `numbers`, where the matcher applies it and where an unreadable
 * restriction degrades to "check with the council" rather than to a guess.
 *
 * Usage: node scripts/fix-street-qualifiers.mjs [--dry]
 */
import { readFileSync, writeFileSync } from "node:fs";

const DRY = process.argv.includes("--dry");
const path = "src/data/licensing-schemes.json";
const data = JSON.parse(readFileSync(path, "utf8"));

/** Does this parenthetical restrict which properties are covered? */
const RESTRICTION = /\bodds?\b|\bevens?\b|\bnumbers?\b|\bnos?\b|[0-9]/i;

let movedToNumbers = 0;
let localityStripped = 0;
const examples = [];

for (const council of data) {
  for (const scheme of council.schemes ?? []) {
    for (const street of scheme.streets ?? []) {
      const m = String(street.name).match(/^(.*?)\s*\(([^)]*)\)\s*$/);
      if (!m) continue;
      const [, base, inner] = m;
      if (!base.trim()) continue;

      if (RESTRICTION.test(inner)) {
        // Preserve BOTH, since a street can carry a range in `numbers` and a
        // parity in its name. Joining keeps the council's own words in view.
        street.numbers = street.numbers ? `${street.numbers}; ${inner}` : inner;
        movedToNumbers++;
        if (examples.length < 12) examples.push(`${council.council}: "${street.name}" -> name "${base.trim()}", numbers "${street.numbers}"`);
      } else {
        localityStripped++;
        if (examples.length < 12) examples.push(`${council.council}: "${street.name}" -> name "${base.trim()}" (locality qualifier)`);
      }
      street.name = base.trim();
    }
  }
}

console.log(`restrictions moved from name into numbers: ${movedToNumbers}`);
console.log(`locality qualifiers stripped from name:    ${localityStripped}`);
for (const e of examples) console.log(`  ${e}`);

// A street can now appear twice in a scheme with the same name and different
// numbers, which the matcher already handles: it checks every entry and only
// answers "not in area" when all of them exclude the property.
if (DRY) {
  console.log("\nDry run, nothing written.");
} else {
  writeFileSync(path, JSON.stringify(data, null, 2) + "\n");
  console.log("\nWritten.");
}
