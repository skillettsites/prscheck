/**
 * Re-run the verdict logic over already-harvested evidence. No network, no cost.
 *
 * Discovery is the expensive part; classification is not. When the matching
 * rules improve (e.g. learning that councils write "does not run selective or
 * additional licensing schemes", which the original negative pattern missed
 * because it required "selective" to be immediately followed by "licen"), the
 * stored quotes can simply be re-judged.
 *
 * Caveat, stated in the output: the harvester tested NEGATIVE patterns against
 * the full page text as well as the quotes, and only quotes were persisted. So
 * this recovers negatives that appear in a quoted sentence, not every one the
 * live pass would have seen. It can only ever be a floor on the improvement.
 *
 * Usage: node scripts/reclassify-evidence.mjs <evidence.json> [out.json]
 */

import { readFileSync, writeFileSync } from "node:fs";

const SELECTIVE = /selective\s+licen[cs]/i;
const ADDITIONAL = /additional\s+(?:hmo\s+)?licen[cs]/i;

const POSITIVE = [
  /\bdesignat(?:ed|ion|ions)\b/i,
  /\bscheme\s+(?:is|are)?\s*(?:currently\s+)?(?:in\s+force|live|active|operating|running)\b/i,
  /\bcomes?\s+into\s+(?:force|effect)\b/i,
  /\byou\s+(?:will\s+)?need\s+a\s+licen[cs]e\b/i,
  /\bmust\s+(?:be\s+)?licen[cs]/i,
  /\bruns?\s+(?:from|until)\b/i,
];

const NEGATIVE = [
  /\b(?:do(?:es)?\s+not|don'?t)\s+(?:currently\s+)?(?:have|operate|run)\b[^.]{0,80}\bselective\s+licen[cs]/i,
  // The addition: "does not run selective or additional licensing schemes".
  /\b(?:do(?:es)?\s+not|don'?t)\s+(?:currently\s+)?(?:have|operate|run|designat\w*)\b[^.]{0,60}\bselective\b[^.]{0,40}\blicen[cs]/i,
  /\bno\s+(?:selective|additional)\b[^.]{0,40}\blicen[cs]\w*\s+scheme/i,
  /\bno\s+selective\s+licen[cs][^.]{0,60}\b(?:in|within|scheme|area|designation)/i,
  /\bselective\s+licen[cs]\w*\s+(?:is|are)\s+not\s+(?:in\s+(?:force|operation)|operating|currently)/i,
  /\bthere\s+(?:is|are)\s+(?:currently\s+)?no\s+(?:selective|additional)\s+licen[cs]/i,
  /\bnot\s+(?:currently\s+)?(?:a\s+)?designated\b[^.]{0,50}\bselective/i,
];

const src = process.argv[2];
const out = process.argv[3] || src.replace(/\.json$/, "-reclassified.json");
const rows = JSON.parse(readFileSync(src, "utf8"));

let changed = 0;
const moves = [];

for (const r of rows) {
  if (!r.evidence?.length) continue;

  for (const e of r.evidence) {
    const quotes = e.quotes || [];
    e.looksNegative = NEGATIVE.some((rx) => quotes.some((q) => rx.test(q)));
    e.looksPositive = POSITIVE.some((rx) => quotes.some((q) => rx.test(q)));
    e.mentionsSelective = quotes.some((q) => SELECTIVE.test(q)) || e.mentionsSelective;
    e.mentionsAdditional = quotes.some((q) => ADDITIONAL.test(q)) || e.mentionsAdditional;
  }

  const pos = r.evidence.some((e) => e.looksPositive && !e.looksNegative);
  const neg = r.evidence.some((e) => e.looksNegative);
  const mentions = r.evidence.some((e) => e.mentionsSelective || e.mentionsAdditional);

  const before = r.verdict;
  if (pos && mentions) {
    r.verdict = "likely_has_scheme";
    r.confidence = neg ? "medium" : "high";
  } else if (neg && !pos) {
    r.verdict = "likely_no_scheme";
    r.confidence = "medium";
  } else if (mentions) {
    r.verdict = "needs_review";
    r.confidence = "low";
  }
  if (r.verdict !== before) {
    changed++;
    moves.push(`${r.name}: ${before} -> ${r.verdict}`);
  }
}

writeFileSync(out, JSON.stringify(rows, null, 1));

const tally = rows.reduce((a, r) => ((a[r.verdict] = (a[r.verdict] || 0) + 1), a), {});
console.log(`  reclassified: ${changed} councils changed verdict`);
for (const m of moves) console.log(`    ${m}`);
console.log(`\n  verdicts now: ${JSON.stringify(tally)}`);
console.log(`  written: ${out}`);
console.log(
  "\n  NOTE: only quoted sentences were persisted, so negatives stated elsewhere\n" +
    "  on the page are not recoverable here. This is a floor, not the full gain."
);
