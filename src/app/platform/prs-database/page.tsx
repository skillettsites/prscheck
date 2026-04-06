"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import RegisterInterestCTA from "@/components/RegisterInterestCTA";

const timeline = [
  { date: "Q2 2026", event: "MHCLG publishes PRS Database technical specifications", status: "expected" },
  { date: "Q3 2026", event: "PRSCheck API integration development and testing", status: "planned" },
  { date: "Q4 2026", event: "National PRS Database launches for landlord registration", status: "expected" },
  { date: "Q1 2027", event: "Full integration live: automatic landlord verification", status: "planned" },
];

const preparations = [
  {
    title: "Property Register Alignment",
    description: "Your PRS property data is structured to match the national database schema from day one, eliminating migration friction.",
  },
  {
    title: "Landlord Identity Matching",
    description: "PRSCheck already builds landlord profiles from multiple data sources. When the PRS Database launches, matching is automatic.",
  },
  {
    title: "Compliance History Continuity",
    description: "All enforcement history, notices, and outcomes are preserved and linked to national registration records.",
  },
  {
    title: "API-First Architecture",
    description: "Built to connect via API from the start. When MHCLG publishes integration endpoints, PRSCheck will be ready immediately.",
  },
  {
    title: "Registration Gap Detection",
    description: "Identify landlords who fail to register with the national database, using your existing PRS stock data.",
  },
  {
    title: "Automatic Verification",
    description: "Cross-check landlord registrations against your local records to verify accuracy and flag discrepancies.",
  },
];

export default function PRSDatabasePage() {
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
              { "@type": "ListItem", position: 3, name: "PRS Database", item: "https://prscheck.co.uk/platform/prs-database" },
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
              PRS Database Integration
            </h1>
            <p className="mt-6 text-base text-navy-400 sm:text-xl">
              The national PRS Database is coming in late 2026. PRSCheck is built from
              the ground up to integrate with it, so your team is ready from day one.
            </p>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="border-y border-navy-800 bg-navy-950 py-14 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-accent-500">Timeline</h2>
            <p className="mt-3 text-2xl font-bold text-navy-100 sm:text-3xl">PRS Database Launch Timeline</p>
          </div>
          <div className="mx-auto mt-12 max-w-2xl">
            <div className="space-y-0">
              {timeline.map((item, i) => (
                <motion.div
                  key={item.date}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12, duration: 0.4 }}
                  className="relative flex gap-6 pb-8 last:pb-0"
                >
                  {/* Connector line */}
                  {i < timeline.length - 1 && (
                    <div className="absolute left-[11px] top-6 h-full w-px bg-navy-700" />
                  )}
                  <div className="relative flex h-6 w-6 shrink-0 items-center justify-center">
                    <div className={`h-3 w-3 rounded-full ${item.status === "expected" ? "bg-accent-500" : "bg-navy-600"}`} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-accent-400">{item.date}</p>
                    <p className="mt-1 text-sm text-navy-300">{item.event}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* What PRSCheck Prepares */}
      <section className="py-14 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-accent-500">Preparation</h2>
            <p className="mt-3 text-2xl font-bold text-navy-100 sm:text-3xl">What PRSCheck Prepares</p>
            <p className="mx-auto mt-4 max-w-2xl text-navy-400">
              Councils using PRSCheck today will have a seamless transition when
              the national database goes live.
            </p>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {preparations.map((prep, i) => (
              <motion.div
                key={prep.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className="rounded-xl border border-navy-800 bg-navy-800/30 p-5 sm:p-6"
              >
                <h3 className="text-base font-semibold text-navy-100">{prep.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-navy-400">{prep.description}</p>
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
