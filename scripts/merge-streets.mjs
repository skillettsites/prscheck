/**
 * Merge researched designated-street schedules into src/data/licensing-schemes.json.
 *
 * Usage:
 *   node scripts/merge-streets.mjs --dry      # report only
 *   node scripts/merge-streets.mjs            # write
 *
 * Reads every scripts/incoming/streets-*.json, matches each entry to an existing
 * scheme by (gss, type, start, end), and attaches its `streets` array.
 *
 * It refuses to guess. A schedule that cannot be matched to exactly one scheme
 * is reported and skipped rather than attached to a best guess, because a street
 * list on the wrong designation produces confident wrong answers in both
 * directions.
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SCHEMES_PATH = join(ROOT, "src", "data", "licensing-schemes.json");
const INCOMING = join(ROOT, "scripts", "incoming");
const DRY = process.argv.includes("--dry");

const THOROUGHFARE = /\b(road|rd|street|st|lane|ln|avenue|ave|close|drive|dr|way|place|pl|court|ct|crescent|cres|gardens|gdns|grove|terrace|walk|hill|park|rise|view|green|square|sq|row|mount|vale|mews|parade|approach|bank|brow|chase|circus|croft|dale|end|fields|gate|glade|heath|meadow|moor|paddock|path|quay|ridge|side|spinney|strand|villas|wharf|wood|yard|buildings)$/i;

/**
 * Expand a compound entry into the streets it actually names.
 *
 * Scarborough publishes rows like "Clarence Place and Clarence Road" and
 * "Durham Street and Place" in a single cell. Left as one string, neither
 * street ever matches, and the engine returns "not in the designated area" for
 * a property that IS designated. That is the expensive direction of error, so
 * these are split, and the abbreviated second half is completed from the first
 * half's prefix ("Durham Street and Place" -> Durham Street, Durham Place).
 *
 * Returns the original single name unchanged when the pattern does not clearly
 * describe two streets, since some real street names contain "and".
 */
function expandCompound(name) {
  const m = name.match(/^(.+?)\s+(?:and|&)\s+(.+)$/i);
  if (!m) return [name];
  const [, left, right] = m;
  const leftWords = left.trim().split(/\s+/);
  const rightWords = right.trim().split(/\s+/);
  // Both halves name a thoroughfare in full: "Market Street and Market Way".
  if (THOROUGHFARE.test(leftWords[leftWords.length - 1]) && THOROUGHFARE.test(rightWords[rightWords.length - 1])) {
    if (rightWords.length >= 2) return [left.trim(), right.trim()];
    // Right half is a bare type: "Durham Street and Place" -> "Durham Place".
    return [left.trim(), `${leftWords.slice(0, -1).join(" ")} ${right.trim()}`];
  }
  return [name];
}

const schemes = JSON.parse(readFileSync(SCHEMES_PATH, "utf8"));
const byGss = new Map(schemes.map((c) => [c.gss, c]));

const files = readdirSync(INCOMING).filter((f) => /^streets-.*\.json$/.test(f)).sort();
if (files.length === 0) {
  console.error("No scripts/incoming/streets-*.json files found.");
  process.exit(1);
}

let attached = 0;
let totalStreets = 0;
const problems = [];
const expansions = [];

for (const file of files) {
  let doc;
  try {
    doc = JSON.parse(readFileSync(join(INCOMING, file), "utf8"));
  } catch (e) {
    problems.push(`${file}: not valid JSON (${e.message})`);
    continue;
  }
  const council = byGss.get(doc.gss);
  if (!council) {
    problems.push(`${file}: gss ${doc.gss} is not in licensing-schemes.json`);
    continue;
  }

  for (const entry of doc.schemes ?? []) {
    const { type, start, end } = entry.match ?? {};
    const candidates = (council.schemes ?? []).filter(
      (s) => s.type === type && s.start === start && s.end === end,
    );
    if (candidates.length !== 1) {
      problems.push(
        `${file}: ${doc.council} ${type} ${start}..${end} matched ${candidates.length} schemes, skipped`,
      );
      continue;
    }
    const target = candidates[0];

    if (entry.confidence === "not-found") {
      problems.push(`${file}: ${doc.council} ${start}..${end} reported not-found, left as check-boundary`);
      continue;
    }
    if (!Array.isArray(entry.streets) || entry.streets.length === 0) {
      problems.push(`${file}: ${doc.council} ${start}..${end} has no streets, skipped`);
      continue;
    }

    // Validate and expand.
    const out = [];
    const seen = new Set();
    for (const s of entry.streets) {
      const name = String(s?.name ?? "").trim();
      if (!name) {
        problems.push(`${file}: ${doc.council} ${start}..${end} has an entry with no name, skipped`);
        continue;
      }
      const numbers = s.numbers == null || String(s.numbers).trim() === "" ? null : String(s.numbers).trim();
      const names = expandCompound(name);
      if (names.length > 1) expansions.push(`${doc.council}: "${name}" -> ${names.map((n) => `"${n}"`).join(" + ")}`);
      for (const n of names) {
        const key = `${n.toLowerCase()}|${numbers ?? ""}`;
        if (seen.has(key)) continue;
        seen.add(key);
        out.push(numbers === null ? { name: n } : { name: n, numbers });
      }
    }

    target.streets = out;
    // Replace the source with the official one the research actually read.
    // Several of these records previously cited commercial aggregators, which
    // is the failure mode this whole dataset exists to beat.
    if (entry.sourceUrl && /^https?:\/\//.test(entry.sourceUrl)) target.sourceUrl = entry.sourceUrl;
    attached++;
    totalStreets += out.length;
    console.log(
      `${doc.council.padEnd(42)} ${type} ${start}..${end}  ${String(out.length).padStart(4)} streets  ` +
        `(${out.filter((x) => x.numbers).length} with number ranges)  [${entry.confidence}]`,
    );
  }
}

if (expansions.length) {
  console.log(`\nCompound entries expanded (${expansions.length}):`);
  for (const e of expansions) console.log(`  ${e}`);
}
if (problems.length) {
  console.log(`\nProblems (${problems.length}):`);
  for (const p of problems) console.log(`  ${p}`);
}

console.log(`\n${attached} schemes given a street schedule, ${totalStreets} streets total.`);

if (DRY) {
  console.log("Dry run, nothing written.");
} else {
  writeFileSync(SCHEMES_PATH, JSON.stringify(schemes, null, 2) + "\n");
  const kb = Math.round(Buffer.byteLength(JSON.stringify(schemes)) / 1024);
  console.log(`Wrote ${SCHEMES_PATH} (${kb}KB runtime data).`);
}
