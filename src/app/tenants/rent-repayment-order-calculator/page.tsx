import type { Metadata } from "next";
import Link from "next/link";
import RroCalculator from "@/components/RroCalculator";
import { AWARD_BAND, RRO_FACTS, RRO_SOURCES, estimateRro, gbp } from "@/lib/rro";

export const metadata: Metadata = {
  title: "Rent Repayment Order Calculator | How Much Can You Claim?",
  description:
    "Work out what a Rent Repayment Order could be worth. Enter your rent and how long the property was unlicensed. Uses the Acheampong v Roman method the tribunal follows, not the headline maximum.",
  alternates: { canonical: "https://prscheck.co.uk/tenants/rent-repayment-order-calculator" },
  openGraph: {
    title: "Rent Repayment Order Calculator",
    description:
      "What a rent repayment order is realistically worth, worked the way the tribunal works it.",
    url: "https://prscheck.co.uk/tenants/rent-repayment-order-calculator",
  },
};

export default function RroCalculatorPage() {
  const pct = (n: number) => `${Math.round(n * 100)}%`;

  /**
   * A worked example, computed by the same function the calculator uses rather
   * than typed in. A hand-written example drifts the moment the method changes,
   * and this page exists to be believed.
   */
  const example = estimateRro({ monthlyRent: 1200, utilitiesPerMonth: 150, monthsUnlicensed: 30 });

  const faqs = [
    {
      q: "How is a rent repayment order calculated?",
      a: `The Upper Tribunal set the method in Acheampong v Roman [2022] UKUT 239 (LC). Take the whole rent for the period the offence was being committed, capped at ${RRO_FACTS.maxMonths} months. Subtract any part of the rent that paid for utilities only the tenant consumed. Apply a percentage reflecting the seriousness of the offence. Then adjust for the section 44(4) factors: the conduct of the landlord and tenant, the landlord's financial circumstances, and any previous convictions.`,
    },
    {
      q: "Do tribunals award the full 24 months?",
      a: `Rarely. The cap is the ceiling, not the expectation. Awards for straightforward licensing breaches commonly fall between ${pct(AWARD_BAND.low)} and ${pct(AWARD_BAND.high)} of the rent after utilities. In Acheampong itself the Upper Tribunal arrived at ${pct(AWARD_BAND.high)}.`,
    },
    {
      q: "Is the maximum 12 months or 24 months?",
      a: `${RRO_FACTS.maxMonths} months for an offence committed on or after 1 May 2026, under the Renters' Rights Act 2025. ${RRO_FACTS.maxMonthsBeforeUplift} months for an offence that ended before that date. The 24-month uplift applies in England; Wales remains at 12.`,
    },
    {
      q: "Does the order include my deposit or my bills?",
      a: "No. It repays rent you paid. Money you paid the landlord for gas, electricity or internet that you alone consumed is deducted, because that is not really rent. A deposit is a separate matter with its own protection rules.",
    },
    {
      q: "What if housing benefit paid part of my rent?",
      a: "The part covered by housing benefit or the housing element of universal credit belongs to a council claim rather than yours, and the amount is split proportionately. You claim the part you paid.",
    },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:py-16">
        <nav className="text-sm text-navy-500">
          <Link href="/tenants" className="hover:text-navy-300">
            For tenants
          </Link>
          <span className="mx-2">/</span>
          <span className="text-navy-400">RRO calculator</span>
        </nav>

        <h1 className="mt-4 text-3xl font-bold text-navy-100 sm:text-4xl">Rent Repayment Order calculator</h1>
        <p className="mt-4 text-lg text-navy-300">
          Enter your rent and how long the property was let without a licence. This works the calculation the way the
          tribunal works it, so the number you see is a realistic range rather than the statutory ceiling.
        </p>

        <div className="mt-8">
          <RroCalculator />
        </div>

        {/* Worked example */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold text-navy-100">A worked example</h2>
          <p className="mt-3 text-navy-300">
            A tenant paying £1,200 a month, with £150 of that covering gas, electricity and broadband, in a property
            that was unlicensed for 30 months.
          </p>
          <div className="mt-5 overflow-x-auto rounded-xl border border-navy-800 bg-navy-800/30">
            <table className="w-full min-w-[420px] text-sm">
              <tbody>
                {[
                  [
                    `Months claimable, capped at ${example.capMonths}`,
                    `${example.claimableMonths} of 30`,
                    `The cap removes ${example.monthsCapped} months straight away.`,
                  ],
                  ["Rent across those months", gbp(example.grossRent), "£1,200 x " + example.claimableMonths],
                  ["Less utilities", `-${gbp(example.utilitiesDeducted)}`, "£150 x " + example.claimableMonths],
                  ["Rent after utilities, the ceiling", gbp(example.rentAfterUtilities), "Not the award."],
                  [
                    `Tribunal applies ${pct(AWARD_BAND.low)} to ${pct(AWARD_BAND.high)}`,
                    `${gbp(example.low)} to ${gbp(example.high)}`,
                    "For seriousness, then adjusted under section 44(4).",
                  ],
                ].map(([label, value, note]) => (
                  <tr key={label} className="border-b border-navy-800 last:border-b-0">
                    <td className="p-3.5 align-top text-navy-300">
                      {label}
                      <span className="mt-0.5 block text-xs text-navy-500">{note}</span>
                    </td>
                    <td className="whitespace-nowrap p-3.5 text-right align-top font-mono font-semibold text-navy-100">
                      {value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-sm text-navy-400">
            A calculator that simply multiplied £1,200 by 30 would have shown £36,000. The honest figure is a range
            around {gbp(example.typical)}, and even that assumes the offence can be proved beyond reasonable doubt.
          </p>
        </section>

        {/* What decides it */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold text-navy-100">Everything above assumes one thing</h2>
          <p className="mt-3 text-navy-300">
            That the property actually needed a licence and did not have one. That is the part the tribunal must be
            satisfied of {RRO_FACTS.standardOfProof}, and it depends on whether your exact address fell inside a live
            council designation. Selective and additional schemes are frequently drawn street by street.
          </p>
          <div className="mt-6 rounded-2xl border border-accent-500/30 bg-accent-600/10 p-6 text-center">
            <p className="font-semibold text-navy-100">Check the postcode free</p>
            <p className="mx-auto mt-1.5 max-w-lg text-sm text-navy-300">
              Every live selective, additional and mandatory HMO scheme that could have applied to that address, with
              the council&apos;s own source link.
            </p>
            <Link
              href="/check?for=tenant"
              className="mt-4 inline-block rounded-lg bg-accent-600 px-7 py-3 font-semibold text-white transition-all hover:bg-accent-500"
            >
              Check my address
            </Link>
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold text-navy-100">Common questions</h2>
          <div className="mt-6 space-y-6">
            {faqs.map((f) => (
              <div key={f.q}>
                <h3 className="font-semibold text-navy-100">{f.q}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-navy-400">{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12 rounded-2xl border border-navy-800 bg-navy-800/30 p-6">
          <h2 className="text-lg font-bold text-navy-100">Sources</h2>
          <ul className="mt-3 space-y-2">
            {RRO_SOURCES.map((s) => (
              <li key={s.url}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-accent-400 underline hover:text-accent-300"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-navy-600">
            This calculator is an estimate, not advice and not a prediction. The First-tier Tribunal decides each case
            on its own facts.
          </p>
        </section>

        <p className="mt-8 text-sm text-navy-400">
          Next:{" "}
          <Link href="/tenants/rent-repayment-order" className="text-accent-400 hover:underline">
            how to apply for a Rent Repayment Order
          </Link>{" "}
          and{" "}
          <Link href="/tenants/is-my-landlord-licensed" className="text-accent-400 hover:underline">
            how to check whether your landlord is licensed
          </Link>
          .
        </p>
      </div>
    </>
  );
}
