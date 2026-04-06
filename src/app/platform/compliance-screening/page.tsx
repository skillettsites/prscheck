"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import RegisterInterestCTA from "@/components/RegisterInterestCTA";
// TODO: Import ComplianceScreeningMockup from @/components/mockups/ when available

const steps = [
  {
    number: "01",
    title: "Ingest Property Data",
    description: "Upload your PRS property register or connect via API. PRSCheck matches each address against national datasets automatically.",
  },
  {
    number: "02",
    title: "Cross-Reference Compliance Records",
    description: "Every property is checked against EPC, gas safety, EICR, deposit protection, and licensing databases in seconds, not weeks.",
  },
  {
    number: "03",
    title: "Flag and Prioritise",
    description: "Non-compliant properties are flagged with a risk score. Your team sees the highest-priority cases first, with full evidence attached.",
  },
];

const checks = [
  { name: "EPC Ratings", description: "Verify minimum E rating compliance and identify properties below threshold" },
  { name: "Gas Safety", description: "Check for valid gas safety certificates and flag expired or missing records" },
  { name: "EICR Status", description: "Confirm electrical installation condition reports are current" },
  { name: "Deposit Protection", description: "Verify tenancy deposits are registered with an approved scheme" },
  { name: "Licensing Status", description: "Check mandatory, additional, and selective licensing requirements" },
  { name: "Fire Safety", description: "Assess fire safety compliance including smoke alarms and escape routes" },
];

const benefits = [
  { title: "10x Faster", description: "Screen your entire PRS stock in hours instead of months of manual checking" },
  { title: "99.2% Accuracy", description: "Cross-referencing multiple data sources catches issues manual checks miss" },
  { title: "Full Coverage", description: "Every property checked against every obligation, every time, with no gaps" },
];

export default function ComplianceScreeningPage() {
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
              { "@type": "ListItem", position: 3, name: "Compliance Screening", item: "https://prscheck.co.uk/platform/compliance-screening" },
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
              Automated Compliance Screening
            </h1>
            <p className="mt-6 text-base text-navy-400 sm:text-xl">
              Bulk-check every PRS property in your borough against six core compliance
              obligations. Get results in hours, not months.
            </p>
          </div>
        </div>
      </section>

      {/* Mockup */}
      <section className="border-y border-navy-800 bg-navy-950 py-12 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Replace with <ComplianceScreeningMockup /> when component is ready */}
          <div className="mx-auto max-w-4xl rounded-2xl border border-navy-700 bg-navy-800/50 p-12 text-center">
            <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-xl bg-accent-600/10">
              <svg className="h-8 w-8 text-accent-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
              </svg>
            </div>
            <p className="mt-4 text-navy-400">Interactive compliance screening demo coming soon</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-14 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-accent-500">Process</h2>
            <p className="mt-3 text-2xl font-bold text-navy-100 sm:text-3xl">How It Works</p>
          </div>
          <div className="mt-12 grid gap-6 sm:gap-8 lg:grid-cols-3">
            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.4 }}
                className="rounded-xl border border-navy-800 bg-navy-800/30 p-6 sm:p-8"
              >
                <span className="text-sm font-bold text-accent-500">{step.number}</span>
                <h3 className="mt-3 text-lg font-semibold text-navy-100">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-navy-400">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* What Gets Checked */}
      <section className="border-y border-navy-800 bg-navy-950 py-14 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-accent-500">Coverage</h2>
            <p className="mt-3 text-2xl font-bold text-navy-100 sm:text-3xl">What Gets Checked</p>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {checks.map((check) => (
              <div key={check.name} className="rounded-xl border border-navy-800 bg-navy-900 p-5 sm:p-6">
                <div className="flex items-center gap-3">
                  <svg className="h-5 w-5 shrink-0 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  <h3 className="text-base font-semibold text-navy-100">{check.name}</h3>
                </div>
                <p className="mt-2 text-sm text-navy-400">{check.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-14 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-accent-500">Benefits</h2>
            <p className="mt-3 text-2xl font-bold text-navy-100 sm:text-3xl">Why Automate Screening</p>
          </div>
          <div className="mt-12 grid gap-6 sm:gap-8 lg:grid-cols-3">
            {benefits.map((b) => (
              <div key={b.title} className="text-center">
                <p className="text-3xl font-bold text-accent-400">{b.title}</p>
                <p className="mt-3 text-sm text-navy-400">{b.description}</p>
              </div>
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
