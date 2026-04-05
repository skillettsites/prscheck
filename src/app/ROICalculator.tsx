"use client";

import { useState } from "react";

export default function ROICalculator() {
  const [properties, setProperties] = useState(10000);
  const [teamSize, setTeamSize] = useState(5);

  const nonCompliant = Math.round(properties * 0.15);
  const penaltiesPerYear = Math.round(nonCompliant * 0.05); // 5% of non-compliant actually penalised
  const avgPenalty = 8000; // average civil penalty
  const penaltyIncome = penaltiesPerYear * avgPenalty;
  const monthlyCost = properties <= 5000 ? 500 : properties <= 25000 ? 1500 : 3000;
  const annualCost = monthlyCost * 12;
  const roi = annualCost > 0 ? (penaltyIncome / annualCost).toFixed(1) : "0";
  const propertiesPerOfficer = Math.round(properties / teamSize);

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(n);

  return (
    <div className="rounded-2xl border border-navy-700 bg-navy-800/50 p-8 sm:p-10">
      <div className="grid gap-10 lg:grid-cols-2">
        {/* Inputs */}
        <div className="space-y-8">
          <div>
            <div className="mb-3 flex items-center justify-between">
              <label className="text-sm font-medium text-navy-300">
                PRS properties in your borough
              </label>
              <span className="rounded-md bg-navy-700 px-3 py-1 text-sm font-semibold text-accent-400">
                {properties.toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min={1000}
              max={50000}
              step={500}
              value={properties}
              onChange={(e) => setProperties(Number(e.target.value))}
              className="w-full accent-accent-500"
            />
            <div className="mt-1 flex justify-between text-xs text-navy-600">
              <span>1,000</span>
              <span>50,000</span>
            </div>
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between">
              <label className="text-sm font-medium text-navy-300">
                Enforcement team size
              </label>
              <span className="rounded-md bg-navy-700 px-3 py-1 text-sm font-semibold text-accent-400">
                {teamSize}
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={20}
              step={1}
              value={teamSize}
              onChange={(e) => setTeamSize(Number(e.target.value))}
              className="w-full accent-accent-500"
            />
            <div className="mt-1 flex justify-between text-xs text-navy-600">
              <span>1</span>
              <span>20</span>
            </div>
          </div>
        </div>

        {/* Outputs */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-navy-700 bg-navy-900 p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-navy-500">
              Est. Non-Compliant
            </p>
            <p className="mt-2 text-2xl font-bold text-warning">
              {nonCompliant.toLocaleString()}
            </p>
            <p className="mt-1 text-xs text-navy-500">15% of PRS stock</p>
          </div>

          <div className="rounded-xl border border-navy-700 bg-navy-900 p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-navy-500">
              Properties per Officer
            </p>
            <p className="mt-2 text-2xl font-bold text-danger">
              {propertiesPerOfficer.toLocaleString()}
            </p>
            <p className="mt-1 text-xs text-navy-500">Current capacity</p>
          </div>

          <div className="rounded-xl border border-navy-700 bg-navy-900 p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-navy-500">
              Potential Penalty Income
            </p>
            <p className="mt-2 text-2xl font-bold text-success">
              {formatCurrency(penaltyIncome)}
            </p>
            <p className="mt-1 text-xs text-navy-500">Per year (5% enforcement rate)</p>
          </div>

          <div className="rounded-xl border border-navy-700 bg-navy-900 p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-navy-500">
              ROI Multiplier
            </p>
            <p className="mt-2 text-2xl font-bold text-accent-400">
              {roi}x
            </p>
            <p className="mt-1 text-xs text-navy-500">
              vs {formatCurrency(annualCost)}/yr platform cost
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
