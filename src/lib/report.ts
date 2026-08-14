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
 * The issued token is the last 12 characters of the Stripe session id, not the
 * id itself, so lookups cannot `.eq("stripe_session_id", token)`. They use
 * exact suffix equality on that column (`regexMatch` with `token$`), not
 * LIKE/ilike. An unvalidated "%" used to be a LIKE wildcard that matched every
 * report row; the alphanumeric gate still rejects anything that is not the
 * issued shape before a query runs.
 */
export function isValidReportToken(token: string | null | undefined): boolean {
  return typeof token === "string" && /^[A-Za-z0-9]{12}$/.test(token);
}

/**
 * Exact suffix match for a validated report token.
 *
 * `regexMatch` is POSIX regex (`~`), so `token$` means the session id ends with
 * this literal suffix. Callers must already have passed `isValidReportToken`,
 * which guarantees the token has no regex metacharacters. Not LIKE/ilike: no
 * `%` or `_` wildcards.
 */
export function applyReportTokenFilter<
  Q extends { regexMatch: (column: string, pattern: string) => Q },
>(query: Q, token: string): Q {
  return query.regexMatch("stripe_session_id", `${token}$`);
}
