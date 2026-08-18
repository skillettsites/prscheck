import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import RegisterInterestCTA from "@/components/RegisterInterestCTA";

export const metadata: Metadata = {
  title: "Civil Penalty Management",
  description:
    "Calculate, issue, and track civil penalties for housing offences. PRSCheck includes tariff tables, calculation factors, and revenue tracking. Councils retain 100% of penalty income.",
  alternates: { canonical: "https://prscheck.co.uk/solutions/civil-penalties" },
  openGraph: {
    title: "Civil Penalty Management | PRSCheck",
    description: "Built-in penalty calculator, tariff tables, and revenue tracking for housing enforcement teams.",
    url: "https://prscheck.co.uk/solutions/civil-penalties",
    siteName: "PRSCheck",
    type: "website",
  },
};

// £40,000, not £30,000. The Housing Act 2004 s.249A maximum was raised from
// £30,000 to £40,000 on 1 May 2026 by the Renters' Rights Act 2025, so this
// table has been publishing a superseded figure to the enforcement officers it
// is written for. The PRS Database rows are a two-tier regime, not a single
// £30,000 cap: £7,000 for a failure to register and £40,000 for serious or
// repeat breaches. The Act is 2025, not 2024.
// Figures: src/data/national-rules.json -> england.penalties, england.prsDatabase.
const penaltyTable = [
  { offence: "Failure to comply with Improvement Notice", act: "Housing Act 2004, s.30", max: "£40,000" },
  { offence: "Operating an unlicensed HMO", act: "Housing Act 2004, s.72(1)", max: "£40,000" },
  { offence: "Operating an unlicensed property (selective/additional)", act: "Housing Act 2004, s.95(1)", max: "£40,000" },
  { offence: "Breach of HMO management regulations", act: "Housing Act 2004, s.234", max: "£40,000" },
  { offence: "Breach of licence conditions", act: "Housing Act 2004, s.72(3) / s.95(2)", max: "£40,000" },
  { offence: "Failure to comply with overcrowding notice", act: "Housing Act 2004, s.139(7)", max: "£40,000" },
  { offence: "Letting a property with EPC below minimum E", act: "Energy Efficiency Regulations 2015, reg.36", max: "£5,000" },
  // NOT swept up by the s.249A uplift. The Electrical Safety Standards in the
  // Private Rented Sector (England) Regulations 2020 set their own £30,000 cap,
  // as the MEES row below sets its own £5,000. Only Housing Act 2004 offences
  // moved to £40,000.
  { offence: "Failure to provide a valid EICR", act: "Electrical Safety Regulations 2020, reg.3", max: "£30,000" },
  { offence: "Failure to register on PRS Database", act: "Renters' Rights Act 2025, s.75", max: "£7,000" },
  { offence: "PRS Database: serious or repeat breach", act: "Renters' Rights Act 2025, s.76", max: "£40,000" },
];

const calculationFactors = [
  {
    factor: "Severity of the offence",
    description: "How serious is the breach? Does it pose a direct risk to tenant health or safety? A missing gas safety certificate on a property with a faulty boiler is more severe than an administrative lapse.",
  },
  {
    factor: "Culpability and intent",
    description: "Did the landlord knowingly commit the offence? Have they ignored previous warnings? Deliberate non-compliance justifies higher penalties. First-time offenders with genuine ignorance may warrant lower amounts.",
  },
  {
    factor: "Landlord track record",
    description: "Previous offences, penalty history, and compliance record across their portfolio. Repeat offenders should expect escalating penalties. PRSCheck tracks this automatically across all properties.",
  },
  {
    factor: "Financial benefit gained",
    description: "The penalty should remove any financial benefit from non-compliance. If a landlord saved £2,000 by not doing required works, the penalty must at least exceed that amount.",
  },
  {
    factor: "Deterrent effect",
    description: "The penalty should discourage the landlord and others from committing similar offences. For large-portfolio landlords, a small penalty relative to their rental income has limited deterrent effect.",
  },
  {
    factor: "Landlord financial circumstances",
    description: "Where a landlord provides evidence of financial hardship, this can be a mitigating factor. However, this does not override the need for the penalty to outweigh the benefit of non-compliance.",
  },
];

export default function CivilPenaltiesPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://prscheck.co.uk" },
      { "@type": "ListItem", position: 2, name: "Solutions", item: "https://prscheck.co.uk/solutions" },
      { "@type": "ListItem", position: 3, name: "Civil Penalties", item: "https://prscheck.co.uk/solutions/civil-penalties" },
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
                Calculate, Issue, and Track Civil Penalties
              </h1>
              <p className="mt-6 text-lg leading-8 text-navy-300">
                Civil penalties are the most powerful enforcement tool available to local authority housing teams. PRSCheck provides built-in tariff tables, calculation guidance, and revenue tracking to help you use them effectively.
              </p>
            </div>
          </div>
        </section>

        {/* Starting Amounts Table */}
        <section className="bg-navy-900 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl">
              <h2 className="text-3xl font-bold text-white">Penalty starting amounts</h2>
              <p className="mt-4 text-navy-300">
                The Housing Act 2004 s.249A allows councils to impose civil penalties as an alternative to prosecution. The maximum rose from £30,000 to £40,000 on 1 May 2026 under the Renters&apos; Rights Act 2025. The following table lists the key offences.
              </p>
              <div className="mt-8 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-navy-700">
                      <th className="pb-3 text-left font-semibold text-navy-200">Offence</th>
                      <th className="pb-3 text-left font-semibold text-navy-200">Legislation</th>
                      <th className="pb-3 text-right font-semibold text-navy-200">Maximum penalty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {penaltyTable.map((item, i) => (
                      <tr key={item.offence} className={i < penaltyTable.length - 1 ? "border-b border-navy-800/50" : ""}>
                        <td className="py-3 pr-4 font-medium text-navy-100">{item.offence}</td>
                        <td className="py-3 pr-4 text-navy-400">{item.act}</td>
                        <td className="py-3 text-right font-semibold text-accent-400">{item.max}</td>
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

        {/* Calculation Factors */}
        <section className="bg-navy-950 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl">
              <h2 className="text-3xl font-bold text-white">Calculation factors</h2>
              <p className="mt-4 text-navy-300">
                MHCLG guidance (Civil Penalties under the Housing and Planning Act 2016) sets out the factors councils must consider when determining the penalty amount. PRSCheck guides officers through each factor.
              </p>
              <div className="mt-8 space-y-5">
                {calculationFactors.map((item) => (
                  <div key={item.factor} className="rounded-xl border border-navy-800 bg-navy-900 p-6">
                    <h3 className="font-semibold text-navy-100">{item.factor}</h3>
                    <p className="mt-2 text-sm leading-6 text-navy-400">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Revenue Tracking */}
        <section className="bg-navy-900 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl">
              <h2 className="text-3xl font-bold text-white">Revenue tracking</h2>
              <p className="mt-4 text-navy-300">
                Local authorities retain 100% of civil penalty income. Under the Housing and Planning Act 2016, this money must be used to fund further housing enforcement activities, creating a self-sustaining enforcement cycle.
              </p>
              <div className="mt-8 grid gap-6 sm:grid-cols-3">
                <div className="rounded-xl border border-navy-800 bg-navy-950 p-6 text-center">
                  <p className="text-3xl font-bold text-accent-400">100%</p>
                  <p className="mt-2 text-sm text-navy-400">Penalty income retained by the council</p>
                </div>
                <div className="rounded-xl border border-navy-800 bg-navy-950 p-6 text-center">
                  <p className="text-3xl font-bold text-accent-400">Ring-fenced</p>
                  <p className="mt-2 text-sm text-navy-400">Must fund further enforcement activity</p>
                </div>
                <div className="rounded-xl border border-navy-800 bg-navy-950 p-6 text-center">
                  <p className="text-3xl font-bold text-accent-400">Real-time</p>
                  <p className="mt-2 text-sm text-navy-400">Dashboard tracks issued, paid, and outstanding</p>
                </div>
              </div>
              <p className="mt-8 text-navy-300">
                PRSCheck tracks every penalty from issuance through to payment or appeal. Your team can see total revenue generated, outstanding amounts, appeal rates, and average time to payment at a glance.
              </p>
            </div>
          </div>
        </section>

        {/* Link to ROI */}
        <section className="bg-navy-950 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-2xl font-bold text-white">Calculate your enforcement ROI</h2>
              <p className="mt-4 text-navy-300">
                See how much penalty income your borough could generate with proactive enforcement. Our ROI calculator uses your property count and current enforcement activity to project potential revenue.
              </p>
              <Link href="/pricing" className="mt-6 inline-flex items-center rounded-lg bg-accent-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-accent-500 hover:shadow-lg hover:shadow-accent-600/25">
                View Pricing and ROI Calculator
              </Link>
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
              <Link href="/solutions/hmo-detection" className="hover:text-accent-400 transition-colors">HMO Detection</Link>
              <span className="text-navy-700">|</span>
              <Link href="/solutions/selective-licensing" className="hover:text-accent-400 transition-colors">Selective Licensing</Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
