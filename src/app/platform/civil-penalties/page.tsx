"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import RegisterInterestCTA from "@/components/RegisterInterestCTA";

const penaltyAmounts = [
  { offence: "Failure to licence an HMO", starting: "£10,000", maximum: "£30,000" },
  { offence: "Breach of HMO management regulations", starting: "£5,000", maximum: "£30,000" },
  { offence: "Failure to comply with improvement notice", starting: "£10,000", maximum: "£30,000" },
  { offence: "Failure to comply with overcrowding notice", starting: "£5,000", maximum: "£30,000" },
  { offence: "Breach of banning order", starting: "£15,000", maximum: "£30,000" },
  { offence: "Failure to display energy certificate", starting: "£2,000", maximum: "£5,000" },
  { offence: "Unlawful eviction or harassment", starting: "£10,000", maximum: "£30,000" },
  { offence: "Breach of selective licensing", starting: "£5,000", maximum: "£30,000" },
];

const factors = [
  {
    title: "Severity of Offence",
    description: "The nature, scale, and impact of the non-compliance. More serious breaches warrant higher penalties.",
  },
  {
    title: "Culpability",
    description: "Whether the landlord acted deliberately, recklessly, negligently, or with no significant fault.",
  },
  {
    title: "Landlord Track Record",
    description: "Previous enforcement history, compliance record, and any prior penalties or convictions.",
  },
  {
    title: "Harm to Tenants",
    description: "Actual or potential harm caused. Vulnerable tenants, children, or elderly occupants increase the assessment.",
  },
  {
    title: "Deterrence and Prevention",
    description: "Whether the penalty level is sufficient to deter the landlord and others from similar breaches.",
  },
  {
    title: "Financial Circumstances",
    description: "The landlord's ability to pay, including portfolio size, rental income, and known assets.",
  },
];

export default function CivilPenaltiesPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://prscheck.co.uk" },
              { "@type": "ListItem", position: 2, name: "Platform", item: "https://prscheck.co.uk/platform" },
              { "@type": "ListItem", position: 3, name: "Civil Penalties", item: "https://prscheck.co.uk/platform/civil-penalties" },
            ],
          }),
        }}
      />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-navy-950 to-navy-900">
        <div className="absolute inset-0 grid-pattern" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <Link href="/platform" className="mb-4 inline-flex items-center gap-1.5 text-sm text-navy-500 transition-colors hover:text-navy-300">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Back to Platform
            </Link>
            <h1 className="text-3xl font-bold tracking-tight text-navy-100 sm:text-4xl lg:text-5xl">
              Civil Penalty Calculator
            </h1>
            <p className="mt-6 text-base text-navy-400 sm:text-xl">
              Auto-calculate penalty amounts per MHCLG guidance. Standardise your
              team's approach, reduce tribunal challenges, and maximise penalty income.
            </p>
          </div>
        </div>
      </section>

      {/* Starting Amounts Table */}
      <section className="border-y border-navy-800 bg-navy-950 py-14 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-accent-500">Reference</h2>
            <p className="mt-3 text-2xl font-bold text-navy-100 sm:text-3xl">Penalty Starting Amounts</p>
            <p className="mx-auto mt-4 max-w-2xl text-navy-400">
              Civil penalties under the Housing Act 2004 and Housing and Planning Act 2016.
              Starting amounts are adjusted based on individual case factors.
            </p>
          </div>
          <div className="mx-auto mt-10 max-w-4xl overflow-hidden rounded-xl border border-navy-800">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-navy-800 bg-navy-900">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-navy-400 sm:px-6">Offence</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-navy-400">Starting Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-navy-400">Maximum</th>
                  </tr>
                </thead>
                <tbody>
                  {penaltyAmounts.map((row) => (
                    <tr key={row.offence} className="border-b border-navy-800/50 last:border-0">
                      <td className="px-4 py-3 text-sm text-navy-300 sm:px-6">{row.offence}</td>
                      <td className="px-4 py-3 text-sm font-medium text-warning">{row.starting}</td>
                      <td className="px-4 py-3 text-sm font-medium text-danger">{row.maximum}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Calculation Factors */}
      <section className="py-14 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-accent-500">Methodology</h2>
            <p className="mt-3 text-2xl font-bold text-navy-100 sm:text-3xl">Calculation Factors</p>
            <p className="mx-auto mt-4 max-w-2xl text-navy-400">
              PRSCheck applies MHCLG guidance factors to calculate a justified penalty
              amount. Each factor adjusts the starting amount up or down.
            </p>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {factors.map((factor, i) => (
              <motion.div
                key={factor.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className="rounded-xl border border-navy-800 bg-navy-800/30 p-5 sm:p-6"
              >
                <h3 className="text-base font-semibold text-navy-100">{factor.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-navy-400">{factor.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-navy-800 bg-navy-950 py-12 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <RegisterInterestCTA variant="banner" />
        </div>
      </section>
    </>
  );
}
