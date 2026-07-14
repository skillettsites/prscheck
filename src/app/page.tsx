import type { Metadata } from "next";
import Link from "next/link";
import HeroSearch from "@/components/HeroSearch";
import { councilsWithLiveSchemes, englishCouncils } from "@/lib/licensing";

export const metadata: Metadata = {
  title: "PRSCheck | Do I Need a Landlord Licence? Check Your Postcode",
  description:
    "Find out instantly whether your rental property needs a selective, additional or HMO licence. Check any postcode free, then get a property-specific report for £7.99. Avoid penalties up to £40,000.",
  alternates: { canonical: "https://prscheck.co.uk" },
  openGraph: {
    title: "PRSCheck | Do I Need a Landlord Licence?",
    description:
      "Check whether your rental property needs a licence. Free postcode check, £7.99 property report. Avoid penalties up to £40,000.",
    url: "https://prscheck.co.uk",
  },
};

const steps = [
  {
    n: "1",
    title: "Enter your postcode",
    body: "We identify your licensing authority and every selective, additional and mandatory HMO scheme that could apply.",
  },
  {
    n: "2",
    title: "Tell us about the let",
    body: "How many people live there and how many households. That determines exactly which licence rules bite.",
  },
  {
    n: "3",
    title: "Get your report",
    body: "A clear verdict on each licence type, scheme dates and fees, your penalty exposure, and a step-by-step action plan.",
  },
];

export default function HomePage() {
  const live = councilsWithLiveSchemes();
  const total = englishCouncils().length;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "PRSCheck",
      url: "https://prscheck.co.uk",
    },
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: "Landlord Licence Check",
      description:
        "Property-specific check of selective, additional and mandatory HMO licensing requirements for UK rental properties.",
      provider: { "@type": "Organization", name: "PRSCheck", url: "https://prscheck.co.uk" },
      areaServed: "GB",
      offers: { "@type": "Offer", price: "7.99", priceCurrency: "GBP" },
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-navy-950 to-navy-900">
        <div className="absolute inset-0 grid-pattern" />
        <div className="relative mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 sm:py-24 lg:py-32">
          <span className="mb-5 inline-block rounded-full border border-accent-500/30 bg-accent-600/10 px-3 py-1 text-xs font-medium text-accent-400">
            Free postcode check · £7.99 full report
          </span>
          <h1 className="animate-fade-in text-3xl font-bold tracking-tight text-navy-100 sm:text-4xl lg:text-6xl">
            Does your rental property need a{" "}
            <span className="text-accent-400">licence?</span>
          </h1>
          <p className="animate-slide-up mx-auto mt-6 max-w-2xl text-base text-navy-400 sm:text-xl">
            Selective and HMO licensing now covers hundreds of areas across the UK. Renting out an unlicensed property
            risks a civil penalty of up to £40,000 and a rent repayment order of up to 24 months. Check yours in seconds.
          </p>
          <HeroSearch />
          <p className="mt-5 text-sm text-navy-500">
            {live.length} of {total} English councils currently run a licensing scheme, with more launching under the
            Renters&apos; Rights Act 2025.
          </p>
        </div>
      </section>

      {/* Trust stats */}
      <section className="border-y border-navy-800 bg-navy-950 py-12 sm:py-16">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-3 px-4 sm:grid-cols-4 sm:gap-6 sm:px-6">
          {[
            { v: "£40,000", l: "Max civil penalty per unlicensed property" },
            { v: "24 months", l: "Rent a tenant can reclaim (RRO)" },
            { v: `${live.length}`, l: "Councils with a live licensing scheme" },
            { v: "3 nations", l: "England, Wales & Scotland rules covered" },
          ].map((s) => (
            <div key={s.l} className="rounded-xl border border-navy-800 bg-navy-900 p-4 text-center sm:p-6">
              <p className="text-2xl font-bold text-accent-400 sm:text-3xl">{s.v}</p>
              <p className="mt-2 text-xs text-navy-400 sm:text-sm">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* What we do */}
      <section className="py-14 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-navy-100 sm:text-3xl">What PRSCheck does</h2>
          <div className="mt-5 space-y-4 text-navy-300">
            <p>
              Property licensing in the UK is a patchwork. On top of the England-wide rules for houses in multiple
              occupation, individual councils run their own selective and additional licensing schemes, often covering
              just a few streets or wards. There is no single national register a landlord can check, the schemes change
              constantly, and the boundaries can run down the middle of a road.
            </p>
            <p>
              The result is that thousands of landlords are letting property that needs a licence without realising it,
              and only find out when a council enforcement officer, or a tenant claiming their rent back, gets in touch.
              With penalties now reaching £40,000 per property and rent repayment orders of up to 24 months, that is an
              expensive way to learn the rules.
            </p>
            <p>
              PRSCheck fixes that. We have mapped every selective and additional licensing scheme in England to the
              exact council and area it covers, and combined it with the national HMO rules and the registration regimes
              in Wales and Scotland. Enter a postcode and we show you instantly whether that area has a scheme. Answer a
              couple of questions about the tenancy and our £7.99 report tells you precisely which licence your property
              needs, what it costs, what you are exposed to if you get it wrong, and exactly what to do next.
            </p>
          </div>
        </div>
      </section>

      {/* The three licence types */}
      <section className="border-y border-navy-800 bg-navy-950 py-14 sm:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-navy-100 sm:text-3xl">The three types of property licence</h2>
            <p className="mx-auto mt-3 max-w-2xl text-navy-400">
              Most landlords only think about HMO licences. There are actually three regimes, and any combination can
              apply to one property.
            </p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              {
                t: "Mandatory HMO",
                s: "Applies everywhere in England",
                b: "Any property let to 5 or more people forming 2 or more households who share a kitchen, bathroom or toilet. No storey rule since 2018.",
              },
              {
                t: "Additional HMO",
                s: "Where the council designates it",
                b: "Extends HMO licensing to smaller shared homes, typically 3 to 4 sharers, that fall below the mandatory threshold.",
              },
              {
                t: "Selective",
                s: "Where the council designates it",
                b: "Covers ordinary private rented homes, not just HMOs, in a designated area. A single family let still needs one if it is in the zone.",
              },
            ].map((c) => (
              <div key={c.t} className="rounded-2xl border border-navy-800 bg-navy-800/30 p-6">
                <h3 className="text-lg font-bold text-navy-100">{c.t}</h3>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-accent-500">{c.s}</p>
                <p className="mt-3 text-sm text-navy-400">{c.b}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href="/guides/landlord-licensing" className="text-sm font-medium text-accent-400 hover:text-accent-300">
              Read the full guide to landlord licensing →
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-14 sm:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-navy-100 sm:text-3xl">How the licence check works</h2>
            <p className="mx-auto mt-3 max-w-2xl text-navy-400">
              Most landlords have no idea their street is covered until enforcement arrives. Three steps to certainty.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {steps.map((s) => (
              <div key={s.n} className="rounded-2xl border border-navy-800 bg-navy-800/30 p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-600/15 text-lg font-bold text-accent-400">
                  {s.n}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-navy-100">{s.title}</h3>
                <p className="mt-2 text-sm text-navy-400">{s.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link
              href="/check"
              className="inline-block rounded-lg bg-accent-600 px-8 py-3.5 font-semibold text-white shadow-lg shadow-accent-600/25 transition-all hover:bg-accent-500"
            >
              Check your postcode now
            </Link>
          </div>
        </div>
      </section>

      {/* What you get */}
      <section className="border-y border-navy-800 bg-navy-950 py-14 sm:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-navy-100 sm:text-3xl">What&apos;s in your £7.99 report</h2>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {[
              ["A verdict on every licence type", "Selective, additional and mandatory HMO, decided for your exact property and occupancy."],
              ["Scheme dates and fees", "When each scheme runs, what the council charges, and links to the official designation."],
              ["Your penalty exposure", "The specific civil penalty, rent repayment order and prosecution risk you carry if unlicensed."],
              ["A clear action plan", "Exactly what to do next, in order, so you get compliant fast."],
            ].map(([t, b]) => (
              <div key={t} className="flex gap-4 rounded-xl border border-navy-800 bg-navy-800/30 p-5">
                <svg className="mt-0.5 h-6 w-6 flex-none text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="font-semibold text-navy-100">{t}</h3>
                  <p className="mt-1 text-sm text-navy-400">{b}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who it's for */}
      <section className="py-14 sm:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-navy-100 sm:text-3xl">Who uses PRSCheck</h2>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Landlords", "Confirm your existing lets are licensed, and check before you buy a new rental or change the tenancy."],
              ["Letting & managing agents", "Check licensing across a portfolio and avoid managing an unlicensed property on a client's behalf."],
              ["Property buyers", "Find out during due diligence whether a buy-to-let you are purchasing sits in a licensing area."],
              ["Tenants", "Check whether the home you rent should be licensed, which underpins a rent repayment claim if it isn't."],
            ].map(([t, b]) => (
              <div key={t} className="rounded-2xl border border-navy-800 bg-navy-800/30 p-6">
                <h3 className="font-bold text-navy-100">{t}</h3>
                <p className="mt-2 text-sm text-navy-400">{b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Renters' Rights Act urgency */}
      <section className="border-t border-navy-800 py-14 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-warning/30 bg-warning/5 p-6 sm:p-8">
            <h2 className="text-xl font-bold text-navy-100 sm:text-2xl">The rules are tightening in 2026</h2>
            <p className="mt-3 text-navy-300">
              The Renters&apos; Rights Act 2025 raised the maximum civil penalty to £40,000, extended rent repayment
              orders to 24 months, and is rolling out a national PRS Database that every landlord must join. Councils are
              also using new powers to launch selective licensing schemes far faster than before. If you let property,
              staying on top of licensing has never mattered more.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/councils" className="rounded-lg border border-navy-700 px-5 py-2.5 text-sm font-semibold text-navy-200 transition-all hover:border-navy-600 hover:bg-navy-800">
                Browse licensing by council
              </Link>
              <Link href="/check" className="rounded-lg bg-accent-600 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-accent-500">
                Check my property
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* For councils (B2B, secondary) */}
      <section className="border-t border-navy-800 bg-navy-950 py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-accent-500">For local authorities</h2>
          <p className="mt-3 text-xl font-bold text-navy-100 sm:text-2xl">
            Run a council housing team? PRSCheck also powers PRS enforcement.
          </p>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-navy-400">
            Automated compliance screening, HMO detection and enforcement case management for local authority housing
            teams preparing for the PRS Database.
          </p>
          <div className="mt-6">
            <Link
              href="/platform"
              className="inline-flex items-center gap-2 text-sm font-medium text-accent-400 transition-colors hover:text-accent-300"
            >
              See the council platform
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
          <h2 className="text-2xl font-bold text-navy-100 sm:text-3xl">Check your property in seconds</h2>
          <p className="mt-3 text-navy-400">Free scheme check. £7.99 for the full property-specific report.</p>
          <div className="mt-6">
            <Link
              href="/check"
              className="inline-block rounded-lg bg-accent-600 px-8 py-4 font-semibold text-white shadow-lg shadow-accent-600/25 transition-all hover:bg-accent-500"
            >
              Start my licence check
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
