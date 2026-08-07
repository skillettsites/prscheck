/**
 * Merge researched area/ward findings into src/data/licensing-schemes.json.
 *
 * Usage:
 *   node scripts/merge-areas.mjs --dry
 *   node scripts/merge-areas.mjs
 *
 * Reads scripts/incoming/areas-*.json and wards-*.json. These cover the
 * designations that a postcode alone could never resolve: polygons on PDF maps,
 * and ward lists transcribed before a boundary review.
 *
 * Matching is by (gss, type, coverage), narrowed by start date when the council
 * runs more than one scheme of the same shape. Anything still ambiguous is
 * reported and skipped: a street list or postcode set attached to the wrong
 * designation produces confident wrong answers in both directions, which is
 * worse than the gap it would fill.
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SCHEMES_PATH = join(ROOT, "src", "data", "licensing-schemes.json");
const INCOMING = join(ROOT, "scripts", "incoming");
const DRY = process.argv.includes("--dry");
/**
 * Today, for deciding whether "not live" means expired or not yet started.
 * Overridable so the behaviour can be checked without waiting for a date to pass.
 */
const TODAY = process.env.PRSCHECK_TODAY ?? new Date().toISOString().slice(0, 10);

const norm = (s) =>
  String(s).toLowerCase().replace(/&amp;/g, "and").replace(/&/g, "and").replace(/['’]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
const normPostcode = (p) => String(p).toUpperCase().replace(/[^A-Z0-9]/g, "");

const schemes = JSON.parse(readFileSync(SCHEMES_PATH, "utf8"));
const byGss = new Map(schemes.map((c) => [c.gss, c]));
const wards = JSON.parse(readFileSync(join(ROOT, "src", "data", "wards.json"), "utf8"));

const files = readdirSync(INCOMING).filter((f) => /^(areas|wards)-.*\.json$/.test(f)).sort();
if (files.length === 0) {
  console.error("No scripts/incoming/areas-*.json or wards-*.json files found.");
  process.exit(1);
}

const problems = [];
const notes = [];
let touched = 0;
/** Schemes whose ward list this run has already replaced, so later entries for
 *  the same scheme add to it instead of starting over. */
const replacedWards = new Set();

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
    const { type, coverage } = entry.match ?? {};
    if (entry.confidence === "not-found") {
      problems.push(`${file}: ${doc.council} ${type}/${coverage} reported not-found, left unchanged`);
      continue;
    }

    let candidates = (council.schemes ?? []).filter((s) => s.type === type && s.coverage === coverage);
    // Research sometimes classifies a designation's shape differently from us
    // (Harrow's Wealdstone scheme reads as "streets" to a researcher and
    // "wards" to us). A type plus an exact start date is specific enough to
    // identify the scheme on its own, so fall back to that rather than lose the
    // finding over a labelling disagreement.
    if (candidates.length === 0 && entry.inForce?.start) {
      candidates = (council.schemes ?? []).filter((s) => s.type === type && s.start === entry.inForce.start);
      if (candidates.length === 1) {
        notes.push(`${doc.council}: matched on type+start, research called it "${coverage}" and we hold "${candidates[0].coverage}"`);
      }
    }
    // A council can run several schemes of the same type and shape (Newcastle
    // runs three). Narrow on start date.
    //
    // Matching and correcting must use different fields. Research frequently
    // corrects a date, and Newcastle's 2026 designation is a case in point: our
    // record says it starts 1 October because that is what the council's web
    // page says, while the designation instrument itself says 30 September.
    // Matching on the corrected date would fail to find the record it corrects.
    const matchStart = entry.match?.start ?? entry.inForce?.start;
    if (candidates.length > 1 && matchStart) {
      const byStart = candidates.filter((s) => s.start === matchStart);
      if (byStart.length === 1) candidates = byStart;
    }
    const start = matchStart;
    if (candidates.length !== 1) {
      problems.push(
        `${file}: ${doc.council} ${type}/${coverage} start=${start ?? "?"} matched ${candidates.length} schemes, skipped`,
      );
      continue;
    }
    const target = candidates[0];
    const applied = [];

    // The research verifies whether the designation is actually still in force.
    // This is where expired schemes get caught, which is the single most
    // damaging kind of wrong answer we can give.
    //
    // `stillLive: false` is ambiguous on its own: it covers both "this expired"
    // and "this is validly made but not operative yet". Newcastle's 2026
    // designation is the latter, and marking it expired would delete a scheme
    // that starts in weeks. The end date decides which it is.
    if (entry.inForce && entry.inForce.stillLive === false) {
      const end = entry.inForce.end ?? target.end;
      const start = entry.inForce.start ?? target.start;
      if (end && end < TODAY) {
        target.status = "expired";
        applied.push("status -> expired");
      } else if (start && start > TODAY) {
        target.status = "upcoming";
        applied.push("status -> upcoming");
      } else {
        problems.push(
          `${file}: ${doc.council} ${type}/${coverage} reported not live but its dates (${start} to ${end}) span today, status left as ${target.status}`,
        );
      }
    }
    if (entry.inForce?.start && entry.inForce.start !== target.start) {
      applied.push(`start ${target.start} -> ${entry.inForce.start}`);
      target.start = entry.inForce.start;
    }
    if (entry.inForce?.end && entry.inForce.end !== target.end) {
      applied.push(`end ${target.end} -> ${entry.inForce.end}`);
      target.end = entry.inForce.end;
    }

    if (Array.isArray(entry.streets) && entry.streets.length > 0) {
      // Research returns either {name, numbers} objects or, where a council
      // publishes no house-number restrictions at all, plain strings. Accept
      // both: rejecting the string form silently discarded Charnwood's entire
      // 156-street schedule.
      const cleaned = entry.streets
        .map((s) => (typeof s === "string" ? { name: s, numbers: null } : s))
        .filter((s) => s && String(s.name ?? "").trim())
        .map((s) => {
          const numbers = s.numbers == null || String(s.numbers).trim() === "" ? null : String(s.numbers).trim();
          return numbers === null ? { name: String(s.name).trim() } : { name: String(s.name).trim(), numbers };
        });
      // Never write an empty schedule. A scheme with `streets: []` reads as
      // "we have the list and you are not on it", which is a confident no built
      // on nothing.
      if (cleaned.length > 0) {
        target.streets = cleaned;
        applied.push(`${cleaned.length} streets`);
      } else {
        problems.push(`${file}: ${doc.council} ${type}/${coverage} street entries were all unusable, none written`);
      }
    }

    if (Array.isArray(entry.postcodes) && entry.postcodes.length > 0) {
      const seen = new Set();
      target.postcodes = entry.postcodes
        .map((p) => String(p).trim().toUpperCase())
        .filter((p) => /^[A-Z]{1,2}[0-9][A-Z0-9]?\s*[0-9][A-Z]{2}$/.test(p))
        .filter((p) => {
          const k = normPostcode(p);
          if (seen.has(k)) return false;
          seen.add(k);
          return true;
        });
      applied.push(`${target.postcodes.length} postcodes`);
      const rejected = entry.postcodes.length - target.postcodes.length;
      if (rejected > 0) notes.push(`${doc.council}: ${rejected} postcode entries rejected as malformed or duplicate`);
    }

    // Postcodes the council says straddle the boundary. Kept separate so they
    // get an honest "we cannot tell, and neither will the council" answer.
    if (Array.isArray(entry.boundaryPostcodes) && entry.boundaryPostcodes.length > 0) {
      target.boundaryPostcodes = entry.boundaryPostcodes.map((p) => String(p).trim().toUpperCase());
      applied.push(`${target.boundaryPostcodes.length} boundary postcodes`);
    }

    // Ward list refreshed to current ONS names. Only accepted when the new
    // names actually exist in the current ward set, otherwise we would swap one
    // stale list for another and lose the staleness detection that currently
    // makes the engine hedge honestly.
    // `includedWards` and `currentWards` mean the same thing to us: the wards
    // the designation covers, in names the matcher can use. Research uses
    // whichever the source document phrases it as.
    const current = [
      ...(Array.isArray(entry.currentWards) ? entry.currentWards : []),
      ...(Array.isArray(entry.includedWards) ? entry.includedWards : []),
    ];
    if (current.length > 0) {
      const live = new Set((wards[doc.gss] ?? []).map(norm));
      const unknown = current.filter((w) => !live.has(norm(w)));
      if (unknown.length > 0) {
        problems.push(
          `${file}: ${doc.council} currentWards contains ${unknown.length} name(s) absent from ONS (${unknown.slice(0, 4).join(", ")}), ward list NOT replaced`,
        );
      } else {
        // Union rather than overwrite. Research often returns one entry per
        // ward: Harrow came back as six single-ward objects covering four
        // schemes, and overwriting would have left each scheme holding only the
        // last ward seen, silently dropping the others from the designation.
        const first = !replacedWards.has(target);
        replacedWards.add(target);
        const merged = first ? [] : [...(target.wards ?? [])];
        for (const w of current) if (!merged.some((x) => norm(x) === norm(w))) merged.push(w);
        target.wards = merged;
        applied.push(`${current.length} ward(s) -> ${merged.length} on current ONS names`);
      }
    }
    if (entry.confidence === "derived-boundary-mapping") {
      target.wardListIsDerived = true;
      applied.push("ward list marked derived from geometry");
    }

    // Wards the council places wholly inside or wholly outside a map-defined
    // designation. Validated against ONS so a stale name cannot produce a
    // confident answer, especially `excludedWards`, where a wrong name means
    // telling a landlord inside the scheme that they are outside it.
    for (const [field, label] of [
      ["fullWards", "wards fully inside"],
      ["excludedWards", "wards wholly outside"],
    ]) {
      const list = Array.isArray(entry[field]) ? entry[field] : [];
      if (list.length === 0) continue;
      const live = new Set((wards[doc.gss] ?? []).map(norm));
      const unknown = live.size > 0 ? list.filter((w) => !live.has(norm(w))) : [];
      if (unknown.length > 0) {
        problems.push(
          `${file}: ${doc.council} ${field} contains ${unknown.length} name(s) absent from ONS (${unknown.slice(0, 4).join(", ")}), NOT applied`,
        );
        continue;
      }
      target[field] = list;
      applied.push(`${list.length} ${label}`);
    }

    if (Array.isArray(entry.licensedPostcodes) && entry.licensedPostcodes.length > 0) {
      const seen = new Set();
      target.licensedPostcodes = entry.licensedPostcodes
        .map((p) => String(p).trim().toUpperCase())
        .filter((p) => /^[A-Z]{1,2}[0-9][A-Z0-9]?\s*[0-9][A-Z]{2}$/.test(p))
        .filter((p) => {
          const k = normPostcode(p);
          if (seen.has(k)) return false;
          seen.add(k);
          return true;
        });
      applied.push(`${target.licensedPostcodes.length} licensed-register postcodes`);
    }

    if (entry.listIsIndicative === true) {
      target.listIsIndicative = true;
      applied.push("list marked indicative");
    }

    if (entry.checkerUrl && /^https?:\/\//.test(entry.checkerUrl)) {
      target.checkerUrl = entry.checkerUrl;
      applied.push("checker URL");
    }
    if (entry.sourceUrl && /^https?:\/\//.test(entry.sourceUrl)) {
      if (/legislate\.tech|londonpropertylicensing/.test(target.sourceUrl ?? "")) {
        applied.push("commercial source replaced with official");
      }
      target.sourceUrl = entry.sourceUrl;
    }

    if (applied.length === 0) {
      problems.push(`${file}: ${doc.council} ${type}/${coverage} matched but carried nothing usable`);
      continue;
    }
    touched++;
    console.log(`${doc.council.padEnd(40)} ${String(type).padEnd(11)} ${applied.join(", ")}`);
  }
}

if (notes.length) {
  console.log(`\nNotes (${notes.length}):`);
  for (const n of notes) console.log(`  ${n}`);
}
if (problems.length) {
  console.log(`\nProblems (${problems.length}):`);
  for (const p of problems) console.log(`  ${p}`);
}
console.log(`\n${touched} schemes updated.`);

if (DRY) {
  console.log("Dry run, nothing written.");
} else {
  writeFileSync(SCHEMES_PATH, JSON.stringify(schemes, null, 2) + "\n");
  const kb = Math.round(Buffer.byteLength(JSON.stringify(schemes)) / 1024);
  console.log(`Wrote ${SCHEMES_PATH} (${kb}KB runtime data).`);
}
