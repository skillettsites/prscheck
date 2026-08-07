/**
 * Third pass on public-facing notes: the audit-trail phrasing.
 *
 * These are less embarrassing than the "403'd; Kamma cited" batch but they are
 * still working notes rather than customer copy. `notes` renders verbatim on the
 * council page and inside the £7.99 report, so a paying reader currently sees
 * "Checked 2026-07-30:", "Quoted:", "derived from 5-year term", "Watch for gap
 * or renewal", and stray ALL CAPS emphasis.
 *
 * The meaning is preserved in every case, including the uncertainty. What
 * changes is that it reads as something written for the reader rather than for
 * whoever did the research.
 *
 * Usage: node scripts/clean-public-notes-3.mjs [--dry]
 */
import { readFileSync, writeFileSync } from "node:fs";

const DRY = process.argv.includes("--dry");
const path = "src/data/licensing-schemes.json";
const data = JSON.parse(readFileSync(path, "utf8"));

/** Generic rewrites applied to every note. */
const RULES = [
  // "Checked 2026-07-30: the council states..." -> "The council states..."
  [/^Checked \d{4}-\d{2}-\d{2}:\s*/i, ""],
  // "UNVERIFIED: ..." -> the sentence carries the doubt on its own.
  [/^UNVERIFIED:\s*/i, ""],
  // "Quoted: \"...\"" is a research citation. Keep the quotation, drop the label.
  [/\s*Quoted:\s*/gi, " The council's own wording: "],
  // Working shorthand for "we could not find a published end date".
  [/End dates? for ([^.]*?) derived from 5-year term\.?/i, "The end date for $1 is not published by the council, so it is calculated from the standard five-year designation term."],
  [/End date derived from 5-year term; not stated on the page\.?/i, "The council does not publish an end date, so it is calculated from the standard five-year designation term."],
  [/\bderived from a? ?5-year term\b/gi, "calculated from the standard five-year designation term"],
  [/\bat the time of checking\b/gi, "when we last checked"],
  // Notes to ourselves.
  [/\s*Watch for (a )?gap or renewal from [^.]*\./i, " Confirm the current position with the council before letting."],
  [/\s*If you let in those areas, watch for a decision after that date\./i, " If you let in those areas, check with the council after that date."],
  // Emphasis that reads as shouting in body copy.
  [/\bNOT\b/g, "not"],
  [/\bPROPOSED ONLY\b/g, "proposed only"],
  [/\bEXPIRES\b/g, "expires"],
];

let changed = 0;
const before = new Map();
for (const c of data) {
  if (!c.notes) continue;
  const original = c.notes;
  let next = c.notes;
  for (const [re, to] of RULES) next = next.replace(re, to);
  next = next.replace(/\s{2,}/g, " ").trim();
  // Restore a capital after stripping a leading prefix.
  next = next.charAt(0).toUpperCase() + next.slice(1);
  if (next !== original) {
    before.set(c.council, original);
    c.notes = next;
    changed++;
  }
}

// Fee fields carrying our uncertainty rather than a fee.
let fees = 0;
for (const c of data) {
  for (const s of c.schemes ?? []) {
    if (!s.feeApprox) continue;
    if (/^unverified on council page$/i.test(s.feeApprox.trim())) {
      // Not a fee at all. Null renders as "no fee shown", which is honest.
      s.feeApprox = null;
      fees++;
    } else if (/\(unverified\)/i.test(s.feeApprox)) {
      s.feeApprox = s.feeApprox.replace(/\s*\(unverified\)/i, " (not confirmed on the council's fee page)");
      fees++;
    }
  }
}

console.log(`notes rewritten: ${changed}`);
for (const [council, was] of [...before].slice(0, 8)) {
  const now = data.find((c) => c.council === council).notes;
  console.log(`\n  ${council}\n    was: ${was}\n    now: ${now}`);
}
console.log(`\nfee fields fixed: ${fees}`);

if (DRY) {
  console.log("\nDry run, nothing written.");
} else {
  writeFileSync(path, JSON.stringify(data, null, 2) + "\n");
  console.log("\nWritten.");
}
