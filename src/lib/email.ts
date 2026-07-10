import { Resend } from "resend";
import type { LicenceReportData } from "@/lib/report";

function getResend(): Resend {
  const key = (process.env.RESEND_API_KEY ?? "").replace(/\\n$/, "").trim();
  if (!key) throw new Error("RESEND_API_KEY not configured");
  return new Resend(key);
}

const FROM = process.env.EMAIL_FROM ?? "PRSCheck <reports@prscheck.co.uk>";

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
    } else if (a.verdict === "upcoming") {
      verdictLines.push(`Additional licensing scheme starting ${a.scheme.start ?? "soon"}`);
    }
  }
  if (verdictLines.length === 0) {
    verdictLines.push("No licence requirement identified on the details provided");
  }

  const html = `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;color:#1e293b">
    <div style="background:#0f172a;padding:24px;border-radius:8px 8px 0 0">
      <h1 style="color:#fff;font-size:20px;margin:0">PRS<span style="color:#3b82f6">Check</span> Licence Check</h1>
    </div>
    <div style="border:1px solid #e2e8f0;border-top:none;padding:24px;border-radius:0 0 8px 8px">
      <p style="font-size:15px">Your landlord licence check for:</p>
      <p style="font-size:16px;font-weight:bold">${escapeHtml(report.address || report.postcode)}, ${escapeHtml(report.postcode)}<br/>
      <span style="font-weight:normal;color:#64748b">${escapeHtml(d.council.name)}${report.ward ? `, ${escapeHtml(report.ward)} ward` : ""}</span></p>
      <div style="background:#f1f5f9;border-radius:8px;padding:16px;margin:16px 0">
        ${verdictLines.map((v) => `<p style="margin:4px 0;font-weight:600">${escapeHtml(v)}</p>`).join("")}
      </div>
      <p style="font-size:14px;color:#475569">Your full report includes the scheme details, dates, fees, penalty exposure (civil penalties up to £40,000 and rent repayment orders up to 24 months' rent), and a step-by-step action plan.</p>
      <p style="text-align:center;margin:24px 0">
        <a href="${url}" style="background:#2563eb;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:15px">View your full report</a>
      </p>
      <p style="font-size:12px;color:#94a3b8">This link is permanent, save it for your records. This report is an information service based on published council designations (source links included in the report); it is not legal advice. Always confirm exact designation boundaries with the council before relying on them.</p>
    </div>
  </div>`;

  const resend = getResend();
  const { error } = await resend.emails.send({
    from: FROM,
    to,
    subject: `Your licence check: ${report.address || report.postcode} (${d.council.name})`,
    html,
  });
  if (error) throw new Error(`resend_failed: ${error.message}`);
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
