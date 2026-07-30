/**
 * Second pass over the review-queue councils: pull the facts a scheme record
 * needs, so a human judgement can be made from the page's own words.
 *
 * The harvester answers "is there something here?". This answers "what does it
 * actually say?" — status wording, date ranges, coverage, fees — because a
 * record needs `status`, `start`, `end`, `coverage` and a `sourceUrl`, and a
 * single matched sentence is not enough to fill those in honestly.
 *
 * Direct fetches only, no search API, so this costs nothing to run.
 *
 * Usage: node scripts/extract-scheme-detail.mjs <evidence.json> <out.json>
 */

import { readFileSync, writeFileSync } from "node:fs";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileP = promisify(execFile);
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";
const MARK = "\n@@S:";

const SELECTIVE = /selective\s+licen[cs]/i;
const ADDITIONAL = /additional\s+(?:hmo\s+)?licen[cs]/i;
const SCHEME_RE = /(selective|additional)\s+(?:hmo\s+)?licen[cs]/i;

// Wording that pins down whether a designation is live, finished or only proposed.
const LIVE = /\b(?:is|are|remains?)\s+(?:currently\s+)?(?:in\s+force|live|active|running|operating|in\s+operation)\b|\bcame?\s+into\s+(?:force|effect)\b|\bapplies\s+to\s+all\b|\byou\s+must\s+(?:apply|have|hold)\b|\bneed\s+a\s+licen[cs]e\b/i;
const ENDED = /\b(?:ended|ceased|expired|came\s+to\s+an\s+end|no\s+longer\s+(?:in\s+force|applies|required)|has\s+ended)\b/i;
const PROPOSED = /\b(?:propos\w+|consultation|considering|would\s+introduce|may\s+introduce|cabinet\s+(?:will|to)\s+(?:consider|decide))\b/i;
const NONE = /\b(?:do(?:es)?\s+not|don'?t)\s+(?:currently\s+)?(?:have|operate|run|designat\w*)\b|there\s+(?:is|are)\s+(?:currently\s+)?no\b/i;

// Date ranges: "1 April 2023 to 31 March 2028", "2023-2028", "until 31 March 2028"
const DATE_RANGE =
  /\b(\d{1,2}\s+\w+\s+20\d{2}|\w+\s+20\d{2}|20\d{2})\s*(?:to|until|-|–|—|through to)\s*(\d{1,2}\s+\w+\s+20\d{2}|\w+\s+20\d{2}|20\d{2})\b/gi;
const FIVE_YEARS = /\bfive\s+years?\b/i;
const FEE = /£\s?[\d,]{3,7}(?:\.\d{2})?/g;
const WARD_HINT = /\b(?:ward|wards|street|streets|area|areas|borough[- ]wide|district[- ]wide|whole\s+of\s+the)\b/i;

const norm = (s) => s.replace(/\s+/g, " ").trim();

function stripHtml(html) {
  return norm(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<nav[\s\S]*?<\/nav>/gi, " ")
      .replace(/<header[\s\S]*?<\/header>/gi, " ")
      .replace(/<footer[\s\S]*?<\/footer>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&#\d+;/g, " ")
  );
}

async function get(url) {
  try {
    const { stdout } = await execFileP(
      "curl",
      [
        "-sSL", "--compressed", "--max-time", "25",
        "-H", `User-Agent: ${UA}`,
        "-H", "Accept-Language: en-GB,en;q=0.9",
        "-w", `${MARK}%{http_code}`,
        url,
      ],
      { maxBuffer: 12 * 1024 * 1024, windowsHide: true }
    );
    const i = stdout.lastIndexOf(MARK);
    if (i < 0) return null;
    const code = Number(stdout.slice(i + MARK.length));
    return code >= 200 && code < 300 ? stdout.slice(0, i) : null;
  } catch {
    return null;
  }
}

const rows = JSON.parse(readFileSync(process.argv[2], "utf8"));
const out = process.argv[3] || "scheme-detail.json";
const queue = rows.filter((r) => r.evidence?.length);

const results = [];
let done = 0;

for (const r of queue) {
  const urls = [...new Set(r.evidence.map((e) => e.url))].slice(0, 3);
  const rec = { gss: r.gss, name: r.name, verdict: r.verdict, pages: [] };

  for (const url of urls) {
    const html = await get(url);
    if (!html) continue;
    const text = stripHtml(html);
    if (!SELECTIVE.test(text) && !ADDITIONAL.test(text)) continue;

    // Keep only sentences that mention a scheme, then tag what they assert.
    const sents = text
      .split(/(?<=[.!?])\s+/)
      .map(norm)
      .filter((s) => s.length > 45 && s.length < 400 && SCHEME_RE.test(s));

    const ranges = [];
    let m;
    const rx = new RegExp(DATE_RANGE.source, "gi");
    while ((m = rx.exec(text)) && ranges.length < 6) ranges.push(`${m[1]} to ${m[2]}`);

    rec.pages.push({
      url,
      selective: SELECTIVE.test(text),
      additional: ADDITIONAL.test(text),
      signals: {
        live: sents.some((s) => LIVE.test(s)),
        ended: sents.some((s) => ENDED.test(s)),
        proposed: sents.some((s) => PROPOSED.test(s)),
        none: sents.some((s) => NONE.test(s)),
        fiveYears: FIVE_YEARS.test(text),
        coverageWords: sents.some((s) => WARD_HINT.test(s)),
      },
      dateRanges: [...new Set(ranges)],
      fees: [...new Set(text.match(FEE) || [])].slice(0, 4),
      sentences: sents.slice(0, 6),
    });
  }
  results.push(rec);
  done++;
  if (done % 5 === 0) process.stderr.write(`  ..${done}/${queue.length}\n`);
}

writeFileSync(out, JSON.stringify(results, null, 1));
console.error(`\n  councils read: ${results.length}`);
console.error(`  with usable pages: ${results.filter((r) => r.pages.length).length}`);
console.error(`  written: ${out}`);
