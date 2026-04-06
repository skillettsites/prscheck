"use client";

import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";

const steps = [
  {
    title: "We connect to government data",
    description: "PRSCheck pulls data from 15 official sources automatically. EPC ratings, gas safety records, licensing databases, crime stats, and more. No manual imports, no spreadsheets.",
  },
  {
    title: "We screen every property in your borough",
    description: "Every PRS property is checked against compliance requirements. EPC rating, gas safety certificate, electrical safety, deposit protection, HMO licensing. All at once.",
  },
  {
    title: "We flag what needs your attention",
    description: "Non-compliant properties are ranked by risk. Your team sees exactly which properties to investigate first, with the evidence already attached.",
  },
  {
    title: "We manage your cases from start to finish",
    description: "Every enforcement case is tracked through investigation, notice, response, and resolution. No more cases lost in email inboxes.",
  },
  {
    title: "You see the results",
    description: "Compliance rates go up, penalty income funds your team, and you have the data to prove it to cabinet members and MHCLG.",
  },
];

export default function PlatformOverviewAnimation() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-30px" });
  const [step, setStep] = useState(-1);

  useEffect(() => {
    if (!isInView) return;
    const timers: NodeJS.Timeout[] = [];
    timers.push(setTimeout(() => setStep(0), 800));
    timers.push(setTimeout(() => setStep(1), 4000));
    timers.push(setTimeout(() => setStep(2), 7200));
    timers.push(setTimeout(() => setStep(3), 10400));
    timers.push(setTimeout(() => setStep(4), 13600));
    return () => timers.forEach(clearTimeout);
  }, [isInView]);

  const replay = () => {
    setStep(-1);
    const timers: NodeJS.Timeout[] = [];
    timers.push(setTimeout(() => setStep(0), 500));
    timers.push(setTimeout(() => setStep(1), 3700));
    timers.push(setTimeout(() => setStep(2), 6900));
    timers.push(setTimeout(() => setStep(3), 10100));
    timers.push(setTimeout(() => setStep(4), 13300));
  };

  return (
    <div ref={ref} className="mx-auto max-w-5xl">
      {/* Explanation text above dashboard */}
      <div className="mb-6 min-h-[80px] sm:min-h-[72px] text-center">
        <AnimatePresence mode="wait">
          {step >= 0 && (
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
            >
              <h3 className="text-lg sm:text-xl font-bold text-navy-100">
                {steps[step]?.title}
              </h3>
              <p className="mt-2 text-sm text-navy-400 max-w-2xl mx-auto">
                {steps[step]?.description}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Dashboard frame */}
      <motion.div
        className="rounded-2xl border border-navy-700 bg-navy-900 shadow-2xl shadow-navy-950/50 overflow-hidden"
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        {/* Window chrome */}
        <div className="flex items-center justify-between border-b border-navy-800 bg-navy-950 px-4 py-2.5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
              <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
              <div className="h-2.5 w-2.5 rounded-full bg-green-500/60" />
            </div>
            <span className="text-xs font-medium text-navy-500">PRSCheck Dashboard</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-navy-500">Live</span>
          </div>
        </div>

        {/* Dashboard sidebar + content */}
        <div className="flex">
          {/* Sidebar */}
          <div className="hidden sm:flex w-44 shrink-0 flex-col border-r border-navy-800 bg-navy-950/50 py-3">
            {[
              { label: "Overview", active: step === 4 },
              { label: "Properties", active: step === 1 },
              { label: "Compliance", active: step === 2 },
              { label: "Cases", active: step === 3 },
              { label: "HMO Detection", active: false },
              { label: "Reports", active: step === 4 },
              { label: "Settings", active: false },
            ].map((item) => (
              <div
                key={item.label}
                className={`px-4 py-2 text-xs font-medium transition-colors ${
                  item.active ? "bg-accent-600/10 text-accent-400 border-r-2 border-accent-500" : "text-navy-500"
                }`}
              >
                {item.label}
              </div>
            ))}
          </div>

          {/* Main content */}
          <div className="flex-1 p-4 sm:p-6 min-h-[300px] sm:min-h-[360px] relative">
            {/* Step 0: Data sources connecting */}
            <AnimatePresence>
              {step === 0 && (
                <motion.div
                  className="absolute inset-4 sm:inset-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-2 w-2 rounded-full bg-accent-500 animate-pulse" />
                    <span className="text-xs font-medium text-accent-400">Connecting data sources...</span>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {["EPC Register", "Police Crime", "Flood Risk", "Ofcom", "Transport", "IMD Data", "CQC Health", "Schools", "Council Tax", "Air Quality", "Planning", "Census", "HMO Licences", "Deposits", "PRS Database"].map((source, i) => (
                      <motion.div
                        key={source}
                        className="flex items-center justify-center rounded-lg border border-navy-700 bg-navy-800/50 p-2 sm:p-2.5"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.12, duration: 0.4 }}
                      >
                        <div className="text-center">
                          <motion.div
                            className="mx-auto mb-1 h-1.5 w-1.5 rounded-full"
                            initial={{ backgroundColor: "#475569" }}
                            animate={{ backgroundColor: "#10b981" }}
                            transition={{ delay: i * 0.12 + 0.3, duration: 0.3 }}
                          />
                          <span className="text-[9px] sm:text-[10px] font-medium text-navy-300 leading-tight block">{source}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  <motion.p
                    className="mt-4 text-center text-xs text-navy-500"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2 }}
                  >
                    15 sources connected. Data refreshed automatically.
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Step 1: Property screening table */}
            <AnimatePresence>
              {step === 1 && (
                <motion.div
                  className="absolute inset-4 sm:inset-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-navy-300">Property Compliance Screening</span>
                    <motion.span
                      className="text-xs text-accent-400"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.5 }}
                    >
                      12,847 properties scanned
                    </motion.span>
                  </div>
                  {/* Table header */}
                  <div className="grid grid-cols-6 gap-1 px-2 py-1.5 text-[9px] sm:text-[10px] font-semibold text-navy-500 uppercase tracking-wider border-b border-navy-800 mb-1">
                    <span className="col-span-2">Address</span>
                    <span className="text-center">EPC</span>
                    <span className="text-center">Gas</span>
                    <span className="text-center hidden sm:block">EICR</span>
                    <span className="text-center">Status</span>
                  </div>
                  {[
                    { addr: "47 Victoria Road, NW3", epc: "D", gas: false, eicr: true, status: "Non-Compliant" },
                    { addr: "12 Park Lane, SE1", epc: "E", gas: true, eicr: false, status: "Non-Compliant" },
                    { addr: "301 High Street, N1", epc: "C", gas: true, eicr: true, status: "Compliant" },
                    { addr: "8 Queens Drive, E14", epc: "B", gas: true, eicr: true, status: "Compliant" },
                    { addr: "15 Cobblestone Sq, E1W", epc: "A", gas: true, eicr: true, status: "Compliant" },
                    { addr: "22 Maple Avenue, SW4", epc: "F", gas: false, eicr: false, status: "Non-Compliant" },
                  ].map((row, i) => (
                    <motion.div
                      key={row.addr}
                      className="grid grid-cols-6 gap-1 items-center rounded px-2 py-2 text-[10px] sm:text-xs hover:bg-navy-800/30"
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.25, duration: 0.4 }}
                    >
                      <span className="col-span-2 text-navy-300 truncate">{row.addr}</span>
                      <span className={`text-center font-bold ${row.epc <= "C" ? "text-green-400" : "text-red-400"}`}>{row.epc}</span>
                      <span className="text-center">{row.gas ? <span className="text-green-400">✓</span> : <span className="text-red-400">✗</span>}</span>
                      <span className="text-center hidden sm:block">{row.eicr ? <span className="text-green-400">✓</span> : <span className="text-red-400">✗</span>}</span>
                      <span className={`text-center rounded-full px-1 py-0.5 text-[8px] sm:text-[9px] font-semibold ${
                        row.status === "Compliant" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
                      }`}>{row.status}</span>
                    </motion.div>
                  ))}
                  {/* Progress bar */}
                  <motion.div className="mt-3 flex items-center gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}>
                    <div className="h-1 flex-1 rounded-full bg-navy-800 overflow-hidden">
                      <motion.div className="h-full rounded-full bg-accent-500" initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 1.5, ease: "easeInOut" }} />
                    </div>
                    <span className="text-[10px] text-accent-400 shrink-0">Complete</span>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Step 2: Risk flags */}
            <AnimatePresence>
              {step === 2 && (
                <motion.div
                  className="absolute inset-4 sm:inset-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xs font-medium text-navy-300">Risk Summary</span>
                    <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold text-red-400">1,927 issues found</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
                    {[
                      { label: "Expired Gas Certs", count: 342, severity: "high" },
                      { label: "Unlicensed HMOs", count: 85, severity: "high" },
                      { label: "EPC Below Minimum", count: 156, severity: "medium" },
                      { label: "Missing EICR", count: 234, severity: "medium" },
                      { label: "Deposit Issues", count: 178, severity: "medium" },
                      { label: "Overcrowding Risk", count: 67, severity: "high" },
                      { label: "Damp/Mould Risk", count: 445, severity: "medium" },
                      { label: "Unregistered", count: 420, severity: "high" },
                    ].map((flag, i) => (
                      <motion.div
                        key={flag.label}
                        className={`rounded-lg border p-2.5 sm:p-3 ${
                          flag.severity === "high" ? "border-red-500/20 bg-red-500/5" : "border-amber-500/20 bg-amber-500/5"
                        }`}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.15, duration: 0.4 }}
                      >
                        <p className={`text-base sm:text-xl font-bold ${flag.severity === "high" ? "text-red-400" : "text-amber-400"}`}>
                          {flag.count}
                        </p>
                        <p className="text-[9px] sm:text-[10px] text-navy-400 mt-0.5 leading-tight">{flag.label}</p>
                      </motion.div>
                    ))}
                  </div>
                  <motion.p
                    className="mt-3 text-[10px] sm:text-xs text-navy-500 text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5 }}
                  >
                    Sorted by risk. Your team starts with the most serious issues.
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Step 3: Pipeline */}
            <AnimatePresence>
              {step === 3 && (
                <motion.div
                  className="absolute inset-4 sm:inset-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <span className="text-xs font-medium text-navy-300 mb-3 block">Enforcement Pipeline</span>
                  <div className="grid grid-cols-4 gap-1.5 sm:gap-2.5">
                    {[
                      { stage: "Investigate", count: 45, color: "border-blue-500/30", items: ["47 Victoria Rd", "22 Maple Ave", "12 Park Lane"] },
                      { stage: "Notice Issued", count: 23, color: "border-amber-500/30", items: ["301 High St", "15 Mill Lane"] },
                      { stage: "Response", count: 12, color: "border-purple-500/30", items: ["42 Oak Ave"] },
                      { stage: "Resolved", count: 89, color: "border-green-500/30", items: ["56 Elm Close", "99 The Green", "7 River Walk"] },
                    ].map((col, i) => (
                      <motion.div
                        key={col.stage}
                        className={`rounded-lg border bg-navy-800/20 p-2 sm:p-3 ${col.color}`}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.2, duration: 0.4 }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[9px] sm:text-[10px] font-semibold text-navy-300">{col.stage}</span>
                          <span className="text-[9px] sm:text-[10px] font-bold text-navy-500">{col.count}</span>
                        </div>
                        <div className="space-y-1">
                          {col.items.map((item, j) => (
                            <motion.div
                              key={item}
                              className="rounded bg-navy-800/60 px-1.5 py-1 sm:px-2 sm:py-1.5"
                              initial={{ opacity: 0, x: -8 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.2 + j * 0.15 + 0.3, duration: 0.3 }}
                            >
                              <span className="text-[8px] sm:text-[10px] text-navy-400">{item}</span>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  <motion.p
                    className="mt-3 text-[10px] sm:text-xs text-navy-500 text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5 }}
                  >
                    Every case tracked. Nothing falls through the cracks.
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Step 4: Results dashboard */}
            <AnimatePresence>
              {step === 4 && (
                <motion.div
                  className="absolute inset-4 sm:inset-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  {/* KPI row */}
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3 mb-4">
                    {[
                      { label: "Compliance Rate", value: "73%", change: "+12%", color: "text-green-400" },
                      { label: "Active Cases", value: "234", change: "", color: "text-accent-400" },
                      { label: "Penalties Issued", value: "£2.1M", change: "+340%", color: "text-green-400" },
                      { label: "Avg Response", value: "4.2 days", change: "-58%", color: "text-green-400" },
                    ].map((kpi, i) => (
                      <motion.div
                        key={kpi.label}
                        className="rounded-lg border border-navy-700 bg-navy-800/30 p-2.5 sm:p-3"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.15, duration: 0.4 }}
                      >
                        <p className="text-[9px] sm:text-[10px] text-navy-500 uppercase tracking-wider">{kpi.label}</p>
                        <div className="flex items-baseline gap-1.5 mt-1">
                          <span className={`text-base sm:text-xl font-bold ${kpi.color}`}>{kpi.value}</span>
                          {kpi.change && <span className="text-[9px] text-green-500">{kpi.change}</span>}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  {/* Bar chart */}
                  <div className="rounded-lg border border-navy-800 bg-navy-800/20 p-3">
                    <span className="text-[10px] font-medium text-navy-400 block mb-3">Compliance by Ward</span>
                    <div className="flex items-end gap-1.5 sm:gap-2 h-24 sm:h-32">
                      {[
                        { ward: "North", pct: 82 },
                        { ward: "Central", pct: 68 },
                        { ward: "East", pct: 75 },
                        { ward: "South", pct: 71 },
                        { ward: "West", pct: 85 },
                        { ward: "Riverside", pct: 62 },
                        { ward: "Park", pct: 78 },
                        { ward: "Hill", pct: 73 },
                      ].map((bar, i) => (
                        <div key={bar.ward} className="flex-1 flex flex-col items-center gap-1">
                          <motion.div
                            className={`w-full rounded-t ${bar.pct >= 75 ? "bg-green-500/60" : bar.pct >= 65 ? "bg-amber-500/60" : "bg-red-500/60"}`}
                            initial={{ height: 0 }}
                            animate={{ height: `${bar.pct}%` }}
                            transition={{ delay: i * 0.1 + 0.5, duration: 0.6, ease: "easeOut" }}
                          />
                          <span className="text-[7px] sm:text-[8px] text-navy-500 truncate w-full text-center">{bar.ward}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Placeholder while loading */}
            {step < 0 && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="mx-auto mb-3 h-8 w-8 rounded-full border-2 border-navy-700 border-t-accent-500 animate-spin" />
                  <p className="text-xs text-navy-500">Loading dashboard...</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom status bar */}
        <div className="flex items-center justify-between border-t border-navy-800 bg-navy-950 px-4 py-2 sm:px-6">
          <div className="flex items-center gap-4">
            <span className="text-[10px] text-navy-500">Borough: Tower Hamlets</span>
            <span className="text-[10px] text-navy-500">12,847 properties</span>
          </div>
          {step >= 4 && (
            <motion.button
              onClick={replay}
              className="inline-flex items-center gap-1.5 text-[10px] font-medium text-navy-400 transition-colors hover:text-navy-300 cursor-pointer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
            >
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
              </svg>
              Replay
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Step dots */}
      <div className="mt-4 flex justify-center gap-2">
        {steps.map((_, i) => (
          <button
            key={i}
            onClick={() => setStep(i)}
            className={`h-2 rounded-full transition-all cursor-pointer ${
              step === i ? "w-6 bg-accent-500" : step > i ? "w-2 bg-green-500/60" : "w-2 bg-navy-700"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
