"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const formFields = [
  { label: "Property Address", value: "47 Victoria Road, Hackney E8 4PL", type: "text" },
  { label: "Issue Type", value: "Damp & Mould", type: "select" },
  { label: "Severity", value: "High", type: "select" },
  { label: "Tenant Name", value: "Sarah Mitchell", type: "text" },
  { label: "Contact", value: "s.mitchell@email.com", type: "text" },
];

const complianceChecks = [
  { label: "EPC Rating", value: "D", color: "amber" },
  { label: "Gas Safety", value: "Expired", color: "red" },
  { label: "EICR", value: "Valid", color: "green" },
  { label: "Deposit", value: "Protected", color: "green" },
  { label: "HMO Licence", value: "Not Required", color: "green" },
];

const checkColors: Record<string, string> = {
  red: "border-red-500/30 bg-red-500/15 text-red-400",
  amber: "border-amber-500/30 bg-amber-500/15 text-amber-400",
  green: "border-emerald-500/30 bg-emerald-500/15 text-emerald-400",
};

export default function TenantComplaintMockup() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  return (
    <div ref={containerRef} className="overflow-hidden rounded-2xl border border-navy-800 bg-navy-900 shadow-2xl">
      {/* Top bar */}
      <div className="flex items-center gap-3 border-b border-navy-800 px-5 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/20">
          <svg className="h-4 w-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <h3 className="text-sm font-semibold text-navy-100">Tenant Complaint Intake</h3>
        <span className="ml-auto rounded-full bg-navy-800 px-3 py-1 text-[11px] text-navy-400">Auto-enrichment enabled</span>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* Left: Form */}
        <motion.div
          className="flex-1 border-b border-navy-800 p-5 lg:border-b-0 lg:border-r"
          initial={{ opacity: 0, x: -20 }}
          animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="mb-4 flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-accent-500" />
            <span className="text-xs font-semibold uppercase tracking-wider text-navy-400">New Complaint</span>
          </div>

          <div className="space-y-3">
            {formFields.map((field, i) => (
              <motion.div
                key={field.label}
                initial={{ opacity: 0, y: 10 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                transition={{ duration: 0.4, delay: 0.2 + i * 0.1, ease: "easeOut" }}
              >
                <label className="mb-1 block text-[11px] font-medium text-navy-500">{field.label}</label>
                <div className="flex items-center rounded-lg border border-navy-700 bg-navy-800/50 px-3 py-2">
                  <span className="text-xs text-navy-200">{field.value}</span>
                  {field.type === "select" && (
                    <svg className="ml-auto h-3 w-3 text-navy-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  )}
                </div>
              </motion.div>
            ))}

            <motion.button
              className="mt-2 w-full rounded-lg bg-accent-600 py-2.5 text-xs font-semibold text-white"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.4, delay: 0.8 }}
            >
              Submit Complaint
            </motion.button>
          </div>
        </motion.div>

        {/* Center: Arrow */}
        <motion.div
          className="hidden items-center justify-center px-2 lg:flex"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.5, delay: 1.0, ease: "easeOut" }}
        >
          <div className="flex flex-col items-center gap-1">
            <motion.div
              className="h-8 w-[2px] bg-gradient-to-b from-transparent to-accent-500/60"
              initial={{ scaleY: 0 }}
              animate={isInView ? { scaleY: 1 } : { scaleY: 0 }}
              transition={{ duration: 0.4, delay: 1.1 }}
              style={{ transformOrigin: "top" }}
            />
            <svg className="h-5 w-5 rotate-90 text-accent-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
            <span className="mt-1 text-[9px] font-medium uppercase tracking-wider text-accent-400/60">Auto-enrich</span>
            <motion.div
              className="h-8 w-[2px] bg-gradient-to-b from-accent-500/60 to-transparent"
              initial={{ scaleY: 0 }}
              animate={isInView ? { scaleY: 1 } : { scaleY: 0 }}
              transition={{ duration: 0.4, delay: 1.2 }}
              style={{ transformOrigin: "top" }}
            />
          </div>
        </motion.div>

        {/* Mobile arrow */}
        <motion.div
          className="flex items-center justify-center py-3 lg:hidden"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.4, delay: 1.0 }}
        >
          <svg className="h-5 w-5 rotate-90 text-accent-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </motion.div>

        {/* Right: Case card */}
        <motion.div
          className="flex-1 p-5"
          initial={{ opacity: 0, x: 30 }}
          animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
          transition={{ duration: 0.6, delay: 1.2, ease: "easeOut" }}
        >
          <div className="mb-4 flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span className="text-xs font-semibold uppercase tracking-wider text-navy-400">Structured Case</span>
            <span className="ml-auto rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-400">Auto-generated</span>
          </div>

          <div className="rounded-xl border border-navy-700/50 bg-navy-800/30 p-4">
            {/* Case header */}
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[10px] font-medium text-navy-500">CASE-2024-0847</span>
              <span className="rounded-full border border-red-500/30 bg-red-500/15 px-2 py-0.5 text-[10px] font-medium text-red-400">High Priority</span>
            </div>

            <p className="text-sm font-medium text-navy-100">47 Victoria Road, Hackney E8 4PL</p>
            <p className="mt-1 text-xs text-navy-400">Damp & Mould, reported by tenant</p>

            {/* Compliance checks */}
            <div className="mt-4 space-y-1.5">
              {complianceChecks.map((check, i) => (
                <motion.div
                  key={check.label}
                  className="flex items-center justify-between"
                  initial={{ opacity: 0, x: 10 }}
                  animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 10 }}
                  transition={{ duration: 0.3, delay: 1.5 + i * 0.08, ease: "easeOut" }}
                >
                  <span className="text-[11px] text-navy-400">{check.label}</span>
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${checkColors[check.color]}`}>
                    {check.value}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* Property intel */}
            <div className="mt-4 grid grid-cols-2 gap-2 border-t border-navy-700/50 pt-3">
              <div>
                <p className="text-[10px] text-navy-500">Council Tax Band</p>
                <p className="text-xs font-medium text-navy-200">Band D</p>
              </div>
              <div>
                <p className="text-[10px] text-navy-500">Crime Level</p>
                <p className="text-xs font-medium text-amber-400">Medium</p>
              </div>
            </div>

            {/* Assignment */}
            <motion.div
              className="mt-3 rounded-lg bg-accent-600/10 px-3 py-2"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.4, delay: 2.0 }}
            >
              <div className="flex items-center gap-2">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-accent-600/30 text-[10px] font-bold text-accent-400">3</div>
                <span className="text-[11px] font-medium text-accent-300">Auto-assigned to: Enforcement Team 3</span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
