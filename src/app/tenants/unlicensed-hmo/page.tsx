import type { Metadata } from "next";
import Link from "next/link";
import PostcodeCTA from "@/components/PostcodeCTA";
import { RRO_FACTS } from "@/lib/rro";
import { penaltiesFor } from "@/lib/licensing";

export const metadata: Metadata = {
  title: "Unlicensed HMO: What Tenants Can Do (and Claim) in 2026",
  description:
    "Living in a shared house with no HMO licence? What counts as an HMO, how to check the licence, what the council can do, and how to claim up to 24 months' rent back.",
  alternates: { canonical: "https://prscheck.co.uk/tenants/unlicensed-hmo" },
  openGraph: {
    title: "Unlicensed HMO: What Tenants Can Do",
    description: "What counts as an HMO, how to check the licence, and how to claim rent back.",
    url: "https://prscheck.co.uk/tenants/unlicensed-hmo",
  },
};

export default function UnlicensedHmoPage() {
  const pen = penaltiesFor("england");

  const faqs = [
    {
      q: "What counts as an HMO?",
      a: "In England, a house in multiple occupation is a property occupied by three or more people forming two or more households who share a kitchen, bathroom or toilet. A mandatory licence is required at five or more people in two or more households. Between three and four sharers, a licence is required only where the council has designated additional licensing. Scotland's threshold is three or more people from three or more households, and Northern Ireland's is three or more people forming more than two households.",
    },
    {
      q: "Is a couple one household or two?",
      a: "One. A household is a single person or members of the same family living together, including couples, so two sharers plus a couple is three households and four people.",
    },
    {
      q: "How do I find out if my HMO is licensed?",
      a: "Councils must keep a public register of licensed HMOs and let you inspect it. Search the council website for its HMO register and look up your address. For evidence you can use, email the private-sector housing team and ask in writing whether the address held a licence for each month of your tenancy.",
    },
    {
      q: "What happens to my tenancy if the landlord is unlicensed?",
      a: "Your tenancy is still valid and you still owe rent. An unlicensed landlord faces restrictions on regaining possession, and section 21 no-fault evictions were abolished on 1 May 2026 in any event. You do not lose your home by raising this, and you should keep paying your rent while a claim is running.",
    },
    {
      q: "Can I report my landlord anonymously?",
      a: "You can report an unlicensed HMO to the council's private-sector housing team, and councils will normally act on anonymous information. Bear in mind that a Rent Repayment Order claim of your own cannot be anonymous, because you have to be identified as the person who paid the rent.",
    },
    {
      q: "Will the council's enforcement stop me claiming?",
      a: "No. A council can impose a civil penalty and you can separately apply for a Rent Repayment Order for the same offence. The tribunal must be satisfied beyond reasonable doubt, and a council penalty is useful evidence, but you do not have to wait for one.",
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
          <span className="text-navy-400">Unlicensed HMO</span>
        </nav>

        <h1 className="mt-4 text-3xl font-bold text-navy-100 sm:text-4xl">
          My HMO is unlicensed. What can I do?
        </h1>
        <p className="mt-4 text-lg text-navy-300">
          Shared houses are where most licensing breaches sit, because the rules bite at a threshold plenty of landlords
          have never checked against their own property. If the house you share needed an HMO licence and did not have
          one, that is a criminal offence, and you may be able to claim rent back.
        </p>

        <section className="mt-10">
          <h2 className="text-2xl font-bold text-navy-100">First, work out whether a licence was needed</h2>
          <p className="mt-3 text-navy-300">
            Count people and households, not bedrooms. A household is one person or members of one family, so a couple
            counts once.
          </p>
          <div className="mt-5 space-y-4">
            {[
              {
                t: "5 or more people, 2 or more households",
                b: "A mandatory HMO licence is required, anywhere in England, with no designation needed and no storey test since October 2018. In Wales the same occupancy plus three or more storeys.",
                tone: "border-danger/40 bg-danger/5",
              },
              {
                t: "3 or 4 people, 2 or more households",
                b: "A licence is required only where the council has designated additional licensing for the area. Many have. This is the case most often missed, by landlords and tenants alike.",
                tone: "border-warning/40 bg-warning/5",
              },
              {
                t: "Any number, inside a selective licensing area",
                b: "Selective licensing covers ordinary private rented homes, not just shared ones. A single household in a designated street still needs a licence.",
                tone: "border-navy-800 bg-navy-800/30",
              },
            ].map((c) => (
              <div key={c.t} className={`rounded-xl border p-5 ${c.tone}`}>
                <h3 className="font-semibold text-navy-100">{c.t}</h3>
                <p className="mt-1.5 text-sm text-navy-400">{c.b}</p>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <PostcodeCTA
              audience="tenant"
              heading="Check the house you share"
              sub="Free check of every mandatory, additional and selective scheme that could apply to that postcode."
            />
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-bold text-navy-100">Then check whether a licence was actually held</h2>
          <p className="mt-3 text-navy-300">
            Councils must keep a public register of licensed HMOs and let you inspect it, so start there. Then ask the
            private-sector housing team in writing to confirm the position for each month you lived there, because a
            written answer from the licensing authority is what a tribunal will accept. It also settles the two defences
            that would otherwise sink a claim: that an application was already in, or that a temporary exemption notice
            was in force.
          </p>
          <p className="mt-3 text-navy-400">
            The full method, including what to say in the email, is on{" "}
            <Link href="/tenants/is-my-landlord-licensed" className="text-accent-400 hover:underline">
              is my landlord licensed
            </Link>
            .
          </p>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-bold text-navy-100">What happens to the landlord</h2>
          <p className="mt-3 text-navy-300">
            Two separate things can follow, and they do not cancel each other out.
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-navy-800 bg-navy-800/30 p-5">
              <h3 className="font-semibold text-navy-100">The council can act</h3>
              <p className="mt-1.5 text-sm text-navy-400">
                A civil penalty of up to {pen.civilPenaltyLabel} per offence, or prosecution with{" "}
                {pen.criminalFine === "unlimited" ? "an unlimited fine" : `a fine of ${pen.criminalFine}`}. Report it to
                the private-sector housing team. Councils will usually act on anonymous information.
              </p>
            </div>
            <div className="rounded-xl border border-accent-500/30 bg-accent-600/10 p-5">
              <h3 className="font-semibold text-navy-100">You can claim</h3>
              <p className="mt-1.5 text-sm text-navy-400">
                A Rent Repayment Order of up to {RRO_FACTS.maxMonths}{" "}
                months&apos; rent, applied for by you, decided by
                the First-tier Tribunal. No conviction needed first, but the tribunal must be satisfied{" "}
                {RRO_FACTS.standardOfProof}.
              </p>
            </div>
          </div>
          <p className="mt-5 text-sm text-navy-400">
            Sharers can claim together over the same unlicensed period, using the same designation evidence. Each of you
            claims the rent you personally paid.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/tenants/rent-repayment-order"
              className="rounded-lg bg-accent-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-accent-500"
            >
              How to claim, step by step
            </Link>
            <Link
              href="/tenants/rent-repayment-order-calculator"
              className="rounded-lg border border-navy-700 px-6 py-3 text-sm font-semibold text-navy-200 transition-all hover:border-navy-600 hover:bg-navy-800"
            >
              Calculate your range
            </Link>
          </div>
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

        <p className="mt-10 text-xs text-navy-600">
          PRSCheck is an information service based on published council designations and national legislation, not legal
          advice. For advice on your own situation, speak to Shelter, Citizens Advice or your council&apos;s
          private-sector housing team.
        </p>
      </div>
    </>
  );
}
