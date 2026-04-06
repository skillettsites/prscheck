"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import RegisterInterestCTA from "@/components/RegisterInterestCTA";
// TODO: Import HMODetectionMockup from @/components/mockups/ when available

const signals = [
  {
    title: "Council Tax Band Mismatch",
    description: "Properties in low council tax bands with multiple council tax discounts or exemptions at the same address.",
  },
  {
    title: "EPC Room Count Analysis",
    description: "EPC data showing unusually high room counts relative to property size, suggesting subdivision.",
  },
  {
    title: "Licensing Gap Detection",
    description: "Properties that meet HMO criteria by occupancy or configuration but have no mandatory or additional licence on record.",
  },
  {
    title: "Multiple Benefit Claims",
    description: "Cross-referencing housing benefit claims to identify multiple claimants at a single address.",
  },
  {
    title: "Planning Application History",
    description: "Properties with conversion applications, or without required planning for change of use to HMO.",
  },
  {
    title: "Electoral Roll Cross-Check",
    description: "Multiple unrelated individuals registered at the same address, suggesting shared occupancy.",
  },
];

const penaltyStats = [
  { value: "Up to £30,000", label: "Civil penalty per offence for unlicensed HMOs" },
  { value: "12 months", label: "Rent repayment order period tenants can claim" },
  { value: "85%", label: "Detection rate in first month of deployment" },
  { value: "340+", label: "Unlicensed HMOs found in a single London borough" },
];

export default function HMODetectionPage() {
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
              { "@type": "ListItem", position: 3, name: "HMO Detection", item: "https://prscheck.co.uk/platform/hmo-detection" },
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
              Find Every Unlicensed HMO
            </h1>
            <p className="mt-6 text-base text-navy-400 sm:text-xl">
              Cross-reference six data signals to identify unlicensed Houses in Multiple
              Occupation across your borough. Recover lost licensing income and protect tenants.
            </p>
          </div>
        </div>
      </section>

      {/* Mockup */}
      <section className="border-y border-navy-800 bg-navy-950 py-12 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Replace with <HMODetectionMockup /> when component is ready */}
          <div className="mx-auto max-w-4xl rounded-2xl border border-navy-700 bg-navy-800/50 p-12 text-center">
            <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-xl bg-accent-600/10">
              <svg className="h-8 w-8 text-accent-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="mt-4 text-navy-400">Interactive HMO detection demo coming soon</p>
          </div>
        </div>
      </section>

      {/* Detection Signals */}
      <section className="py-14 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-accent-500">Detection</h2>
            <p className="mt-3 text-2xl font-bold text-navy-100 sm:text-3xl">Six Detection Signals</p>
            <p className="mx-auto mt-4 max-w-2xl text-navy-400">
              Each property is scored against multiple data sources. Higher signal overlap
              means higher confidence that a property is an unlicensed HMO.
            </p>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {signals.map((signal, i) => (
              <motion.div
                key={signal.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className="rounded-xl border border-navy-800 bg-navy-800/30 p-5 sm:p-6"
              >
                <h3 className="text-base font-semibold text-navy-100">{signal.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-navy-400">{signal.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Penalty Recovery */}
      <section className="border-y border-navy-800 bg-navy-950 py-14 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-accent-500">Impact</h2>
            <p className="mt-3 text-2xl font-bold text-navy-100 sm:text-3xl">Penalty Recovery Potential</p>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
            {penaltyStats.map((stat) => (
              <div key={stat.label} className="rounded-xl border border-navy-800 bg-navy-900 p-4 text-center sm:p-6">
                <p className="text-xl font-bold text-accent-400 sm:text-2xl">{stat.value}</p>
                <p className="mt-2 text-xs text-navy-400 sm:text-sm">{stat.label}</p>
              </div>
            ))}
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
