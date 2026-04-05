import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import RegisterInterestCTA from "@/components/RegisterInterestCTA";

export const metadata: Metadata = {
  title: "Automated HMO Detection | PRSCheck",
  description:
    "Find every unlicensed HMO in your borough. PRSCheck cross-references council tax, EPC records, and occupancy data to detect unlicensed Houses in Multiple Occupation.",
  alternates: { canonical: "https://prscheck.co.uk/solutions/hmo-detection" },
  openGraph: {
    title: "Automated HMO Detection | PRSCheck",
    description:
      "Cross-reference council tax, EPC, and occupancy data to find unlicensed HMOs and recover penalties.",
    url: "https://prscheck.co.uk/solutions/hmo-detection",
    siteName: "PRSCheck",
    type: "website",
  },
};

const detectionSignals = [
  {
    signal: "Council tax vs EPC mismatch",
    description:
      "A property paying single-occupancy council tax discount but with an EPC registered as a multi-bedroom dwelling indicates possible undisclosed multiple occupation.",
  },
  {
    signal: "Multiple certificates at one address",
    description:
      "Multiple gas safety certificates or EPC assessments at sub-units within a single address is a strong indicator of an HMO that has been subdivided.",
  },
  {
    signal: "Occupancy mismatches",
    description:
      "Electoral roll data showing multiple unrelated adults at a property, combined with a single tenancy record, suggests HMO-style occupation.",
  },
  {
    signal: "Planning and building control records",
    description:
      "Properties with building control applications for conversions or additional kitchens/bathrooms, without a corresponding HMO licence application.",
  },
  {
    signal: "Fire safety referrals",
    description:
      "Fire service referrals or incidents at properties with multiple occupants can flag unlicensed HMOs with inadequate fire safety measures.",
  },
  {
    signal: "Licensing gap analysis",
    description:
      "Comparing known rental properties against your mandatory and additional licensing registers to find properties that should be licensed but are not.",
  },
];

const steps = [
  {
    step: "1. Data ingestion",
    description:
      "PRSCheck ingests your council tax records, EPC register data, licensing databases, Land Registry titles, and electoral roll data. All data is processed securely within the platform.",
  },
  {
    step: "2. Cross-reference analysis",
    description:
      "Our detection algorithms cross-reference these data sources to identify properties exhibiting HMO signals. Each property receives a confidence score based on how many signals it matches.",
  },
  {
    step: "3. Prioritised enforcement list",
    description:
      "Properties are ranked by confidence score and potential penalty value. Your enforcement team receives a ready-to-action list, starting with the highest-value targets.",
  },
];

export default function HMODetectionPage() {
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
        name: "HMO Detection",
        item: "https://prscheck.co.uk/solutions/hmo-detection",
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
              <h1 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl">
                Find Every Unlicensed HMO in Your Borough
              </h1>
              <p className="mt-6 text-lg leading-8 text-navy-300">
                Unlicensed HMOs cost councils millions in uncollected penalties
                and put tenants at risk. PRSCheck uses data cross-referencing to
                surface suspected HMOs that would take officers months to find
                manually.
              </p>
            </div>
          </div>
        </section>

        {/* Detection Signals */}
        <section className="bg-navy-900 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl">
              <h2 className="text-3xl font-bold text-white">
                Detection signals
              </h2>
              <p className="mt-4 text-navy-300">
                PRSCheck identifies suspected HMOs by analysing multiple data
                sources for patterns that indicate multiple occupation. No single
                signal is conclusive on its own, but when combined, they produce
                high-confidence matches.
              </p>
              <div className="mt-8 space-y-5">
                {detectionSignals.map((item) => (
                  <div
                    key={item.signal}
                    className="rounded-xl border border-navy-800 bg-navy-950 p-6"
                  >
                    <h3 className="font-semibold text-navy-100">
                      {item.signal}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-navy-400">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <RegisterInterestCTA />
        </div>

        {/* How It Works */}
        <section className="bg-navy-950 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl">
              <h2 className="text-3xl font-bold text-white">How it works</h2>
              <div className="mt-8 space-y-8">
                {steps.map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-600/20 text-accent-400 font-bold text-sm">
                      {item.step.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-navy-100">
                        {item.step}
                      </h3>
                      <p className="mt-2 text-navy-400">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Penalty Recovery */}
        <section className="bg-navy-900 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl">
              <h2 className="text-3xl font-bold text-white">
                Penalty recovery potential
              </h2>
              <p className="mt-4 text-navy-300">
                Operating an unlicensed HMO is a criminal offence under the
                Housing Act 2004. Local authorities can pursue civil penalties as
                an alternative to prosecution.
              </p>
              <div className="mt-8 grid gap-6 sm:grid-cols-3">
                <div className="rounded-xl border border-navy-800 bg-navy-950 p-6 text-center">
                  <p className="text-3xl font-bold text-accent-400">£30,000</p>
                  <p className="mt-2 text-sm text-navy-400">
                    Maximum civil penalty per offence
                  </p>
                </div>
                <div className="rounded-xl border border-navy-800 bg-navy-950 p-6 text-center">
                  <p className="text-3xl font-bold text-accent-400">
                    Unlimited
                  </p>
                  <p className="mt-2 text-sm text-navy-400">
                    Fine on criminal prosecution
                  </p>
                </div>
                <div className="rounded-xl border border-navy-800 bg-navy-950 p-6 text-center">
                  <p className="text-3xl font-bold text-accent-400">
                    24 months
                  </p>
                  <p className="mt-2 text-sm text-navy-400">
                    Rent Repayment Order period
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Case Study */}
        <section className="bg-navy-950 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl">
              <h2 className="text-3xl font-bold text-white">
                Example: borough-wide HMO sweep
              </h2>
              <div className="mt-8 rounded-2xl border border-accent-500/20 bg-accent-600/5 p-8">
                <div className="grid gap-8 sm:grid-cols-3">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-white">200</p>
                    <p className="mt-2 text-sm text-navy-400">
                      Suspected unlicensed HMOs identified
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-4xl font-bold text-white">85</p>
                    <p className="mt-2 text-sm text-navy-400">
                      Confirmed as unlicensed on inspection
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-4xl font-bold text-accent-400">
                      £1.4M
                    </p>
                    <p className="mt-2 text-sm text-navy-400">
                      Total penalties and RRO income
                    </p>
                  </div>
                </div>
                <p className="mt-6 text-sm text-navy-300">
                  Based on a medium-sized London borough using PRSCheck to
                  cross-reference council tax, EPC, and licensing data. A 42%
                  confirmation rate is typical, as some properties will have
                  legitimate explanations for the data signals.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ROI */}
        <section className="bg-navy-900 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl">
              <h2 className="text-3xl font-bold text-white">
                Return on investment
              </h2>
              <p className="mt-4 text-navy-300">
                HMO enforcement is one of the most financially productive
                activities a housing team can undertake. Civil penalties alone
                often exceed the annual cost of PRSCheck many times over, and
                Rent Repayment Orders return funds directly to tenants.
              </p>
              <div className="mt-8 rounded-xl border border-navy-800 bg-navy-950 p-6">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-navy-800">
                      <th className="pb-3 text-left font-semibold text-navy-300">
                        Metric
                      </th>
                      <th className="pb-3 text-right font-semibold text-navy-300">
                        Typical value
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-navy-400">
                    <tr className="border-b border-navy-800/50">
                      <td className="py-3">Average civil penalty per HMO</td>
                      <td className="py-3 text-right text-navy-100">
                        £17,000
                      </td>
                    </tr>
                    <tr className="border-b border-navy-800/50">
                      <td className="py-3">Average RRO per HMO (24 months)</td>
                      <td className="py-3 text-right text-navy-100">
                        £18,000
                      </td>
                    </tr>
                    <tr className="border-b border-navy-800/50">
                      <td className="py-3">
                        Officer time saved per investigation
                      </td>
                      <td className="py-3 text-right text-navy-100">
                        4-6 hours
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3">Time to first enforcement action</td>
                      <td className="py-3 text-right text-navy-100">
                        2-4 weeks
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-navy-950 py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <RegisterInterestCTA variant="banner" />
            <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm text-navy-400">
              <Link href="/solutions/compliance-screening" className="hover:text-accent-400 transition-colors">
                Compliance Screening
              </Link>
              <span className="text-navy-700">|</span>
              <Link href="/solutions/civil-penalties" className="hover:text-accent-400 transition-colors">
                Civil Penalties
              </Link>
              <span className="text-navy-700">|</span>
              <Link href="/solutions/selective-licensing" className="hover:text-accent-400 transition-colors">
                Selective Licensing
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
