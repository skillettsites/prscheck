"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";

const kpis = [
  { label: "Compliance Rate", value: 73, suffix: "%", color: "text-accent-400" },
  { label: "Active Cases", value: 234, suffix: "", color: "text-navy-100" },
  { label: "Avg. Response", value: 4.2, suffix: " days", color: "text-navy-100", decimals: 1 },
  { label: "Penalties Issued", value: 1.2, suffix: "M", prefix: "\u00a3", color: "text-emerald-400", decimals: 1 },
];

const wards = [
  { name: "Hackney Central", value: 87 },
  { name: "Dalston", value: 72 },
  { name: "Homerton", value: 64 },
  { name: "Stoke Newington", value: 91 },
  { name: "Clapton", value: 56 },
  { name: "Hoxton", value: 78 },
  { name: "De Beauvoir", value: 83 },
  { name: "Shacklewell", value: 69 },
];

const trendPoints = [
  { month: "Sep", value: 58 },
  { month: "Oct", value: 62 },
  { month: "Nov", value: 59 },
  { month: "Dec", value: 65 },
  { month: "Jan", value: 68 },
  { month: "Feb", value: 71 },
  { month: "Mar", value: 73 },
];

function AnimatedKPI({
  label,
  value,
  suffix,
  prefix,
  color,
  decimals = 0,
  delay,
  isInView,
}: {
  label: string;
  value: number;
  suffix: string;
  prefix?: string;
  color: string;
  decimals?: number;
  delay: number;
  isInView: boolean;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const duration = 1.5;
    let start = 0;
    const increment = value / (duration * 60);
    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(decimals > 0 ? parseFloat(start.toFixed(decimals)) : Math.floor(start));
      }
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [isInView, value, decimals]);

  return (
    <motion.div
      className="rounded-xl border border-navy-800 bg-navy-800/40 p-4"
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
    >
      <p className="text-[11px] font-medium text-navy-500">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${color}`}>
        {prefix || ""}{decimals > 0 ? count.toFixed(decimals) : count.toLocaleString()}{suffix}
      </p>
    </motion.div>
  );
}

export default function ReportingMockup() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  const maxBarValue = Math.max(...wards.map((w) => w.value));

  // Build SVG path for trend line
  const trendMax = Math.max(...trendPoints.map((t) => t.value));
  const trendMin = Math.min(...trendPoints.map((t) => t.value));
  const svgWidth = 280;
  const svgHeight = 80;
  const padding = 8;
  const pathPoints = trendPoints.map((point, i) => {
    const x = padding + (i / (trendPoints.length - 1)) * (svgWidth - padding * 2);
    const y = svgHeight - padding - ((point.value - trendMin) / (trendMax - trendMin)) * (svgHeight - padding * 2);
    return `${x},${y}`;
  });
  const linePath = `M ${pathPoints.join(" L ")}`;
  const areaPath = `${linePath} L ${padding + svgWidth - padding * 2},${svgHeight - padding} L ${padding},${svgHeight - padding} Z`;

  return (
    <div ref={containerRef} className="overflow-hidden rounded-2xl border border-navy-800 bg-navy-900 shadow-2xl">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-navy-800 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20">
            <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-navy-100">Reporting Dashboard</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-navy-800 px-3 py-1 text-[11px] text-navy-400">Last 30 days</span>
          <button className="rounded-lg border border-navy-700 px-3 py-1.5 text-[11px] font-medium text-navy-300 transition-colors hover:bg-navy-800">
            Export
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-3 p-5 lg:grid-cols-4">
        {kpis.map((kpi, i) => (
          <AnimatedKPI
            key={kpi.label}
            label={kpi.label}
            value={kpi.value}
            suffix={kpi.suffix}
            prefix={kpi.prefix}
            color={kpi.color}
            decimals={kpi.decimals}
            delay={0.1 + i * 0.12}
            isInView={isInView}
          />
        ))}
      </div>

      {/* Charts row */}
      <div className="flex flex-col gap-4 border-t border-navy-800 p-5 lg:flex-row">
        {/* Bar chart */}
        <div className="flex-1">
          <p className="mb-3 text-xs font-semibold text-navy-300">Compliance by Ward</p>
          <div className="flex items-end gap-2" style={{ height: 160 }}>
            {wards.map((ward, i) => {
              const heightPercent = (ward.value / maxBarValue) * 100;
              return (
                <div key={ward.name} className="flex flex-1 flex-col items-center gap-1">
                  <motion.div
                    className="w-full rounded-t-md bg-gradient-to-t from-accent-600/80 to-accent-400/80"
                    style={{ minWidth: 12 }}
                    initial={{ height: 0 }}
                    animate={isInView ? { height: `${heightPercent}%` } : { height: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 + i * 0.1, ease: "easeOut" }}
                  />
                  <motion.span
                    className="text-[8px] leading-tight text-navy-500 sm:text-[9px]"
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                    transition={{ duration: 0.3, delay: 1.0 + i * 0.1 }}
                  >
                    {ward.name.split(" ")[0]}
                  </motion.span>
                  <motion.span
                    className="text-[9px] font-medium text-navy-300"
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                    transition={{ duration: 0.3, delay: 1.0 + i * 0.1 }}
                  >
                    {ward.value}%
                  </motion.span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Line chart / trend */}
        <div className="flex-1">
          <p className="mb-3 text-xs font-semibold text-navy-300">Compliance Trend</p>
          <div className="relative rounded-xl border border-navy-800 bg-navy-800/30 p-4">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full"
              preserveAspectRatio="none"
            >
              {/* Grid lines */}
              {[0.25, 0.5, 0.75].map((ratio) => (
                <line
                  key={ratio}
                  x1={padding}
                  y1={padding + ratio * (svgHeight - padding * 2)}
                  x2={svgWidth - padding}
                  y2={padding + ratio * (svgHeight - padding * 2)}
                  stroke="rgba(51,65,85,0.3)"
                  strokeWidth="0.5"
                />
              ))}

              {/* Area fill */}
              <motion.path
                d={areaPath}
                fill="url(#areaGradient)"
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                transition={{ duration: 1, delay: 1.5 }}
              />

              {/* Line */}
              <motion.path
                d={linePath}
                fill="none"
                stroke="#60a5fa"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={isInView ? { pathLength: 1 } : { pathLength: 0 }}
                transition={{ duration: 1.5, delay: 1.2, ease: "easeOut" }}
              />

              {/* Dots */}
              {trendPoints.map((point, i) => {
                const x = padding + (i / (trendPoints.length - 1)) * (svgWidth - padding * 2);
                const y = svgHeight - padding - ((point.value - trendMin) / (trendMax - trendMin)) * (svgHeight - padding * 2);
                return (
                  <motion.circle
                    key={point.month}
                    cx={x}
                    cy={y}
                    r="3"
                    fill="#0f172a"
                    stroke="#60a5fa"
                    strokeWidth="1.5"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
                    transition={{ duration: 0.3, delay: 1.4 + i * 0.1 }}
                  />
                );
              })}

              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#60a5fa" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>

            {/* Month labels */}
            <div className="mt-1 flex justify-between px-1">
              {trendPoints.map((point) => (
                <span key={point.month} className="text-[9px] text-navy-500">{point.month}</span>
              ))}
            </div>

            {/* Trend indicator */}
            <motion.div
              className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.4, delay: 2.2 }}
            >
              <svg className="h-3 w-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
              </svg>
              <span className="text-[10px] font-medium text-emerald-400">+15% YoY</span>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
