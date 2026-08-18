import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import RegisterInterestCTA from "@/components/RegisterInterestCTA";

export const metadata: Metadata = {
  title: "Tenant Complaint Triage",
  description:
    "Replace freeform emails with structured tenant complaints. PRSCheck receives reports through RenterCheck with property data, compliance status, and evidence for automatic triage.",
  alternates: { canonical: "https://prscheck.co.uk/solutions/tenant-complaints" },
  openGraph: {
    title: "Tenant Complaint Triage | PRSCheck",
    description: "Structured tenant reports with auto-triage based on severity, hazard type, and property risk score.",
    url: "https://prscheck.co.uk/solutions/tenant-complaints",
    siteName: "PRSCheck",
    type: "website",
  },
};

const reportData = [
  { field: "Property address", detail: "Verified against Land Registry and council tax records" },
  { field: "Landlord identity", detail: "Matched against PRS Database (when live) or licensing records" },
  { field: "Tenancy details", detail: "Start date, rent amount, deposit protection status" },
  { field: "Compliance status", detail: "EPC rating, gas safety, EICR status auto-populated" },
  { field: "Issue category", detail: "Standardised categories: damp, heating, electrical, structural, pest, fire safety" },
  { field: "Severity assessment", detail: "Tenant-reported severity with photo and video evidence" },
  { field: "Communication log", detail: "Record of attempts to contact landlord, with dates and outcomes" },
  { field: "HHSRS indicators", detail: "Responses mapped to Housing Health and Safety Rating System hazard categories" },
];

const priorityLevels = [
  {
    level: "Critical",
    colour: "bg-danger",
    textColour: "text-danger",
    criteria: "Imminent risk to health or safety. Category 1 HHSRS hazard indicators: no heating in winter, exposed wiring, structural collapse risk, carbon monoxide risk.",
    response: "Same-day assignment. Inspection within 24 hours.",
  },
  {
    level: "High",
    colour: "bg-warning",
    textColour: "text-warning",
    criteria: "Significant disrepair affecting habitability. Persistent damp and mould, broken windows, pest infestation, no hot water for over 48 hours.",
    response: "Assignment within 24 hours. Inspection within 5 working days.",
  },
  {
    level: "Medium",
    colour: "bg-accent-500",
    textColour: "text-accent-400",
    criteria: "Compliance failures without immediate danger. Expired EPC, missing gas safety certificate, deposit not protected.",
    response: "Assignment within 3 working days. Investigation within 15 working days.",
  },
  {
    level: "Low",
    colour: "bg-navy-500",
    textColour: "text-navy-400",
    criteria: "Minor issues or landlord-tenant disputes. Cosmetic disrepair, noise, communication breakdowns.",
    response: "Logged and reviewed weekly. Signposted to mediation where appropriate.",
  },
];

export default function TenantComplaintsPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://prscheck.co.uk" },
      { "@type": "ListItem", position: 2, name: "Solutions", item: "https://prscheck.co.uk/solutions" },
      { "@type": "ListItem", position: 3, name: "Tenant Complaints", item: "https://prscheck.co.uk/solutions/tenant-complaints" },
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
                Structured Tenant Reports, Not Freeform Emails
              </h1>
              <p className="mt-6 text-lg leading-8 text-navy-300">
                When tenants email or phone with complaints, your team spends hours gathering basic information. PRSCheck receives structured reports through the free RenterCheck consumer tool, complete with property data and compliance status.
              </p>
            </div>
          </div>
        </section>

        {/* How tenants submit */}
        <section className="bg-navy-900 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl">
              <h2 className="text-3xl font-bold text-white">How tenants submit reports</h2>
              <p className="mt-4 text-navy-300">
                Tenants use RenterCheck, a free consumer tool, to check their rental property and report issues to their local council. The tool guides them through a structured process that captures exactly the information your enforcement team needs.
              </p>
              <div className="mt-8 space-y-6">
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-600/20 text-accent-400 font-bold">1</div>
                  <div>
                    <h3 className="text-lg font-semibold text-navy-100">Tenant enters their address</h3>
                    <p className="mt-2 text-navy-400">RenterCheck verifies the property against Land Registry data and auto-populates known compliance information (EPC, gas safety, licensing status).</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-600/20 text-accent-400 font-bold">2</div>
                  <div>
                    <h3 className="text-lg font-semibold text-navy-100">Tenant describes the issue</h3>
                    <p className="mt-2 text-navy-400">Guided questions categorise the issue (damp, heating, electrical, structural, pest, fire safety) and assess severity. Tenants upload photos and video evidence.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-600/20 text-accent-400 font-bold">3</div>
                  <div>
                    <h3 className="text-lg font-semibold text-navy-100">Report arrives in PRSCheck</h3>
                    <p className="mt-2 text-navy-400">The structured report appears in your PRSCheck dashboard, automatically triaged by severity and linked to any existing cases or compliance data for that property.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <RegisterInterestCTA />
        </div>

        {/* What arrives */}
        <section className="bg-navy-950 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl">
              <h2 className="text-3xl font-bold text-white">What arrives in your dashboard</h2>
              <p className="mt-4 text-navy-300">
                Every report contains structured data fields, not unstructured text. This means your officers can start investigating immediately, without phone calls to gather basic information.
              </p>
              <div className="mt-8 space-y-4">
                {reportData.map((item) => (
                  <div key={item.field} className="rounded-xl border border-navy-800 bg-navy-900 p-5">
                    <p className="font-semibold text-navy-100">{item.field}</p>
                    <p className="mt-1 text-sm text-navy-400">{item.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Auto-Priority Triage */}
        <section className="bg-navy-900 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl">
              <h2 className="text-3xl font-bold text-white">Automatic triage</h2>
              <p className="mt-4 text-navy-300">
                Every incoming complaint is automatically assigned a priority level based on the reported issue type, severity indicators, HHSRS hazard mapping, and the property&apos;s existing risk score in PRSCheck.
              </p>
              <div className="mt-8 space-y-6">
                {priorityLevels.map((level) => (
                  <div key={level.level} className="rounded-xl border border-navy-800 bg-navy-950 p-6">
                    <div className="flex items-center gap-3">
                      <div className={`h-3 w-3 rounded-full ${level.colour}`} />
                      <h3 className={`text-lg font-semibold ${level.textColour}`}>{level.level}</h3>
                    </div>
                    <p className="mt-3 text-sm text-navy-400">{level.criteria}</p>
                    <p className="mt-2 text-sm font-medium text-navy-300">{level.response}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Integration */}
        <section className="bg-navy-950 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl">
              <h2 className="text-3xl font-bold text-white">Integration with enforcement pipeline</h2>
              <p className="mt-4 text-navy-300">
                When a complaint warrants enforcement action, it converts directly into a case in the{" "}
                <Link href="/solutions/enforcement-pipeline" className="text-accent-400 hover:text-accent-300">enforcement pipeline</Link>.
                All the structured data from the original report carries over, so officers never re-enter information. The tenant receives updates as the case progresses.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-navy-900 py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <RegisterInterestCTA variant="banner" />
            <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm text-navy-400">
              <Link href="/solutions/enforcement-pipeline" className="hover:text-accent-400 transition-colors">Enforcement Pipeline</Link>
              <span className="text-navy-700">|</span>
              <Link href="/solutions/compliance-screening" className="hover:text-accent-400 transition-colors">Compliance Screening</Link>
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
