"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import RegisterInterestCTA from "@/components/RegisterInterestCTA";
// TODO: Import TenantComplaintMockup from @/components/mockups/ when available

const flowSteps = [
  {
    number: "01",
    title: "Tenant Submits Complaint",
    description: "Structured online form captures property address, issue category, severity, timeline, and photographic evidence.",
  },
  {
    number: "02",
    title: "Auto-Enrichment",
    description: "PRSCheck attaches the property's compliance history, landlord details, previous complaints, and licensing status automatically.",
  },
  {
    number: "03",
    title: "Triage and Priority Score",
    description: "Each complaint receives a risk score based on severity, vulnerability factors, and property compliance history. High-risk cases surface first.",
  },
  {
    number: "04",
    title: "Assignment and Action",
    description: "Complaints are routed to the appropriate officer based on category, location, and team workload. Full case context is ready from day one.",
  },
];

const triageCategories = [
  { category: "Damp and Mould", priority: "High", response: "24 hours", color: "text-danger" },
  { category: "No Heating or Hot Water", priority: "High", response: "24 hours", color: "text-danger" },
  { category: "Electrical Hazards", priority: "High", response: "24 hours", color: "text-danger" },
  { category: "Structural Issues", priority: "Medium", response: "5 days", color: "text-warning" },
  { category: "Pest Infestation", priority: "Medium", response: "5 days", color: "text-warning" },
  { category: "Disrepair", priority: "Medium", response: "5 days", color: "text-warning" },
  { category: "Noise or Antisocial", priority: "Standard", response: "10 days", color: "text-navy-400" },
  { category: "Overcrowding Concerns", priority: "Standard", response: "10 days", color: "text-navy-400" },
];

export default function TenantComplaintsPage() {
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
              { "@type": "ListItem", position: 3, name: "Tenant Complaints", item: "https://prscheck.co.uk/platform/tenant-complaints" },
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
              Structured Tenant Reports
            </h1>
            <p className="mt-6 text-base text-navy-400 sm:text-xl">
              Replace unstructured emails and phone calls with a complaint system that
              captures evidence, enriches context, and triages automatically.
            </p>
          </div>
        </div>
      </section>

      {/* Mockup */}
      <section className="border-y border-navy-800 bg-navy-950 py-12 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Replace with <TenantComplaintMockup /> when component is ready */}
          <div className="mx-auto max-w-4xl rounded-2xl border border-navy-700 bg-navy-800/50 p-12 text-center">
            <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-xl bg-accent-600/10">
              <svg className="h-8 w-8 text-accent-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
              </svg>
            </div>
            <p className="mt-4 text-navy-400">Interactive complaint triage demo coming soon</p>
          </div>
        </div>
      </section>

      {/* How Complaints Flow */}
      <section className="py-14 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-accent-500">Workflow</h2>
            <p className="mt-3 text-2xl font-bold text-navy-100 sm:text-3xl">How Complaints Flow In</p>
          </div>
          <div className="mt-12 grid gap-6 sm:gap-8 lg:grid-cols-2">
            {flowSteps.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
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

      {/* Auto-Triage */}
      <section className="border-y border-navy-800 bg-navy-950 py-14 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-accent-500">Triage</h2>
            <p className="mt-3 text-2xl font-bold text-navy-100 sm:text-3xl">Automatic Priority Assignment</p>
            <p className="mx-auto mt-4 max-w-2xl text-navy-400">
              Complaints are automatically categorised and assigned response targets
              based on severity and Awaab&apos;s Law timelines.
            </p>
          </div>
          <div className="mx-auto mt-10 max-w-3xl overflow-hidden rounded-xl border border-navy-800">
            <table className="w-full">
              <thead>
                <tr className="border-b border-navy-800 bg-navy-900">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-navy-400">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-navy-400">Priority</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-navy-400">Target Response</th>
                </tr>
              </thead>
              <tbody>
                {triageCategories.map((row) => (
                  <tr key={row.category} className="border-b border-navy-800/50 last:border-0">
                    <td className="px-4 py-3 text-sm text-navy-300">{row.category}</td>
                    <td className={`px-4 py-3 text-sm font-medium ${row.color}`}>{row.priority}</td>
                    <td className="px-4 py-3 text-sm text-navy-400">{row.response}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
