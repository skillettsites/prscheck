import { Resend } from "resend";
import type { LicenceReportData } from "@/lib/report";
import { penaltiesFor } from "@/lib/licensing";
import { RRO_FACTS, gbp } from "@/lib/rro";

function getResend(): Resend {
  const key = (process.env.RESEND_API_KEY ?? "").replace(/\\n$/, "").trim();
  if (!key) throw new Error("RESEND_API_KEY not configured");
  return new Resend(key);
}

const FROM = process.env.EMAIL_FROM ?? "PRSCheck <reports@prscheck.co.uk>";
const REPLY_TO = process.env.EMAIL_REPLY_TO ?? "support@prscheck.co.uk";

export async function sendLicenceReportEmail(
  to: string,
  report: LicenceReportData,
  token: string,
): Promise<void> {
  const d = report.determination;
  const url = `https://prscheck.co.uk/r/${token}`;

  const verdictLines: string[] = [];
  if (d.mandatoryHmo.required) {
    verdictLines.push("Mandatory HMO licence: REQUIRED");
  } else if (d.mandatoryHmo.conditional) {
    // Wales keeps the three-storey test England dropped in 2018 and we do not
    // collect storeys, so this is neither required nor not required. Without
    // this branch a Welsh property that meets the occupancy test fell through
    // to "No licence requirement identified", which is the opposite of true.
    verdictLines.push("Mandatory HMO licence: DEPENDS ON STOREYS (required in Wales at three or more)");
  }
  for (const a of d.selective) {
    if (a.verdict === "required" || a.verdict === "likely-required") {
      verdictLines.push(`Selective licence: ${a.verdict === "required" ? "REQUIRED" : "LIKELY REQUIRED"}`);
    } else if (a.verdict === "check-boundary") {
      verdictLines.push("Selective licence: CHECK BOUNDARY (street-level designation)");
    } else if (a.verdict === "upcoming") {
      verdictLines.push(`Selective licensing scheme starting ${a.scheme.start ?? "soon"}`);
    }
  }
  for (const a of d.additional) {
    if (a.verdict === "required" || a.verdict === "likely-required") {
      verdictLines.push(`Additional (HMO) licence: ${a.verdict === "required" ? "REQUIRED" : "LIKELY REQUIRED"}`);
    } else if (a.verdict === "check-boundary") {
      // Mirrors the selective branch above. Omitting it dropped a positive
      // additional-licensing verdict out of the email entirely.
      verdictLines.push("Additional (HMO) licence: CHECK BOUNDARY (street-level designation)");
    } else if (a.verdict === "upcoming") {
      verdictLines.push(`Additional licensing scheme starting ${a.scheme.start ?? "soon"}`);
    }
  }
  if (verdictLines.length === 0) {
    verdictLines.push("No licence requirement identified on the details provided");
  }

  // Nation-aware, because this hardcoded England's £40,000 and 24 months and was
  // sent to Welsh buyers alongside a report that (now) says £150-£250 and 12.
  // Recomputed from the stored nation rather than read from the snapshot, so
  // reports sold before nation-aware penalties existed are corrected too.
  // Deliberately NOT `pen.rroMonths || 24`: a nation with no rent repayment
  // order regime has rroMonths 0, and `||` turned that straight back into a
  // 24-month claim, which is the England figure this exists to stop repeating.
  const pen = penaltiesFor(d.council.nation);
  const rroClause = pen.rroMonths > 0 ? ` and rent repayment orders up to ${pen.rroMonths} months' rent` : "";
  // The label is a sentinel ("n/a", "varies") where the nation has no civil
  // penalty regime, so it has to be gated like rroMonths rather than dropped
  // into "civil penalties up to n/a".
  const hasCivil = pen.civilPenaltyLabel !== "n/a" && pen.civilPenaltyLabel !== "varies";
  const civilClause = hasCivil
    ? d.council.nation === "wales"
      ? `fixed penalties of ${pen.civilPenaltyLabel}, an unlimited fine on conviction`
      : `civil penalties up to ${pen.civilPenaltyLabel}`
    : `a fine of ${pen.criminalFine} on conviction`;
  const penaltyPhrase = `${civilClause}${rroClause}`;

  // Absent audience means landlord, which is what every report sold before the
  // tenant product existed is.
  const isTenant = report.audience === "tenant";
  const rro = report.rro;

  /**
   * The body paragraph, per audience.
   *
   * The tenant version carries the award range rather than the cap, and names
   * the deadline, because an email is the thing they will still have in three
   * months when the deadline is what matters. Quoting the 24-month maximum here
   * would be the same overstatement the report itself refuses to make.
   */
  const bodyParagraph = isTenant
    ? rro && !rro.incomplete
      ? `Your report works the claim through the Acheampong v Roman method: ${gbp(rro.rentAfterUtilities)} of rent after utilities over ${rro.claimableMonths} claimable ${rro.claimableMonths === 1 ? "month" : "months"}, which on the percentages tribunals commonly apply to a licensing breach is a range of ${gbp(rro.low)} to ${gbp(rro.high)}. Tribunals rarely award the full amount, and all of it assumes the offence can be proved beyond reasonable doubt. You have ${RRO_FACTS.applicationWindowMonths} months from the offence to apply on Form ${RRO_FACTS.applicationForm}.`
      : `Your report sets out the designation, its dates and the council's own source, plus the two statutory defences and the Form ${RRO_FACTS.applicationForm} route. You have ${RRO_FACTS.applicationWindowMonths} months from the offence to apply.`
    : `Your full report includes the scheme details, dates, fees, penalty exposure (${penaltyPhrase}), and a step-by-step action plan.`;

  const html = `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;color:#1e293b">
    <div style="background:#0f172a;padding:24px;border-radius:8px 8px 0 0">
      <h1 style="color:#fff;font-size:20px;margin:0">PRS<span style="color:#3b82f6">Check</span> ${
        isTenant ? "Rent Repayment Order Evidence" : "Licence Check"
      }</h1>
    </div>
    <div style="border:1px solid #e2e8f0;border-top:none;padding:24px;border-radius:0 0 8px 8px">
      <p style="font-size:15px">${
        isTenant ? "Your licensing evidence report for:" : "Your landlord licence check for:"
      }</p>
      <p style="font-size:16px;font-weight:bold">${escapeHtml(report.address || report.postcode)}, ${escapeHtml(report.postcode)}<br/>
      <span style="font-weight:normal;color:#64748b">${escapeHtml(d.council.name)}${report.ward ? `, ${escapeHtml(report.ward)} ward` : ""}</span></p>
      <div style="background:#f1f5f9;border-radius:8px;padding:16px;margin:16px 0">
        ${verdictLines.map((v) => `<p style="margin:4px 0;font-weight:600">${escapeHtml(v)}</p>`).join("")}
      </div>
      <p style="font-size:14px;color:#475569">${escapeHtml(bodyParagraph)}</p>
      <p style="text-align:center;margin:24px 0">
        <a href="${url}" style="background:#2563eb;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:15px">View your full report</a>
      </p>
      <p style="font-size:12px;color:#94a3b8">This link is permanent, save it for your records. This report is an information service based on published council designations (source links included in the report); it is not legal advice${
        isTenant ? ", and nothing in it predicts what a tribunal will decide" : ""
      }. Always confirm exact designation boundaries with the council before relying on them.</p>
    </div>
  </div>`;

  const resend = getResend();
  const { error } = await resend.emails.send({
    from: FROM,
    to,
    replyTo: REPLY_TO,
    subject: isTenant
      ? `Your rent repayment evidence: ${report.address || report.postcode} (${d.council.name})`
      : `Your licence check: ${report.address || report.postcode} (${d.council.name})`,
    html,
  });
  if (error) throw new Error(`resend_failed: ${error.message}`);
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
