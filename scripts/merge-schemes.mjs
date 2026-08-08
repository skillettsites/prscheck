#!/usr/bin/env node
/**
 * Validate and merge researched council licensing records into
 * src/data/licensing-schemes.json.
 *
 *   node scripts/merge-schemes.mjs <incoming.json> [--dry]
 *
 * Refuses to merge anything that fails validation. A bad "no scheme" record is
 * worse than a missing one, so the bar here is deliberately high.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const COUNCILS = JSON.parse(fs.readFileSync(path.join(ROOT, "src/data/councils.json"), "utf8"));
const TARGET = path.join(ROOT, "src/data/licensing-schemes.json");
const WARDS = JSON.parse(fs.readFileSync(path.join(ROOT, "src/data/wards.json"), "utf8"));
const normWard = (x) =>
  String(x).toLowerCase().replace(/&amp;/g, "and").replace(/&/g, "and")
    .replace(/[‘’'`]/g, "").replace(/[^a-z0-9]+/g, " ").trim();

const TYPES = new Set(["selective", "additional"]);
const STATUSES = new Set(["active", "upcoming", "expired", "proposed", "unverified"]);
const COVERAGE = new Set(["borough-wide", "district", "wards", "streets", "areas", "part"]);
const ISO = /^\d{4}-\d{2}-\d{2}$/;

const byGss = new Map(COUNCILS.map((c) => [c.gss, c]));

function validate(rec, i, existingGss, warn) {
  const e = [];
  const where = `[${i}] ${rec.council ?? rec.gss ?? "?"}`;

  if (!rec.gss) e.push(`${where}: missing gss`);
  else if (!byGss.has(rec.gss)) e.push(`${where}: gss ${rec.gss} is not a known council`);
  else if (existingGss.has(rec.gss)) e.push(`${where}: gss ${rec.gss} already present (would duplicate)`);

  if (!rec.council) e.push(`${where}: missing council name`);
  if (!Array.isArray(rec.schemes)) e.push(`${where}: schemes must be an array`);

  const unverified = typeof rec.notes === "string" && /^UNVERIFIED\b/i.test(rec.notes.trim());

  // A negative finding needs evidence just as much as a positive one.
  if (Array.isArray(rec.schemes) && rec.schemes.length === 0 && !unverified) {
    if (!rec.sourceUrl) e.push(`${where}: confirmed-no-scheme record needs a sourceUrl`);
    if (!rec.verified) e.push(`${where}: confirmed-no-scheme record needs a verified date`);
    if (!rec.notes) e.push(`${where}: confirmed-no-scheme record needs notes quoting the council`);
  }
  if (unverified && rec.verified) {
    e.push(`${where}: record is marked UNVERIFIED but carries a verified date`);
  }
  if (rec.verified && !ISO.test(rec.verified)) e.push(`${where}: verified must be YYYY-MM-DD`);

  // notes render verbatim on the public council page, so they must stay short
  // and free of internal research shorthand.
  if (typeof rec.notes === "string") {
    if (rec.notes.length > 300) e.push(`${where}: notes is ${rec.notes.length} chars (max 300) - move detail to research`);
    for (const bad of ["TRAP:", "IMPORTANT CORRECTION:", "Quoted:", "ADDITIONAL LICENSING:", "SELECTIVE LICENSING:"])
      if (rec.notes.includes(bad)) e.push(`${where}: notes contains internal marker ${JSON.stringify(bad)}`);
  }
  const REC_KEYS = new Set(["council", "gss", "schemes", "notes", "research", "sourceUrl", "verified"]);
  for (const k of Object.keys(rec)) if (!REC_KEYS.has(k)) e.push(`${where}: unknown top-level key ${JSON.stringify(k)}`);
  if (rec.sourceUrl && !/^https?:\/\//.test(rec.sourceUrl)) e.push(`${where}: sourceUrl is not a URL`);

  (rec.schemes ?? []).forEach((s, j) => {
    const w = `${where} scheme[${j}]`;
    if (!TYPES.has(s.type)) e.push(`${w}: bad type ${JSON.stringify(s.type)}`);
    if (!STATUSES.has(s.status)) e.push(`${w}: bad status ${JSON.stringify(s.status)}`);
    if (!COVERAGE.has(s.coverage)) e.push(`${w}: bad coverage ${JSON.stringify(s.coverage)}`);
    if (!s.sourceUrl || !/^https?:\/\//.test(s.sourceUrl)) e.push(`${w}: missing/invalid sourceUrl`);
    if (!s.verified || !ISO.test(s.verified)) e.push(`${w}: missing/invalid verified date`);
    if (s.start && !ISO.test(s.start)) e.push(`${w}: start must be YYYY-MM-DD or null`);
    if (s.end && !ISO.test(s.end)) e.push(`${w}: end must be YYYY-MM-DD or null`);
    if (s.coverage === "wards" && (!Array.isArray(s.wards) || s.wards.length === 0))
      e.push(`${w}: coverage "wards" requires a non-empty wards array`);

    // Ward names are matched EXACTLY against the current ONS ward set, so a name
    // that predates a boundary review silently stops matching and the engine
    // hedges the whole scheme. Warn loudly rather than fail: designations
    // genuinely do name abolished wards, and the honest hedge is the fallback.
    if (s.coverage === "wards" && Array.isArray(s.wards)) {
      const live = new Set((WARDS[rec.gss] ?? []).map(normWard));
      if (live.size > 0) {
        const unknown = s.wards.filter((x) => !live.has(normWard(x)));
        if (unknown.length > 0)
          warn.push(
            `${w}: ${unknown.length} ward name(s) not in the current ONS ward set for ${rec.gss} ` +
              `(${unknown.join(", ")}). The scheme will fall back to "check boundary". ` +
              `Verify against the council's designation map and record successor wards.`,
          );
      }
    }
    if (s.status === "active" && s.end && s.end < "2026-08-04")
      e.push(`${w}: marked active but end date ${s.end} is in the past`);
    // Street schedules power the address-level answer. A malformed entry here
    // would silently downgrade a definite answer back to "check the boundary",
    // or worse, clear someone who is actually in the designation.
    if (s.streets != null) {
      if (!Array.isArray(s.streets)) e.push(`${w}: streets must be an array or null`);
      else
        s.streets.forEach((st, k) => {
          if (!st || typeof st.name !== "string" || !st.name.trim())
            e.push(`${w}: streets[${k}] needs a non-empty name`);
          if (st.numbers != null && typeof st.numbers !== "string")
            e.push(`${w}: streets[${k}].numbers must be a string or null`);
          for (const key of Object.keys(st || {}))
            if (!["name", "numbers"].includes(key)) e.push(`${w}: streets[${k}] unknown key ${JSON.stringify(key)}`);
        });
    }
    if (s.coverage === "streets" && Array.isArray(s.streets) && s.streets.length === 0)
      e.push(`${w}: coverage "streets" with an empty streets array - use null if the council publishes no schedule`);

    const S_KEYS = new Set(["type","status","start","end","coverage","wards","streets","areaDescription","feeApprox","sourceUrl","verified"]);
    for (const k of Object.keys(s))
      if (!S_KEYS.has(k)) e.push(`${w}: unknown key ${JSON.stringify(k)} (engine ignores it; fold into areaDescription)`);
  });
  return e;
}

const [file, ...flags] = process.argv.slice(2);
if (!file) {
  console.error("usage: node scripts/merge-schemes.mjs <incoming.json> [--dry]");
  process.exit(1);
}
const dry = flags.includes("--dry");

const existing = JSON.parse(fs.readFileSync(TARGET, "utf8"));
const existingGss = new Set(existing.map((r) => r.gss));
let incoming = JSON.parse(fs.readFileSync(file, "utf8"));
if (!Array.isArray(incoming)) incoming = [incoming];

const errors = [];
const warnings = [];
const seen = new Set();
incoming.forEach((rec, i) => {
  if (seen.has(rec.gss)) errors.push(`[${i}] ${rec.gss}: duplicated within the incoming file`);
  seen.add(rec.gss);
  errors.push(...validate(rec, i, existingGss, warnings));
});

if (errors.length) {
  console.error(`\n✕ ${errors.length} validation error(s), nothing merged:\n`);
  errors.forEach((x) => console.error("  " + x));
  process.exit(1);
}

const withSchemes = incoming.filter((r) => r.schemes.length > 0).length;
const confirmedNone = incoming.filter(
  (r) => r.schemes.length === 0 && !/^UNVERIFIED/i.test(r.notes ?? "")
).length;
const unverified = incoming.length - withSchemes - confirmedNone;

if (warnings.length) {
  console.warn(`
! ${warnings.length} warning(s):
`);
  warnings.forEach((x) => console.warn("  " + x));
  console.warn("");
}

console.log(`✓ ${incoming.length} record(s) valid`);
console.log(`    ${withSchemes} with at least one scheme`);
console.log(`    ${confirmedNone} confirmed no scheme (sourced)`);
console.log(`    ${unverified} unverified (will show as no-data, not as "no scheme")`);

if (dry) {
  console.log("\n--dry, not written.");
  process.exit(0);
}

// `research` is the audit trail and is never rendered. It is ~69% of the data
// by volume and importing it into 456 static pages once OOM'd the build, so it
// is archived alongside rather than shipped. See scripts/split-research.mjs.
const ARCHIVE = path.join(ROOT, "scripts/licensing-research.json");
const archive = fs.existsSync(ARCHIVE) ? JSON.parse(fs.readFileSync(ARCHIVE, "utf8")) : {};
const lean = incoming.map((rec) => {
  if (typeof rec.research === "string" && rec.research.length > 0) {
    archive[rec.gss] = { council: rec.council, research: rec.research };
  }
  const { research, ...rest } = rec;
  void research;
  return rest;
});
fs.writeFileSync(ARCHIVE, JSON.stringify(archive, null, 2) + "\n", "utf8");

const merged = [...existing, ...lean].sort((a, b) => a.council.localeCompare(b.council, "en-GB"));
fs.writeFileSync(TARGET, JSON.stringify(merged, null, 2) + "\n", "utf8");
console.log(`\nwrote ${TARGET}: ${existing.length} -> ${merged.length} councils`);
console.log(`coverage: ${merged.length}/${COUNCILS.length} (${Math.round((merged.length / COUNCILS.length) * 100)}%)`);
