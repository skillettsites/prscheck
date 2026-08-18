import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import RegisterInterestCTA from "@/components/RegisterInterestCTA";

export const metadata: Metadata = {
  title: "Selective Licensing Management",
  description:
    "Manage your selective licensing scheme effortlessly. PRSCheck handles application processing, compliance monitoring, renewals, and penalty recovery for unlicensed properties.",
  alternates: { canonical: "https://prscheck.co.uk/solutions/selective-licensing" },
  openGraph: {
    title: "Selective Licensing Management | PRSCheck",
    description: "End-to-end licensing management: applications, compliance monitoring, renewals, and £12,000+ penalty recovery.",
    url: "https://prscheck.co.uk/solutions/selective-licensing",
    siteName: "PRSCheck",
    type: "website",
  },
};

const managementFeatures = [
  {
    title: "Application processing",
    description: "Online application forms pre-populated with property data from PRSCheck. Automated validation checks flag incomplete applications, incorrect fees, or missing documents before officers review them.",
  },
  {
    title: "Compliance monitoring",
    description: "Licensed properties are continuously monitored against licence conditions. EPC expiry, gas safety renewal, EICR due dates, and other conditions are tracked with automated alerts to both the landlord and your team.",
  },
  {
    title: "Renewal management",
    description: "Automated renewal reminders sent 90, 60, and 30 days before licence expiry. Renewal applications pull forward existing data so landlords only update what has changed.",
  },
  {
    title: "Unlicensed property detection",
    description: "PRSCheck cross-references council tax data, EPC records, and Land Registry titles against your licensing register to identify properties in the designated area that should be licensed but are not.",
  },
  {
    title: "Fee management",
    description: "Track application fees, penalty charges, and refunds. Export financial reports for your finance team. Support for split-fee models (application fee on submission, licence fee on grant).",
  },
  {
    title: "Condition compliance auditing",
    description: "Schedule periodic audits of licensed properties to verify ongoing compliance. Random sampling or risk-based selection ensures resources are focused where they are needed most.",
  },
];

export default function SelectiveLicensingPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://prscheck.co.uk" },
      { "@type": "ListItem", position: 2, name: "Solutions", item: "https://prscheck.co.uk/solutions" },
      { "@type": "ListItem", position: 3, name: "Selective Licensing", item: "https://prscheck.co.uk/solutions/selective-licensing" },
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
                Manage Your Licensing Scheme Effortlessly
              </h1>
              <p className="mt-6 text-lg leading-8 text-navy-300">
                Selective and additional licensing schemes are the most effective tools councils have for improving PRS standards in specific areas. PRSCheck manages the entire lifecycle, from application to renewal, so your team can focus on enforcement.
              </p>
            </div>
          </div>
        </section>

        {/* No SoS approval */}
        <section className="bg-navy-900 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl">
              <div className="rounded-2xl border border-accent-500/20 bg-accent-600/5 p-8">
                <h2 className="text-2xl font-bold text-white">
                  Secretary of State approval is no longer required
                </h2>
                <p className="mt-4 text-navy-300">
                  Since December 2024, local authorities in England no longer need Secretary of State confirmation to introduce selective licensing schemes covering up to 20% of their geographical area or 20% of their privately rented properties. This change, implemented through the Non-Domestic Rating Act 2023 (Commencement No. 4) Regulations 2024, removes a major barrier that previously delayed scheme introductions by 12-18 months.
                </p>
                <p className="mt-4 text-navy-300">
                  Councils can now move from consultation to implementation much faster. PRSCheck helps you manage the scheme from day one.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Management Features */}
        <section className="bg-navy-950 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl">
              <h2 className="text-3xl font-bold text-white">End-to-end scheme management</h2>
              <div className="mt-8 space-y-6">
                {managementFeatures.map((feature) => (
                  <div key={feature.title} className="rounded-xl border border-navy-800 bg-navy-900 p-6">
                    <h3 className="text-lg font-semibold text-navy-100">{feature.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-navy-400">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <RegisterInterestCTA />
        </div>

        {/* Penalty Recovery */}
        <section className="bg-navy-900 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl">
              <h2 className="text-3xl font-bold text-white">Penalty recovery for unlicensed properties</h2>
              <p className="mt-4 text-navy-300">
                Operating a property that requires a licence without one is an offence under the Housing Act 2004, section 95(1). Councils can impose civil penalties or prosecute.
              </p>
              <div className="mt-8 grid gap-6 sm:grid-cols-3">
                <div className="rounded-xl border border-navy-800 bg-navy-950 p-6 text-center">
                  <p className="text-3xl font-bold text-accent-400">£40,000</p>
                  <p className="mt-2 text-sm text-navy-400">Maximum civil penalty per offence</p>
                </div>
                <div className="rounded-xl border border-navy-800 bg-navy-950 p-6 text-center">
                  <p className="text-3xl font-bold text-accent-400">£12,000</p>
                  <p className="mt-2 text-sm text-navy-400">Typical starting penalty amount</p>
                </div>
                <div className="rounded-xl border border-navy-800 bg-navy-950 p-6 text-center">
                  <p className="text-3xl font-bold text-accent-400">24 months</p>
                  <p className="mt-2 text-sm text-navy-400">Rent Repayment Order period</p>
                </div>
              </div>
              <p className="mt-6 text-navy-300">
                In addition to civil penalties, tenants (or the council for Housing Benefit properties) can apply for Rent Repayment Orders covering up to 24 months of rent. For an unlicensed property charging £1,000/month, that represents up to £24,000 in recoverable rent.
              </p>
            </div>
          </div>
        </section>

        {/* Scheme Types */}
        <section className="bg-navy-950 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl">
              <h2 className="text-3xl font-bold text-white">Scheme types supported</h2>
              <div className="mt-8 grid gap-6 sm:grid-cols-2">
                <div className="rounded-xl border border-navy-800 bg-navy-900 p-6">
                  <h3 className="text-lg font-semibold text-navy-100">Selective licensing</h3>
                  <p className="mt-2 text-sm text-navy-400">
                    Covers all privately rented properties in a designated area. Introduced under Part 3 of the Housing Act 2004. Criteria include low housing demand, antisocial behaviour, poor property conditions, high levels of migration, high deprivation, or high crime.
                  </p>
                </div>
                <div className="rounded-xl border border-navy-800 bg-navy-900 p-6">
                  <h3 className="text-lg font-semibold text-navy-100">Additional HMO licensing</h3>
                  <p className="mt-2 text-sm text-navy-400">
                    Extends mandatory HMO licensing to smaller HMOs that would not otherwise require a licence. Introduced under Part 2 of the Housing Act 2004. Covers properties occupied by three or more people forming two or more households.
                  </p>
                </div>
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
