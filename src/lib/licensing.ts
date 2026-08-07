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

/**
 * Does this street sit inside a street-level designation?
 *
 * Returns `null` when the scheme publishes no street schedule, which is a
 * different answer from "not in the list" and must stay distinguishable: the
 * first means we cannot tell, the second means we checked and it is out.
 */
export function streetMatch(
  scheme: Scheme,
  street: string | null | undefined,
): { inList: boolean; partial: boolean; numbers: string | null } | null {
  const list = scheme.streets;
  if (!Array.isArray(list) || list.length === 0 || !street) return null;
  const target = normalizeStreet(street);
  if (!target) return null;
  const hit = list.find((s) => normalizeStreet(s.name) === target);
  if (!hit) return { inList: false, partial: false, numbers: null };
  const numbers = hit.numbers ?? null;
  return { inList: true, partial: !!numbers, numbers };
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
   * "os" is Ordnance Survey's structured THOROUGHFARE_NAME and is authoritative.
   * "epc" is recovered from a free-text EPC address line by stripping the
   * building number, which is a guess: "Rose Cottage, Mill Lane" can yield
   * "Rose Cottage", and a named house on a designated street can yield the wrong
   * name entirely. "manual" is whatever the user typed.
   *
   * A guessed street that fails to match a designation schedule is
   * indistinguishable from a real street that is genuinely outside it, so only
   * an "os" street may produce a confident "not in the designated area". The
   * others degrade to "check the boundary". Being wrong in that direction costs
   * the landlord a phone call; being wrong in the other costs them an unlimited
   * fine and up to twelve months' rent repaid.
   */
  streetSource?: "os" | "epc" | "manual" | null;
}

/**
 * Deterministic licence determination for an English property.
 * Selective licensing applies to properties NOT covered by HMO licensing;
 * additional licensing applies to HMOs below the mandatory threshold.
 */
export function determine(gss: string, answers: PropertyAnswers): Determination | null {
  const council = councilsByGss.get(gss);
  if (!council || !hasCouncilLicensingPowers(council.nation)) return null;

  const { occupants, households, wardName, street, streetSource } = answers;
  // Only Ordnance Survey gives a structured thoroughfare. Anything else is a
  // guess at the street name, so it may confirm a designation but must never
  // rule one out. See `PropertyAnswers.streetSource`.
  const streetIsAuthoritative = streetSource === "os";
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
      const m = streetMatch(scheme, street);
      if (m && m.inList && !m.partial) {
        return {
          scheme,
          verdict: "required",
          explanation: `${street} is on ${council.name}'s designated street list for this ${scheme.type} licensing scheme, so a licence is required for a property let on this street.`,
        };
      }
      if (m && m.inList && m.partial) {
        return {
          scheme,
          verdict: "likely-required",
          explanation: `${street} is on the designated street list, but only part of it is covered (${m.numbers}). Check your house number against that range; if it falls inside, a licence is required.`,
        };
      }
      if (m && !m.inList) {
        if (!streetIsAuthoritative) {
          return {
            scheme,
            verdict: "check-boundary",
            explanation: `We read this property's street as "${street}", which is not on ${council.name}'s designated street list for this scheme (${(scheme.streets ?? []).length} streets designated). That street name was derived from the address rather than supplied by Ordnance Survey, so it may not be the name the council uses. Check the address against the council's street list before relying on this.`,
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
