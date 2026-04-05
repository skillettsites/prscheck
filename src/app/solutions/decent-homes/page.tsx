import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import RegisterInterestCTA from "@/components/RegisterInterestCTA";

export const metadata: Metadata = {
  title: "Decent Homes Standard Preparation | PRSCheck",
  description:
    "Prepare for the Decent Homes Standard extending to private rentals. PRSCheck screens PRS properties against all five DHS criteria, with over 20% of homes currently failing.",
  alternates: { canonical: "https://prscheck.co.uk/solutions/decent-homes" },
  openGraph: {
    title: "Decent Homes Standard Preparation | PRSCheck",
    description: "Screen PRS properties against all five Decent Homes Standard criteria. 2035 implementation, 2030 EPC C requirement.",
    url: "https://prscheck.co.uk/solutions/decent-homes",
    siteName: "PRSCheck",
    type: "website",
  },
};

const dhsCriteria = [
  {
    criterion: "1. Free from Category 1 hazards",
    description: "The property must be free from any hazard assessed as Category 1 under the Housing Health and Safety Rating System (HHSRS). This includes hazards such as excess cold, damp and mould growth, falls on stairs, and electrical hazards.",
    howChecked: "PRSCheck flags properties with known HHSRS inspection history, complaint patterns, and building age/type risk factors that correlate with Category 1 hazards.",
  },
  {
    criterion: "2. In a reasonable state of repair",
    description: "Key building components (roof, walls, windows, doors, plumbing, heating, electrics) must be in reasonable condition. Components are classed as old if they are older than their expected lifetime and in poor condition if they need major repair or replacement.",
    howChecked: "Building age, EPC construction data, and previous inspection records are used to identify properties likely to fail this criterion.",
  },
  {
    criterion: "3. Reasonably modern facilities and services",
    description: "The property must have a kitchen with adequate space, an appropriately located bathroom and WC, adequate noise insulation, and adequate lighting, ventilation, and heating.",
    howChecked: "EPC data, floor plan information, and property age indicators flag properties where facilities are likely below standard.",
  },
  {
    criterion: "4. Reasonable degree of thermal comfort",
    description: "The property must have efficient heating and effective insulation. From 2030, private rented properties will need a minimum EPC rating of C to meet thermal comfort requirements.",
    howChecked: "PRSCheck checks the EPC register directly. Properties rated D or below are flagged, with those rated E or below marked as high priority.",
  },
  {
    criterion: "5. Minimum energy efficiency",
    description: "Currently, private rented properties must have a minimum EPC rating of E. The Renters' Rights Act 2024 introduces a trajectory to EPC C by 2030, aligned with the Decent Homes Standard timeline.",
    howChecked: "Direct EPC register lookup. Current compliance (minimum E) and future compliance (minimum C by 2030) are both tracked.",
  },
];

const timelineEvents = [
  { year: "2024", event: "Renters' Rights Act receives Royal Assent. DHS extension to PRS confirmed." },
  { year: "2025-2026", event: "MHCLG consultation on DHS implementation details for private sector. PRS Database launches." },
  { year: "2028", event: "Expected secondary legislation setting out DHS enforcement framework for PRS." },
  { year: "2030", event: "EPC C minimum for new private tenancies. Existing tenancies follow by 2033." },
  { year: "2035", event: "Full Decent Homes Standard enforcement in the private rented sector." },
];

export default function DecentHomesPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://prscheck.co.uk" },
      { "@type": "ListItem", position: 2, name: "Solutions", item: "https://prscheck.co.uk/solutions" },
      { "@type": "ListItem", position: 3, name: "Decent Homes Standard", item: "https://prscheck.co.uk/solutions/decent-homes" },
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
              <span className="mt-4 inline-block rounded-full bg-warning/20 px-4 py-1.5 text-sm font-medium text-warning">
                2035 Implementation
              </span>
              <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
                Prepare for the Decent Homes Standard in Private Rentals
              </h1>
              <p className="mt-6 text-lg leading-8 text-navy-300">
                For the first time, the Decent Homes Standard will apply to the private rented sector. Over 20% of PRS homes currently fail at least one criterion. PRSCheck helps councils identify which properties need attention and track progress towards compliance.
              </p>
            </div>
          </div>
        </section>

        {/* Scale of the challenge */}
        <section className="bg-navy-900 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl">
              <h2 className="text-3xl font-bold text-white">The scale of the challenge</h2>
              <div className="mt-8 grid gap-6 sm:grid-cols-3">
                <div className="rounded-xl border border-navy-800 bg-navy-950 p-6 text-center">
                  <p className="text-3xl font-bold text-accent-400">4.6M</p>
                  <p className="mt-2 text-sm text-navy-400">Private rented homes in England</p>
                </div>
                <div className="rounded-xl border border-navy-800 bg-navy-950 p-6 text-center">
                  <p className="text-3xl font-bold text-danger">21%</p>
                  <p className="mt-2 text-sm text-navy-400">Currently fail Decent Homes Standard</p>
                </div>
                <div className="rounded-xl border border-navy-800 bg-navy-950 p-6 text-center">
                  <p className="text-3xl font-bold text-warning">~966,000</p>
                  <p className="mt-2 text-sm text-navy-400">Properties needing improvement</p>
                </div>
              </div>
              <p className="mt-6 text-navy-300">
                Data from the English Housing Survey shows that the PRS has the highest rate of non-decent homes of any tenure. The most common failures are Category 1 HHSRS hazards (mainly excess cold) and insufficient thermal comfort.
              </p>
            </div>
          </div>
        </section>

        {/* Five Criteria */}
        <section className="bg-navy-950 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl">
              <h2 className="text-3xl font-bold text-white">The five criteria</h2>
              <p className="mt-4 text-navy-300">
                A property meets the Decent Homes Standard when it satisfies all five of the following criteria. Failure on any single criterion means the property is non-decent.
              </p>
              <div className="mt-8 space-y-6">
                {dhsCriteria.map((item) => (
                  <div key={item.criterion} className="rounded-xl border border-navy-800 bg-navy-900 p-6">
                    <h3 className="text-lg font-semibold text-navy-100">{item.criterion}</h3>
                    <p className="mt-2 text-sm leading-6 text-navy-400">{item.description}</p>
                    <div className="mt-4 rounded-lg bg-accent-600/10 p-4">
                      <p className="text-sm text-accent-300">
                        <span className="font-semibold">How PRSCheck screens for this:</span> {item.howChecked}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <RegisterInterestCTA />
        </div>

        {/* Timeline */}
        <section className="bg-navy-900 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl">
              <h2 className="text-3xl font-bold text-white">Implementation timeline</h2>
              <div className="mt-8 space-y-6">
                {timelineEvents.map((item, i) => (
                  <div key={item.year} className="flex gap-6">
                    <div className="flex flex-col items-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-600 text-sm font-bold text-white">
                        {item.year}
                      </div>
                      {i < timelineEvents.length - 1 && (
                        <div className="mt-2 h-full w-px bg-navy-700" />
                      )}
                    </div>
                    <div className="pb-6">
                      <p className="text-navy-300">{item.event}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-navy-950 py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <RegisterInterestCTA variant="banner" />
            <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm text-navy-400">
              <Link href="/solutions/compliance-screening" className="hover:text-accent-400 transition-colors">Compliance Screening</Link>
              <span className="text-navy-700">|</span>
              <Link href="/solutions/prs-database" className="hover:text-accent-400 transition-colors">PRS Database</Link>
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
