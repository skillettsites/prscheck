"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";

// Animated platform overview showing the full PRSCheck workflow
export default function PlatformOverviewAnimation() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const timers: NodeJS.Timeout[] = [];
    // Auto-advance through steps
    timers.push(setTimeout(() => setStep(1), 600));   // Data flows in
    timers.push(setTimeout(() => setStep(2), 1800));  // Screening
    timers.push(setTimeout(() => setStep(3), 3000));  // Flags appear
    timers.push(setTimeout(() => setStep(4), 4200));  // Pipeline
    timers.push(setTimeout(() => setStep(5), 5400));  // Results
    return () => timers.forEach(clearTimeout);
  }, [isInView]);

  return (
    <div ref={ref} className="mx-auto max-w-5xl">
      {/* Main dashboard frame */}
      <motion.div
        className="rounded-2xl border border-navy-700 bg-navy-900 shadow-2xl shadow-navy-950/50 overflow-hidden"
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-navy-800 bg-navy-950 px-4 py-3 sm:px-6">
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

        {/* Dashboard content */}
        <div className="p-4 sm:p-6">
          {/* Step indicator */}
          <div className="mb-6 flex items-center justify-center gap-1 sm:gap-2">
            {["Data Ingestion", "Compliance Scan", "Risk Flagging", "Case Pipeline", "Results"].map((label, i) => (
              <div key={label} className="flex items-center gap-1 sm:gap-2">
                <motion.div
                  className={`flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full text-[10px] sm:text-xs font-bold transition-colors ${
                    step > i ? "bg-green-500 text-white" : step === i ? "bg-accent-500 text-white" : "bg-navy-800 text-navy-500"
                  }`}
                  animate={step === i ? { scale: [1, 1.15, 1] } : {}}
                  transition={{ duration: 0.4 }}
                >
                  {step > i ? "✓" : i + 1}
                </motion.div>
                {i < 4 && (
                  <motion.div
                    className="h-0.5 w-4 sm:w-8 rounded-full"
                    animate={{
                      backgroundColor: step > i ? "#10b981" : "#1e293b",
                    }}
                    transition={{ duration: 0.3 }}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Main content area */}
          <div className="relative min-h-[280px] sm:min-h-[320px]">
            {/* Step 1: Data flowing in */}
            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: step === 1 ? 1 : 0 }}
              transition={{ duration: 0.4 }}
            >
              <p className="mb-4 text-center text-xs font-medium uppercase tracking-wider text-accent-400">
                Connecting 15 Government Data Sources
              </p>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 sm:gap-3">
                {["EPC Register", "Police Crime", "Flood Risk", "Ofcom Broadband", "DfT Transport", "IMD Data", "CQC Healthcare", "GIAS Schools", "Council Tax", "Air Quality", "Planning Data", "ONS Census", "HMO Licences", "Deposit Schemes", "PRS Database"].map((source, i) => (
                  <motion.div
                    key={source}
                    className="flex items-center justify-center rounded-lg border border-navy-700 bg-navy-800 p-2 sm:p-3"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={step >= 1 ? { opacity: 1, scale: 1 } : {}}
                    transition={{ delay: i * 0.06, duration: 0.3 }}
                  >
                    <span className="text-[10px] sm:text-xs font-medium text-navy-300 text-center leading-tight">{source}</span>
                  </motion.div>
                ))}
              </div>
              <motion.p
                className="mt-4 text-center text-sm text-navy-500"
                initial={{ opacity: 0 }}
                animate={step >= 1 ? { opacity: 1 } : {}}
                transition={{ delay: 0.8 }}
              >
                All data aggregated in real-time, no manual imports
              </motion.p>
            </motion.div>

            {/* Step 2: Screening */}
            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: step === 2 ? 1 : 0 }}
              transition={{ duration: 0.4 }}
            >
              <p className="mb-4 text-center text-xs font-medium uppercase tracking-wider text-accent-400">
                Screening 12,847 Properties
              </p>
              <div className="space-y-2">
                {[
                  { addr: "47 Victoria Road, NW3", epc: "C", gas: true, eicr: true, dep: true, lic: false },
                  { addr: "12 Park Lane, SE1", epc: "E", gas: false, eicr: true, dep: true, lic: true },
                  { addr: "8 Queens Drive, E14", epc: "B", gas: true, eicr: false, dep: false, lic: true },
                  { addr: "301 High Street, N1", epc: "D", gas: true, eicr: true, dep: true, lic: true },
                  { addr: "15 Cobblestone Sq, E1W", epc: "B", gas: true, eicr: true, dep: true, lic: true },
                ].map((row, i) => (
                  <motion.div
                    key={row.addr}
                    className="flex items-center gap-2 sm:gap-4 rounded-lg border border-navy-800 bg-navy-800/50 px-3 py-2 sm:px-4 sm:py-2.5"
                    initial={{ opacity: 0, x: -20 }}
                    animate={step >= 2 ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: i * 0.12, duration: 0.3 }}
                  >
                    <span className="text-xs text-navy-300 truncate flex-1 min-w-0">{row.addr}</span>
                    <div className="flex gap-1 sm:gap-1.5 shrink-0">
                      <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${row.epc <= "C" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>{row.epc}</span>
                      <span className={`rounded px-1.5 py-0.5 text-[10px] ${row.gas ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>{row.gas ? "GAS" : "GAS"}</span>
                      <span className={`hidden sm:inline rounded px-1.5 py-0.5 text-[10px] ${row.eicr ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>EICR</span>
                      <span className={`hidden sm:inline rounded px-1.5 py-0.5 text-[10px] ${row.dep ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>DEP</span>
                      <span className={`rounded px-1.5 py-0.5 text-[10px] ${row.lic ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>LIC</span>
                    </div>
                  </motion.div>
                ))}
              </div>
              <motion.div
                className="mt-3 flex items-center justify-center gap-2"
                initial={{ opacity: 0 }}
                animate={step >= 2 ? { opacity: 1 } : {}}
                transition={{ delay: 0.6 }}
              >
                <div className="h-1.5 flex-1 max-w-xs rounded-full bg-navy-800 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-accent-500"
                    initial={{ width: "0%" }}
                    animate={step >= 2 ? { width: "100%" } : {}}
                    transition={{ duration: 1, ease: "easeInOut" }}
                  />
                </div>
                <span className="text-xs text-navy-500">Scanning...</span>
              </motion.div>
            </motion.div>

            {/* Step 3: Risk flags */}
            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: step === 3 ? 1 : 0 }}
              transition={{ duration: 0.4 }}
            >
              <p className="mb-4 text-center text-xs font-medium uppercase tracking-wider text-warning">
                1,927 Issues Flagged
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { label: "Expired Gas Certs", count: 342, color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
                  { label: "Unlicensed HMOs", count: 85, color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
                  { label: "EPC Below E", count: 156, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
                  { label: "Missing EICR", count: 234, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
                  { label: "Deposit Issues", count: 178, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
                  { label: "Overcrowding Risk", count: 67, color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
                  { label: "Damp Risk High", count: 445, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
                  { label: "Unregistered", count: 420, color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
                ].map((flag, i) => (
                  <motion.div
                    key={flag.label}
                    className={`rounded-xl border p-3 sm:p-4 ${flag.bg}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={step >= 3 ? { opacity: 1, scale: 1 } : {}}
                    transition={{ delay: i * 0.08, duration: 0.3 }}
                  >
                    <p className={`text-lg sm:text-2xl font-bold ${flag.color}`}>{flag.count}</p>
                    <p className="text-[10px] sm:text-xs text-navy-400 mt-1">{flag.label}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Step 4: Pipeline */}
            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: step === 4 ? 1 : 0 }}
              transition={{ duration: 0.4 }}
            >
              <p className="mb-4 text-center text-xs font-medium uppercase tracking-wider text-accent-400">
                Enforcement Pipeline
              </p>
              <div className="grid grid-cols-4 gap-2 sm:gap-3">
                {[
                  { stage: "Investigate", count: 45, items: ["47 Victoria Rd", "12 Park Lane", "8 Queens Dr"], color: "border-blue-500/30" },
                  { stage: "Notice", count: 23, items: ["301 High St", "15 Mill Lane"], color: "border-amber-500/30" },
                  { stage: "Response", count: 12, items: ["42 Oak Avenue"], color: "border-purple-500/30" },
                  { stage: "Resolved", count: 89, items: ["56 Elm Close", "99 The Green"], color: "border-green-500/30" },
                ].map((col, i) => (
                  <motion.div
                    key={col.stage}
                    className={`rounded-xl border bg-navy-800/30 p-2 sm:p-3 ${col.color}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={step >= 4 ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: i * 0.12, duration: 0.3 }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] sm:text-xs font-semibold text-navy-300">{col.stage}</span>
                      <span className="text-[10px] font-bold text-navy-500">{col.count}</span>
                    </div>
                    <div className="space-y-1">
                      {col.items.map((item, j) => (
                        <motion.div
                          key={item}
                          className="rounded bg-navy-800 px-2 py-1"
                          initial={{ opacity: 0, x: -10 }}
                          animate={step >= 4 ? { opacity: 1, x: 0 } : {}}
                          transition={{ delay: i * 0.12 + j * 0.08, duration: 0.2 }}
                        >
                          <span className="text-[9px] sm:text-[10px] text-navy-400">{item}</span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Step 5: Results */}
            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: step === 5 ? 1 : 0 }}
              transition={{ duration: 0.4 }}
            >
              <p className="mb-4 text-center text-xs font-medium uppercase tracking-wider text-green-400">
                Enforcement Outcomes
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
                {[
                  { label: "Properties Screened", value: "12,847", color: "text-accent-400" },
                  { label: "Non-Compliant Found", value: "1,927", color: "text-amber-400" },
                  { label: "Penalties Issued", value: "£2.1M", color: "text-green-400" },
                  { label: "Platform ROI", value: "61x", color: "text-accent-400" },
                ].map((metric, i) => (
                  <motion.div
                    key={metric.label}
                    className="rounded-xl border border-navy-700 bg-navy-800/50 p-3 sm:p-4 text-center"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={step >= 5 ? { opacity: 1, scale: 1 } : {}}
                    transition={{ delay: i * 0.1, duration: 0.4 }}
                  >
                    <motion.p
                      className={`text-xl sm:text-3xl font-bold ${metric.color}`}
                      initial={{ opacity: 0 }}
                      animate={step >= 5 ? { opacity: 1 } : {}}
                      transition={{ delay: i * 0.1 + 0.2, duration: 0.3 }}
                    >
                      {metric.value}
                    </motion.p>
                    <p className="mt-1 text-[10px] sm:text-xs text-navy-400">{metric.label}</p>
                  </motion.div>
                ))}
              </div>
              <motion.div
                className="mt-6 text-center"
                initial={{ opacity: 0 }}
                animate={step >= 5 ? { opacity: 1 } : {}}
                transition={{ delay: 0.6 }}
              >
                <p className="text-sm text-navy-400">
                  From data ingestion to enforcement outcomes, fully automated.
                </p>
              </motion.div>
            </motion.div>
          </div>

          {/* Replay button */}
          {step >= 5 && (
            <motion.div
              className="mt-4 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              <button
                onClick={() => { setStep(0); setTimeout(() => setStep(1), 300); }}
                className="inline-flex items-center gap-2 rounded-lg border border-navy-700 px-4 py-2 text-xs font-medium text-navy-400 transition-colors hover:border-navy-600 hover:text-navy-300 cursor-pointer"
              >
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                </svg>
                Replay
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
