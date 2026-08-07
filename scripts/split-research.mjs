#!/usr/bin/env node
/**
 * Moves the `research` evidence trail out of the runtime data file.
 *
 * `research` is the full audit trail for each council: quoted council wording,
 * fee lines, committee references and the false positives that were excluded.
 * It is deliberately never rendered to a user. But it is ~69% of
 * licensing-schemes.json by volume, and that file is imported by every one of
 * the 456 statically generated pages, which was enough to OOM the build once
 * all 361 councils carried a full write-up.
 *
 * After this split:
 *   src/data/licensing-schemes.json   runtime: council, gss, schemes, notes, source
 *   scripts/licensing-research.json   audit trail, keyed by GSS, never bundled
 *
 * Run once. `merge-schemes.mjs` keeps them in step from then on.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const RUNTIME = path.join(ROOT, "src/data/licensing-schemes.json");
const ARCHIVE = path.join(ROOT, "scripts/licensing-research.json");

const records = JSON.parse(fs.readFileSync(RUNTIME, "utf8"));

const archive = fs.existsSync(ARCHIVE) ? JSON.parse(fs.readFileSync(ARCHIVE, "utf8")) : {};
let moved = 0;

const stripped = records.map((rec) => {
  if (typeof rec.research === "string" && rec.research.length > 0) {
    archive[rec.gss] = { council: rec.council, research: rec.research };
    moved++;
  }
  const { research, ...rest } = rec;
  void research;
  return rest;
});

const before = fs.statSync(RUNTIME).size;
fs.writeFileSync(RUNTIME, JSON.stringify(stripped, null, 2) + "\n", "utf8");
fs.writeFileSync(ARCHIVE, JSON.stringify(archive, null, 2) + "\n", "utf8");
const after = fs.statSync(RUNTIME).size;

console.log(`moved ${moved} research write-ups to ${path.relative(ROOT, ARCHIVE)}`);
console.log(`runtime data: ${(before / 1024).toFixed(0)}KB -> ${(after / 1024).toFixed(0)}KB`);
console.log(`archive now holds ${Object.keys(archive).length} councils`);
