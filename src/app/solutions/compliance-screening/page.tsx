import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import RegisterInterestCTA from "@/components/RegisterInterestCTA";

export const metadata: Metadata = {
  title: "Automated Compliance Screening | PRSCheck",
  description:
    "Check every property in your borough against 15 data sources. PRSCheck generates compliance scores, risk flags, and enforcement priority lists for local authority housing teams.",
  alternates: { canonical: "https://prscheck.co.uk/solutions/compliance-screening" },
  openGraph: {
    title: "Automated Compliance Screening | PRSCheck",
    description:
      "Screen every PRS property against 15 data sources. Compliance scores, risk flags, and enforcement priorities.",
    url: "https://prscheck.co.uk/solutions/compliance-screening",
    siteName: "PRSCheck",
    type: "website",
  },
};

const complianceChecks = [
  { check: "Energy Performance Certificate (EPC)", requirement: "Minimum E rating (C by 2030)", source: "MHCLG EPC Register" },
  { check: "Gas safety certificate", requirement: "Annual inspection by Gas Safe engineer", source: "Gas Safe Register" },
  { check: "Electrical safety (EICR)", requirement: "5-yearly inspection, satisfactory report", source: "Landlord declaration / NICEIC" },
  { check: "HMO licence", requirement: "Mandatory for 5+ occupants, 2+ households", source: "Council licensing database" },
  { check: "Selective licence", requirement: "Where scheme is in force", source: "Council licensing database" },
  { check: "Deposit protection", requirement: "Protected within 30 days, prescribed info served", source: "TDS / DPS / MyDeposits" },
  { check: "Fire safety", requirement: "Smoke alarms every floor, CO alarm where solid fuel", source: "Inspection records" },
  { check: "Right to Rent", requirement: "Immigration status check before tenancy", source: "Home Office" },
  { check: "How to Rent guide", requirement: "Latest version served before tenancy", source: "MHCLG" },
  { check: "HHSRS hazards", requirement: "No Category 1 hazards", source: "Inspection records" },
  { check: "Planning permission", requirement: "Lawful use for residential letting", source: "Planning portal" },
  { check: "Building regulations", requirement: "Compliance for any conversion work", source: "Building control records" },
  { check: "Council tax registration", requirement: "Correct banding and occupancy status", source: "VOA / council tax records" },
  { check: "Land Registry title", requirement: "Ownership verification", source: "HM Land Registry" },
  { check: "PRS Database registration", requirement: "Registered before letting (from late 2026)", source: "MHCLG PRS Database" },
];

export default function ComplianceScreeningPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://prscheck.co.uk" },
      { "@type": "ListItem", position: 2, name: "Solutions", item: "https://prscheck.co.uk/solutions" },
      { "@type": "ListItem", position: 3, name: "Compliance Screening", item: "https://prscheck.co.uk/solutions/compliance-screening" },
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
                Check Every Property in Your Borough Against 15 Data Sources
              </h1>
              <p className="mt-6 text-lg leading-8 text-navy-300">
                Most councils have no way to systematically screen PRS
                properties for compliance. PRSCheck automates the process,
                checking every known rental property and producing actionable
                risk scores.
              </p>
            </div>
          </div>
        </section>

        {/* What Gets Checked */}
        <section className="bg-navy-900 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl">
              <h2 className="text-3xl font-bold text-white">What gets checked</h2>
              <p className="mt-4 text-navy-300">
                Each property is screened against 15 compliance requirements drawn from the Housing Act 2004,
                the Renters&apos; Rights Act 2024, the Energy Efficiency (Private Rented Property) Regulations 2015,
                and the Electrical Safety Standards in the Private Rented Sector (England) Regulations 2020.
              </p>
              <div className="mt-8 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-navy-700">
                      <th className="pb-3 text-left font-semibold text-navy-200">Check</th>
                      <th className="pb-3 text-left font-semibold text-navy-200">Requirement</th>
                      <th className="pb-3 text-left font-semibold text-navy-200">Data source</th>
                    </tr>
                  </thead>
                  <tbody>
                    {complianceChecks.map((item, i) => (
                      <tr key={item.check} className={i < complianceChecks.length - 1 ? "border-b border-navy-800/50" : ""}>
                        <td className="py-3 pr-4 font-medium text-navy-100">{item.check}</td>
                        <td className="py-3 pr-4 text-navy-400">{item.requirement}</td>
                        <td className="py-3 text-navy-500">{item.source}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <RegisterInterestCTA />
        </div>

        {/* How Bulk Screening Works */}
        <section className="bg-navy-950 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl">
              <h2 className="text-3xl font-bold text-white">How bulk screening works</h2>
              <div className="mt-8 space-y-8">
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-600/20 text-accent-400 font-bold">1</div>
                  <div>
                    <h3 className="text-lg font-semibold text-navy-100">Upload or connect your data</h3>
                    <p className="mt-2 text-navy-400">
                      Provide your council tax extract, licensing database, and any local inspection records.
                      PRSCheck securely ingests and normalises the data against its existing property intelligence.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-600/20 text-accent-400 font-bold">2</div>
                  <div>
                    <h3 className="text-lg font-semibold text-navy-100">Automated cross-referencing</h3>
                    <p className="mt-2 text-navy-400">
                      Every property identified as likely PRS is checked against all 15 data sources.
                      Checks run in parallel, with results typically available within 24 hours for an entire borough.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-600/20 text-accent-400 font-bold">3</div>
                  <div>
                    <h3 className="text-lg font-semibold text-navy-100">Review and act</h3>
                    <p className="mt-2 text-navy-400">
                      Results appear in your PRSCheck dashboard as compliance scores, risk flags, and prioritised
                      enforcement lists. Filter by ward, risk level, offence type, or potential penalty value.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Results */}
        <section className="bg-navy-900 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl">
              <h2 className="text-3xl font-bold text-white">What you get</h2>
              <div className="mt-8 grid gap-6 sm:grid-cols-3">
                <div className="rounded-xl border border-navy-800 bg-navy-950 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
                    <svg className="h-6 w-6 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="mt-4 font-semibold text-navy-100">Compliance scores</h3>
                  <p className="mt-2 text-sm text-navy-400">
                    Every property receives a score from 0 to 100 based on how many compliance checks it passes. Scores update automatically as new data becomes available.
                  </p>
                </div>
                <div className="rounded-xl border border-navy-800 bg-navy-950 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10">
                    <svg className="h-6 w-6 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                  </div>
                  <h3 className="mt-4 font-semibold text-navy-100">Risk flags</h3>
                  <p className="mt-2 text-sm text-navy-400">
                    High-severity issues (Category 1 hazards, missing gas safety, expired EPC below minimum) are flagged for immediate attention with clear action guidance.
                  </p>
                </div>
                <div className="rounded-xl border border-navy-800 bg-navy-950 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-danger/10">
                    <svg className="h-6 w-6 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                    </svg>
                  </div>
                  <h3 className="mt-4 font-semibold text-navy-100">Priority lists</h3>
                  <p className="mt-2 text-sm text-navy-400">
                    Properties are ranked by enforcement priority, factoring in severity, number of failures, penalty potential, and tenant risk. Work through them in order for maximum impact.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Data Sources */}
        <section className="bg-navy-950 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl">
              <h2 className="text-3xl font-bold text-white">Data sources</h2>
              <p className="mt-4 text-navy-300">
                PRSCheck draws on publicly available government data, council-provided records, and commercial datasets to build a complete compliance picture.
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {[
                  "MHCLG EPC Register",
                  "HM Land Registry",
                  "Gas Safe Register",
                  "Deposit protection schemes",
                  "Council tax records",
                  "Electoral roll data",
                  "Planning portal",
                  "Building control records",
                  "Fire service referrals",
                  "MHCLG PRS Database (2026)",
                  "Council licensing databases",
                  "VOA valuation data",
                ].map((source) => (
                  <div key={source} className="flex items-center gap-3 rounded-lg border border-navy-800 bg-navy-900 px-4 py-3">
                    <svg className="h-5 w-5 shrink-0 text-accent-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    <span className="text-sm text-navy-200">{source}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-navy-900 py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <RegisterInterestCTA variant="banner" />
            <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm text-navy-400">
              <Link href="/solutions/hmo-detection" className="hover:text-accent-400 transition-colors">HMO Detection</Link>
              <span className="text-navy-700">|</span>
              <Link href="/solutions/enforcement-pipeline" className="hover:text-accent-400 transition-colors">Enforcement Pipeline</Link>
              <span className="text-navy-700">|</span>
              <Link href="/solutions/civil-penalties" className="hover:text-accent-400 transition-colors">Civil Penalties</Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
