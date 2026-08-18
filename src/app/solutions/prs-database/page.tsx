import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import RegisterInterestCTA from "@/components/RegisterInterestCTA";

export const metadata: Metadata = {
  title: "PRS Database Integration Platform",
  description:
    "Be PRS Database ready from day one. PRSCheck integrates with the national PRS Database launching late 2026, helping councils auto-sync landlords, cross-reference compliance, and flag unregistered properties.",
  alternates: { canonical: "https://prscheck.co.uk/solutions/prs-database" },
  openGraph: {
    title: "PRS Database Integration Platform | PRSCheck",
    description:
      "Prepare your council for the national PRS Database. Auto-sync registered landlords and flag unregistered properties.",
    url: "https://prscheck.co.uk/solutions/prs-database",
    siteName: "PRSCheck",
    type: "website",
  },
};

const timelineSteps = [
  {
    date: "Now",
    title: "Audit your existing data",
    description:
      "Use PRSCheck to build a complete picture of PRS properties in your borough from existing data sources: council tax, EPC records, licensing databases, and Land Registry.",
  },
  {
    date: "Mid 2026",
    title: "Prepare integration workflows",
    description:
      "Set up automated compliance screening so that when PRS Database records flow in, they are immediately cross-referenced against your local enforcement data.",
  },
  {
    date: "Late 2026",
    title: "Go live with PRS Database sync",
    description:
      "PRSCheck connects directly to the PRS Database API. Registered landlords sync automatically. Unregistered properties are flagged for enforcement action.",
  },
  {
    date: "2027+",
    title: "Continuous enforcement",
    description:
      "Ongoing monitoring detects registration lapses, expired compliance documents, and new rental properties that have not yet been registered.",
  },
];

const databaseContents = [
  { label: "Landlord identity", detail: "Name, address, unique identifier" },
  {
    label: "Property portfolio",
    detail: "All registered rental properties per landlord",
  },
  {
    label: "Compliance status",
    detail: "EPC rating, gas safety, electrical safety, licensing",
  },
  {
    label: "Penalty history",
    detail: "Civil penalties, banning orders, rent repayment orders",
  },
  {
    label: "Registration dates",
    detail: "Initial registration, renewals, expiry dates",
  },
  {
    label: "Managing agent",
    detail: "Agent details where a third party manages the property",
  },
];

export default function PRSDatabasePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://prscheck.co.uk",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Solutions",
        item: "https://prscheck.co.uk/solutions",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "PRS Database Integration",
        item: "https://prscheck.co.uk/solutions/prs-database",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <main className="min-h-screen">
        {/* Hero */}
        <section className="relative overflow-hidden bg-navy-950 pt-32 pb-20">
          <div className="absolute inset-0 grid-pattern opacity-40" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <Link
                href="/solutions"
                className="inline-flex items-center text-sm font-medium text-accent-400 hover:text-accent-300"
              >
                <svg className="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
                All Solutions
              </Link>
              <span className="mt-4 inline-block rounded-full bg-accent-600/20 px-4 py-1.5 text-sm font-medium text-accent-400">
                Launching Late 2026
              </span>
              <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
                Be PRS Database Ready from Day One
              </h1>
              <p className="mt-6 text-lg leading-8 text-navy-300">
                The Renters&apos; Rights Act 2024 creates a national PRS Database
                of every private landlord and rental property in England.
                PRSCheck ensures your council is prepared to use it from the
                moment it goes live.
              </p>
            </div>
          </div>
        </section>

        {/* What is the PRS Database */}
        <section className="bg-navy-900 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl">
              <h2 className="text-3xl font-bold text-white">
                What is the PRS Database?
              </h2>
              <p className="mt-4 text-lg leading-8 text-navy-300">
                The Renters&apos; Rights Act 2024 (sections 73-81) establishes a
                national Private Rented Sector Database, maintained by the
                Ministry of Housing, Communities and Local Government (MHCLG).
                Every private landlord in England will be required to register
                themselves and their rental properties before they can lawfully
                let them.
              </p>
              <p className="mt-4 text-lg leading-8 text-navy-300">
                The database serves two purposes: giving tenants a way to verify
                their landlord is registered, and giving local authorities a
                comprehensive view of the PRS in their area for the first time.
              </p>
            </div>
          </div>
        </section>

        {/* What data it will contain */}
        <section className="bg-navy-950 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl">
              <h2 className="text-3xl font-bold text-white">
                What the database will contain
              </h2>
              <p className="mt-4 text-navy-300">
                Based on the Act and MHCLG consultation documents, the PRS
                Database will hold the following for every registered property:
              </p>
              <div className="mt-8 space-y-4">
                {databaseContents.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-xl border border-navy-800 bg-navy-900 p-5"
                  >
                    <p className="font-semibold text-navy-100">{item.label}</p>
                    <p className="mt-1 text-sm text-navy-400">{item.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <RegisterInterestCTA />
        </div>

        {/* How PRSCheck integrates */}
        <section className="bg-navy-900 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl">
              <h2 className="text-3xl font-bold text-white">
                How PRSCheck integrates
              </h2>
              <div className="mt-8 space-y-8">
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-600/20 text-accent-400 font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-navy-100">
                      Auto-sync registered landlords
                    </h3>
                    <p className="mt-2 text-navy-400">
                      PRSCheck pulls landlord and property records from the PRS
                      Database API automatically. New registrations appear in
                      your dashboard within hours, not weeks.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-600/20 text-accent-400 font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-navy-100">
                      Cross-reference compliance
                    </h3>
                    <p className="mt-2 text-navy-400">
                      Every synced property is automatically checked against EPC
                      records, gas safety certificates, EICR reports, deposit
                      protection, and your local licensing schemes. Non-compliant
                      properties are flagged immediately.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-600/20 text-accent-400 font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-navy-100">
                      Flag unregistered properties
                    </h3>
                    <p className="mt-2 text-navy-400">
                      PRSCheck compares the PRS Database records against its own
                      property intelligence (council tax, EPC, and Land Registry
                      data) to identify rental properties that are not
                      registered. These are high-priority enforcement targets.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="bg-navy-950 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl">
              <h2 className="text-3xl font-bold text-white">
                What councils should do now
              </h2>
              <p className="mt-4 text-navy-300">
                The PRS Database is expected to launch in late 2026. Councils
                that prepare now will be able to act on the data immediately,
                while those that wait will spend months catching up.
              </p>
              <div className="mt-10 space-y-8">
                {timelineSteps.map((step, index) => (
                  <div key={step.date} className="relative flex gap-6">
                    <div className="flex flex-col items-center">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-600 text-sm font-bold text-white">
                        {index + 1}
                      </div>
                      {index < timelineSteps.length - 1 && (
                        <div className="mt-2 h-full w-px bg-navy-700" />
                      )}
                    </div>
                    <div className="pb-8">
                      <span className="text-sm font-medium text-accent-400">
                        {step.date}
                      </span>
                      <h3 className="mt-1 text-lg font-semibold text-navy-100">
                        {step.title}
                      </h3>
                      <p className="mt-2 text-navy-400">{step.description}</p>
                    </div>
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
              <Link href="/solutions/hmo-detection" className="hover:text-accent-400 transition-colors">
                HMO Detection
              </Link>
              <span className="text-navy-700">|</span>
              <Link href="/solutions/compliance-screening" className="hover:text-accent-400 transition-colors">
                Compliance Screening
              </Link>
              <span className="text-navy-700">|</span>
              <Link href="/solutions/enforcement-pipeline" className="hover:text-accent-400 transition-colors">
                Enforcement Pipeline
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
