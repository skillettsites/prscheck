import type { Metadata } from "next";
import Link from "next/link";
import { BookDemoButton } from "@/components/DemoPopup";

export const metadata: Metadata = {
  title: "About",
  description:
    "PRSCheck has two sides: instant £7.99 property licence checks for landlords, tenants and buyers, and a PRS enforcement platform for local authority housing teams. All built on government-backed licensing data.",
  alternates: { canonical: "https://prscheck.co.uk/about" },
};

const consumerPoints = [
  "Enter any England postcode for a free check of the licensing schemes that apply.",
  "Answer a couple of questions about the tenancy and get a £7.99 property-specific report.",
  "See exactly which licence you need (selective, additional or mandatory HMO), the scheme dates and fees, your penalty exposure, and a step-by-step action plan.",
];

const councilPoints = [
  "Screen every private rented property in your area against official public datasets.",
  "Surface unlicensed HMOs by cross-referencing council tax, EPC and licensing data.",
  "Prioritise enforcement, manage cases end to end, and turn civil penalty income into self-funding oversight.",
];

export default function AboutPage() {
  return (
    <>
      {/* Header */}
      <section className="bg-gradient-to-b from-navy-950 to-navy-900 py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-navy-100 sm:text-5xl">About PRSCheck</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-navy-400">
            Getting property licensing right, from both sides. We help landlords, tenants and buyers find out whether a
            property needs a licence, and we help councils enforce the rules across their whole private rented sector.
          </p>
          <p className="mx-auto mt-4 inline-flex items-center gap-1.5 rounded-full border border-navy-700 bg-navy-800 px-3 py-1 text-xs text-navy-400">
            <span aria-hidden>🏛️</span> Built on government-backed data
          </p>
        </div>
      </section>

      {/* The two sides */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-accent-500">Two sides, one dataset</h2>
            <p className="mt-3 text-2xl font-bold text-navy-100 sm:text-3xl">Who PRSCheck is for</p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            {/* Side 1: Consumers */}
            <div className="flex flex-col rounded-2xl border border-accent-500/30 bg-accent-600/5 p-8">
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-accent-500/40 bg-accent-600/10 px-3 py-1 text-xs font-semibold text-accent-300">
                For landlords, tenants &amp; buyers
              </span>
              <h3 className="mt-5 text-2xl font-bold text-navy-100">One-off property licence check</h3>
              <p className="mt-3 text-navy-400">
                A licence you did not know you needed can cost up to £40,000. Before you let, rent or buy, check the
                property in seconds, no subscription, no jargon.
              </p>
              <ul className="mt-6 space-y-3">
                {consumerPoints.map((p) => (
                  <li key={p} className="flex gap-3 text-sm text-navy-300">
                    <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-accent-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8 pt-2">
                <Link
                  href="/check"
                  className="inline-block rounded-lg bg-accent-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-accent-600/25 transition-all hover:bg-accent-500"
                >
                  Check a property, free
                </Link>
              </div>
            </div>

            {/* Side 2: Councils */}
            <div className="flex flex-col rounded-2xl border border-navy-700 bg-navy-800/40 p-8">
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-navy-600 bg-navy-800 px-3 py-1 text-xs font-semibold text-navy-300">
                For councils &amp; housing teams
              </span>
              <h3 className="mt-5 text-2xl font-bold text-navy-100">PRS enforcement platform</h3>
              <p className="mt-3 text-navy-400">
                The Renters&apos; Rights Act 2025 and the forthcoming PRS Database give councils more data than ever.
                PRSCheck turns that data into action, so a stretched team can cover far more ground.
              </p>
              <ul className="mt-6 space-y-3">
                {councilPoints.map((p) => (
                  <li key={p} className="flex gap-3 text-sm text-navy-300">
                    <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-navy-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-wrap gap-3 pt-2">
                <BookDemoButton className="rounded-lg bg-navy-100 px-7 py-3.5 text-sm font-semibold text-navy-950 transition-all hover:bg-white">
                  Book a demo
                </BookDemoButton>
                <Link
                  href="/solutions"
                  className="rounded-lg border border-navy-700 px-7 py-3.5 text-sm font-semibold text-navy-300 transition-all hover:border-navy-600 hover:bg-navy-800"
                >
                  See the platform
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="border-y border-navy-800 bg-navy-950 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-accent-500">Our mission</h2>
          <p className="mt-4 text-2xl font-bold leading-relaxed text-navy-100">
            Make property licensing clear for the people who have to comply, and enforceable for the authorities who
            oversee it.
          </p>
          <div className="mt-8 space-y-4 text-navy-400">
            <p>
              England&apos;s licensing landscape is a patchwork: mandatory HMO rules apply nationwide, while hundreds of
              councils run their own selective and additional schemes, often street by street. It is genuinely hard for
              a landlord to know where they stand, and hard for a council to see the full picture of who is compliant.
            </p>
            <p>
              PRSCheck maps every active and upcoming scheme in England to the areas it covers, layered on the national
              rules. The same dataset powers both a simple consumer check and a professional enforcement platform, two
              front doors to one source of truth.
            </p>
          </div>
        </div>
      </section>

      {/* Data provenance */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-accent-500">Where our data comes from</h2>
          <p className="mt-4 text-xl font-bold text-navy-100 sm:text-2xl">Government-backed, cross-referenced, verified.</p>
          <div className="mt-6 space-y-4 text-navy-400">
            <p>
              Every result is built from official sources: local authority licensing designations, ONS council and ward
              boundaries, the government&apos;s EPC register for addresses, and UK housing legislation (the Housing Act
              2004 and its statutory instruments). We cross-reference schemes against each council&apos;s own published
              designation and record the date we verified it.
            </p>
            <p>
              Many schemes are designated at street or part-ward level, so a licence can apply to one address and not the
              one next door. That is exactly why a postcode-level answer is not enough, and why the paid report resolves
              your specific property and cites its official source.
            </p>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="border-y border-navy-800 bg-navy-950 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-accent-500">Team</h2>
          <p className="mt-3 text-2xl font-bold text-navy-100 sm:text-3xl">Built by people who understand housing</p>
          <p className="mx-auto mt-4 max-w-2xl text-navy-400">
            We combine expertise in private rented housing, licensing enforcement and public data. More details coming
            soon.
          </p>
        </div>
      </section>

      {/* Dual CTA */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-navy-100">Whichever side you are on</h2>
          <p className="mt-4 text-navy-400">Check a single property, or talk to us about enforcement across your area.</p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/check"
              className="rounded-lg bg-accent-600 px-8 py-3.5 text-sm font-semibold text-white transition-all hover:bg-accent-500"
            >
              Check a property
            </Link>
            <BookDemoButton className="rounded-lg border border-navy-700 px-8 py-3.5 text-sm font-semibold text-navy-300 transition-all hover:border-navy-600 hover:bg-navy-800">
              Book a council demo
            </BookDemoButton>
          </div>
        </div>
      </section>
    </>
  );
}
