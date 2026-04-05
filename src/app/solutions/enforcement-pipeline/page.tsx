import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import RegisterInterestCTA from "@/components/RegisterInterestCTA";

export const metadata: Metadata = {
  title: "Enforcement Case Management | PRSCheck",
  description:
    "From complaint to resolution in one dashboard. PRSCheck provides Kanban-style enforcement pipelines, case tracking, document management, and MHCLG reporting for local authority housing teams.",
  alternates: { canonical: "https://prscheck.co.uk/solutions/enforcement-pipeline" },
  openGraph: {
    title: "Enforcement Case Management | PRSCheck",
    description: "Kanban-style enforcement pipeline with case tracking, document management, and automated MHCLG reporting.",
    url: "https://prscheck.co.uk/solutions/enforcement-pipeline",
    siteName: "PRSCheck",
    type: "website",
  },
};

const pipelineStages = [
  {
    stage: "Investigation",
    colour: "bg-accent-500",
    items: [
      "Complaint or data-driven referral received",
      "Property compliance data auto-populated",
      "Officer assigned and notified",
      "Site inspection scheduled",
      "Evidence collection and documentation",
    ],
  },
  {
    stage: "Notice Issued",
    colour: "bg-warning",
    items: [
      "Improvement notice or civil penalty notice drafted",
      "Manager review and approval workflow",
      "Notice served with recorded delivery tracking",
      "Compliance deadline set with automated reminders",
      "Landlord response window monitored",
    ],
  },
  {
    stage: "Appeal / Response",
    colour: "bg-danger",
    items: [
      "Landlord representations received and logged",
      "First-Tier Tribunal appeal tracking",
      "Evidence bundle preparation",
      "Hearing date and outcome recording",
      "Penalty adjustment if appeal succeeds",
    ],
  },
  {
    stage: "Resolved",
    colour: "bg-success",
    items: [
      "Compliance confirmed or penalty paid",
      "Outcome recorded for MHCLG reporting",
      "Property compliance score updated",
      "Case archived with full audit trail",
      "Follow-up inspection scheduled if needed",
    ],
  },
];

const features = [
  {
    title: "Case tracking",
    description: "Every enforcement case has a unique reference, timeline, assigned officer, and current status. Filter and search across all active cases instantly.",
  },
  {
    title: "Document management",
    description: "Upload and attach evidence photos, inspection reports, correspondence, and legal documents to each case. Version-controlled with full audit trail.",
  },
  {
    title: "Timeline and audit trail",
    description: "Every action on a case is timestamped and attributed. The full history is exportable for tribunal preparation or MHCLG returns.",
  },
  {
    title: "Outcome recording",
    description: "Record the outcome of every case: compliance achieved, penalty paid, prosecution completed, or case closed with reasons. Feeds into borough-wide analytics.",
  },
  {
    title: "MHCLG reporting integration",
    description: "Enforcement activity data is structured to meet MHCLG reporting requirements. Generate returns with a single click instead of weeks of spreadsheet collation.",
  },
  {
    title: "Team collaboration",
    description: "Assign cases to officers, set deadlines, leave internal notes, and escalate to managers. Workload balancing ensures no officer is overwhelmed while others are idle.",
  },
];

export default function EnforcementPipelinePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://prscheck.co.uk" },
      { "@type": "ListItem", position: 2, name: "Solutions", item: "https://prscheck.co.uk/solutions" },
      { "@type": "ListItem", position: 3, name: "Enforcement Pipeline", item: "https://prscheck.co.uk/solutions/enforcement-pipeline" },
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
                From Complaint to Resolution in One Dashboard
              </h1>
              <p className="mt-6 text-lg leading-8 text-navy-300">
                Housing enforcement cases involve multiple stages, officers, and documents over weeks or months. PRSCheck replaces spreadsheets and email chains with a structured pipeline that keeps every case on track.
              </p>
            </div>
          </div>
        </section>

        {/* Pipeline Stages */}
        <section className="bg-navy-900 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-white text-center">Enforcement pipeline</h2>
            <p className="mt-4 text-center text-navy-300 mx-auto max-w-2xl">
              Cases move through four stages. At each stage, PRSCheck tracks required actions, deadlines, and responsible officers.
            </p>
            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {pipelineStages.map((stage) => (
                <div key={stage.stage} className="rounded-2xl border border-navy-800 bg-navy-950 p-6">
                  <div className="flex items-center gap-3">
                    <div className={`h-3 w-3 rounded-full ${stage.colour}`} />
                    <h3 className="text-lg font-semibold text-navy-100">{stage.stage}</h3>
                  </div>
                  <ul className="mt-4 space-y-2.5">
                    {stage.items.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-navy-400">
                        <svg className="mt-0.5 h-4 w-4 shrink-0 text-navy-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <RegisterInterestCTA />
        </div>

        {/* Features */}
        <section className="bg-navy-950 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl">
              <h2 className="text-3xl font-bold text-white">Built for housing teams</h2>
              <div className="mt-8 space-y-6">
                {features.map((feature) => (
                  <div key={feature.title} className="rounded-xl border border-navy-800 bg-navy-900 p-6">
                    <h3 className="text-lg font-semibold text-navy-100">{feature.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-navy-400">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* MHCLG Reporting */}
        <section className="bg-navy-900 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl">
              <h2 className="text-3xl font-bold text-white">MHCLG reporting integration</h2>
              <p className="mt-4 text-navy-300">
                The Renters&apos; Rights Act 2024 gives MHCLG new powers to collect enforcement data from local authorities. PRSCheck structures your case data in the format MHCLG requires, so generating returns takes minutes instead of weeks.
              </p>
              <div className="mt-8 grid gap-6 sm:grid-cols-2">
                <div className="rounded-xl border border-navy-800 bg-navy-950 p-6">
                  <p className="text-2xl font-bold text-accent-400">1 click</p>
                  <p className="mt-2 text-sm text-navy-400">Generate quarterly MHCLG enforcement returns</p>
                </div>
                <div className="rounded-xl border border-navy-800 bg-navy-950 p-6">
                  <p className="text-2xl font-bold text-accent-400">100%</p>
                  <p className="mt-2 text-sm text-navy-400">Audit trail coverage for every case action</p>
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
              <Link href="/solutions/tenant-complaints" className="hover:text-accent-400 transition-colors">Tenant Complaints</Link>
              <span className="text-navy-700">|</span>
              <Link href="/solutions/civil-penalties" className="hover:text-accent-400 transition-colors">Civil Penalties</Link>
              <span className="text-navy-700">|</span>
              <Link href="/solutions/reporting" className="hover:text-accent-400 transition-colors">Reporting</Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
