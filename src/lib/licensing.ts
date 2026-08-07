import councilsData from "@/data/councils.json";
import schemesData from "@/data/licensing-schemes.json";
import nationalRules from "@/data/national-rules.json";
import wardsData from "@/data/wards.json";

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

export function normalizeStreet(s: string): string {
  return s
    .toLowerCase()
    .replace(/&amp;/g, "and")
    .replace(/&/g, "and")
    .replace(/['’‘`]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(" ")
    .map((w) => STREET_WORDS[w] ?? w)
    .join(" ");
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

  const ranges: NumberRange[] = [];

  // Split on commas AND "and", so each clause carries its own parity word.
  // "7-23 odds, 20-48 evens" and Leicester's "1 -3 odd and 2 - 4 - even" both
  // pair two spans with opposite parities. Reading one parity for the whole
  // string would apply "odd" to the even range, and a landlord at number 2 of a
  // designated street would be told they are outside the scheme.
  for (const clause of t.split(/[,;]|\sand\s/)) {
    const parity: NumberRange["parity"] = /\bodds?\b/.test(clause)
      ? "odd"
      : /\bevens?\b/.test(clause)
        ? "even"
        : "all";
    // "12 to 80", "12-80", "433a to 519"
    const spanRe = /([0-9]+)[a-z]?\s*(?:to|-|–)\s*([0-9]+)[a-z]?/g;
    let m: RegExpExecArray | null;
    let matchedSpan = false;
    while ((m = spanRe.exec(clause)) !== null) {
      matchedSpan = true;
      const a = parseInt(m[1], 10);
      const b = parseInt(m[2], 10);
      // Councils sometimes write a range backwards ("173a to 147 (odd)").
      ranges.push({ from: Math.min(a, b), to: Math.max(a, b), parity });
    }
    if (matchedSpan) continue;
    // Bare numbers: "just 2a, 2b and 2c evens" arrives here one clause at a time.
    const bareRe = /\b([0-9]+)[a-z]?\b/g;
    while ((m = bareRe.exec(clause)) !== null) {
      const n = parseInt(m[1], 10);
      ranges.push({ from: n, to: n, parity: "all" });
    }
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
  | "not-in-area"; // scheme exists in council but ward does not match

export interface SchemeAssessment {
  scheme: Scheme;
  verdict: SchemeVerdict;
  explanation: string;
}

export interface Determination {
  council: Council;
  ward: string | null;
  mandatoryHmo: {
    required: boolean;
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
}

/**
 * Deterministic licence determination for an English property.
 * Selective licensing applies to properties NOT covered by HMO licensing;
 * additional licensing applies to HMOs below the mandatory threshold.
 */
export function determine(gss: string, answers: PropertyAnswers): Determination | null {
  const council = councilsByGss.get(gss);
  if (!council || !hasCouncilLicensingPowers(council.nation)) return null;

  const { occupants, households, wardName, street, streetSource, houseNumber } = answers;
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
    if (scheme.status === "upcoming") {
      return {
        scheme,
        verdict: "upcoming",
        explanation: `An approved ${scheme.type} licensing scheme starts ${scheme.start ?? "soon"}. ${scheme.areaDescription ?? ""}`.trim(),
      };
    }
    if (isWholeDistrict(scheme.coverage)) {
      return {
        scheme,
        verdict: "required",
        explanation: `${council.name} runs a ${scheme.coverage} ${scheme.type} licensing scheme, so the designation covers this property's area.`,
      };
    }
    if (scheme.coverage === "wards" && wardName) {
      if (wardMatches(scheme.wards, wardName)) {
        return {
          scheme,
          verdict: "likely-required",
          explanation: `This property's ward (${wardName}) is in the scheme's designated ward list. Some designations cover only parts of a ward, so confirm the exact boundary on the council's map.`,
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
    // Street-level designations: if the council publishes a schedule and we
    // know the street, this becomes a definite answer instead of a hedge.
    if (scheme.coverage === "streets") {
      const m = streetMatch(scheme, street, houseNumber);
      if (m && m.inList) {
        // In the list and inside a designated stretch (or the whole street is
        // designated). Asserting "required" here is the safe direction, so it
        // does not depend on how the street name was obtained.
        if (m.numberVerdict === true) {
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
    }
    return {
      scheme,
      verdict: "check-boundary",
      explanation: `This scheme uses a ${scheme.coverage}-level designation${scheme.areaDescription ? ` (${scheme.areaDescription})` : ""}. Check the property's address against the council's designation map or street list.`,
    };
  };

  const liveSchemes = (cs?.schemes ?? []).filter((s) => s.status === "active" || s.status === "upcoming");
  // Selective licensing only bites on non-HMO lets; additional licensing on small HMOs.
  const selective = liveSchemes
    .filter((s) => s.type === "selective")
    .map(assess)
    .map((a) =>
      isMandatoryHmo || isSmallHmo
        ? { ...a, explanation: a.explanation + " Note: selective licensing normally applies to properties not already licensable as HMOs." }
        : a,
    );
  const additional = liveSchemes.filter((s) => s.type === "additional").map(assess);

  const relevantAdditional = isSmallHmo
    ? additional
    : additional.map((a) => ({
        ...a,
        explanation:
          a.explanation +
          (isMandatoryHmo
            ? " This property meets the MANDATORY HMO threshold, so mandatory licensing applies instead of additional licensing."
            : " This property is not an HMO on the details given (fewer than 3 occupants or a single household), so additional licensing does not currently apply, but would if occupancy changes."),
      }));

  const positiveVerdicts: SchemeVerdict[] = ["required", "likely-required", "check-boundary", "upcoming"];
  const selectiveRisk = !isMandatoryHmo && !isSmallHmo && selective.some((a) => positiveVerdicts.includes(a.verdict));
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
  return {
    council,
    hasData: !!cs,
    activeSelective: schemes.filter((s) => s.type === "selective" && s.status === "active"),
    activeAdditional: schemes.filter((s) => s.type === "additional" && s.status === "active"),
    upcoming: schemes.filter((s) => s.status === "upcoming"),
    expired: schemes.filter((s) => s.status === "expired"),
    proposed: schemes.filter((s) => s.status === "proposed" || s.status === "unverified"),
    notes: cs?.notes,
  };
}
