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

/**
 * Accept a report token only if it is the exact shape we issue.
 *
 * Tokens are looked up with `ilike("stripe_session_id", "%" + token)`, and in a
 * LIKE pattern `%` and `_` are wildcards. An unvalidated token of "%" therefore
 * matched EVERY report row rather than none, and the query's
 * order-by-newest-limit-1 handed back the most recent customer's report. The
 * token's ~70 bits of entropy were irrelevant, because the wildcard never had to
 * guess.
 *
 * Stripe session ids are alphanumeric, so a strict 12-character alphanumeric
 * test removes every LIKE metacharacter and closes that off at the door.
 */
export function isValidReportToken(token: string | null | undefined): boolean {
  return typeof token === "string" && /^[A-Za-z0-9]{12}$/.test(token);
}
