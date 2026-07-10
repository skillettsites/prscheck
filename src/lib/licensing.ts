import councilsData from "@/data/councils.json";
import schemesData from "@/data/licensing-schemes.json";
import nationalRules from "@/data/national-rules.json";

export interface Council {
  gss: string;
  name: string;
  slug: string;
  nation: "england" | "wales" | "scotland" | "northern-ireland";
}

export type SchemeType = "selective" | "additional";
export type SchemeStatus = "active" | "upcoming" | "expired" | "proposed" | "unverified";

export interface Scheme {
  type: SchemeType;
  status: SchemeStatus;
  start: string | null;
  end: string | null;
  coverage: string; // "borough-wide" | "whole district" | "district" | "wards" | "streets" | "areas" | "area"
  wards?: string[] | null;
  areaDescription?: string;
  feeApprox?: string | null;
  sourceUrl: string;
  verified: string;
}

export interface CouncilSchemes {
  council: string;
  gss: string;
  schemes: Scheme[];
  notes?: string;
}

export const COUNCILS = councilsData as Council[];
export const SCHEMES = schemesData as CouncilSchemes[];
export const NATIONAL_RULES = nationalRules as Record<string, unknown>;

const schemesByGss = new Map<string, CouncilSchemes>(SCHEMES.map((s) => [s.gss, s]));
const councilsByGss = new Map<string, Council>(COUNCILS.map((c) => [c.gss, c]));
const councilsBySlug = new Map<string, Council>(COUNCILS.map((c) => [c.slug, c]));

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

export function wardMatches(schemeWards: string[] | null | undefined, wardName: string): boolean {
  if (!schemeWards || schemeWards.length === 0) return false;
  const target = normalizeWard(wardName);
  return schemeWards.some((w) => {
    const n = normalizeWard(w);
    return n === target || n.includes(target) || target.includes(n);
  });
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
}

/**
 * Deterministic licence determination for an English property.
 * Selective licensing applies to properties NOT covered by HMO licensing;
 * additional licensing applies to HMOs below the mandatory threshold.
 */
export function determine(gss: string, answers: PropertyAnswers): Determination | null {
  const council = councilsByGss.get(gss);
  if (!council || council.nation !== "england") return null;

  const { occupants, households, wardName } = answers;
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
      return {
        scheme,
        verdict: "not-in-area",
        explanation: `This property's ward (${wardName}) is not in the scheme's designated ward list (${(scheme.wards ?? []).length} wards designated).`,
      };
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
      required: isMandatoryHmo,
      explanation: isMandatoryHmo
        ? `With ${occupants} occupants forming ${households} households sharing facilities, this property needs a MANDATORY HMO licence anywhere in England (Housing Act 2004 Part 2).`
        : `With ${occupants} occupant${occupants === 1 ? "" : "s"} forming ${households} household${households === 1 ? "" : "s"}, this property is below the mandatory HMO threshold (5+ occupants forming 2+ households).`,
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
