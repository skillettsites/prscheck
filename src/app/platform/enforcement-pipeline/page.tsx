"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import RegisterInterestCTA from "@/components/RegisterInterestCTA";
// TODO: Import EnforcementPipelineMockup from @/components/mockups/ when available

const stages = [
  {
    name: "Triage",
    color: "bg-blue-500",
    description: "New cases are assessed, categorised, and assigned a priority score based on risk and severity.",
  },
  {
    name: "Investigation",
    color: "bg-yellow-500",
    description: "Officers gather evidence, conduct inspections, and document findings. All materials are attached to the case.",
  },
  {
    name: "Notice Served",
    color: "bg-orange-500",
    description: "Formal notices are issued with auto-generated templates, tracked deadlines, and service confirmation.",
  },
  {
    name: "Compliance Check",
    color: "bg-purple-500",
    description: "Follow-up inspections verify whether the landlord has met requirements within the notice period.",
  },
  {
    name: "Escalation",
    color: "bg-red-500",
    description: "Non-compliant cases escalate to civil penalties, prosecution referral, or rent repayment orders.",
  },
  {
    name: "Resolved",
    color: "bg-green-500",
    description: "Case closed with full outcome recorded. Data feeds into MHCLG reporting and team performance metrics.",
  },
];

const trackingFeatures = [
  "Kanban board with drag-and-drop case movement",
  "Automatic deadline tracking with reminders",
  "Full audit trail for every case action",
  "Evidence attachment and document management",
  "Team workload balancing and assignment",
  "Outcome recording for MHCLG reporting",
  "Bulk actions for similar cases",
  "Integration with email for landlord correspondence",
];

export default function EnforcementPipelinePage() {
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
              { "@type": "ListItem", position: 3, name: "Enforcement Pipeline", item: "https://prscheck.co.uk/platform/enforcement-pipeline" },
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
              From Complaint to Resolution
            </h1>
            <p className="mt-6 text-base text-navy-400 sm:text-xl">
              Track every enforcement case from initial report through investigation,
              notice, and resolution. No more spreadsheets. No more missed deadlines.
            </p>
          </div>
        </div>
      </section>

      {/* Mockup */}
      <section className="border-y border-navy-800 bg-navy-950 py-12 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Replace with <EnforcementPipelineMockup /> when component is ready */}
          <div className="mx-auto max-w-4xl rounded-2xl border border-navy-700 bg-navy-800/50 p-12 text-center">
            <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-xl bg-accent-600/10">
              <svg className="h-8 w-8 text-accent-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 6.878V6a2.25 2.25 0 012.25-2.25h7.5A2.25 2.25 0 0118 6v.878m-12 0c.235-.083.487-.128.75-.128h10.5c.263 0 .515.045.75.128m-12 0A2.25 2.25 0 004.5 9v.878m13.5-3A2.25 2.25 0 0119.5 9v.878m0 0a2.246 2.246 0 00-.75-.128H5.25c-.263 0-.515.045-.75.128m15 0A2.25 2.25 0 0121 12v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6c0-.98.626-1.813 1.5-2.122" />
              </svg>
            </div>
            <p className="mt-4 text-navy-400">Interactive enforcement pipeline demo coming soon</p>
          </div>
        </div>
      </section>

      {/* Pipeline Stages */}
      <section className="py-14 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-accent-500">Workflow</h2>
            <p className="mt-3 text-2xl font-bold text-navy-100 sm:text-3xl">Six Pipeline Stages</p>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {stages.map((stage, i) => (
              <motion.div
                key={stage.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className="rounded-xl border border-navy-800 bg-navy-800/30 p-5 sm:p-6"
              >
                <div className="flex items-center gap-3">
                  <div className={`h-3 w-3 rounded-full ${stage.color}`} />
                  <h3 className="text-base font-semibold text-navy-100">{stage.name}</h3>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-navy-400">{stage.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Case Tracking Features */}
      <section className="border-y border-navy-800 bg-navy-950 py-14 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <div className="text-center">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-accent-500">Features</h2>
              <p className="mt-3 text-2xl font-bold text-navy-100 sm:text-3xl">Case Tracking Capabilities</p>
            </div>
            <ul className="mt-10 grid gap-3 sm:grid-cols-2">
              {trackingFeatures.map((feature) => (
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
