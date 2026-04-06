"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import RegisterInterestCTA from "@/components/RegisterInterestCTA";
// TODO: Import ReportingMockup from @/components/mockups/ when available

const kpis = [
  { metric: "Compliance Rate", description: "Percentage of PRS properties meeting all statutory requirements, tracked by ward" },
  { metric: "Response Time", description: "Average days from complaint received to first officer action, benchmarked against targets" },
  { metric: "Cases Resolved", description: "Monthly and quarterly case closure rates, broken down by resolution type" },
  { metric: "Penalty Income", description: "Civil penalty and rent repayment order income, tracked against annual targets" },
  { metric: "HMO Licensing Rate", description: "Percentage of identified HMOs that hold valid licences, with trend analysis" },
  { metric: "Inspection Volume", description: "Number of inspections completed per officer, per ward, per period" },
  { metric: "Repeat Offender Rate", description: "Landlords with multiple enforcement actions, flagged for escalation" },
  { metric: "Awaab's Law Compliance", description: "Percentage of hazard cases meeting statutory response and repair timelines" },
];

const mhclgFeatures = [
  "Pre-formatted reports matching MHCLG submission templates",
  "Quarterly enforcement activity summaries",
  "Ward-level compliance heat maps",
  "Year-on-year trend analysis",
  "Exportable data in CSV, PDF, and Excel formats",
  "Cabinet member briefing packs with key statistics",
];

export default function ReportingPage() {
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
              { "@type": "ListItem", position: 3, name: "Reporting", item: "https://prscheck.co.uk/platform/reporting" },
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
              Real-Time Enforcement Analytics
            </h1>
            <p className="mt-6 text-base text-navy-400 sm:text-xl">
              Track every KPI your team, cabinet members, and MHCLG need to see.
              Live dashboards, automated reports, and data exports built in.
            </p>
          </div>
        </div>
      </section>

      {/* Mockup */}
      <section className="border-y border-navy-800 bg-navy-950 py-12 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Replace with <ReportingMockup /> when component is ready */}
          <div className="mx-auto max-w-4xl rounded-2xl border border-navy-700 bg-navy-800/50 p-12 text-center">
            <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-xl bg-accent-600/10">
              <svg className="h-8 w-8 text-accent-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <p className="mt-4 text-navy-400">Interactive reporting dashboard demo coming soon</p>
          </div>
        </div>
      </section>

      {/* KPIs */}
      <section className="py-14 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-accent-500">Metrics</h2>
            <p className="mt-3 text-2xl font-bold text-navy-100 sm:text-3xl">KPIs Tracked</p>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
            {kpis.map((kpi, i) => (
              <motion.div
                key={kpi.metric}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.4 }}
                className="rounded-xl border border-navy-800 bg-navy-800/30 p-5"
              >
                <h3 className="text-sm font-semibold text-accent-400">{kpi.metric}</h3>
                <p className="mt-2 text-xs leading-relaxed text-navy-400">{kpi.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* MHCLG Reporting */}
      <section className="border-y border-navy-800 bg-navy-950 py-14 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <div className="text-center">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-accent-500">Compliance</h2>
              <p className="mt-3 text-2xl font-bold text-navy-100 sm:text-3xl">MHCLG Reporting Ready</p>
              <p className="mt-4 text-navy-400">
                Generate the reports MHCLG requires without manual data compilation.
                Every enforcement action feeds directly into reporting templates.
              </p>
            </div>
            <ul className="mt-10 space-y-3">
              {mhclgFeatures.map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-sm text-navy-300">
                  <svg className="mt-0.5 h-4 w-4 shrink-0 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <RegisterInterestCTA variant="banner" />
        </div>
      </section>
    </>
  );
}
