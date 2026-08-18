"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AWARD_BAND, RRO_FACTS, RRO_SECTION_44_FACTORS, estimateRro, gbp } from "@/lib/rro";

/**
 * The rent repayment order calculator.
 *
 * Built to be linked to and quoted, which is exactly why it refuses to print
 * the number people want. Enter £1,500 a month over three years and a naive
 * calculator says £54,000; the honest answer is that the claim is capped at 24
 * months, utilities come out, and the tribunal then awards a percentage of what
 * is left. This shows all four steps, and leads with the band rather than the
 * ceiling.
 */
export default function RroCalculator({ compact = false }: { compact?: boolean }) {
  const [rent, setRent] = useState("");
  const [utilities, setUtilities] = useState("");
  const [months, setMonths] = useState("");
  const [preUplift, setPreUplift] = useState(false);

  const monthlyRent = parseFloat(rent) || 0;
  const utilitiesPerMonth = parseFloat(utilities) || 0;
  const monthsUnlicensed = parseInt(months, 10) || 0;

  const estimate = useMemo(
    () => estimateRro({ monthlyRent, utilitiesPerMonth, monthsUnlicensed, offenceEndedBeforeUplift: preUplift }),
    [monthlyRent, utilitiesPerMonth, monthsUnlicensed, preUplift],
  );

  const showResult = !estimate.incomplete;
  const pct = (n: number) => `${Math.round(n * 100)}%`;

  return (
    <div className="rounded-2xl border border-navy-700 bg-navy-800/40 p-6 sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-navy-200">Your rent, per month</span>
          <div className="relative mt-1.5">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-navy-500">£</span>
            <input
              type="number"
              inputMode="decimal"
              min={0}
              value={rent}
              onChange={(e) => setRent(e.target.value)}
              placeholder="1200"
              className="w-full rounded-lg border border-navy-700 bg-navy-900 py-2.5 pl-7 pr-3 text-navy-100 placeholder-navy-600 focus:border-accent-500 focus:outline-none"
            />
          </div>
          <span className="mt-1 block text-xs text-navy-500">What you actually paid, your share if you shared.</span>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-navy-200">Months the property was unlicensed</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            value={months}
            onChange={(e) => setMonths(e.target.value)}
            placeholder="14"
            className="mt-1.5 w-full rounded-lg border border-navy-700 bg-navy-900 px-3 py-2.5 text-navy-100 placeholder-navy-600 focus:border-accent-500 focus:outline-none"
          />
          <span className="mt-1 block text-xs text-navy-500">
            Months you lived there while it needed a licence and did not have one.
          </span>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-navy-200">Utilities included in that rent, per month</span>
          <div className="relative mt-1.5">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-navy-500">£</span>
            <input
              type="number"
              inputMode="decimal"
              min={0}
              value={utilities}
              onChange={(e) => setUtilities(e.target.value)}
              placeholder="0"
              className="w-full rounded-lg border border-navy-700 bg-navy-900 py-2.5 pl-7 pr-3 text-navy-100 placeholder-navy-600 focus:border-accent-500 focus:outline-none"
            />
          </div>
          <span className="mt-1 block text-xs text-navy-500">
            Gas, electricity, water, internet. Leave at 0 if you paid these separately.
          </span>
        </label>

        <label className="flex items-start gap-3 sm:pt-7">
          <input
            type="checkbox"
            checked={preUplift}
            onChange={(e) => setPreUplift(e.target.checked)}
            className="mt-1 h-4 w-4 flex-none rounded border-navy-600 bg-navy-900 accent-accent-600"
          />
          <span className="text-sm text-navy-300">
            The unlicensed period ended before 1 May 2026
            <span className="mt-0.5 block text-xs text-navy-500">
              Tick this and the older 12-month cap applies instead of 24.
            </span>
          </span>
        </label>
      </div>

      {showResult ? (
        <div className="mt-7 border-t border-navy-700 pt-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-accent-400">
            Realistic award range for a licensing breach
          </p>
          <p className="mt-2 text-3xl font-bold text-navy-100 sm:text-4xl">
            {gbp(estimate.low)} to {gbp(estimate.high)}
          </p>
          <p className="mt-2 text-sm text-navy-400">
            Midpoint around {gbp(estimate.typical)}. The statutory ceiling on these figures is{" "}
            {gbp(estimate.rentAfterUtilities)}, and tribunals rarely award all of it.
          </p>

          <div className="mt-5 rounded-xl bg-navy-900/60 p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-navy-500">How that is worked out</p>
            <ol className="mt-3 space-y-2.5 text-sm text-navy-300">
              <li className="flex justify-between gap-4">
                <span>
                  1. Rent over {estimate.claimableMonths} {estimate.claimableMonths === 1 ? "month" : "months"}
                  {estimate.monthsCapped > 0 && (
                    <span className="block text-xs text-warning">
                      Capped: you entered {monthsUnlicensed} months, the limit is {estimate.capMonths}, so{" "}
                      {estimate.monthsCapped} cannot be claimed.
                    </span>
                  )}
                </span>
                <span className="font-mono font-semibold text-navy-100">{gbp(estimate.grossRent)}</span>
              </li>
              <li className="flex justify-between gap-4">
                <span>2. Less utilities you alone consumed</span>
                <span className="font-mono font-semibold text-navy-100">
                  {estimate.utilitiesDeducted > 0 ? `-${gbp(estimate.utilitiesDeducted)}` : "£0"}
                </span>
              </li>
              <li className="flex justify-between gap-4 border-t border-navy-800 pt-2.5">
                <span>3. Rent after utilities, the ceiling</span>
                <span className="font-mono font-semibold text-navy-100">{gbp(estimate.rentAfterUtilities)}</span>
              </li>
              <li className="flex justify-between gap-4">
                <span>
                  4. Tribunal applies a percentage for seriousness, typically {pct(AWARD_BAND.low)} to{" "}
                  {pct(AWARD_BAND.high)}
                </span>
                <span className="font-mono font-semibold text-accent-400">
                  {gbp(estimate.low)} to {gbp(estimate.high)}
                </span>
              </li>
            </ol>
          </div>

          <p className="mt-4 text-sm text-navy-400">
            This is an estimate, not a prediction. The tribunal fixes the amount case by case and, under section 44(4)
            of the Housing and Planning Act 2016, must take into account {RRO_SECTION_44_FACTORS.length} things we
            cannot know from a rent figure: {RRO_SECTION_44_FACTORS.join("; ").toLowerCase()}.
          </p>

          {!compact && (
            <div className="mt-6 rounded-xl border border-accent-500/30 bg-accent-600/10 p-5">
              <p className="font-semibold text-navy-100">
                None of it matters unless the property actually needed a licence.
              </p>
              <p className="mt-1.5 text-sm text-navy-300">
                That is the part the tribunal has to be satisfied of {RRO_FACTS.standardOfProof}, and it turns on
                whether your address fell inside a live council designation. Check the postcode free.
              </p>
              <Link
                href="/check?for=tenant"
                className="mt-4 inline-block rounded-lg bg-accent-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-accent-500"
              >
                Check if my home should have been licensed
              </Link>
            </div>
          )}
        </div>
      ) : (
        <p className="mt-7 border-t border-navy-700 pt-6 text-sm text-navy-500">
          Enter your monthly rent and how many months the property was unlicensed to see the range.
        </p>
      )}
    </div>
  );
}
