import type { Metadata } from "next";
import Link from "next/link";
import PostcodeCTA from "@/components/PostcodeCTA";
import { RRO_FACTS, RRO_OFFENCES } from "@/lib/rro";
import { councilsWithLiveSchemes, penaltiesFor } from "@/lib/licensing";

export const metadata: Metadata = {
  title: "Tenants: Is Your Landlord Licensed? Claim Rent Back",
  description:
    "If your landlord let an unlicensed property, you can apply for a Rent Repayment Order of up to 24 months' rent. Check your postcode free, see what a claim is worth, and get the evidence you need.",
  alternates: { canonical: "https://prscheck.co.uk/tenants" },
  openGraph: {
    title: "Tenants: Is Your Landlord Licensed?",
    description:
      "Check free whether the home you rent should have been licensed, and what a Rent Repayment Order could be worth.",
    url: "https://prscheck.co.uk/tenants",
  },
};

const pages = [
  {
    href: "/tenants/rent-repayment-order",
    title: "Rent Repayment Orders explained",
    body: "What they are, which offences qualify, how much tribunals actually award, and the step-by-step route to applying with Form RRO1.",
  },
  {
    href: "/tenants/rent-repayment-order-calculator",
    title: "Rent Repayment Order calculator",
    body: "Put in your rent and how long the property was unlicensed. See the realistic award range, worked the way the tribunal works it.",
  },
  {
    href: "/tenants/is-my-landlord-licensed",
    title: "Is my landlord licensed?",
    body: "How to find out, free, in three ways: the council's public register, the postcode designation check, and a written request to the council.",
  },
  {
    href: "/tenants/unlicensed-hmo",
    title: "My HMO is unlicensed. What now?",
    body: "Shared houses are where most licensing breaches sit. What counts as an HMO, what your landlord should hold, and what you can do about it.",
  },
];

export default function TenantsHub() {
  const live = councilsWithLiveSchemes();
  const pen = penaltiesFor("england");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Can I claim my rent back if my landlord was not licensed?",
        acceptedAnswer: {
          "@type": "Answer",
          text: `Possibly. If the property required a selective, additional or mandatory HMO licence and was let without one, that is an offence, and a tenant can apply to the First-tier Tribunal for a Rent Repayment Order. For offences committed on or after 1 May 2026 the order can be up to ${RRO_FACTS.maxMonths} months' rent. Tribunals rarely award the full amount: the Upper Tribunal in Acheampong v Roman set out a method of deducting utilities and then applying a percentage for seriousness.`,
        },
      },
      {
        "@type": "Question",
        name: "How long do I have to apply for a Rent Repayment Order?",
        acceptedAnswer: {
          "@type": "Answer",
          text: `Two years. An occupier must apply within ${RRO_FACTS.applicationWindowMonths} months of the offence, and where the offence continued, the last date it was committed must fall inside that window.`,
        },
      },
      {
        "@type": "Question",
        name: "Does my landlord have to be prosecuted first?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. The tribunal can make a Rent Repayment Order without any conviction or civil penalty, but it must be satisfied beyond reasonable doubt that the offence was committed.",
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
            For tenants
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-navy-100 sm:text-4xl lg:text-5xl">
            If your landlord let an unlicensed home, you may be able to{" "}
            <span className="text-accent-400">claim your rent back</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base text-navy-400 sm:text-lg">
            Hundreds of areas in England and Wales require a landlord licence, and plenty of landlords do not hold one.
            Letting without a licence is a criminal offence, and a tenant can apply for a Rent Repayment Order of up to{" "}
            {pen.rroMonths}{" "}
            months&apos; rent. The first question is whether your address was inside a designated area.
          </p>
          <div className="mx-auto mt-8 max-w-xl">
            <PostcodeCTA
              audience="tenant"
              heading="Check the home you rent"
              sub="Free check of every licensing scheme covering that postcode. No sign-up."
            />
          </div>
        </div>
      </section>

      {/* The three facts that matter */}
      <section className="border-y border-navy-800 bg-navy-950 py-12 sm:py-16">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 px-4 sm:grid-cols-3 sm:px-6">
          {[
            { v: `${pen.rroMonths} months`, l: "Maximum rent an order can repay, for offences from 1 May 2026" },
            { v: "2 years", l: "Deadline to apply from the date of the offence" },
            { v: "No conviction", l: "Needed first. The tribunal decides for itself" },
          ].map((s) => (
            <div key={s.l} className="rounded-xl border border-navy-800 bg-navy-900 p-5 text-center">
              <p className="text-2xl font-bold text-accent-400 sm:text-3xl">{s.v}</p>
              <p className="mt-2 text-sm text-navy-400">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Honest framing */}
      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-navy-100 sm:text-3xl">How this actually works</h2>
          <div className="mt-5 space-y-4 text-navy-300">
            <p>
              Councils in England and Wales can designate areas where every private rented home needs a licence, called
              selective licensing, and areas where smaller shared houses need one, called additional licensing. On top
              of that, any property in England let to five or more people forming two or more households needs a
              mandatory HMO licence wherever it is. {live.length} English councils currently run at least one live
              scheme.
            </p>
            <p>
              If your landlord let a property that needed a licence, without one, they committed an offence under
              section 72(1) or section 95(1) of the Housing Act 2004. You do not need them prosecuted. You apply to the
              First-tier Tribunal yourself, and the tribunal decides.
            </p>
            <p>
              Be clear about the odds, though. The tribunal has to be satisfied{" "}
              <strong className="text-navy-100">{RRO_FACTS.standardOfProof}</strong> that the offence happened, which is
              the criminal standard applied in a civil tribunal. And it awards a percentage of the rent, not the whole
              of it. A calculator that tells you the maximum is telling you the ceiling, not the answer.
            </p>
          </div>

          <div className="mt-8 rounded-2xl border border-warning/30 bg-warning/5 p-6">
            <h3 className="font-bold text-navy-100">Three things that stop a claim before it starts</h3>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-navy-300">
              <li>
                Your landlord had already applied for a licence, or held a temporary exemption notice, for the whole
                period. Then no offence was committed at all.
              </li>
              <li>
                The property was outside the designated area. Selective and additional schemes are often drawn street by
                street, and the street next door may not be covered.
              </li>
              <li>
                More than two years have passed since the offence. That is a hard deadline under section 41 of the
                Housing and Planning Act 2016.
              </li>
            </ul>
            <p className="mt-3 text-sm text-navy-400">
              All three are worth checking before you pay a tribunal fee. The first and third you can settle yourself;
              the second is what our postcode check is for.
            </p>
          </div>
        </div>
      </section>

      {/* Guides */}
      <section className="border-y border-navy-800 bg-navy-950 py-14 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-navy-100 sm:text-3xl">Start here</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
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

      {/* The other offences */}
      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-navy-100 sm:text-3xl">
            Licensing is not the only route to a Rent Repayment Order
          </h2>
          <p className="mt-3 text-navy-400">
            Section 40(3) of the Housing and Planning Act 2016 lists every offence that can support an order. PRSCheck
            can evidence the two licensing ones. The rest are listed here because you may have a claim we cannot help
            with, and you should know that.
          </p>
          <ul className="mt-6 space-y-2.5">
            {RRO_OFFENCES.map((o) => (
              <li
                key={o.statute}
                className={`flex flex-wrap items-baseline justify-between gap-2 rounded-lg border p-3.5 text-sm ${
                  o.licensingOffence ? "border-accent-500/30 bg-accent-600/5" : "border-navy-800 bg-navy-800/30"
                }`}
              >
                <span className="text-navy-200">
                  {o.offence}
                  {o.licensingOffence && (
                    <span className="ml-2 rounded bg-accent-600/20 px-2 py-0.5 text-xs font-semibold text-accent-300">
                      PRSCheck covers this
                    </span>
                  )}
                </span>
                <span className="font-mono text-xs text-navy-500">{o.statute}</span>
              </li>
            ))}
          </ul>
          <p className="mt-5 text-sm text-navy-500">
            For illegal eviction, harassment or a misused possession ground, speak to Shelter, Citizens Advice or your
            council&apos;s private-sector housing team. Those claims turn on what happened to you rather than on where
            the property is, so a postcode check cannot evidence them.
          </p>
        </div>
      </section>

      {/* For landlords, honestly signposted */}
      <section className="border-t border-navy-800 bg-navy-950 py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-accent-500">Landlord, not a tenant?</h2>
          <p className="mt-3 text-lg text-navy-300">
            The same check tells you whether your property needs a licence, before a tenant asks the question for you.
          </p>
          <Link
            href="/landlords"
            className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-accent-400 transition-colors hover:text-accent-300"
          >
            Go to the landlord side
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </section>
    </>
  );
}
