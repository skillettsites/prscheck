"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const pins = [
  { x: "22%", y: "35%", address: "47 Victoria Road", risk: "High", delay: 0.3 },
  { x: "58%", y: "20%", address: "12 Pemberton Close", risk: "High", delay: 0.5 },
  { x: "75%", y: "55%", address: "8 Greenmount Lane", risk: "Medium", delay: 0.7 },
  { x: "40%", y: "65%", address: "91 Station Road", risk: "High", delay: 0.9 },
  { x: "65%", y: "78%", address: "3 Devonshire Place", risk: "Medium", delay: 1.1 },
];

const detections = [
  { address: "47 Victoria Road, E8 4PL", risk: "High", signals: "Council tax mismatch, Multiple EPCs" },
  { address: "12 Pemberton Close, N1 3TQ", risk: "High", signals: "No HMO licence, 6 council tax names" },
  { address: "91 Station Road, SE15 2NX", risk: "High", signals: "Planning breach, Multiple EPCs" },
  { address: "3 Devonshire Place, SW4 8AZ", risk: "Medium", signals: "Council tax mismatch" },
];

const signals = [
  "Council tax mismatch",
  "Multiple EPCs at address",
  "No HMO licence on record",
  "Planning use class breach",
];

export default function HMODetectionMockup() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  return (
    <div ref={containerRef} className="overflow-hidden rounded-2xl border border-navy-800 bg-navy-900 shadow-2xl">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-navy-800 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20">
            <svg className="h-4 w-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-navy-100">HMO Detection Scanner</h3>
        </div>
        <span className="rounded-full bg-amber-500/15 px-3 py-1 text-[11px] font-medium text-amber-400">34 suspected unlicensed HMOs</span>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* Map area */}
        <div className="relative min-h-[320px] flex-1 overflow-hidden border-b border-navy-800 lg:border-b-0 lg:border-r">
          {/* Grid pattern to suggest a map */}
          <div className="absolute inset-0 opacity-30" style={{
            backgroundImage: "linear-gradient(rgba(96, 165, 250, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(96, 165, 250, 0.08) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }} />
          {/* Faux roads */}
          <div className="absolute left-0 right-0 top-[45%] h-[1px] bg-navy-700/60" />
          <div className="absolute bottom-0 left-[35%] top-0 w-[1px] bg-navy-700/60" />
          <div className="absolute bottom-0 left-[70%] top-0 w-[1px] bg-navy-700/40" />
          <div className="absolute left-0 right-0 top-[25%] h-[1px] bg-navy-700/40" />
          <div className="absolute left-0 right-0 top-[70%] h-[1px] bg-navy-700/30" />
          {/* Curved road */}
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 320" fill="none">
            <path d="M50 280 Q200 100 380 200" stroke="rgba(51,65,85,0.4)" strokeWidth="1" fill="none" />
          </svg>

          {/* Area labels */}
          <span className="absolute left-[12%] top-[15%] text-[10px] font-medium uppercase tracking-widest text-navy-600">Hackney</span>
          <span className="absolute right-[15%] top-[40%] text-[10px] font-medium uppercase tracking-widest text-navy-600">Islington</span>
          <span className="absolute bottom-[18%] left-[45%] text-[10px] font-medium uppercase tracking-widest text-navy-600">Southwark</span>

          {/* Pins */}
          {pins.map((pin, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{ left: pin.x, top: pin.y }}
              initial={{ scale: 0, opacity: 0 }}
              animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
              transition={{ duration: 0.4, delay: pin.delay, ease: "backOut" }}
            >
              {/* Pulse ring */}
              <motion.div
                className="absolute -inset-3 rounded-full bg-red-500/20"
                animate={isInView ? { scale: [1, 1.8, 1], opacity: [0.4, 0, 0.4] } : {}}
                transition={{ duration: 2, repeat: Infinity, delay: pin.delay + 0.5 }}
              />
              {/* Pin dot */}
              <div className={`relative h-3 w-3 rounded-full border-2 border-white/80 shadow-lg ${
                pin.risk === "High" ? "bg-red-500" : "bg-amber-500"
              }`} />
              {/* Tooltip */}
              <motion.div
                className="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-navy-800 px-2.5 py-1.5 text-[10px] text-navy-200 shadow-lg"
                initial={{ opacity: 0, y: 4 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 4 }}
                transition={{ duration: 0.3, delay: pin.delay + 0.3 }}
              >
                <span className="font-medium">{pin.address}</span>
                <span className="ml-1.5 text-navy-500">Suspected unlicensed HMO</span>
                <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-navy-800" />
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Side panel */}
        <motion.div
          className="w-full shrink-0 lg:w-[320px]"
          initial={{ x: 40, opacity: 0 }}
          animate={isInView ? { x: 0, opacity: 1 } : { x: 40, opacity: 0 }}
          transition={{ duration: 0.6, delay: 0.8, ease: "easeOut" }}
        >
          <div className="border-b border-navy-800 px-5 py-4">
            <p className="text-xs text-navy-500">Detection Results</p>
            <p className="mt-1 text-lg font-bold text-navy-100">34 suspected unlicensed HMOs</p>
            <p className="mt-0.5 text-xs text-navy-400">Estimated penalty income: <span className="font-semibold text-emerald-400">£578,000</span></p>
          </div>

          <div className="divide-y divide-navy-800/50">
            {detections.map((d, i) => (
              <motion.div
                key={i}
                className="px-5 py-3"
                initial={{ opacity: 0, x: 20 }}
                animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
                transition={{ duration: 0.4, delay: 1.0 + i * 0.12, ease: "easeOut" }}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-medium text-navy-200">{d.address}</p>
                  <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                    d.risk === "High"
                      ? "border-red-500/30 bg-red-500/15 text-red-400"
                      : "border-amber-500/30 bg-amber-500/15 text-amber-400"
                  }`}>
                    {d.risk}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-navy-500">{d.signals}</p>
              </motion.div>
            ))}
          </div>

          {/* Detection signals */}
          <motion.div
            className="border-t border-navy-800 px-5 py-4"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.5, delay: 1.6 }}
          >
            <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-navy-500">Detection Signals</p>
            <div className="flex flex-wrap gap-1.5">
              {signals.map((s) => (
                <span key={s} className="rounded-full border border-accent-500/30 bg-accent-500/10 px-2.5 py-0.5 text-[10px] font-medium text-accent-400">
                  {s}
                </span>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
