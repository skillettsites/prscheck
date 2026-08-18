import type { Metadata } from "next";
import Link from "next/link";
import PostcodeCTA from "@/components/PostcodeCTA";
import { councilsWithLiveSchemes, englishCouncils, penaltiesFor } from "@/lib/licensing";
import { RRO_FACTS } from "@/lib/rro";

export const metadata: Metadata = {
  title: "Landlords: Do You Need a Property Licence? Check Free",
  description:
    "Check whether your rental needs a selective, additional or mandatory HMO licence. Free postcode check of every live scheme, then a £7.99 property-specific report. Penalties reach £40,000.",
  alternates: { canonical: "https://prscheck.co.uk/landlords" },
  openGraph: {
    title: "Landlords: Do You Need a Property Licence?",
    description:
      "Free postcode check of every live licensing scheme, then a £7.99 property-specific verdict and action plan.",
    url: "https://prscheck.co.uk/landlords",
  },
};

const pages = [
  {
    href: "/guides/landlord-licensing",
    title: "Landlord licensing explained",
    body: "The three licence types, how to tell which yours needs, and how the four nations differ.",
  },
  {
    href: "/guides/selective-licensing",
    title: "Selective licensing",
    body: "Why an ordinary single-family let can need a licence, and how street-level designations work.",
  },
  {
    href: "/guides/hmo-licensing",
    title: "HMO licensing",
    body: "The mandatory threshold, additional licensing, and the household test people get wrong.",
  },
  {
    href: "/landlords/rent-repayment-orders",
    title: "Rent Repayment Orders: your exposure",
    body: "What your tenant can claim if you get licensing wrong, how tribunals decide the amount, and the two defences.",
  },
  {
    href: "/guides/penalties",
    title: "Penalties for letting unlicensed",
    body: "Civil penalties, prosecution, banning orders and the possession restrictions coming with the PRS Database.",
  },
  {
    href: "/councils",
    title: "Licensing by council",
    body: "Every English and Welsh council, its live schemes, dates, fees and the official designation source.",
  },
];

export default function LandlordsHub() {
  const live = councilsWithLiveSchemes();
  const total = englishCouncils().length;
  const pen = penaltiesFor("england");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How do I know if my rental property needs a licence?",
        acceptedAnswer: {
          "@type": "Answer",
          text: `Three things decide it. Whether the property is inside a council selective licensing designation, whether it is inside an additional HMO licensing designation and let as a small HMO, and whether it meets the England-wide mandatory HMO test of five or more people in two or more households. ${live.length} of ${total} English councils run at least one live designation, and many are drawn street by street, so the address decides it rather than the town.`,
        },
      },
      {
        "@type": "Question",
        name: "What is the penalty for letting an unlicensed property?",
        acceptedAnswer: {
          "@type": "Answer",
          text: `In England, a civil penalty of up to ${pen.civilPenaltyLabel} per offence from 1 May 2026, an unlimited fine on prosecution, a possible banning order, and a Rent Repayment Order of up to ${pen.rroMonths} months' rent claimable by the tenant.`,
        },
      },
      {
        "@type": "Question",
        name: "Is my property licensed if I have registered with the council?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Registration and licensing are different things. In Wales, Rent Smart Wales registration does not cover you for a local selective or additional licensing scheme, and nine Welsh councils run one. In England there is no national registration yet; a PRS Database is being introduced under the Renters' Rights Act 2025 from late 2026, and it will sit alongside licensing rather than replace it.",
        },
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="relative overflow-hidden bg-gradient-to-b from-navy-950 to-navy-900">
        <div className="absolute inset-0 grid-pattern" />
        <div className="relative mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 sm:py-24">
          <span className="mb-5 inline-block rounded-full border border-accent-500/30 bg-accent-600/10 px-3 py-1 text-xs font-medium text-accent-400">
            For landlords and agents
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-navy-100 sm:text-4xl lg:text-5xl">
            Does your rental property need a <span className="text-accent-400">licence?</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base text-navy-400 sm:text-lg">
            There is no national register to check. {live.length} of {total}{" "}
            English councils run their own selective or
            additional licensing schemes, many designated street by street, and they change constantly. Letting without
            a licence you needed carries a civil penalty of up to {pen.civilPenaltyLabel} per property.
          </p>
          <div className="mx-auto mt-8 max-w-xl">
            <PostcodeCTA
              heading="Check your property"
              sub="Free check of every live scheme covering that postcode. No sign-up."
            />
          </div>
        </div>
      </section>

      <section className="border-y border-navy-800 bg-navy-950 py-12 sm:py-16">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-3 px-4 sm:grid-cols-4 sm:gap-5 sm:px-6">
          {[
            { v: pen.civilPenaltyLabel, l: "Max civil penalty per unlicensed property" },
            { v: `${pen.rroMonths} months`, l: "Rent your tenant can reclaim" },
            { v: `${live.length}`, l: "Councils with a live scheme" },
            { v: "Unlimited", l: "Fine on criminal prosecution" },
          ].map((s) => (
            <div key={s.l} className="rounded-xl border border-navy-800 bg-navy-900 p-4 text-center sm:p-5">
              <p className="text-xl font-bold text-accent-400 sm:text-2xl">{s.v}</p>
              <p className="mt-2 text-xs text-navy-400 sm:text-sm">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-navy-100 sm:text-3xl">Why this is harder than it should be</h2>
          <div className="mt-5 space-y-4 text-navy-300">
            <p>
              Property licensing in the UK is a patchwork. On top of the England-wide rules for houses in multiple
              occupation, individual councils run their own selective and additional licensing schemes, often covering
              just a few streets or wards. There is no single national register a landlord can check, the schemes change
              constantly, and the boundaries can run down the middle of a road.
            </p>
            <p>
              The result is that thousands of landlords let property that needs a licence without realising, and only
              find out when a council enforcement officer, or a tenant claiming their rent back, gets in touch.
            </p>
            <p>
              PRSCheck has mapped every selective and additional licensing scheme in England and Wales to the exact
              council and area it covers, combined with the national HMO rules and the registration regimes in Wales,
              Scotland and Northern Ireland. Enter a postcode and we show you instantly whether that area has a scheme.
              Answer two questions about the tenancy and the {"£"}7.99 report gives the property-specific verdict, what
              it costs, what you are exposed to, and exactly what to do next.
            </p>
          </div>
        </div>
      </section>

      {/* The tenant side, stated plainly */}
      <section className="border-y border-navy-800 bg-navy-950 py-14 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-navy-100 sm:text-3xl">
            The reason this got more expensive in 2026
          </h2>
          <p className="mt-4 text-navy-300">
            Your tenant no longer needs the council to act. They can apply to the First-tier Tribunal themselves for a
            Rent Repayment Order, the tribunal can make one without any conviction, and for offences committed on or
            after 1 May 2026 the order can be up to {RRO_FACTS.maxMonths} months&apos; rent rather than{" "}
            {RRO_FACTS.maxMonthsBeforeUplift}. The window to apply is now two years.
          </p>
          <p className="mt-3 text-navy-300">
            That is a real number on a real timescale, and it sits alongside the council&apos;s own civil penalty rather
            than instead of it. It is also entirely avoidable: a licence application that has been duly made is a
            complete answer, because no offence is committed while it is effective.
          </p>
          <Link
            href="/landlords/rent-repayment-orders"
            className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-accent-400 hover:text-accent-300"
          >
            What a Rent Repayment Order would cost you
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Guides */}
      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-navy-100 sm:text-3xl">Guides and reference</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {pages.map((p) => (
              <Link
                key={p.href}
                href={p.href}
                className="group rounded-2xl border border-navy-800 bg-navy-800/30 p-6 transition-all hover:border-accent-500/40 hover:bg-navy-800/60"
              >
                <h3 className="font-bold text-navy-100 group-hover:text-accent-300">{p.title}</h3>
                <p className="mt-2 text-sm text-navy-400">{p.body}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Who else */}
      <section className="border-t border-navy-800 bg-navy-950 py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-accent-500">Renting, not letting?</h2>
          <p className="mt-3 text-lg text-navy-300">
            The same check tells a tenant whether their home should have been licensed, and what that is worth.
          </p>
          <Link
            href="/tenants"
            className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-accent-400 transition-colors hover:text-accent-300"
          >
            Go to the tenant side
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </section>
    </>
  );
}
