import type { Metadata } from "next";
import Link from "next/link";
import PostcodeCTA from "@/components/PostcodeCTA";
import {
  AWARD_BAND,
  RRO_DEFENCES,
  RRO_FACTS,
  RRO_SECTION_44_FACTORS,
  RRO_SOURCES,
  estimateRro,
  gbp,
} from "@/lib/rro";
import { penaltiesFor } from "@/lib/licensing";

export const metadata: Metadata = {
  title: "Rent Repayment Orders: A Landlord's Guide to the 24-Month Risk",
  description:
    "What a Rent Repayment Order costs a landlord in 2026, how the tribunal decides the amount, the two statutory defences, and how to remove the exposure before a tenant applies.",
  alternates: { canonical: "https://prscheck.co.uk/landlords/rent-repayment-orders" },
  openGraph: {
    title: "Rent Repayment Orders: A Landlord's Guide",
    description: "The 24-month exposure, how tribunals set the amount, and the two defences that end a claim.",
    url: "https://prscheck.co.uk/landlords/rent-repayment-orders",
  },
};

export default function LandlordRroPage() {
  const pen = penaltiesFor("england");
  const pct = (n: number) => `${Math.round(n * 100)}%`;
  // Same engine as the tenant calculator, so the two sides of the site cannot
  // quote different numbers for the same facts.
  const example = estimateRro({ monthlyRent: 1400, utilitiesPerMonth: 0, monthsUnlicensed: 20 });

  const faqs = [
    {
      q: "Can a tenant claim without the council prosecuting me?",
      a: "Yes. The First-tier Tribunal decides for itself whether the offence was committed, to the criminal standard of beyond reasonable doubt. No conviction, and no council civil penalty, is needed first. A council penalty and a tenant's rent repayment order can both follow from the same offence.",
    },
    {
      q: "How much is a rent repayment order likely to be?",
      a: `The cap is ${RRO_FACTS.maxMonths} months' rent for an offence committed on or after 1 May 2026, and it cannot exceed the rent actually paid. Tribunals follow Acheampong v Roman [2022] UKUT 239 (LC): deduct any part of the rent that paid for utilities the tenant alone consumed, then apply a percentage for seriousness, then adjust for the section 44(4) factors. Awards for straightforward licensing breaches commonly land between ${pct(AWARD_BAND.low)} and ${pct(AWARD_BAND.high)} of rent after utilities.`,
    },
    {
      q: "Does a pending licence application protect me?",
      a: "Yes, for the period it is effective. Under section 72(4) and section 95(3) of the Housing Act 2004 no offence is committed while a duly made application is effective, or while a temporary exemption notice is in force. This is the single most useful thing a landlord who has just discovered a scheme can do.",
    },
    {
      q: "Is not knowing about the scheme a defence?",
      a: "There is a reasonable excuse defence at section 72(5) and section 95(4), and the tribunal decides what counts. Being unaware a designation existed has repeatedly failed as an excuse, so it should not be relied on.",
    },
    {
      q: "Can several tenants claim for the same property?",
      a: "Yes. Each occupier claims the rent they personally paid over the same unlicensed period, using the same designation evidence. A five-person HMO is therefore five claims, not one.",
    },
    {
      q: "How long am I exposed for?",
      a: `Two years. An occupier must apply within ${RRO_FACTS.applicationWindowMonths} months of the offence, and where the offence continued, the last date it was committed must fall inside that window. Former tenants can and do apply after moving out.`,
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
          <Link href="/landlords" className="hover:text-navy-300">
            For landlords
          </Link>
          <span className="mx-2">/</span>
          <span className="text-navy-400">Rent Repayment Orders</span>
        </nav>

        <h1 className="mt-4 text-3xl font-bold text-navy-100 sm:text-4xl">
          Rent Repayment Orders: what they cost a landlord
        </h1>
        <p className="mt-4 text-lg text-navy-300">
          A Rent Repayment Order is a tenant-driven claim, not a council one. Your tenant applies to the tribunal, the
          tribunal decides for itself whether an offence was committed, and for offences on or after 1 May 2026 it can
          order up to {RRO_FACTS.maxMonths}{" "}
          months&apos; rent repaid. It sits alongside the council&apos;s civil penalty
          of up to {pen.civilPenaltyLabel}, not instead of it.
        </p>

        <section className="mt-10 rounded-2xl border border-warning/30 bg-warning/5 p-6">
          <h2 className="text-xl font-bold text-navy-100">What changed in 2026</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-navy-300">
            <li>
              The cap doubled, from {RRO_FACTS.maxMonthsBeforeUplift} to {RRO_FACTS.maxMonths}{" "}
              months&apos; rent, for
              offences committed on or after 1 May 2026. The uplift is England-only; Wales stays at{" "}
              {penaltiesFor("wales").rroMonths}.
            </li>
            <li>
              The application window doubled, from 12 months to {RRO_FACTS.applicationWindowMonths}, so a former tenant
              can come back two years later.
            </li>
            <li>
              The civil penalty maximum rose to {pen.civilPenaltyLabel} per offence, and section 21 no-fault possession
              was abolished on the same date.
            </li>
          </ul>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-bold text-navy-100">What it looks like in money</h2>
          <p className="mt-3 text-navy-300">
            A single let at £1,400 a month, unlicensed for 20 months, with no utilities included in the rent:
          </p>
          <div className="mt-5 rounded-xl border border-navy-800 bg-navy-800/30 p-5">
            <dl className="space-y-2.5 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-navy-400">Rent across the unlicensed period</dt>
                <dd className="font-mono font-semibold text-navy-100">{gbp(example.rentAfterUtilities)}</dd>
              </div>
              <div className="flex justify-between gap-4 border-t border-navy-800 pt-2.5">
                <dt className="text-navy-400">
                  Likely order, at {pct(AWARD_BAND.low)} to {pct(AWARD_BAND.high)}
                </dt>
                <dd className="font-mono font-semibold text-danger">
                  {gbp(example.low)} to {gbp(example.high)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-navy-400">Plus a council civil penalty, up to</dt>
                <dd className="font-mono font-semibold text-danger">{pen.civilPenaltyLabel}</dd>
              </div>
            </dl>
          </div>
          <p className="mt-4 text-sm text-navy-400">
            That is one tenant. In a licensable HMO each occupier claims the rent they personally paid over the same
            period, so a five-person share is five claims on the same set of facts.
          </p>
          <p className="mt-3 text-sm text-navy-400">
            Under section 44(4) of the Housing and Planning Act 2016 the tribunal must take into account{" "}
            {RRO_SECTION_44_FACTORS.join("; ").toLowerCase()}. A first offence, promptly regularised, is treated
            differently from a portfolio landlord who has been penalised before.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-bold text-navy-100">The two defences</h2>
          <p className="mt-3 text-navy-300">
            Both are statutory, and the first is the reason to act today rather than after a letter arrives.
          </p>
          <dl className="mt-5 space-y-4">
            {RRO_DEFENCES.map((d) => (
              <div key={d.defence} className="rounded-xl border border-navy-800 bg-navy-800/30 p-5">
                <dt className="font-semibold text-navy-100">
                  {d.defence} <span className="font-normal text-navy-500">({d.statute})</span>
                </dt>
                <dd className="mt-1.5 text-sm text-navy-400">{d.detail}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-5 text-navy-300">
            The practical consequence is blunt. If your property is inside a designation and unlicensed, a duly made
            licence application stops the clock on the offence. Every month you wait is another month of rent inside a
            potential claim, and the window now runs for two years after it ends.
          </p>
        </section>

        <section className="mt-12">
          <PostcodeCTA
            heading="Find out whether your property is inside a designation"
            sub="Free check of every live selective, additional and mandatory HMO scheme covering that postcode."
          />
          <p className="mt-4 text-sm text-navy-400">
            The {"£"}7.99 report gives the property-specific verdict on your exact address and occupancy, the scheme
            dates and fees, and the order to do things in.
          </p>
        </section>

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
            PRSCheck is an information service based on published council designations and national legislation, not
            legal advice. Take advice from a housing solicitor on any live claim.
          </p>
        </section>

        <section className="mt-12 rounded-2xl border border-navy-800 bg-navy-950 p-6 text-center">
          <p className="text-sm text-navy-400">
            We publish the tenant&apos;s side of this too, deliberately. Knowing exactly what they will be told is
            useful.
          </p>
          <Link
            href="/tenants/rent-repayment-order"
            className="mt-2 inline-block text-sm font-medium text-accent-400 hover:text-accent-300"
          >
            What tenants read about Rent Repayment Orders →
          </Link>
        </section>
      </div>
    </>
  );
}
