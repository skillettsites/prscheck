/**
 * Repoint every no-scheme record's sourceUrl at the page the harvester actually
 * read, and verify each one still resolves.
 *
 * The first pass had these typed by hand from truncated console output, which
 * put a 404 in the Derby record among others. A negative record is only worth
 * anything if the citation backs it up, so the URL has to come from the
 * evidence file rather than from me retyping it.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileP = promisify(execFile);
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";

async function status(url) {
  try {
    const { stdout } = await execFileP(
      "curl",
      ["-sSL", "--compressed", "-o", process.platform === "win32" ? "NUL" : "/dev/null",
       "-w", "%{http_code}", "--max-time", "20", "-H", `User-Agent: ${UA}`, url],
      { windowsHide: true }
    );
    return Number(stdout.trim().slice(-3));
  } catch {
    return 0;
  }
}

const evidenceFiles = process.argv.slice(3);
const SCHEMES = process.argv[2];

const evidence = [];
for (const f of evidenceFiles) {
  try {
    evidence.push(...JSON.parse(readFileSync(f, "utf8")));
  } catch {
    console.error(`  (skipped unreadable ${f})`);
  }
}
const byName = new Map(evidence.map((r) => [r.name.toLowerCase(), r]));

const schemes = JSON.parse(readFileSync(SCHEMES, "utf8"));
let fixed = 0;
const report = [];

for (const r of schemes) {
  if (r.schemes?.length) continue; // only the no-scheme records carry a top-level sourceUrl
  const ev =
    byName.get(r.council.toLowerCase()) ||
    [...byName.entries()].find(([k]) => r.council.toLowerCase().startsWith(k))?.[1];
  if (!ev?.evidence?.length) {
    report.push([r.council, r.sourceUrl, "no evidence entry", null]);
    continue;
  }

  // Prefer the evidence item whose quotes contain the negative statement, since
  // that is the page the record is actually relying on.
  const best =
    ev.evidence.find((e) => (e.quotes || []).some((q) => /\bnot\b|\bno\b/i.test(q))) ?? ev.evidence[0];
  const url = best.url;
  const code = await status(url);
  if (url !== r.sourceUrl) fixed++;
  r.sourceUrl = url;
  report.push([r.council, url, code === 200 ? "OK" : `HTTP ${code}`, code]);
}

writeFileSync(SCHEMES, JSON.stringify(schemes, null, 2) + "\n");

console.log(`  repointed ${fixed} sourceUrls\n`);
for (const [name, url, note] of report) {
  console.log(`  ${note === "OK" ? "OK  " : "BAD "} ${name.slice(0, 24).padEnd(26)} ${note.padEnd(12)} ${String(url).slice(0, 84)}`);
}
