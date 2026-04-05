import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description:
    "PRSCheck is building the intelligence layer for PRS enforcement. Our mission is making private rented sector oversight effective, affordable, and accessible for every council.",
  alternates: { canonical: "https://prscheck.co.uk/about" },
};

const values = [
  {
    title: "Accuracy",
    description: "Every data point is sourced from official government registers. We cross-reference multiple sources to reduce false positives and ensure your team acts on reliable intelligence.",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    ),
  },
  {
    title: "Affordability",
    description: "Council budgets are under pressure. PRSCheck is priced so that civil penalty income from improved enforcement covers the platform cost, typically within the first quarter.",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
    ),
  },
  {
    title: "Accessibility",
    description: "Small district councils deserve the same enforcement tools as large metropolitan authorities. Our Starter tier ensures every council can afford effective PRS oversight.",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
    ),
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Header */}
      <section className="bg-gradient-to-b from-navy-950 to-navy-900 py-20">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-navy-100 sm:text-5xl">
            About PRSCheck
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-navy-400">
            Building the intelligence layer for PRS enforcement.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-accent-500">
            Our Mission
          </h2>
          <p className="mt-4 text-2xl font-bold leading-relaxed text-navy-100">
            Making PRS enforcement effective and affordable for every local authority in England.
          </p>
          <div className="mt-8 space-y-4 text-navy-400">
            <p>
              The Renters&apos; Rights Act 2025 transforms the regulatory landscape for private rented housing.
              The new PRS Database will give councils, for the first time, a comprehensive register of every
              landlord and property in the private rented sector.
            </p>
            <p>
              But data alone does not create compliance. Councils need the tools to analyse that data,
              identify non-compliant properties, prioritise enforcement action, and manage cases from
              investigation through to resolution.
            </p>
            <p>
              That is what PRSCheck does. We take 15 government data sources, combine them with the
              upcoming PRS Database, and give housing teams a single platform to monitor, investigate,
              and enforce across their entire PRS portfolio.
            </p>
          </div>
        </div>
      </section>

      {/* The Problem */}
      <section className="border-y border-navy-800 bg-navy-950 py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-accent-500">
            The Problem
          </h2>
          <p className="mt-4 text-2xl font-bold text-navy-100">
            Enforcement teams are overwhelmed.
          </p>
          <div className="mt-8 space-y-4 text-navy-400">
            <p>
              England has 4.6 million privately rented households, overseen by just a few thousand
              enforcement officers across 309 local authorities. Most councils have 3 to 5 officers
              responsible for 10,000 or more PRS properties.
            </p>
            <p>
              Only 2% of non-compliant landlords currently face any enforcement action. Not because
              councils lack the will, but because they lack the tools. Compliance checks are manual,
              data sits in silos, and case management happens in spreadsheets and email inboxes.
            </p>
            <p>
              The government has allocated 18.2 million for PRS enforcement in 2025/26. PRSCheck
              ensures that investment translates into measurable outcomes: more inspections, more
              penalties, and better housing conditions for tenants.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-accent-500">
              Values
            </h2>
            <p className="mt-3 text-3xl font-bold text-navy-100">
              What We Stand For
            </p>
          </div>
          <div className="mt-12 grid gap-8 lg:grid-cols-3">
            {values.map((value) => (
              <div key={value.title} className="rounded-xl border border-navy-800 bg-navy-800/30 p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent-600/10">
                  <svg className="h-6 w-6 text-accent-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    {value.icon}
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-navy-100">{value.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-navy-400">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Placeholder */}
      <section className="border-y border-navy-800 bg-navy-950 py-20">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-accent-500">
            Team
          </h2>
          <p className="mt-3 text-3xl font-bold text-navy-100">
            Built by People Who Understand Housing
          </p>
          <p className="mx-auto mt-4 max-w-2xl text-navy-400">
            Our team combines deep expertise in local government, housing enforcement,
            and government data platforms. More details coming soon.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-navy-100">
            Want to learn more?
          </h2>
          <p className="mt-4 text-navy-400">
            Book a demo to see how PRSCheck can support your enforcement team.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/demo"
              className="rounded-lg bg-accent-600 px-8 py-3.5 text-sm font-semibold text-white transition-all hover:bg-accent-500"
            >
              Book a Demo
            </Link>
            <Link
              href="/contact"
              className="rounded-lg border border-navy-700 px-8 py-3.5 text-sm font-semibold text-navy-300 transition-all hover:border-navy-600 hover:bg-navy-800"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
