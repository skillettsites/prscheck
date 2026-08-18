import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase-admin";
import { applyReportTokenFilter, isValidReportToken, type LicenceReportData } from "@/lib/report";
import LicenceReport from "@/components/LicenceReport";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your PRSCheck Report",
  robots: { index: false, follow: false },
};

async function getReport(token: string): Promise<LicenceReportData | null> {
  // Reject anything that is not the exact 12-character alphanumeric shape we
  // issue. The lookup is exact suffix equality on stripe_session_id, not LIKE.
  if (!isValidReportToken(token)) return null;
  try {
    const admin = createAdminClient();
    const { data, error } = await applyReportTokenFilter(
      admin.from("reports").select("data, status, stripe_session_id"),
      token,
    )
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error || !data?.data) return null;
    if (data.status !== "ready") return null;
    return data.data as unknown as LicenceReportData;
  } catch {
    return null;
  }
}

export default async function ReportPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const report = await getReport(token);
  if (!report) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <LicenceReport report={report} />
      {/* The next step differs entirely by audience. A landlord has other
          properties to check; a tenant has one property and a claim to file,
          and pointing them at "check another property" wasted the moment. */}
      {report.audience === "tenant" ? (
        <div className="mx-auto mt-8 max-w-3xl rounded-2xl border border-accent-500/30 bg-accent-600/10 p-6 text-center">
          <p className="text-sm text-navy-300">
            Next: read the step-by-step guide to applying, including what the tribunal expects to see.
          </p>
          <Link
            href="/tenants/rent-repayment-order"
            className="mt-3 inline-block rounded-lg bg-accent-600 px-6 py-3 font-semibold text-white transition-all hover:bg-accent-500"
          >
            How to claim your rent back
          </Link>
        </div>
      ) : (
        <div className="mx-auto mt-8 max-w-3xl rounded-2xl border border-accent-500/30 bg-accent-600/10 p-6 text-center">
          <p className="text-sm text-navy-300">Own another rental property?</p>
          <Link
            href="/check"
            className="mt-3 inline-block rounded-lg bg-accent-600 px-6 py-3 font-semibold text-white transition-all hover:bg-accent-500"
          >
            Check another property
          </Link>
        </div>
      )}
    </div>
  );
}
