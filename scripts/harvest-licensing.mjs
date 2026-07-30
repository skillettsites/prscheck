/**
 * Harvest selective / additional licensing evidence from council websites.
 *
 * Why this exists: licensing-schemes.json covered only 90 of 296 English
 * councils, and the site rendered "no blanket scheme in {council}" for the other
 * 206 as though that were researched fact. There is no national dataset of
 * designations (the Renters' Rights Act 2025 PRS Database will eventually be
 * one), so the source of truth is each council's own licensing pages.
 *
 * This script only GATHERS EVIDENCE. It never invents a scheme record: it emits
 * candidate URLs plus the exact matched sentences and a confidence band, so a
 * curation pass can write records carrying a real sourceUrl, like the first 90.
 *
 * Discovery is SITEMAP-FIRST, which matters. Two earlier approaches failed:
 *   1. Crawling homepages: councils bury licensing behind JS mega-menus, so it
 *      averaged 1.2 pages and found evidence for 3 of 22 known-scheme councils.
 *   2. DuckDuckGo `site:` queries: worked beautifully, then the delay failed to
 *      serialise under concurrency, burst the endpoint and got the IP blocked.
 * Sitemaps are declared in robots.txt specifically to be read, give a complete
 * URL list in one request, and work on councils whose pages sit behind a WAF.
 *
 * Usage:
 *   node scripts/harvest-licensing.mjs --in todo.json --out evidence.json
 *                                      [--limit N] [--concurrency 4]
 */

import { readFileSync, writeFileSync } from "node:fs";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileP = promisify(execFile);

// A descriptive bot UA is 403'd by roughly a quarter of council WAFs (measured:
// 7 of 30), which reads as "no scheme" rather than "we were blocked". These are
// ordinary public pages read a few times each, so present as a normal browser
// and keep the request rate low instead.
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";
const TIMEOUT_MS = 25000;
const HOST_GAP_MS = 800;
const MAX_PAGES_PER_COUNCIL = 8;

// Sentinel curl appends after the body so the status survives arbitrary content.
const STATUS_MARKER = "\n@@STATUS:";

const args = process.argv.slice(2);
const flag = (n, d = null) => {
  const i = args.indexOf(`--${n}`);
  return i >= 0 && args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : d;
};

/* ---------------------------------------------------------------- matching */

const SELECTIVE = /selective\s+licen[cs]/i;
const ADDITIONAL = /additional\s+(?:hmo\s+)?licen[cs]/i;

// URL shapes worth fetching, most specific first.
const URL_STRONG = /selective[-_]?licen|additional[-_]?licen|licensing[-_]?designation/i;
const URL_WEAK =
  /hmo|private[-_]?sector[-_]?housing|private[-_]?rent|landlord|houses?[-_]in[-_]multiple|property[-_]?licen|housing[-_]?licen/i;

/**
 * Councils license a great many things that are not housing. Without this the
 * ranker spent the whole per-council page budget on alcohol, taxi, explosives
 * and dangerous-wild-animal licensing and never reached property licensing at
 * all, which is why 121 councils fetched the full 6 pages and still returned
 * no evidence.
 */
const URL_OFFTOPIC =
  /alcohol|premises[-_]?licen|entertain|taxi|hackney[-_]?carriage|private[-_]?hire|animal|dog[-_]|kennel|zoo|dangerous[-_]wild|explosive|firearm|gambl|lotter|betting|scrap[-_]?metal|street[-_]trading|food[-_]|hygiene|caravan[-_]site|marriage|civil[-_]partnership|skip[-_]|pavement|tattoo|piercing|sex[-_]establish|charity[-_]collect|game[-_]|fishing/i;

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
  /\bno\s+selective\s+licen[cs][^.]{0,60}\b(?:in|within|scheme|area|designation)/i,
  /\bselective\s+licen[cs]\w*\s+(?:is|are)\s+not\s+(?:in\s+(?:force|operation)|operating|currently)/i,
  /\bthere\s+(?:is|are)\s+(?:currently\s+)?no\s+(?:selective|additional)\s+licen[cs]/i,
  /\bnot\s+(?:currently\s+)?(?:a\s+)?designated\b[^.]{0,50}\bselective/i,
];

const YEARS = /\b20\d{2}\b/g;
const FEE = /£\s?[\d,]{3,7}/g;

const norm = (s) => s.replace(/\s+/g, " ").trim();

/**
 * Text of the page body with navigation chrome removed.
 *
 * Without this the first sentence containing "selective licen" was almost
 * always a breadcrumb or menu item ("Home Document downloads Housing Selective
 * Licensing"), so quotes were useless as evidence and classification keyed off
 * boilerplate rather than what the page actually says.
 */
function stripHtml(html) {
  return norm(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<nav[\s\S]*?<\/nav>/gi, " ")
      .replace(/<header[\s\S]*?<\/header>/gi, " ")
      .replace(/<footer[\s\S]*?<\/footer>/gi, " ")
      .replace(/<aside[\s\S]*?<\/aside>/gi, " ")
      .replace(/<form[\s\S]*?<\/form>/gi, " ")
      .replace(/<select[\s\S]*?<\/select>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&#\d+;/g, " ")
  );
}

/** Drop sentences that are obviously menu/breadcrumb runs rather than prose. */
function looksLikeProse(s) {
  if (s.length < 40) return false;
  const words = s.split(/\s+/);
  if (words.length < 8) return false;
  // Breadcrumb/menu runs are mostly Capitalised Words with almost no lowercase
  // connective tissue and no sentence punctuation.
  const lower = words.filter((w) => /^[a-z]/.test(w)).length;
  return lower / words.length > 0.45;
}

function sentencesMatching(text, re, max = 4) {
  const out = [];
  for (const raw of text.split(/(?<=[.!?])\s+/)) {
    if (re.test(raw) && looksLikeProse(norm(raw))) {
      out.push(norm(raw).slice(0, 320));
      if (out.length >= max) break;
    }
  }
  return out;
}

/* ------------------------------------------------------------------ fetching */

// Per-host serialisation via a promise chain. A timestamp check is not enough:
// concurrent workers all read the same value and proceed together, which is
// exactly how the previous version got an endpoint to block us.
const hostChain = new Map();
function onHost(host, fn) {
  const prev = hostChain.get(host) ?? Promise.resolve();
  const next = prev.then(async () => {
    await new Promise((r) => setTimeout(r, HOST_GAP_MS));
    return fn();
  });
  hostChain.set(
    host,
    next.then(
      () => {},
      () => {}
    )
  );
  return next;
}

/**
 * Fetch via curl rather than global fetch.
 *
 * Not a style choice. Several council WAFs fingerprint the TLS/HTTP client and
 * reject Node's undici outright: enfield.gov.uk and great-yarmouth.gov.uk both
 * return 403 to fetch() even with a complete browser header set, while plain
 * curl gets 200 and 2,640 / 3,305 sitemap URLs from the same machine and URL.
 * A 403 read as "no scheme found", which is precisely the wrong answer.
 */
async function get(url, { asXml = false } = {}) {
  let host;
  try {
    host = new URL(url).host;
  } catch {
    return { ok: false, status: "bad-url" };
  }
  return onHost(host, async () => {
    const accept = asXml
      ? "application/xml,text/xml,*/*;q=0.8"
      : "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8";
    // -w writes the status on the last line so it survives binary-ish bodies.
    const cmdArgs = [
      "-sSL",
      "--compressed",
      "--max-time",
      String(Math.ceil(TIMEOUT_MS / 1000)),
      "-H",
      `User-Agent: ${UA}`,
      "-H",
      `Accept: ${accept}`,
      "-H",
      "Accept-Language: en-GB,en;q=0.9",
      "-w",
      `${STATUS_MARKER}%{http_code}:%{url_effective}`,
      url,
    ];
    try {
      const { stdout } = await execFileP("curl", cmdArgs, {
        maxBuffer: 12 * 1024 * 1024,
        timeout: TIMEOUT_MS + 8000,
        windowsHide: true,
      });
      const marker = stdout.lastIndexOf(STATUS_MARKER);
      if (marker < 0) return { ok: false, status: "no-status" };
      const tail = stdout.slice(marker + STATUS_MARKER.length);
      const firstColon = tail.indexOf(":");
      const code = Number(tail.slice(0, firstColon));
      const effective = tail.slice(firstColon + 1).trim();
      if (code < 200 || code >= 300) return { ok: false, status: code };
      return { ok: true, url: effective || url, body: stdout.slice(0, marker) };
    } catch (e) {
      // curl exits non-zero on connection/TLS failure, and execFile rejects,
      // but any bytes it did receive are still on the error object. 88 councils
      // were being discarded as "Command failed" with usable stdout attached.
      const partial = typeof e?.stdout === "string" ? e.stdout : "";
      const marker = partial.lastIndexOf(STATUS_MARKER);
      if (marker >= 0) {
        const tail = partial.slice(marker + STATUS_MARKER.length);
        const code = Number(tail.slice(0, tail.indexOf(":")));
        if (code >= 200 && code < 300) {
          return { ok: true, url, body: partial.slice(0, marker) };
        }
        return { ok: false, status: code || "curl-fail" };
      }
      return { ok: false, status: e?.killed ? "timeout" : "curl-fail" };
    }
  });
}

/* ---------------------------------------------------------------- discovery */

/**
 * Normalise a sitemap <loc>. Some councils emit XML-entity or percent-encoded
 * URLs (arun.gov.uk gives "https://www.arun.gov.uk%2Fhmo-licensing"), which is
 * not parseable as-is and previously produced bad-url on every candidate.
 */
function decodeLoc(raw) {
  let u = raw.replace(/&amp;/g, "&").replace(/&#38;/g, "&").trim();
  if (/%2F/i.test(u)) {
    try {
      u = decodeURIComponent(u);
    } catch {
      /* leave as-is */
    }
  }
  try {
    return new URL(u).toString();
  } catch {
    return null;
  }
}

/** Sitemap URLs declared in robots.txt, which is where they are meant to live. */
async function sitemapsFromRobots(origin) {
  const r = await get(new URL("/robots.txt", origin).toString());
  if (!r.ok) return [];
  return [...r.body.matchAll(/^\s*sitemap:\s*(\S+)/gim)].map((m) => m[1].trim()).slice(0, 5);
}

/** Read a sitemap (or sitemap index, recursively) and return <loc> values. */
async function readSitemap(url, depth = 0, seen = new Set()) {
  if (depth > 2 || seen.has(url) || seen.size > 40) return [];
  seen.add(url);
  const r = await get(url, { asXml: true });
  if (!r.ok) return [];
  const locs = [...r.body.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)]
    .map((m) => decodeLoc(m[1]))
    .filter(Boolean);
  const isIndex = /<sitemapindex/i.test(r.body);
  if (!isIndex) return locs;

  // Follow child sitemaps, preferring ones whose own name hints at content.
  const children = locs
    .sort((a, b) => (URL_WEAK.test(b) ? 1 : 0) - (URL_WEAK.test(a) ? 1 : 0))
    .slice(0, 12);
  const out = [];
  for (const c of children) out.push(...(await readSitemap(c, depth + 1, seen)));
  return out;
}

function rankCandidates(urls) {
  const scored = new Map();
  for (const u of urls) {
    const strong = URL_STRONG.test(u);
    // Off-topic licensing is discarded outright unless the URL literally names
    // selective/additional licensing (e.g. a combined "licensing" hub page).
    if (!strong && URL_OFFTOPIC.test(u)) continue;
    let s = 0;
    if (strong) s += 6;
    if (URL_WEAK.test(u)) s += 2;
    if (/housing|landlord|private[-_]?rent/i.test(u)) s += 1;
    if (/\.pdf$/i.test(u)) s -= 1; // real pages read better than scanned notices
    if (s > 0) scored.set(u.split("#")[0], Math.max(scored.get(u.split("#")[0]) ?? 0, s));
  }
  return [...scored.entries()].sort((a, b) => b[1] - a[1]).map(([u]) => u);
}

/** Last resort when a council publishes no usable sitemap. */
async function fallbackCandidates(origin) {
  const paths = [
    "/selective-licensing",
    "/housing/selective-licensing",
    "/private-sector-housing",
    "/hmo-licensing",
    "/property-licensing",
    "/landlord-licensing",
    "/housing/private-rented-property-licensing",
  ];
  const out = [];
  const home = await get(origin);
  if (home.ok) {
    const links = [...home.body.matchAll(/href\s*=\s*["']([^"'#]+)["']/gi)].map((m) => m[1]);
    for (const href of links) {
      try {
        const abs = new URL(href, home.url).toString();
        if (URL_STRONG.test(abs) || URL_WEAK.test(abs)) out.push(abs);
      } catch {
        /* skip unparseable href */
      }
    }
  }
  for (const p of paths) {
    try {
      out.push(new URL(p, origin).toString());
    } catch {
      /* skip */
    }
  }
  return rankCandidates(out);
}

/* ------------------------------------------------------------- per council */

async function harvest(council) {
  const rec = {
    gss: council.gss,
    name: council.name,
    website: council.website,
    discovery: null,
    sitemapUrls: 0,
    candidates: 0,
    pagesFetched: 0,
    evidence: [],
    verdict: "no_evidence",
    confidence: "none",
    errors: [],
  };
  if (!council.website) {
    rec.errors.push("no website");
    return rec;
  }

  let origin;
  try {
    origin = new URL(council.website).origin;
  } catch {
    rec.errors.push("bad website url");
    return rec;
  }

  // 1. sitemap-first discovery
  let locs = [];
  const declared = await sitemapsFromRobots(origin);
  for (const sm of declared) {
    locs.push(...(await readSitemap(sm)));
    if (locs.length > 200) break;
  }
  if (locs.length === 0) {
    for (const guess of ["/sitemap.xml", "/sitemap_index.xml", "/sitemap-index.xml"]) {
      locs.push(...(await readSitemap(new URL(guess, origin).toString())));
      if (locs.length) break;
    }
  }
  rec.sitemapUrls = locs.length;

  // Evidence must come from the council's own site. The homepage-link fallback
  // was picking up consultancy and partner domains: Gloucester was flagged as
  // having a scheme on the strength of a page on arkconsultancy.co.uk.
  const ownHost = new URL(origin).host.replace(/^www\./, "");
  const onOwnSite = (u) => {
    try {
      return new URL(u).host.replace(/^www\./, "").endsWith(ownHost);
    } catch {
      return false;
    }
  };

  let candidates = rankCandidates(locs).filter(onOwnSite);
  rec.discovery = candidates.length ? "sitemap" : null;
  if (candidates.length === 0) {
    candidates = (await fallbackCandidates(origin)).filter(onOwnSite);
    rec.discovery = candidates.length ? "fallback" : "none";
  }
  rec.candidates = candidates.length;
  if (candidates.length === 0) {
    rec.errors.push("no candidate pages");
    return rec;
  }

  // 2. read the best candidates and record what they actually say
  for (const url of candidates.slice(0, MAX_PAGES_PER_COUNCIL)) {
    const page = await get(url);
    if (!page.ok) {
      if (rec.errors.length < 4) rec.errors.push(`${page.status} ${url.slice(origin.length, 60)}`);
      continue;
    }
    rec.pagesFetched++;
    const text = stripHtml(page.body);
    const hasSel = SELECTIVE.test(text);
    const hasAdd = ADDITIONAL.test(text);
    if (!hasSel && !hasAdd) continue;

    const quotes = [
      ...(hasSel ? sentencesMatching(text, SELECTIVE) : []),
      ...(hasAdd ? sentencesMatching(text, ADDITIONAL) : []),
    ];
    rec.evidence.push({
      url: page.url,
      mentionsSelective: hasSel,
      mentionsAdditional: hasAdd,
      looksPositive: POSITIVE.some((r) => quotes.some((q) => r.test(q))),
      looksNegative: NEGATIVE.some((r) => quotes.some((q) => r.test(q)) || r.test(text)),
      years: [...new Set(text.match(YEARS) || [])].filter((y) => +y >= 2015 && +y <= 2035).slice(0, 8),
      fees: [...new Set(text.match(FEE) || [])].slice(0, 5),
      quotes: quotes.slice(0, 4),
    });
    if (rec.evidence.length >= 4) break;
  }

  // 3. verdict, deliberately conservative: anything unclear is needs_review
  //    rather than a claim in either direction.
  const pos = rec.evidence.some((e) => e.looksPositive && !e.looksNegative);
  const neg = rec.evidence.some((e) => e.looksNegative);
  const mentions = rec.evidence.some((e) => e.mentionsSelective || e.mentionsAdditional);

  if (pos && mentions) {
    rec.verdict = "likely_has_scheme";
    rec.confidence = neg ? "medium" : "high";
  } else if (neg && !pos) {
    rec.verdict = "likely_no_scheme";
    rec.confidence = "medium";
  } else if (mentions) {
    rec.verdict = "needs_review";
    rec.confidence = "low";
  }
  return rec;
}

/* ------------------------------------------------------------------- runner */

async function pool(items, n, fn) {
  const out = [];
  let i = 0;
  await Promise.all(
    Array.from({ length: n }, async () => {
      while (i < items.length) {
        const idx = i++;
        try {
          out[idx] = await fn(items[idx]);
        } catch (e) {
          out[idx] = { ...items[idx], verdict: "error", errors: [String(e?.message || e)] };
        }
        const done = out.filter(Boolean).length;
        if (done % 10 === 0) process.stderr.write(`  ..${done}/${items.length}\n`);
      }
    })
  );
  return out;
}

const inFile = flag("in");
const outFile = flag("out") || "evidence.json";
const limit = Number(flag("limit", "0")) || 0;
const conc = Number(flag("concurrency", "4"));

let list = JSON.parse(readFileSync(inFile, "utf8"));
if (limit) list = list.slice(0, limit);

console.error(`harvesting ${list.length} councils, concurrency ${conc}`);
const results = await pool(list, conc, harvest);
writeFileSync(outFile, JSON.stringify(results, null, 1));

const tally = results.reduce((a, r) => ((a[r.verdict] = (a[r.verdict] || 0) + 1), a), {});
const disc = results.reduce((a, r) => ((a[r.discovery] = (a[r.discovery] || 0) + 1), a), {});
console.error(`\nverdicts:  ${JSON.stringify(tally)}`);
console.error(`discovery: ${JSON.stringify(disc)}`);
console.error(`written:   ${outFile}`);
