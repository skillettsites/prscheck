"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

interface CaseCard {
  address: string;
  issue: string;
  issueColor: string;
  days: number;
}

const columns: { title: string; count: number; cards: CaseCard[] }[] = [
  {
    title: "Investigation",
    count: 8,
    cards: [
      { address: "47 Victoria Rd, E8", issue: "Unlicensed HMO", issueColor: "red", days: 12 },
      { address: "8 Birch Lane, N1", issue: "Damp & Mould", issueColor: "amber", days: 8 },
    ],
  },
  {
    title: "Notice Issued",
    count: 5,
    cards: [
      { address: "91 Oak Terrace, SW9", issue: "No Gas Cert", issueColor: "red", days: 22 },
      { address: "15 Park Row, SE5", issue: "Fire Safety", issueColor: "red", days: 18 },
    ],
  },
  {
    title: "Response",
    count: 3,
    cards: [
      { address: "3 Cedar Close, SE1", issue: "EPC Expired", issueColor: "amber", days: 34 },
    ],
  },
  {
    title: "Resolved",
    count: 12,
    cards: [
      { address: "22 Maple St, E3", issue: "Deposit Protected", issueColor: "green", days: 45 },
      { address: "6 Ash Drive, N7", issue: "EICR Renewed", issueColor: "green", days: 52 },
    ],
  },
];

const issueColors: Record<string, string> = {
  red: "border-red-500/30 bg-red-500/15 text-red-400",
  amber: "border-amber-500/30 bg-amber-500/15 text-amber-400",
  green: "border-emerald-500/30 bg-emerald-500/15 text-emerald-400",
};

const columnHeaderColors: Record<string, string> = {
  Investigation: "bg-accent-500",
  "Notice Issued": "bg-amber-500",
  Response: "bg-purple-500",
  Resolved: "bg-emerald-500",
};

export default function EnforcementPipelineMockup() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  return (
    <div ref={containerRef} className="overflow-hidden rounded-2xl border border-navy-800 bg-navy-900 shadow-2xl">
      {/* Top bar */}
      <div className="flex flex-col gap-3 border-b border-navy-800 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/20">
            <svg className="h-4 w-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-navy-100">Enforcement Pipeline</h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-navy-400">Total active cases:</span>
          <motion.span
            className="text-lg font-bold text-navy-100"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            28
          </motion.span>
        </div>
      </div>

      {/* Kanban board */}
      <div className="overflow-x-auto p-4">
        <div className="flex min-w-[700px] gap-3">
          {columns.map((col, colIdx) => (
            <motion.div
              key={col.title}
              className="flex-1 rounded-xl bg-navy-800/40 p-3"
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.5, delay: colIdx * 0.12, ease: "easeOut" }}
            >
              {/* Column header */}
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${columnHeaderColors[col.title]}`} />
                  <span className="text-xs font-semibold text-navy-200">{col.title}</span>
                </div>
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-navy-700 text-[10px] font-medium text-navy-300">
                  {col.count}
                </span>
              </div>

              {/* Cards */}
              <div className="space-y-2">
                {col.cards.map((card, cardIdx) => {
                  const isMovingCard = colIdx === 0 && cardIdx === 0;
                  return (
                    <motion.div
                      key={card.address}
                      className="rounded-lg border border-navy-700/50 bg-navy-900/80 p-3"
                      initial={{ opacity: 0, x: -20 }}
                      animate={
                        isInView
                          ? isMovingCard
                            ? { opacity: 1, x: [0, 0, 20, 20], transition: { duration: 3, delay: 2, times: [0, 0.6, 0.8, 1] } }
                            : { opacity: 1, x: 0 }
                          : { opacity: 0, x: -20 }
                      }
                      transition={!isMovingCard ? { duration: 0.4, delay: 0.4 + colIdx * 0.15 + cardIdx * 0.1, ease: "easeOut" } : undefined}
                    >
                      <p className="text-xs font-medium text-navy-200">{card.address}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${issueColors[card.issueColor]}`}>
                          {card.issue}
                        </span>
                        <span className="text-[10px] text-navy-500">{card.days}d</span>
                      </div>
                    </motion.div>
                  );
                })}

                {/* Placeholder slots */}
                {Array.from({ length: Math.max(0, 2 - col.cards.length) }).map((_, i) => (
                  <div key={`placeholder-${i}`} className="rounded-lg border border-dashed border-navy-700/30 p-3">
                    <div className="h-2 w-3/4 rounded bg-navy-800/50" />
                    <div className="mt-2 h-2 w-1/2 rounded bg-navy-800/30" />
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer stats */}
      <div className="grid grid-cols-3 gap-px border-t border-navy-800 bg-navy-800">
        {[
          { label: "Avg. Resolution", value: "18 days" },
          { label: "Notices This Month", value: "14" },
          { label: "Penalty Compliance", value: "89%" },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            className="bg-navy-900 px-4 py-3 text-center"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.5, delay: 1.2 }}
          >
            <p className="text-[10px] text-navy-500">{stat.label}</p>
            <p className="mt-0.5 text-sm font-semibold text-navy-200">{stat.value}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
