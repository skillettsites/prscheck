"use client";

import { useState } from "react";
import RegisterInterestCTA from "@/components/RegisterInterestCTA";

const wards = [
  { name: "Brixton Hill", properties: 2340, compliant: 78, highRisk: 45, activeCases: 12 },
  { name: "Coldharbour", properties: 1890, compliant: 65, highRisk: 89, activeCases: 23 },
  { name: "Herne Hill", properties: 1560, compliant: 82, highRisk: 28, activeCases: 7 },
  { name: "Streatham Wells", properties: 2100, compliant: 71, highRisk: 62, activeCases: 18 },
  { name: "Tulse Hill", properties: 1780, compliant: 74, highRisk: 51, activeCases: 14 },
  { name: "Thornton", properties: 1420, compliant: 86, highRisk: 19, activeCases: 4 },
];

const alerts = [
  { type: "danger", message: "23 properties with expired gas safety certificates in Coldharbour ward", time: "2 hours ago" },
  { type: "warning", message: "Selective licensing renewal deadline approaching for 145 properties", time: "5 hours ago" },
  { type: "info", message: "PRS Database sync completed: 11,090 properties updated", time: "1 day ago" },
  { type: "success", message: "Civil penalty notice issued: 14 Acre Lane, Brixton (Category 1 hazard)", time: "2 days ago" },
];

const pipelineStages = [
  {
    name: "New Reports",
    count: 8,
    items: [
      { address: "42 Railton Road", type: "Damp & Mould", priority: "High" },
      { address: "7 Tulse Hill", type: "No Gas Cert", priority: "Critical" },
      { address: "189 Brixton Road", type: "Overcrowding", priority: "Medium" },
    ],
  },
  {
    name: "Under Investigation",
    count: 12,
    items: [
      { address: "15 Coldharbour Lane", type: "Unlicensed HMO", priority: "Critical" },
      { address: "88 Acre Lane", type: "Category 1 Hazard", priority: "High" },
      { address: "23 Effra Road", type: "No EPC", priority: "Medium" },
    ],
  },
  {
    name: "Pending Action",
    count: 5,
    items: [
      { address: "61 Brixton Hill", type: "Civil Penalty", priority: "High" },
      { address: "34 Streatham Place", type: "Improvement Notice", priority: "Medium" },
    ],
  },
  {
    name: "Resolved",
    count: 34,
    items: [
      { address: "12 Dulwich Road", type: "Licence Granted", priority: "Complete" },
      { address: "99 Norwood Road", type: "Penalty Paid", priority: "Complete" },
    ],
  },
];

function getPriorityColor(priority: string) {
  switch (priority) {
    case "Critical": return "bg-red-500/20 text-red-400";
    case "High": return "bg-orange-500/20 text-orange-400";
    case "Medium": return "bg-yellow-500/20 text-yellow-400";
    case "Complete": return "bg-green-500/20 text-green-400";
    default: return "bg-navy-700 text-navy-400";
  }
}

function getAlertColor(type: string) {
  switch (type) {
    case "danger": return "border-red-800/50 bg-red-900/20";
    case "warning": return "border-yellow-800/50 bg-yellow-900/20";
    case "success": return "border-green-800/50 bg-green-900/20";
    default: return "border-blue-800/50 bg-blue-900/20";
  }
}

export default function DemoPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "pipeline" | "alerts">("overview");

  const totalProperties = wards.reduce((sum, w) => sum + w.properties, 0);
  const avgCompliance = Math.round(wards.reduce((sum, w) => sum + w.compliant, 0) / wards.length);
  const totalHighRisk = wards.reduce((sum, w) => sum + w.highRisk, 0);
  const totalActiveCases = wards.reduce((sum, w) => sum + w.activeCases, 0);

  return (
    <>
      {/* Header */}
      <section className="bg-gradient-to-b from-navy-950 to-navy-900 py-20">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-navy-100 sm:text-5xl">
            See PRSCheck in Action
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-navy-400">
            Interactive demo using sample data from a fictional London borough.
            This is what your team would see on day one.
          </p>
        </div>
      </section>

      {/* Dashboard Demo */}
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Top Stats */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-navy-800 bg-navy-800/30 p-5">
              <p className="text-xs font-medium uppercase tracking-wider text-navy-500">Total PRS Properties</p>
              <p className="mt-2 text-2xl font-bold text-navy-100">{totalProperties.toLocaleString()}</p>
            </div>
            <div className="rounded-xl border border-navy-800 bg-navy-800/30 p-5">
              <p className="text-xs font-medium uppercase tracking-wider text-navy-500">Avg Compliance Rate</p>
              <p className={`mt-2 text-2xl font-bold ${avgCompliance >= 80 ? "text-success" : avgCompliance >= 70 ? "text-warning" : "text-danger"}`}>
                {avgCompliance}%
              </p>
            </div>
            <div className="rounded-xl border border-navy-800 bg-navy-800/30 p-5">
              <p className="text-xs font-medium uppercase tracking-wider text-navy-500">High-Risk Properties</p>
              <p className="mt-2 text-2xl font-bold text-danger">{totalHighRisk}</p>
            </div>
            <div className="rounded-xl border border-navy-800 bg-navy-800/30 p-5">
              <p className="text-xs font-medium uppercase tracking-wider text-navy-500">Active Cases</p>
              <p className="mt-2 text-2xl font-bold text-accent-400">{totalActiveCases}</p>
            </div>
          </div>

          {/* Tab navigation */}
          <div className="mt-8 flex gap-1 rounded-lg bg-navy-800/50 p-1">
            {(["overview", "pipeline", "alerts"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 rounded-md px-4 py-2.5 text-sm font-medium transition-all ${
                  activeTab === tab
                    ? "bg-navy-700 text-navy-100 shadow-sm"
                    : "text-navy-400 hover:text-navy-300"
                }`}
              >
                {tab === "overview" ? "Ward Overview" : tab === "pipeline" ? "Enforcement Pipeline" : "Alerts"}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="mt-6">
            {activeTab === "overview" && (
              <div className="overflow-x-auto rounded-xl border border-navy-800 bg-navy-800/30">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr className="border-b border-navy-800">
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-navy-500">Ward</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-navy-500">PRS Properties</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-navy-500">Compliance</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-navy-500">High Risk</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-navy-500">Active Cases</th>
                    </tr>
                  </thead>
                  <tbody>
                    {wards.map((ward) => (
                      <tr key={ward.name} className="border-b border-navy-800/50 transition-colors hover:bg-navy-800/50">
                        <td className="px-6 py-4 text-sm font-medium text-navy-100">{ward.name}</td>
                        <td className="px-6 py-4 text-right text-sm text-navy-300">{ward.properties.toLocaleString()}</td>
                        <td className="px-6 py-4 text-right">
                          <span className={`text-sm font-semibold ${ward.compliant >= 80 ? "text-success" : ward.compliant >= 70 ? "text-warning" : "text-danger"}`}>
                            {ward.compliant}%
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right text-sm text-navy-300">{ward.highRisk}</td>
                        <td className="px-6 py-4 text-right text-sm text-navy-300">{ward.activeCases}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "pipeline" && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {pipelineStages.map((stage) => (
                  <div key={stage.name} className="rounded-xl border border-navy-800 bg-navy-800/30 p-4">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-navy-100">{stage.name}</h3>
                      <span className="rounded-full bg-navy-700 px-2.5 py-0.5 text-xs font-medium text-navy-300">
                        {stage.count}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {stage.items.map((item) => (
                        <div key={item.address} className="rounded-lg border border-navy-700 bg-navy-900 p-3">
                          <p className="text-sm font-medium text-navy-200">{item.address}</p>
                          <p className="mt-1 text-xs text-navy-500">{item.type}</p>
                          <span className={`mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${getPriorityColor(item.priority)}`}>
                            {item.priority}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "alerts" && (
              <div className="space-y-3">
                {alerts.map((alert, i) => (
                  <div key={i} className={`rounded-xl border p-4 ${getAlertColor(alert.type)}`}>
                    <div className="flex items-start justify-between gap-4">
                      <p className="text-sm text-navy-200">{alert.message}</p>
                      <span className="shrink-0 text-xs text-navy-500">{alert.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Demo disclaimer */}
          <p className="mt-8 text-center text-xs text-navy-600">
            This demo uses fictional sample data. Your PRSCheck instance would be populated with
            real PRS properties, compliance data, and enforcement cases from your borough.
          </p>
        </div>
      </section>

      {/* Register Interest */}
      <section className="border-t border-navy-800 bg-navy-950 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <RegisterInterestCTA variant="banner" />
        </div>
      </section>
    </>
  );
}
