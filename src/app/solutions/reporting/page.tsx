import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import RegisterInterestCTA from "@/components/RegisterInterestCTA";

export const metadata: Metadata = {
  title: "Enforcement Reporting and Analytics",
  description:
    "Real-time enforcement metrics, automated MHCLG returns, KPI dashboards, and trend analysis for local authority housing teams. Compliance rates by ward, pipeline status, and response times.",
  alternates: { canonical: "https://prscheck.co.uk/solutions/reporting" },
  openGraph: {
    title: "Enforcement Reporting and Analytics | PRSCheck",
    description: "Real-time dashboards, automated MHCLG returns, and KPI tracking for housing enforcement teams.",
    url: "https://prscheck.co.uk/solutions/reporting",
    siteName: "PRSCheck",
    type: "website",
  },
};

const dashboardMetrics = [
  { metric: "Compliance rate by ward", description: "Percentage of PRS properties meeting all compliance checks, broken down by ward and updated daily." },
  { metric: "Enforcement pipeline status", description: "Active cases by stage (investigation, notice issued, appeal, resolved) with average time in each stage." },
  { metric: "Response times", description: "Average time from complaint received to first action, from investigation to notice, and from notice to resolution." },
  { metric: "Penalty revenue", description: "Total civil penalties issued, paid, outstanding, and under appeal. Month-over-month and year-over-year trends." },
  { metric: "HMO detection rate", description: "Suspected HMOs identified, confirmed on inspection, and resulting enforcement actions." },
  { metric: "Licensing compliance", description: "Licensed vs unlicensed properties in designated areas. Application processing times and renewal rates." },
  { metric: "Tenant complaint volume", description: "Incoming complaints by category, severity, and ward. Resolution rates and average case duration." },
  { metric: "Officer workload", description: "Cases per officer, completion rates, and time allocation across investigation, notice processing, and case management." },
];

const mhclgReturns = [
  "Number of properties inspected",
  "Number of improvement notices served",
  "Number of civil penalties issued and total value",
  "Number of prosecutions commenced and outcomes",
  "Number of banning orders applied for and granted",
  "Number of Rent Repayment Orders applied for and granted",
  "Licensing scheme statistics (applications, grants, refusals, revocations)",
  "PRS Database registration compliance rates",
];

export default function ReportingPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://prscheck.co.uk" },
      { "@type": "ListItem", position: 2, name: "Solutions", item: "https://prscheck.co.uk/solutions" },
      { "@type": "ListItem", position: 3, name: "Reporting", item: "https://prscheck.co.uk/solutions/reporting" },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Header />
      <main className="min-h-screen">
        {/* Hero */}
        <section className="relative overflow-hidden bg-navy-950 pt-32 pb-20">
          <div className="absolute inset-0 grid-pattern opacity-40" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <Link href="/solutions" className="inline-flex items-center text-sm font-medium text-accent-400 hover:text-accent-300">
                <svg className="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
                All Solutions
              </Link>
              <h1 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl">
                Real-Time Metrics for MHCLG Returns
              </h1>
              <p className="mt-6 text-lg leading-8 text-navy-300">
                The Renters&apos; Rights Act 2024 requires local authorities to report enforcement activity to MHCLG. PRSCheck generates these returns automatically from your day-to-day case data, while giving your team real-time dashboards for operational decision-making.
              </p>
            </div>
          </div>
        </section>

        {/* Dashboard Metrics */}
        <section className="bg-navy-900 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl">
              <h2 className="text-3xl font-bold text-white">Dashboard metrics</h2>
              <p className="mt-4 text-navy-300">
                Your PRSCheck dashboard shows real-time enforcement data across your entire borough. All metrics are filterable by ward, time period, officer, and offence type.
              </p>
              <div className="mt-8 space-y-4">
                {dashboardMetrics.map((item) => (
                  <div key={item.metric} className="rounded-xl border border-navy-800 bg-navy-950 p-5">
                    <p className="font-semibold text-navy-100">{item.metric}</p>
                    <p className="mt-1 text-sm text-navy-400">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <RegisterInterestCTA />
        </div>

        {/* MHCLG Returns */}
        <section className="bg-navy-950 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl">
              <h2 className="text-3xl font-bold text-white">Automated MHCLG returns</h2>
              <p className="mt-4 text-navy-300">
                MHCLG requires councils to report on their enforcement activity. PRSCheck structures your case data to meet these requirements, so generating returns takes a single click. The following data points are captured automatically from your enforcement workflow:
              </p>
              <ul className="mt-8 space-y-3">
                {mhclgReturns.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <svg className="mt-0.5 h-5 w-5 shrink-0 text-accent-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    <span className="text-navy-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* KPI Tracking */}
        <section className="bg-navy-900 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl">
              <h2 className="text-3xl font-bold text-white">KPI tracking and trend analysis</h2>
              <p className="mt-4 text-navy-300">
                Beyond statutory reporting, PRSCheck helps your team track operational performance with customisable KPIs. Set targets, monitor trends, and identify areas that need attention.
              </p>
              <div className="mt-8 grid gap-6 sm:grid-cols-2">
                <div className="rounded-xl border border-navy-800 bg-navy-950 p-6">
                  <h3 className="font-semibold text-navy-100">Target setting</h3>
                  <p className="mt-2 text-sm text-navy-400">
                    Set quarterly and annual targets for inspections, notices, penalty income, and resolution times. Track progress against targets in real time.
                  </p>
                </div>
                <div className="rounded-xl border border-navy-800 bg-navy-950 p-6">
                  <h3 className="font-semibold text-navy-100">Trend analysis</h3>
                  <p className="mt-2 text-sm text-navy-400">
                    Spot trends in complaint volumes, compliance rates, and enforcement outcomes over time. Identify wards with deteriorating conditions before they become critical.
                  </p>
                </div>
                <div className="rounded-xl border border-navy-800 bg-navy-950 p-6">
                  <h3 className="font-semibold text-navy-100">Exportable reports</h3>
                  <p className="mt-2 text-sm text-navy-400">
                    Generate PDF and CSV reports for committee papers, cabinet briefings, and public scrutiny. All data is exportable in formats your council already uses.
                  </p>
                </div>
                <div className="rounded-xl border border-navy-800 bg-navy-950 p-6">
                  <h3 className="font-semibold text-navy-100">Benchmarking</h3>
                  <p className="mt-2 text-sm text-navy-400">
                    Compare your enforcement activity and outcomes against similar councils (where they also use PRSCheck). Understand whether your team is under-performing or leading the way.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-navy-950 py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <RegisterInterestCTA variant="banner" />
            <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm text-navy-400">
              <Link href="/solutions/enforcement-pipeline" className="hover:text-accent-400 transition-colors">Enforcement Pipeline</Link>
              <span className="text-navy-700">|</span>
              <Link href="/solutions/civil-penalties" className="hover:text-accent-400 transition-colors">Civil Penalties</Link>
              <span className="text-navy-700">|</span>
              <Link href="/solutions/compliance-screening" className="hover:text-accent-400 transition-colors">Compliance Screening</Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
