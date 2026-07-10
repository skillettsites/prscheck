import type { Determination } from "@/lib/licensing";

export interface LicenceReportData {
  postcode: string;
  address: string;
  ward: string | null;
  occupants: number;
  households: number;
  determination: Determination;
  councilNotes?: string;
  generatedAt: string;
}

/** Buyer-facing permanent token; mirrors the PCC pattern (session id suffix). */
export function deriveReportToken(sessionId: string): string {
  return sessionId.slice(-12);
}
