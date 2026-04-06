"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";

const properties = [
  { address: "14 Elm Grove, Camden NW1 8HJ", epc: "pass", gas: "pass", eicr: "pass", deposit: "pass", status: "Compliant" },
  { address: "47 Victoria Road, Hackney E8 4PL", epc: "fail", gas: "pass", eicr: "fail", deposit: "pass", status: "Non-Compliant" },
  { address: "8 Birch Lane, Islington N1 2RF", epc: "pass", gas: "warn", eicr: "pass", deposit: "pass", status: "Attention" },
  { address: "22 Maple Street, Tower Hamlets E3 5NQ", epc: "pass", gas: "pass", eicr: "pass", deposit: "pass", status: "Compliant" },
  { address: "91 Oak Terrace, Lambeth SW9 7DX", epc: "fail", gas: "fail", eicr: "warn", deposit: "fail", status: "Non-Compliant" },
  { address: "3 Cedar Close, Southwark SE1 4BG", epc: "pass", gas: "pass", eicr: "pass", deposit: "warn", status: "Attention" },
];

function Badge({ type }: { type: string }) {
  const styles: Record<string, string> = {
    pass: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    fail: "bg-red-500/15 text-red-400 border-red-500/30",
    warn: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  };
  const labels: Record<string, string> = { pass: "Valid", fail: "Missing", warn: "Expiring" };
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${styles[type]}`}>
      {labels[type]}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Compliant: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    "Non-Compliant": "bg-red-500/15 text-red-400 border-red-500/30",
    Attention: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${styles[status]}`}>
      {status}
    </span>
  );
}

function AnimatedCounter({ target, duration = 2 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const increment = target / (duration * 60);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [isInView, target, duration]);

  return <span ref={ref}>{count.toLocaleString()}</span>;
}

function AnimatedProgress({ targetWidth, delay = 0.5 }: { targetWidth: number; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  return (
    <div ref={ref} className="h-2.5 w-full overflow-hidden rounded-full bg-navy-800">
      <motion.div
        className="h-full rounded-full bg-gradient-to-r from-accent-600 to-accent-400"
        initial={{ width: 0 }}
        animate={isInView ? { width: `${targetWidth}%` } : { width: 0 }}
        transition={{ duration: 1.2, delay, ease: "easeOut" }}
      />
    </div>
  );
}

export default function ComplianceScreeningMockup() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12 },
    },
  };

  const rowVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
  };

  return (
    <div ref={containerRef} className="overflow-hidden rounded-2xl border border-navy-800 bg-navy-900 shadow-2xl">
      {/* Top bar */}
      <div className="flex flex-col gap-4 border-b border-navy-800 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-600/20">
            <svg className="h-4 w-4 text-accent-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-navy-100">Compliance Screening</h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-navy-800 px-3 py-1 text-[11px] text-navy-400">Last scan: 2 hours ago</span>
          <button className="rounded-lg bg-accent-600 px-3.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-accent-500">
            Run Scan
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 gap-4 border-b border-navy-800 px-5 py-4 sm:grid-cols-2">
        <div>
          <p className="text-xs text-navy-500">Properties Screened</p>
          <p className="mt-1 text-2xl font-bold text-navy-100">
            <AnimatedCounter target={12847} duration={2} />
          </p>
        </div>
        <div>
          <p className="text-xs text-navy-500">Compliance Rate</p>
          <div className="mt-1 flex items-center gap-3">
            <span className="text-2xl font-bold text-navy-100">73%</span>
            <div className="flex-1">
              <AnimatedProgress targetWidth={73} delay={0.8} />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead>
            <tr className="border-b border-navy-800 text-left">
              <th className="px-5 py-3 text-[11px] font-medium uppercase tracking-wider text-navy-500">Address</th>
              <th className="px-3 py-3 text-[11px] font-medium uppercase tracking-wider text-navy-500">EPC</th>
              <th className="hidden px-3 py-3 text-[11px] font-medium uppercase tracking-wider text-navy-500 sm:table-cell">Gas Safety</th>
              <th className="hidden px-3 py-3 text-[11px] font-medium uppercase tracking-wider text-navy-500 md:table-cell">EICR</th>
              <th className="hidden px-3 py-3 text-[11px] font-medium uppercase tracking-wider text-navy-500 md:table-cell">Deposit</th>
              <th className="px-3 py-3 text-[11px] font-medium uppercase tracking-wider text-navy-500">Status</th>
            </tr>
          </thead>
          <motion.tbody
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
          >
            {properties.map((prop) => (
              <motion.tr
                key={prop.address}
                variants={rowVariants}
                className="border-b border-navy-800/50 transition-colors hover:bg-navy-800/30"
              >
                <td className="px-5 py-3 text-sm text-navy-200">{prop.address}</td>
                <td className="px-3 py-3"><Badge type={prop.epc} /></td>
                <td className="hidden px-3 py-3 sm:table-cell"><Badge type={prop.gas} /></td>
                <td className="hidden px-3 py-3 md:table-cell"><Badge type={prop.eicr} /></td>
                <td className="hidden px-3 py-3 md:table-cell"><Badge type={prop.deposit} /></td>
                <td className="px-3 py-3"><StatusBadge status={prop.status} /></td>
              </motion.tr>
            ))}
          </motion.tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-5 py-3">
        <span className="text-[11px] text-navy-500">Showing 6 of 12,847 properties</span>
        <div className="flex gap-1">
          {[1, 2, 3].map((n) => (
            <button
              key={n}
              className={`flex h-7 w-7 items-center justify-center rounded text-xs ${
                n === 1
                  ? "bg-accent-600 text-white"
                  : "text-navy-400 hover:bg-navy-800"
              }`}
            >
              {n}
            </button>
          ))}
          <span className="flex h-7 items-center px-1 text-xs text-navy-500">...</span>
        </div>
      </div>
    </div>
  );
}
