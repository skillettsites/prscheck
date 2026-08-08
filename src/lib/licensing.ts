import councilsData from "@/data/councils.json";
import schemesData from "@/data/licensing-schemes.json";
import nationalRules from "@/data/national-rules.json";
import wardsData from "@/data/wards.json";
import boundariesData from "@/data/scheme-boundaries.json";

export interface Council {
  gss: string;
  name: string;
  slug: string;
  nation: "england" | "wales" | "scotland" | "northern-ireland";
}

export type SchemeType = "selective" | "additional";
export type SchemeStatus = "active" | "upcoming" | "expired" | "proposed" | "unverified";

/** A street inside a street-level designation. */
export interface DesignatedStreet {
  /** Street name exactly as the council writes it. */
  name: string;
  /**
   * House-number restriction, verbatim, where only PART of the street is
   * designated (e.g. "53-135 odd, 52-118 even"). Null means the whole street.
   * Partial streets are common and are the main source of a wrong answer, so
   * where this is set we tell the user their street is in the scheme but their
   * house number decides it, rather than asserting either way.
   */
  numbers?: string | null;
}

export interface Scheme {
  type: SchemeType;
  status: SchemeStatus;
  start: string | null;
  end: string | null;
  coverage: string; // "borough-wide" | "whole district" | "district" | "wards" | "streets" | "areas" | "area"
  wards?: string[] | null;
  /** Populated for `coverage: "streets"` designations where the council publishes a schedule. */
  streets?: DesignatedStreet[] | null;
  /**
   * Postcodes the council itself lists as designated.
   *
   * This is the strongest signal we have, because the postcode is the one thing
   * we know exactly: postcodes.io returns it, nothing is derived or guessed. It
   * is used ONLY to confirm a designation, never to rule one out, because these
   * lists are usually illustrative rather than exhaustive and a postcode's
   * absence proves nothing.
   */
  postcodes?: string[] | null;
  /**
   * Postcodes the council states straddle the designation boundary, so some
   * properties in them are inside the scheme and some are not.
   *
   * County Durham publishes 21 of these and explicitly refuses to give a yes or
   * no on them. Treating them as designated, or as not designated, would both
   * be wrong for roughly half the properties concerned, so they get their own
   * answer telling the landlord to confirm with the council.
   */
  boundaryPostcodes?: string[] | null;
  /**
   * Wards the council states are covered IN FULL by a map-defined designation,
   * and wards it states are wholly outside it.
   *
   * A polygon designation is not all-or-nothing at ward level. Nottingham's
   * scheme is drawn on a map, but the council publishes a table saying which
   * wards are Full, which are None, and which are partly covered. That turns
   * twelve of its twenty wards into definite answers, leaving only the genuinely
   * partial ones to hedge. Without this the whole scheme can only ever say
   * "check the boundary", including to landlords the council has explicitly
   * placed inside or outside it.
   */
  fullWards?: string[] | null;
  excludedWards?: string[] | null;
  /**
   * Postcodes appearing in the council's public register of licences ISSUED
   * under this scheme.
   *
   * This is not the designated area, and must never be read as one: it is
   * evidence that licensable properties exist in that postcode. It supports
   * "likely required" and nothing stronger, because a postcode can straddle the
   * designation boundary, so a neighbour holding a licence does not prove this
   * property needs one. Absence proves nothing at all.
   */
  licensedPostcodes?: string[] | null;
  /**
   * True when the council's own street or postcode list is indicative rather
   * than the legal boundary.
   *
   * Not every published list carries the same weight. Manchester's and Sefton's
   * ARE the designation, schedule and all. Rotherham publishes street and
   * postcode lists while stating verbatim that "not all properties within a
   * street or postcode may be subject to Selective Licensing due to where the
   * boundary falls", and Doncaster's street list comes from its consultation
   * evidence base rather than the designation instrument. Treating those as
   * definitive would assert a licence requirement the council itself has not.
   * Where this is set, a match yields "likely required" instead of "required".
   */
  listIsIndicative?: boolean;
  /**
   * True when the ward list was computed from the designation's geometry rather
   * than transcribed from a published list.
   *
   * Liverpool publishes its designated area only as a boundary polygon, so its
   * ward list is derived by intersecting that polygon with ONS ward boundaries.
   * The designation does not follow ward lines: six of the listed wards are only
   * partly inside, and three wards NOT listed still contain designated land. A
   * derived list therefore cannot rule anyone out, because a ward's absence may
   * just mean most of it falls outside. Misses degrade to a boundary check.
   */
  wardListIsDerived?: boolean;
  /**
   * The council's own address checker, where it runs one.
   *
   * Some designations are drawn as a polygon on a map and the council publishes
   * no street or postcode schedule at all, so no amount of research turns them
   * into something an address can be matched against. Sending the landlord
   * straight to the council's own lookup is then the most useful thing we can
   * do, and it is a far better answer than "contact the council".
   */
  checkerUrl?: string | null;
  areaDescription?: string;
  feeApprox?: string | null;
  sourceUrl: string;
  verified: string;
}

export interface CouncilSchemes {
  council: string;
  gss: string;
  schemes: Scheme[];
  /** Short, public-facing. Rendered verbatim on the council page, so keep it
   *  plain English and under ~280 chars. */
  notes?: string;
  /** The full evidence trail lives in `scripts/licensing-research.json`, keyed
   *  by GSS, and is deliberately NOT bundled here. It is never rendered to a
   *  user and was ~69% of this file by volume, which OOM'd the static build
   *  once all 361 councils carried a write-up. Keep it out of the runtime data. */
  research?: never;
  // Present on records where the finding is "we checked and there is no
  // scheme". Those carry no Scheme entries, so the evidence for the negative
  // has nowhere else to live, and a negative needs a source just as much as a
  // positive does.
  sourceUrl?: string;
  verified?: string;
}

export const COUNCILS = councilsData as Council[];
export const SCHEMES = schemesData as CouncilSchemes[];
export const NATIONAL_RULES = nationalRules as Record<string, unknown>;
/** Current ONS ward names keyed by council GSS code. Regenerate with `node scripts/fetch-wards.mjs`. */
export const WARDS = wardsData as Record<string, string[]>;

const schemesByGss = new Map<string, CouncilSchemes>(SCHEMES.map((s) => [s.gss, s]));
const councilsByGss = new Map<string, Council>(COUNCILS.map((c) => [c.gss, c]));
const councilsBySlug = new Map<string, Council>(COUNCILS.map((c) => [c.slug, c]));

/**
 * The nations whose councils can designate selective or additional licensing.
 *
 * Housing Act 2004 s.270(11): "this Act extends to England and Wales only".
 * Welsh councils hold identical Part 2 s.56 and Part 3 powers to English ones
 * and nine of the twenty-two currently exercise them, several county-wide, so
 * Wales must run through the same engine rather than being shown a national
 * fallback. Scottish and Northern Irish councils have no such power at all,
 * which is a definite answer for them rather than a gap in our data.
 */
export const LICENSING_NATIONS: ReadonlySet<Council["nation"]> = new Set(["england", "wales"]);

export function hasCouncilLicensingPowers(nation: Council["nation"]): boolean {
  return LICENSING_NATIONS.has(nation);
}

export function getCouncilByGss(gss: string): Council | undefined {
  return councilsByGss.get(gss);
}

export function getCouncilBySlug(slug: string): Council | undefined {
  return councilsBySlug.get(slug);
}

export function getSchemesForCouncil(gss: string): CouncilSchemes | undefined {
  return schemesByGss.get(gss);
}

export function englishCouncils(): Council[] {
  return COUNCILS.filter((c) => c.nation === "england");
}

/** Councils that have at least one active or upcoming scheme. */
export function councilsWithLiveSchemes(): { council: Council; schemes: Scheme[] }[] {
  const out: { council: Council; schemes: Scheme[] }[] = [];
  for (const cs of SCHEMES) {
    const live = cs.schemes.filter((s) => s.status === "active" || s.status === "upcoming");
    const council = councilsByGss.get(cs.gss);
    if (live.length > 0 && council) out.push({ council, schemes: live });
  }
  return out.sort((a, b) => a.council.name.localeCompare(b.council.name));
}

export function isWholeDistrict(coverage: string): boolean {
  const c = coverage.toLowerCase();
  return (
    c.includes("borough-wide") ||
    c.includes("borough wide") ||
    c.includes("whole district") ||
    c.includes("citywide") ||
    c.includes("city-wide") ||
    c === "district"
  );
}

function normalizeWard(w: string): string {
  return w
    .toLowerCase()
    .replace(/&amp;/g, "and")
    .replace(/&/g, "and")
    .replace(/['''`]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/**
 * Exact (normalised) ward matching.
 *
 * This used to match on substrings in both directions, which was wrong in both
 * directions. It produced false positives, telling a Bristol landlord in Ashley
 * that the "Bishopston and Ashley Down" designation covered them, and a York
 * landlord in the rural Heworth Without that the Heworth scheme applied. It also
 * hid false negatives behind apparent successes. Ward names are a controlled
 * vocabulary published by ONS, so they are compared exactly; boundary-review
 * drift is handled by `schemeWardsAreStale` rather than by fuzzy matching.
 */
export function wardMatches(schemeWards: string[] | null | undefined, wardName: string): boolean {
  if (!schemeWards || schemeWards.length === 0) return false;
  const target = normalizeWard(wardName);
  return schemeWards.some((w) => normalizeWard(w) === target);
}

/**
 * Normalise a street name for comparison.
 *
 * Councils and Ordnance Survey disagree on style constantly: OS returns
 * "ASKEW ROAD", a designation schedule says "Askew Rd", and either may use
 * "St." for Street or Saint. Expanding the common abbreviations is what makes
 * an address lookup line up with a council's published schedule at all.
 */
const STREET_WORDS: Record<string, string> = {
  rd: "road",
  st: "street",
  ave: "avenue",
  av: "avenue",
  cres: "crescent",
  cl: "close",
  ct: "court",
  dr: "drive",
  gdns: "gardens",
  gr: "grove",
  la: "lane",
  ln: "lane",
  pl: "place",
  sq: "square",
  ter: "terrace",
  terr: "terrace",
  pk: "park",
  wlk: "walk",
  yd: "yard",
  mt: "mount",
  bldgs: "buildings",
};

/** "m14 5tq" and "M14 5TQ" and "M145TQ" all compare equal. */
export function normalizePostcode(p: string): string {
  return p.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function normalizeStreet(s: string): string {
  return s
    .toLowerCase()
    // Drop a trailing parenthetical qualifier. Councils put three different
    // kinds of thing in there and none of them is part of the street name:
    // a locality that disambiguates two same-named roads ("Queens Drive
    // (Acton)"), a parity restriction that belongs in the numbers field
    // ("Locket Road (odds)"), or a sub-area ("New Lane (Longden Terrace)").
    // Ordnance Survey returns the bare name, so an exact comparison against the
    // qualified form never matched, and every property on Ealing's two
    // designated Queens Drives was told it was outside the scheme.
    .replace(/\s*\([^)]*\)\s*$/, "")
    .replace(/&amp;/g, "and")
    .replace(/&/g, "and")
    .replace(/['’‘`]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(" ")
    .map((w) => STREET_WORDS[w] ?? w)
    .join(" ");
}

/**
 * Designation boundaries, as published by the councils themselves.
 *
 * Some designations are not a list of anything: they are a shape on a map, and
 * that shape IS the legal boundary. Where a council publishes it in a
 * machine-readable form (Liverpool's KML, Tower Hamlets' and Gedling's ArcGIS
 * services, all of them the files the councils' own address checkers load), a
 * coordinate can be tested against it directly. No street name to derive, no
 * ward to approximate. Regenerate with `node scripts/fetch-boundaries.mjs`.
 */
interface SchemeBoundary {
  match: { type: SchemeType; start: string | null };
  source: string;
  note: string;
  /** Each polygon is [outerRing, ...holes]; each ring is [lon, lat] pairs. */
  polygons: number[][][][] extends never ? never : [number, number][][][];
}
export const BOUNDARIES = boundariesData as unknown as Record<string, SchemeBoundary[]>;

/**
 * How close to a designation edge we refuse to give a definite answer, in metres.
 *
 * This is not about the boundary's precision. It is about ours: postcodes.io
 * returns the postcode's CENTROID, not the property, and a postcode covers a
 * run of addresses that can straddle a boundary drawn down the middle of a
 * street. Inside this margin the centroid genuinely cannot tell us which side
 * the property sits on, so the honest answer is to say so and point at the
 * council's own checker. It also comfortably absorbs the few metres lost when
 * the published boundary was simplified for bundling.
 */
const BOUNDARY_MARGIN_METRES = 100;

/** Metres per degree of latitude, and of longitude at a given latitude. */
function metresPerDegree(lat: number): { x: number; y: number } {
  const rad = (lat * Math.PI) / 180;
  return { x: 111_320 * Math.cos(rad), y: 110_574 };
}

function pointInRing(lon: number, lat: number, ring: [number, number][]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    // Ray cast east; count crossings of edges spanning this latitude.
    if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

/** Distance in metres from a point to a line segment, in local flat coordinates. */
function distanceToSegment(px: number, py: number, ax: number, ay: number, bx: number, by: number): number {
  const dx = bx - ax;
  const dy = by - ay;
  if (dx === 0 && dy === 0) return Math.hypot(px - ax, py - ay);
  let t = ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy);
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

export interface BoundaryVerdict {
  inside: boolean;
  /** Distance to the nearest edge, metres. */
  distance: number;
  /** True when the point is too close to the edge for a postcode centroid to decide. */
  nearEdge: boolean;
  source: string;
}

/**
 * Test a coordinate against a scheme's published boundary.
 *
 * Returns null when we hold no boundary for that scheme, which is different
 * from "outside it" and must stay distinguishable.
 */
export function boundaryTest(
  gss: string,
  scheme: Scheme,
  lat: number | null | undefined,
  lon: number | null | undefined,
): BoundaryVerdict | null {
  if (lat == null || lon == null || !Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  const entry = (BOUNDARIES[gss] ?? []).find(
    (b) => b.match.type === scheme.type && (b.match.start === null || b.match.start === scheme.start),
  );
  if (!entry) return null;
  // An entry with no usable geometry is not a boundary that excludes everyone,
  // it is a boundary we do not have. Left unguarded, the distance stays at
  // Infinity, `nearEdge` is false, and every property in the council gets a
  // confident "not in area" citing a distance of Infinity metres. The fetch
  // script guards against writing this, but the engine must not depend on that.
  if (!entry.polygons?.some((rings) => rings?.[0]?.length >= 4)) return null;

  const scale = metresPerDegree(lat);
  const px = lon * scale.x;
  const py = lat * scale.y;

  let inside = false;
  let nearest = Infinity;
  for (const rings of entry.polygons) {
    const [outer, ...holes] = rings;
    // A point inside the outer ring but inside a hole is outside the area.
    if (pointInRing(lon, lat, outer) && !holes.some((h) => pointInRing(lon, lat, h))) inside = true;
    for (const ring of rings) {
      for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
        const d = distanceToSegment(
          px,
          py,
          ring[j][0] * scale.x,
          ring[j][1] * scale.y,
          ring[i][0] * scale.x,
          ring[i][1] * scale.y,
        );
        if (d < nearest) nearest = d;
      }
    }
  }
  return { inside, distance: nearest, nearEdge: nearest < BOUNDARY_MARGIN_METRES, source: entry.source };
}

/** Levenshtein distance, capped: returns `max + 1` as soon as it is exceeded. */
function editDistance(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const row = [i];
    let best = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      row[j] = Math.min(prev[j] + 1, row[j - 1] + 1, prev[j - 1] + cost);
      if (row[j] < best) best = row[j];
    }
    if (best > max) return max + 1;
    prev = row;
  }
  return prev[b.length];
}

/**
 * Is this street a near miss for something on the designation schedule?
 *
 * Schedules are transcribed from council PDFs and council pages, and councils
 * misspell their own streets: Ashfield's published list says "Preistsic Road"
 * where the road is Priestsic Road. An exact matcher reads that as "not
 * designated" and tells a landlord on Priestsic Road they need no licence.
 *
 * This is deliberately NOT used to assert that a licence IS required, because a
 * near miss is not evidence of anything. It is used only to withhold the
 * confident negative, degrading it to "check the boundary". One typo in a
 * schedule should cost a phone call, not a rent repayment order.
 */
export function streetNearMiss(scheme: Scheme, street: string | null | undefined): boolean {
  const list = scheme.streets;
  if (!Array.isArray(list) || list.length === 0 || !street) return false;
  const target = normalizeStreet(street);
  if (target.length < 5) return false;
  // One edit for short names, two for longer ones, where there is more room for
  // a transcription slip without the name becoming a genuinely different street.
  const max = target.length >= 12 ? 2 : 1;
  return list.some((s) => editDistance(normalizeStreet(s.name), target, max) <= max);
}

/**
 * The numeric part of a house number. "12" -> 12, "12a" -> 12, "Flat 2" -> null.
 *
 * The letter suffix is dropped deliberately: councils write "433a to 519 (odd)"
 * meaning the run of properties, so 433a sits inside a range expressed in whole
 * numbers. Treating the suffix as significant would exclude it wrongly.
 */
export function houseNumberValue(s: string | null | undefined): number | null {
  if (!s) return null;
  const m = String(s).trim().match(/^([0-9]+)/);
  if (!m) return null;
  const n = parseInt(m[1], 10);
  return Number.isFinite(n) ? n : null;
}

interface NumberRange {
  from: number;
  to: number;
  parity: "odd" | "even" | "all";
}

/**
 * Parse a council's house-number restriction into comparable ranges.
 *
 * These are free text transcribed verbatim from designation schedules and the
 * phrasing is wildly inconsistent, including the councils' own typos:
 * "433ato 519 (odd)", "12 to 80(even)", "Numbers 7-23 Odds, 20-48 Evens",
 * "1-160 (All)", "just 2a, 2b and 2c evens", "2 to 2".
 *
 * Returns null when nothing could be parsed, which is NOT the same as an empty
 * list and must stay distinguishable. Some restrictions are not ranges at all
 * (Salford's Bury New Road says to email the council), and guessing at those
 * would produce exactly the confident wrong answer this engine exists to avoid.
 */
export function parseNumberRanges(text: string | null | undefined): NumberRange[] | null {
  if (!text) return null;
  const t = String(text).toLowerCase().replace(/[‐-―]/g, "-");

  // Refuse to parse anything that is an instruction rather than a schedule.
  // Salford's Bury New Road entry reads "email landlord.licensing@salford.gov.uk
  // to check". A phone number or reference number in that text would parse as a
  // house-number range, and a house that then fell outside it would be told no
  // licence is needed. Bailing out yields "check with the council", which is the
  // honest answer to an instruction to check with the council.
  if (/@|https?:|\b\d{5,}\b|\b(contact|email|e-mail|phone|call|enquir|telephone)\b/.test(t)) return null;

  // Ambiguous constructions the council itself has written badly enough that we
  // cannot safely read them. A dangling "to" with no number in front of it
  // ("2, to 16") or a chained one ("34 to 72 to 104") could mean several
  // different spans, and picking one produces a confident answer from a guess.
  const danglingTo = /\bto\b/g;
  let toMatch: RegExpExecArray | null;
  while ((toMatch = danglingTo.exec(t)) !== null) {
    // A well-formed "to" has a house number immediately before it.
    if (!/[0-9][a-z]?\s*$/.test(t.slice(0, toMatch.index))) return null;
  }
  if (/[0-9]\s*(?:to|-)\s*[0-9]+[a-z]?\s*(?:to|-)\s*[0-9]/.test(t)) return null;

  // Tokenise into spans and standalone numbers, keeping their positions, so a
  // parity word can be attributed to the span it actually belongs to.
  interface Token {
    from: number;
    to: number;
    start: number;
    end: number;
    isSpan: boolean;
  }
  const tokens: Token[] = [];

  const spanRe = /([0-9]+)[a-z]?\s*(?:to|-|–)\s*([0-9]+)[a-z]?/g;
  let m: RegExpExecArray | null;
  while ((m = spanRe.exec(t)) !== null) {
    const a = parseInt(m[1], 10);
    const b = parseInt(m[2], 10);
    // Councils sometimes write a range backwards ("173a to 147 (odd)").
    tokens.push({ from: Math.min(a, b), to: Math.max(a, b), start: m.index, end: m.index + m[0].length, isSpan: true });
  }
  // Standalone numbers are those not already inside a span. Councils commonly
  // name a single designated address alongside a range ("1, 1a, 3 (odd) 44 to
  // 156 (even)"), and dropping it leaves that property answered "not in area"
  // when it is the one property the entry names.
  const bareRe = /[0-9]+[a-z]?/g;
  while ((m = bareRe.exec(t)) !== null) {
    const start = m.index;
    if (tokens.some((tok) => tok.isSpan && start >= tok.start && start < tok.end)) continue;
    const n = parseInt(m[0], 10);
    tokens.push({ from: n, to: n, start, end: start + m[0].length, isSpan: false });
  }
  if (tokens.length === 0) {
    // A parity with no numbers at all ("odds", "even numbers only") restricts
    // the whole street to one side. Councils write this where the designation
    // runs the full length of a road but covers only one side of it.
    const bare = /\ball\b/.test(t)
      ? null
      : /\bodds?\b/.test(t) && !/\bevens?\b/.test(t)
        ? "odd"
        : /\bevens?\b/.test(t) && !/\bodds?\b/.test(t)
          ? "even"
          : null;
    return bare ? [{ from: 1, to: Number.MAX_SAFE_INTEGER, parity: bare }] : null;
  }
  tokens.sort((a, b) => a.start - b.start);

  /**
   * Parity for one span, read from the text around it rather than from the
   * whole string.
   *
   * Councils separate opposite-parity ranges with nothing but a space:
   * "1 - 103 Odd (Incl) 2 - 100 Even (Incl)". Reading one parity for the whole
   * string stamped "odd" onto the even range, and every even-numbered property
   * on those streets was told it was outside the scheme. The marker that
   * qualifies a span almost always follows it, so look forward to the next
   * token first, then back to the previous one.
   */
  function parityIn(segment: string): NumberRange["parity"] | null {
    // "odds/evens", "odd and even", "all" mean both. Test this first: the word
    // "odds" inside "odds/evens" would otherwise read as odd-only, turning an
    // explicit instruction to include both into an exclusion of half the street.
    if (/\ball\b/.test(segment)) return "all";
    if (/\bodds?\b/.test(segment) && /\bevens?\b/.test(segment)) return "all";
    if (/\bodds?\b/.test(segment)) return "odd";
    if (/\bevens?\b/.test(segment)) return "even";
    return null;
  }

  const ranges: NumberRange[] = [];
  for (let i = 0; i < tokens.length; i++) {
    const tok = tokens[i];
    // A standalone number names one exact house, so parity cannot exclude it.
    if (!tok.isSpan) {
      ranges.push({ from: tok.from, to: tok.to, parity: "all" });
      continue;
    }
    // Both windows stop at a clause separator. Salford writes the parity BEFORE
    // its span ("odds 77 to 119, evens 34 to 182"), so an unbounded forward look
    // reads the next clause's "evens" and stamps it on the odd range. Truncating
    // at the comma leaves the forward window empty and lets the backward one,
    // which holds this span's own "odds", answer instead.
    const forwardRaw = t.slice(tok.end, tokens[i + 1]?.start ?? t.length);
    const after = forwardRaw.split(/[,;]/)[0];
    const backwardRaw = t.slice(tokens[i - 1]?.end ?? 0, tok.start);
    const beforeParts = backwardRaw.split(/[,;]/);
    const before = beforeParts[beforeParts.length - 1];
    ranges.push({ from: tok.from, to: tok.to, parity: parityIn(after) ?? parityIn(before) ?? "all" });
  }
  return ranges.length > 0 ? ranges : null;
}

/**
 * Is this house number inside the designated part of the street?
 *
 * `null` means we could not tell, which the caller must treat as "check with
 * the council" rather than as a no.
 */
export function numberInDesignation(
  numbers: string | null | undefined,
  houseNumber: string | null | undefined,
): boolean | null {
  const n = houseNumberValue(houseNumber);
  if (n === null) return null;
  const ranges = parseNumberRanges(numbers);
  if (!ranges) return null;
  const parity: "odd" | "even" = n % 2 === 0 ? "even" : "odd";
  return ranges.some((r) => n >= r.from && n <= r.to && (r.parity === "all" || r.parity === parity));
}

/**
 * Does this street sit inside a street-level designation?
 *
 * Returns `null` when the scheme publishes no street schedule, which is a
 * different answer from "not in the list" and must stay distinguishable: the
 * first means we cannot tell, the second means we checked and it is out.
 *
 * A street can legitimately appear more than once in one scheme with different
 * ranges (Manchester designates two separate stretches of Dickenson Road), so
 * every entry for the street is considered, not just the first.
 */
export function streetMatch(
  scheme: Scheme,
  street: string | null | undefined,
  houseNumber?: string | null,
): { inList: boolean; numbers: string | null; numberVerdict: boolean | null } | null {
  const list = scheme.streets;
  if (!Array.isArray(list) || list.length === 0 || !street) return null;
  const target = normalizeStreet(street);
  if (!target) return null;
  const hits = list.filter((s) => normalizeStreet(s.name) === target);
  if (hits.length === 0) return { inList: false, numbers: null, numberVerdict: null };

  // Whole-street entry: the number is irrelevant, the street is designated.
  const wholeStreet = hits.find((h) => !h.numbers);
  if (wholeStreet) return { inList: true, numbers: null, numberVerdict: true };

  const verdicts = hits.map((h) => numberInDesignation(h.numbers, houseNumber));
  const numbers = hits.map((h) => h.numbers).filter(Boolean).join("; ") || null;
  // Inside ANY designated stretch means a licence is needed. Only when every
  // stretch parsed cleanly and excluded this number can we say it is outside.
  if (verdicts.some((v) => v === true)) return { inList: true, numbers, numberVerdict: true };
  if (verdicts.every((v) => v === false)) return { inList: true, numbers, numberVerdict: false };
  return { inList: true, numbers, numberVerdict: null };
}

/** Current ONS ward names for a council, from `wards.json`. */
export function currentWards(gss: string): string[] {
  return WARDS[gss] ?? [];
}

/**
 * Scheme ward names that no longer exist in the council's current ward set.
 *
 * Designations are transcribed from council PDFs that often predate a boundary
 * review: Liverpool's selective scheme names "Central", "Riverside", "Picton"
 * and "Warbreck", none of which survived the 2023 review. A property in the
 * successor ward is genuinely inside the designated area, so a "not in area"
 * answer there would be confidently wrong. Where the list is stale we say
 * "check the boundary" instead, which is honest.
 */
export function schemeWardsAreStale(schemeWards: string[] | null | undefined, gss: string): boolean {
  if (!schemeWards || schemeWards.length === 0) return false;
  const live = new Set(currentWards(gss).map(normalizeWard));
  if (live.size === 0) return false;
  return schemeWards.some((w) => !live.has(normalizeWard(w)));
}

export type SchemeVerdict =
  | "required" // active whole-district scheme of relevant type
  | "likely-required" // active ward-based scheme, ward matches
  | "check-boundary" // active street/area-level scheme, or partial-ward designation
  | "upcoming" // scheme approved/starting soon
  | "not-in-area" // scheme exists in council but ward does not match
  /**
   * The designation covers this address, but the way the property is let puts
   * it outside the scheme's scope: an additional (HMO) scheme against a let
   * that is not a small HMO. Distinct from `not-in-area`, which is about
   * geography. Without it the report badged a single-occupant let "Licence
   * required" while the paragraph underneath said additional licensing does not
   * apply, which is a paid report contradicting itself.
   */
  | "not-applicable";

export interface SchemeAssessment {
  scheme: Scheme;
  verdict: SchemeVerdict;
  explanation: string;
}

/** Verdicts that mean "this scheme could bite for this property". */
export const POSITIVE_VERDICTS: SchemeVerdict[] = ["required", "likely-required", "check-boundary", "upcoming"];

export interface Determination {
  council: Council;
  ward: string | null;
  mandatoryHmo: {
    required: boolean;
    /**
     * True where the occupancy test is met but a further test we do not collect
     * decides the answer, so `required` is false without meaning "not required".
     *
     * Wales kept the three-storey requirement England dropped in 2018, and we do
     * not ask how many storeys a property has. Rendering the bare boolean as a
     * "Not required" pill told a Welsh landlord with six occupants in three
     * households the opposite of the truth, with the correct nuance relegated to
     * the paragraph underneath.
     */
    conditional: boolean;
    explanation: string;
  };
  selective: SchemeAssessment[];
  additional: SchemeAssessment[];
  hasAnyLicenceRisk: boolean;
  penaltySummary: {
    civilPenaltyMax: number;
    rroMonths: number;
    criminalFine: string;
  };
}

export interface PropertyAnswers {
  occupants: number;
  households: number;
  wardName: string | null;
  /**
   * The property's street, from the address picker. Street-level designations
   * are ~35 of the live schemes and a postcode cannot resolve them, so without
   * this the honest answer is only ever "check the boundary".
   */
  street?: string | null;
  /**
   * Where `street` came from, and it decides how far we are willing to trust it.
   *
   * - `os`: Ordnance Survey's structured THOROUGHFARE_NAME. Authoritative.
   * - `epc-numbered`: recovered from an address that led with a house number,
   *   e.g. "12 Askew Road". Stripping "12" leaves exactly the street, so this is
   *   as reliable as a structured field and is trusted the same way.
   * - `epc-derived`: recovered with no house number to anchor it. This is the
   *   "Rose Cottage, Mill Lane" case, where the name extracted may be the
   *   property rather than the road.
   * - `manual`: whatever the user typed.
   *
   * A guessed street that fails to match a designation schedule is
   * indistinguishable from a real street genuinely outside it, so only a
   * trusted street may produce a confident "not in the designated area". The
   * rest degrade to "check the boundary". Being wrong in that direction costs
   * the landlord a phone call; being wrong in the other costs them an unlimited
   * fine and up to twelve months' rent repaid.
   */
  streetSource?: "os" | "epc-numbered" | "epc-derived" | "manual" | null;
  /**
   * House number of the property, e.g. "12" or "12a".
   *
   * Essential, not optional detail: Manchester designates every one of its 223
   * street entries by house-number range rather than whole street, so the street
   * name alone cannot answer the question there.
   */
  houseNumber?: string | null;
  /**
   * The property's postcode. The only part of the address that is known rather
   * than derived, so where a council publishes designated postcodes it gives
   * the most reliable match available.
   */
  postcode?: string | null;
  /**
   * The postcode's coordinates, from postcodes.io.
   *
   * This is the postcode's centroid, not the property's own position, which is
   * why the engine refuses a definite answer within 100m of a designation edge.
   * Away from an edge it is decisive, and it is the only signal that works when
   * a council publishes no list of any kind.
   */
  latitude?: number | null;
  longitude?: number | null;
}

/**
 * Deterministic licence determination for an English property.
 * Selective licensing applies to properties NOT covered by HMO licensing;
 * additional licensing applies to HMOs below the mandatory threshold.
 */
export function determine(gss: string, answers: PropertyAnswers): Determination | null {
  const council = councilsByGss.get(gss);
  if (!council || !hasCouncilLicensingPowers(council.nation)) return null;

  const { occupants, households, wardName, street, streetSource, houseNumber, postcode, latitude, longitude } =
    answers;
  // A street is trustworthy enough to rule a designation OUT when it came from
  // Ordnance Survey, or when it was recovered from an address that led with a
  // house number ("12 Askew Road"), where stripping the number leaves exactly
  // the street. It is not trustworthy when there was no number to anchor it,
  // because then the name we extracted may be the property rather than the road.
  // See `PropertyAnswers.streetSource`.
  const streetIsAuthoritative = streetSource === "os" || streetSource === "epc-numbered";
  const isMandatoryHmo = occupants >= 5 && households >= 2;
  const isSmallHmo = !isMandatoryHmo && occupants >= 3 && households >= 2;

  const cs = schemesByGss.get(gss);
  const assess = (scheme: Scheme): SchemeAssessment => {
    // "Upcoming" only until its start date arrives; after that it is running and
    // must be assessed like any other live scheme.
    if (scheme.status === "upcoming" && !hasCommenced(scheme)) {
      return {
        scheme,
        verdict: "upcoming",
        explanation: `An approved ${scheme.type} licensing scheme starts ${scheme.start ?? "soon"}. ${scheme.areaDescription ?? ""}`.trim(),
      };
    }
    // The council's own published boundary, where it has one. This outranks
    // everything else because it IS the designation rather than a description
    // of it, and it answers by coordinate, with no street name to derive and no
    // ward to approximate.
    const geo = boundaryTest(gss, scheme, latitude, longitude);
    if (geo && !geo.nearEdge) {
      return geo.inside
        ? {
            scheme,
            verdict: "required",
            explanation: `This property falls inside the boundary ${council.name} publishes for this ${scheme.type} licensing designation, so a licence is required. Checked against the council's own boundary data, ${Math.round(geo.distance)}m inside the edge.`,
          }
        : {
            scheme,
            verdict: "not-in-area",
            explanation: `This property falls outside the boundary ${council.name} publishes for this ${scheme.type} licensing designation, ${Math.round(geo.distance)}m beyond its nearest edge. Checked against the council's own boundary data.`,
          };
    }
    if (geo && geo.nearEdge) {
      return {
        scheme,
        verdict: "check-boundary",
        explanation:
          `This property sits within ${Math.round(geo.distance)}m of the edge of ${council.name}'s designated area for this ${scheme.type} licensing scheme, ${geo.inside ? "just inside it" : "just outside it"}. We locate a property from its postcode, and a postcode covers a run of addresses that can straddle a boundary drawn along a street, so this close to the edge the postcode cannot settle it. ` +
          (scheme.checkerUrl ? `Confirm the exact address on the council's own checker: ${scheme.checkerUrl}` : `Confirm the exact address with the council.`),
      };
    }
    // Postcode next, because it is the only part of the address we know for
    // certain rather than derive. A hit is decisive; a miss tells us nothing,
    // since these lists are rarely exhaustive, so it falls through rather than
    // returning a negative.
    if (postcode) {
      const target = normalizePostcode(postcode);
      // A postcode the council itself flags as straddling the boundary must be
      // answered as such. Half its properties are in the scheme and half are
      // not, so both a yes and a no would be wrong for half of them.
      if ((scheme.boundaryPostcodes ?? []).some((p) => normalizePostcode(p) === target)) {
        return {
          scheme,
          verdict: "check-boundary",
          explanation: `${council.name} states that postcode ${postcode} straddles the boundary of this ${scheme.type} licensing designation, so some properties in it need a licence and some do not. The council will not answer this from the postcode alone. Confirm this specific address with them.`,
        };
      }
      if (Array.isArray(scheme.postcodes) && scheme.postcodes.length > 0) {
        if (scheme.postcodes.some((p) => normalizePostcode(p) === target)) {
          return scheme.listIsIndicative
            ? {
                scheme,
                verdict: "likely-required",
                explanation:
                  `${council.name} lists postcode ${postcode} within the designated area for this ${scheme.type} licensing scheme. The council states that not every property in a listed postcode is covered, because of where the boundary falls, so confirm this exact address. ` +
                  (scheme.checkerUrl ? `Its own checker will tell you: ${scheme.checkerUrl}` : ""),
              }
            : {
                scheme,
                verdict: "required",
                explanation: `${council.name} lists this property's postcode (${postcode}) in the designated area for this ${scheme.type} licensing scheme, so a licence is required.`,
              };
        }
      }
    }
    // Ward-level certainty inside a map-defined designation. Councils that draw
    // their scheme as a polygon often still publish which wards are wholly in
    // and wholly out, and those are definite answers regardless of coverage type.
    if (wardName) {
      const w = normalizeWard(wardName);
      if ((scheme.fullWards ?? []).some((x) => normalizeWard(x) === w)) {
        return {
          scheme,
          verdict: "required",
          explanation: `${council.name} states that the whole of ${wardName} falls inside this ${scheme.type} licensing designation, so a licence is required.`,
        };
      }
      if ((scheme.excludedWards ?? []).some((x) => normalizeWard(x) === w)) {
        // A ward name can survive a boundary review while its boundaries are
        // re-cut, which is exactly the Wealdstone hazard: the name still
        // validates against ONS but no longer describes the same ground. That
        // makes an exclusion list the riskiest thing to trust blind, because it
        // is the only ward signal that produces a confident negative.
        if (schemeWardsAreStale(scheme.excludedWards, gss)) {
          return {
            scheme,
            verdict: "check-boundary",
            explanation: `${council.name} lists ${wardName} outside this ${scheme.type} licensing designation, but that list carries ward names from before this council's most recent boundary review, so it cannot be relied on to rule this property out. Confirm the address with the council.`,
          };
        }
        return {
          scheme,
          verdict: "not-in-area",
          explanation: `${council.name} states that ${wardName} falls wholly outside this ${scheme.type} licensing designation.`,
        };
      }
    }
    if (isWholeDistrict(scheme.coverage)) {
      return {
        scheme,
        verdict: "required",
        explanation: `${council.name} runs a ${scheme.coverage} ${scheme.type} licensing scheme, so the designation covers this property's area.`,
      };
    }
    // Ward matching runs on any scheme that carries a ward list, not only those
    // we happened to label "wards". A designation's shape in our data is a
    // description, not a contract, and research routinely disagrees with it:
    // Charnwood's scheme reads as ward-based to us and street-based to the
    // council. Gating on the label meant a schedule we hold could be ignored.
    //
    // It runs AFTER street matching, which is deliberate. A scheme can carry
    // both, and a street schedule settles the property while a ward list only
    // ever narrows it to "likely". Answering from the coarser of the two when
    // the finer one is available would throw away precision we have. Street
    // matching returns null when it cannot decide, so this still runs then.
    const fromStreets = assessStreetSchedule();
    if (fromStreets) return fromStreets;

    if ((scheme.wards?.length ?? 0) > 0 && wardName) {
      if (wardMatches(scheme.wards, wardName)) {
        return {
          scheme,
          verdict: "likely-required",
          explanation: `This property's ward (${wardName}) is in the scheme's designated ward list. Some designations cover only parts of a ward, so confirm the exact boundary on the council's map.`,
        };
      }
      if (scheme.wardListIsDerived) {
        return {
          scheme,
          verdict: "check-boundary",
          explanation:
            `This property's ward (${wardName}) is not in the wards we have derived for this designation, but ${council.name} publishes the area only as a boundary, not as a ward list, so the designation does not follow ward lines and a ward that is mostly outside it can still contain designated streets. This is not a definite no. ` +
            (scheme.checkerUrl ? `Check the exact address on the council's own checker: ${scheme.checkerUrl}` : `Confirm the address with the council.`),
        };
      }
      if (schemeWardsAreStale(scheme.wards, gss)) {
        return {
          scheme,
          verdict: "check-boundary",
          explanation: `This property's ward (${wardName}) is not named in the scheme's designated ward list, but that list uses ward names from before this council's most recent boundary review, so it cannot be matched reliably. Confirm the address against the council's designation map.`,
        };
      }
      return {
        scheme,
        verdict: "not-in-area",
        explanation: `This property's ward (${wardName}) is not in the scheme's designated ward list (${(scheme.wards ?? []).length} wards designated).`,
      };
    }
    /**
     * Street-level designations: if the council publishes a schedule and we know
     * the street, this becomes a definite answer instead of a hedge.
     *
     * Keyed on holding a schedule rather than on the coverage label, for the
     * same reason as ward matching. Returns null when it cannot decide, so the
     * caller falls through to the coarser checks.
     */
    function assessStreetSchedule(): SchemeAssessment | null {
      // Re-narrowed inside: this is a hoisted declaration, so it is analysed
      // without the caller's earlier `if (!council) return null` guard.
      if (!council) return null;
      if (!Array.isArray(scheme.streets) || scheme.streets.length === 0) return null;
      const m = streetMatch(scheme, street, houseNumber);
      if (m && m.inList) {
        // In the list and inside a designated stretch (or the whole street is
        // designated). Asserting "required" here is the safe direction, so it
        // does not depend on how the street name was obtained.
        if (m.numberVerdict === true) {
          // An indicative list places the street inside the area but does not
          // settle the property, so it cannot assert a requirement outright.
          if (scheme.listIsIndicative) {
            return {
              scheme,
              verdict: "likely-required",
              explanation:
                `${street} is on ${council.name}'s published street list for this ${scheme.type} licensing scheme. The council states that not every property on a listed street is covered, because of where the boundary falls, so confirm this exact address. ` +
                (scheme.checkerUrl ? `Its own checker will tell you: ${scheme.checkerUrl}` : ""),
            };
          }
          return {
            scheme,
            verdict: "required",
            explanation: m.numbers
              ? `${street} is on ${council.name}'s designated street list for this ${scheme.type} licensing scheme, and number ${houseNumber} falls inside the designated range (${m.numbers}), so a licence is required.`
              : `${street} is on ${council.name}'s designated street list for this ${scheme.type} licensing scheme, and the whole street is covered, so a licence is required.`,
          };
        }
        // In the list, but this house number sits outside every designated
        // stretch. That is a "no", so it needs a street we can trust.
        if (m.numberVerdict === false) {
          if (!streetIsAuthoritative) {
            return {
              scheme,
              verdict: "check-boundary",
              explanation: `${street} is on ${council.name}'s designated street list, but only part of it is covered (${m.numbers}) and number ${houseNumber} falls outside that. We read the street name from the address rather than from an official address record, so confirm this with the council before relying on it.`,
            };
          }
          return {
            scheme,
            verdict: "not-in-area",
            explanation: `${street} is on ${council.name}'s designated street list, but only part of it is covered (${m.numbers}), and number ${houseNumber} falls outside the designated range.`,
          };
        }
        // Street is designated in part, but we could not place the number,
        // either because the address has none or the council's wording is not
        // a parseable range. Hand the wording to the user verbatim.
        return {
          scheme,
          verdict: "likely-required",
          explanation: `${street} is on ${council.name}'s designated street list, but only part of it is covered (${m.numbers}). Check your house number against that; if it falls inside, a licence is required.`,
        };
      }
      if (m && !m.inList) {
        // The street schedule and the ward list disagree, so one of them is a
        // fragment and we cannot tell which. Newcastle's 2021 designation names
        // three wards but only five streets, because only one of its three
        // sub-areas publishes a street schedule at all. Trusting the schedule
        // there turned "your ward is designated" into "you are not in the area"
        // for the other two sub-areas, so supplying MORE information about a
        // property made its answer worse. Never resolve that disagreement
        // against the landlord.
        if (wardName && wardMatches(scheme.wards, wardName)) {
          return {
            scheme,
            verdict: "likely-required",
            explanation: `This property's ward (${wardName}) is in the designated ward list for this ${scheme.type} licensing scheme, though ${street} is not on the partial street schedule ${council.name} publishes for it. That schedule does not cover the whole designation, so it cannot rule this property out. Confirm the exact address with the council.`,
          };
        }
        // An indicative list is not the boundary, so absence from it is not
        // evidence of absence from the scheme.
        if (scheme.listIsIndicative) {
          return {
            scheme,
            verdict: "check-boundary",
            explanation:
              `${street} does not appear on ${council.name}'s published street list for this ${scheme.type} licensing scheme, but that list is indicative rather than the legal boundary, so this is not a definite no. ` +
              (scheme.checkerUrl ? `Confirm on the council's own checker: ${scheme.checkerUrl}` : `Confirm the address with the council.`),
          };
        }
        // Close but not exact almost always means the council misspelled its
        // own street in the schedule. Never assert a negative over that.
        if (streetNearMiss(scheme, street)) {
          return {
            scheme,
            verdict: "check-boundary",
            explanation: `${street} is not an exact match for anything on ${council.name}'s designated street list, but it is very close to one of the designated streets. Council schedules are transcribed from published notices and sometimes misspell a street, so confirm this address with the council rather than assuming it is outside the scheme.`,
          };
        }
        if (!streetIsAuthoritative) {
          return {
            scheme,
            verdict: "check-boundary",
            explanation: `We read this property's street as "${street}", which is not on ${council.name}'s designated street list for this scheme (${(scheme.streets ?? []).length} streets designated). That name was derived from the address rather than from an official address record, so it may not be the name the council uses. Check the address against the council's street list before relying on this.`,
          };
        }
        return {
          scheme,
          verdict: "not-in-area",
          explanation: `${street} is not on ${council.name}'s designated street list for this scheme (${(scheme.streets ?? []).length} streets designated).`,
        };
      }
      // We hold a schedule but do not know this property's street, so it cannot
      // decide. Fall through to the coarser checks rather than guess.
      return null;
    }
    // Last resort before hedging: has the council actually licensed properties
    // in this postcode under this scheme? That is not the designated area, so it
    // can only ever support "likely", but it beats telling the landlord nothing.
    if (postcode && Array.isArray(scheme.licensedPostcodes) && scheme.licensedPostcodes.length > 0) {
      const target = normalizePostcode(postcode);
      if (scheme.licensedPostcodes.some((p) => normalizePostcode(p) === target)) {
        return {
          scheme,
          verdict: "likely-required",
          explanation:
            `${council.name}'s public register shows licences already issued under this ${scheme.type} licensing scheme at properties in ${postcode}, so this postcode sits in or on the edge of the designated area. ` +
            (scheme.checkerUrl
              ? `Confirm this exact address on the council's own checker: ${scheme.checkerUrl}`
              : `The designation is drawn on a map, so confirm the exact address with the council.`),
        };
      }
    }
    return {
      scheme,
      verdict: "check-boundary",
      explanation:
        `This scheme uses a ${scheme.coverage}-level designation${scheme.areaDescription ? ` (${scheme.areaDescription})` : ""}. ` +
        (scheme.checkerUrl
          ? `${council.name} runs its own address checker for this scheme, which will confirm this exact property: ${scheme.checkerUrl}`
          : `Check the property's address against the council's designation map or street list.`),
    };
  };

  // A recorded status is a snapshot from when the record was researched; the
  // end date is the fact. Without checking it, a designation that lapsed last
  // month is still sold as requiring a licence. See `hasLapsed`.
  const liveSchemes = (cs?.schemes ?? []).filter(
    (s) => (s.status === "active" || s.status === "upcoming") && !hasLapsed(s),
  );
  const additional = liveSchemes.filter((s) => s.type === "additional").map(assess);

  // Additional licensing bites only on small HMOs. When the let is genuinely
  // outside that scope the verdict must move too, not just the explanation:
  // leaving it at "required" badged the scheme "Licence required" directly
  // above a sentence saying it does not apply.
  //
  // WALES IS THE EXCEPTION AND MUST NOT BE DOWNGRADED. England's mandatory
  // regime supersedes additional licensing outright, but Wales also requires
  // three or more storeys (WSI 2006/1712 (W.174)), which we do not collect. A
  // two-storey Welsh property at 5 occupants / 2 households is an HMO that
  // mandatory licensing does NOT cover, so the council's additional scheme is
  // exactly what applies to it. Blanket-downgrading here badged that property
  // "Does not apply to this let" while `mandatoryHmo.required` was also false,
  // leaving a licensable HMO reported as needing nothing at all.
  const mandatorySupersedes = isMandatoryHmo && council.nation === "england";
  const additionalOutOfScope = !isSmallHmo && (mandatorySupersedes || !isMandatoryHmo);

  // Selective licensing (s.80 Housing Act 2004) covers private lets that are not
  // licensable under Part 2, so a property already licensable as an HMO is
  // outside it. Same contradiction as additional licensing had: the verdict has
  // to move with the reasoning, or the report shows a red "Licence required"
  // badge (and emails "Selective licence: REQUIRED") for a scheme it has already
  // decided does not apply.
  //
  // Two ways in. A mandatory HMO, England only: Wales keeps the warning because
  // the storey test decides there and a two-storey property is not licensable
  // under the mandatory regime. Or a small HMO that a live ADDITIONAL scheme
  // positively covers, which is the case the first version missed: 33 English
  // councils run both scheme types, so Birmingham at 3 occupants in 3 households
  // showed "additional: required" and "selective: check boundary" together and
  // told the buyer to apply for both.
  const additionalCovers =
    isSmallHmo && additional.some((a) => POSITIVE_VERDICTS.includes(a.verdict));
  const licensableAsHmo = mandatorySupersedes || additionalCovers;
  const selective = liveSchemes
    .filter((s) => s.type === "selective")
    .map(assess)
    .map((a) => {
      if (licensableAsHmo && a.verdict !== "not-in-area") {
        return {
          ...a,
          verdict: "not-applicable" as SchemeVerdict,
          explanation:
            a.explanation +
            (mandatorySupersedes
              ? " This property needs a mandatory HMO licence, and selective licensing applies to lets that are not licensable as HMOs, so this scheme does not apply to it."
              : " This property is licensable under the council's additional (HMO) scheme, and selective licensing applies to lets that are not licensable as HMOs, so this scheme does not apply to it."),
        };
      }
      if (isMandatoryHmo || isSmallHmo) {
        return {
          ...a,
          explanation:
            a.explanation + " Note: selective licensing normally applies to properties not already licensable as HMOs.",
        };
      }
      return a;
    });
  const relevantAdditional = isSmallHmo
    ? additional
    : additional.map((a) => ({
        ...a,
        verdict: (additionalOutOfScope && a.verdict !== "not-in-area" ? "not-applicable" : a.verdict) as SchemeVerdict,
        explanation:
          a.explanation +
          (mandatorySupersedes
            ? " This property meets the MANDATORY HMO threshold, so mandatory licensing applies instead of additional licensing."
            : isMandatoryHmo
              ? " This property meets the occupancy part of the Welsh mandatory HMO test. If it has three or more storeys a mandatory licence applies instead; if it has one or two, it is not mandatorily licensable and this additional scheme is the one that covers it."
              : " This property is not an HMO on the details given (fewer than 3 occupants or a single household), so additional licensing does not currently apply, but would if occupancy changes."),
      }));

  const positiveVerdicts = POSITIVE_VERDICTS;
  // A small HMO is NOT outside selective licensing: where no additional scheme
  // covers it, a selective designation can still bite, and excluding it here
  // reported no licence risk for a property with a positive selective verdict.
  // The mandatory-HMO exclusion now comes from the verdict itself (downgraded to
  // not-applicable above) rather than being applied twice, which also keeps the
  // Welsh case warning instead of silently dropping out.
  const selectiveRisk = selective.some((a) => positiveVerdicts.includes(a.verdict));
  const additionalRisk = isSmallHmo && additional.some((a) => positiveVerdicts.includes(a.verdict));

  return {
    council,
    ward: wardName,
    mandatoryHmo: {
      // WALES DIFFERS AND MUST NOT BE ANSWERED WITH ENGLAND'S TEST. England
      // dropped the three-storey requirement in October 2018; Wales did not.
      // The Welsh threshold (WSI 2006/1712 (W.174)) is 5+ occupants, 2+
      // households AND three or more storeys. We do not collect storeys, so a
      // Welsh property that meets the occupancy test gets a conditional answer
      // rather than a false assertion that a licence is definitely required.
      required: isMandatoryHmo && council.nation === "england",
      // Wales meets the occupancy test but the storey test decides it, and we
      // do not collect storeys. This is neither "required" nor "not required".
      conditional: isMandatoryHmo && council.nation === "wales",
      explanation: isMandatoryHmo
        ? council.nation === "wales"
          ? `With ${occupants} occupants forming ${households} households sharing facilities, this property meets the occupancy part of the Welsh mandatory HMO test. In Wales, unlike England, a mandatory licence is only required if the property ALSO has three or more storeys (counting habitable basements and attics). If it does, a mandatory HMO licence is required; if it is one or two storeys, it is not.`
          : `With ${occupants} occupants forming ${households} households sharing facilities, this property needs a MANDATORY HMO licence anywhere in England (Housing Act 2004 Part 2).`
        : `With ${occupants} occupant${occupants === 1 ? "" : "s"} forming ${households} household${households === 1 ? "" : "s"}, this property is below the mandatory HMO threshold (5+ occupants forming 2+ households${council.nation === "wales" ? ", and in Wales three or more storeys as well" : ""}).`,
    },
    selective,
    additional: relevantAdditional,
    hasAnyLicenceRisk: isMandatoryHmo || selectiveRisk || additionalRisk,
    penaltySummary: {
      civilPenaltyMax: 40000,
      rroMonths: 24,
      criminalFine: "unlimited",
    },
  };
}

/** Today, as YYYY-MM-DD, so scheme dates compare as plain strings. */
function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Has this designation's term ended, whatever its recorded status says?
 *
 * Statuses are set by hand when a record is researched and then never move.
 * Salford's additional scheme ended on 19 July 2026 and Harrow's on 5 August,
 * and both were still being reported active, so a landlord was told to buy a
 * licence that no longer exists and then charged £7.99 to be told it again.
 * With 189 schemes carrying end dates, that recurs silently every time one
 * lapses. Comparing against the calendar makes the data self-correcting.
 */
export function hasLapsed(scheme: Scheme): boolean {
  return !!scheme.end && scheme.end < today();
}

/** Has an upcoming designation's start date arrived? */
export function hasCommenced(scheme: Scheme): boolean {
  return !!scheme.start && scheme.start <= today();
}

/** Council-level summary used by the FREE check and council pages. */
export interface CouncilSummary {
  council: Council;
  hasData: boolean;
  activeSelective: Scheme[];
  activeAdditional: Scheme[];
  upcoming: Scheme[];
  expired: Scheme[];
  proposed: Scheme[];
  notes?: string;
}

export function councilSummary(gss: string): CouncilSummary | null {
  const council = councilsByGss.get(gss);
  if (!council) return null;
  const cs = schemesByGss.get(gss);
  const schemes = cs?.schemes ?? [];
  const isExpired = (s: Scheme) => s.status === "expired" || hasLapsed(s);
  const isLive = (s: Scheme) => s.status === "active" && !hasLapsed(s);
  return {
    council,
    hasData: !!cs,
    activeSelective: schemes.filter((s) => s.type === "selective" && isLive(s)),
    activeAdditional: schemes.filter((s) => s.type === "additional" && isLive(s)),
    // An "upcoming" scheme whose start has passed is running now.
    upcoming: schemes.filter((s) => s.status === "upcoming" && !hasCommenced(s) && !hasLapsed(s)),
    expired: schemes.filter(isExpired),
    proposed: schemes.filter((s) => s.status === "proposed" || s.status === "unverified"),
    notes: cs?.notes,
  };
}
