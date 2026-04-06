"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import RegisterInterestCTA from "@/components/RegisterInterestCTA";

const capabilities = [
  {
    title: "Application Tracking",
    description: "Track every licensing application from submission through assessment to decision. See which properties are pending, approved, or refused at a glance.",
  },
  {
    title: "Compliance Monitoring",
    description: "Monitor licence conditions across your entire scheme. Get alerts when conditions are breached or when landlords fail to meet requirements.",
  },
  {
    title: "Renewal Management",
    description: "Automated reminders for upcoming licence expirations. Bulk processing for renewal applications with pre-populated data.",
  },
  {
    title: "Fee Collection",
    description: "Track licensing fee payments, outstanding invoices, and income against scheme targets. Identify non-payers for enforcement action.",
  },
  {
    title: "Geographic Coverage Maps",
    description: "Visualise licensing scheme boundaries, coverage rates, and gaps. Identify streets and areas with low compliance rates.",
  },
  {
    title: "Scheme Performance Reports",
    description: "Generate reports on application volumes, compliance rates, income, and enforcement actions across your licensing schemes.",
  },
];

const schemeTypes = [
  {
    type: "Mandatory HMO Licensing",
    description: "Properties with 5+ occupiers from 2+ households. Required nationwide.",
    coverage: "All local authorities",
  },
  {
    type: "Additional HMO Licensing",
    description: "Smaller HMOs not covered by mandatory licensing. Requires council designation.",
    coverage: "Designated areas",
  },
  {
    type: "Selective Licensing",
    description: "All privately rented properties in a designated area, regardless of HMO status.",
    coverage: "Designated areas",
  },
];

export default function SelectiveLicensingPage() {
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
              { "@type": "ListItem", position: 3, name: "Selective Licensing", item: "https://prscheck.co.uk/platform/selective-licensing" },
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
              Licensing Scheme Management
            </h1>
            <p className="mt-6 text-base text-navy-400 sm:text-xl">
              Manage mandatory, additional, and selective licensing schemes in one place.
              Track applications, monitor compliance, and collect fees efficiently.
            </p>
          </div>
        </div>
      </section>

      {/* Scheme Types */}
      <section className="border-y border-navy-800 bg-navy-950 py-14 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-accent-500">Schemes</h2>
            <p className="mt-3 text-2xl font-bold text-navy-100 sm:text-3xl">Supported Licensing Types</p>
          </div>
          <div className="mt-12 grid gap-6 sm:gap-8 lg:grid-cols-3">
            {schemeTypes.map((scheme) => (
              <div key={scheme.type} className="rounded-xl border border-navy-800 bg-navy-900 p-6">
                <h3 className="text-base font-semibold text-navy-100">{scheme.type}</h3>
                <p className="mt-2 text-sm leading-relaxed text-navy-400">{scheme.description}</p>
                <p className="mt-4 text-xs font-medium text-accent-400">{scheme.coverage}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="py-14 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-accent-500">Capabilities</h2>
            <p className="mt-3 text-2xl font-bold text-navy-100 sm:text-3xl">What You Can Do</p>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {capabilities.map((cap, i) => (
              <motion.div
                key={cap.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className="rounded-xl border border-navy-800 bg-navy-800/30 p-5 sm:p-6"
              >
                <h3 className="text-base font-semibold text-navy-100">{cap.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-navy-400">{cap.description}</p>
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
