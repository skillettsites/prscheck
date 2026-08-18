import type { Metadata } from "next";
import Link from "next/link";
import PostcodeCTA from "@/components/PostcodeCTA";
import { councilsWithLiveSchemes, englishCouncils } from "@/lib/licensing";
import { RRO_FACTS } from "@/lib/rro";

export const metadata: Metadata = {
  title: "Is My Landlord Licensed? How To Check, Free (2026)",
  description:
    "Three free ways to check whether your landlord holds the licence your home needs: the council's public register, a postcode designation check, and a written request. What to do if they do not.",
  alternates: { canonical: "https://prscheck.co.uk/tenants/is-my-landlord-licensed" },
  openGraph: {
    title: "Is My Landlord Licensed?",
    description: "Three free ways to check, and what it means for you if the answer is no.",
    url: "https://prscheck.co.uk/tenants/is-my-landlord-licensed",
  },
};

export default function IsMyLandlordLicensedPage() {
  const live = councilsWithLiveSchemes();
  const total = englishCouncils().length;

  const faqs = [
    {
      q: "Is there a national register of licensed landlords?",
      a: "Not yet in England. Each council keeps its own public register of licensed properties, which it must let you inspect, so the check is council by council. A national PRS Database is being introduced under the Renters' Rights Act 2025, with registration opening from late 2026, but it is not live. Wales is different: every landlord must be registered with Rent Smart Wales, which does publish a national check. Scotland and Northern Ireland both operate national landlord registration too.",
    },
    {
      q: "Does every rental property need a licence?",
      a: `No, and this is where most confusion sits. A licence is needed if the property is inside a council's selective or additional licensing designation, or if it meets the mandatory HMO test of five or more people in two or more households in England. ${live.length} of ${total} English councils currently run at least one live designation, and those designations are often drawn street by street rather than covering the whole borough.`,
    },
    {
      q: "My landlord uses a letting agent. Who needs the licence?",
      a: "The licence attaches to the property and is held by a person: usually the owner, sometimes the managing agent applying on their behalf. Either way, a property that needs a licence and does not have one is an offence by whoever has control or management of it, and both the landlord and an agent can be liable.",
    },
    {
      q: "Can my landlord evict me for asking?",
      a: "Section 21 no-fault evictions were abolished on 1 May 2026, so a landlord cannot end your tenancy simply because you asked a question. A landlord who is unlicensed also faces restrictions on regaining possession. If you are being threatened or harassed, contact your council's private-sector housing team and Shelter, and keep a written record.",
    },
    {
      q: "What if the property should have been licensed and was not?",
      a: `Letting an unlicensed property is a criminal offence under section 72(1) or section 95(1) of the Housing Act 2004. As a tenant you can apply to the First-tier Tribunal for a Rent Repayment Order of up to ${RRO_FACTS.maxMonths} months' rent for an offence committed on or after 1 May 2026. You must apply within ${RRO_FACTS.applicationWindowMonths} months of the offence.`,
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
          <span className="text-navy-400">Is my landlord licensed?</span>
        </nav>

        <h1 className="mt-4 text-3xl font-bold text-navy-100 sm:text-4xl">Is my landlord licensed?</h1>
        <p className="mt-4 text-lg text-navy-300">
          There are two separate questions here and they are easy to confuse. First, does the home you rent need a
          licence at all? Second, does your landlord hold one? You need both answers, and you can get both free.
        </p>

        <section className="mt-10">
          <h2 className="text-2xl font-bold text-navy-100">Question one: does this property need a licence?</h2>
          <p className="mt-3 text-navy-300">
            A licence is required in three situations. Your home may fall into more than one.
          </p>
          <div className="mt-5 space-y-4">
            {[
              {
                t: "Selective licensing",
                b: "The council has designated the area, and every private rented home inside it needs a licence, even a single family let. Designations are frequently drawn street by street, or cover a few wards rather than the whole council.",
              },
              {
                t: "Additional HMO licensing",
                b: "The council has designated the area for smaller shared houses, typically three or four sharers, that fall below the mandatory threshold.",
              },
              {
                t: "Mandatory HMO licensing",
                b: "Applies everywhere in England, with no designation needed: five or more people forming two or more households who share a kitchen, bathroom or toilet. There has been no storey requirement since October 2018. Wales kept a three-storey test.",
              },
            ].map((c) => (
              <div key={c.t} className="rounded-xl border border-navy-800 bg-navy-800/30 p-5">
                <h3 className="font-semibold text-navy-100">{c.t}</h3>
                <p className="mt-1.5 text-sm text-navy-400">{c.b}</p>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <PostcodeCTA
              audience="tenant"
              heading="Check your postcode against every live scheme"
              sub="Free. Shows each designation covering that address, its dates, and the council's own source link."
            />
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-bold text-navy-100">Question two: does your landlord hold one?</h2>
          <p className="mt-3 text-navy-300">
            Three routes, all free. Use the third one if you may claim, because it is the one a tribunal will accept.
          </p>
          <ol className="mt-6 space-y-6">
            {[
              {
                t: "The council's public register",
                b: "Every council that licenses properties must keep a register of licensed HMOs and licensed houses, and must let members of the public inspect it. Most publish it online: search the council's site for \"public register of licensed properties\" or \"HMO register\". Look up your own address, not your landlord's name, because the licence attaches to the property.",
              },
              {
                t: "Rent Smart Wales, if you are in Wales",
                b: "Every Welsh landlord must be registered and, unless a licensed agent manages the property, licensed too. Rent Smart Wales publishes a public check by property address or landlord name. This is separate from, and additional to, any local selective or additional licensing scheme.",
              },
              {
                t: "Ask the council in writing",
                b: "This is the one that carries weight. Email the private-sector housing team and ask whether the address held a licence, had an application pending, or held a temporary exemption notice, for each month of your tenancy. A written reply from the licensing authority is the evidence a tribunal wants, and it closes off the two defences a landlord would otherwise raise.",
              },
            ].map((s, i) => (
              <li key={s.t} className="flex gap-4">
                <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-accent-600/15 text-sm font-bold text-accent-400">
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-semibold text-navy-100">{s.t}</h3>
                  <p className="mt-1 text-sm text-navy-400">{s.b}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-6 text-sm text-navy-400">
            Not sure which council covers you, or what it licenses? Every English and Welsh council has a page here with
            its live schemes, dates and fees:{" "}
            <Link href="/councils" className="text-accent-400 hover:underline">
              licensing by council
            </Link>
            .
          </p>
        </section>

        <section className="mt-12 rounded-2xl border border-accent-500/30 bg-accent-600/10 p-6">
          <h2 className="text-xl font-bold text-navy-100">If the answer is no</h2>
          <p className="mt-3 text-navy-300">
            A property that needed a licence and was let without one is a criminal offence by the landlord, and you may
            be able to claim rent back. A Rent Repayment Order can be up to {RRO_FACTS.maxMonths}{" "}
            months&apos; rent for
            an offence committed on or after 1 May 2026, and you have {RRO_FACTS.applicationWindowMonths} months from
            the offence to apply.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/tenants/rent-repayment-order"
              className="rounded-lg bg-accent-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-accent-500"
            >
              How to claim your rent back
            </Link>
            <Link
              href="/tenants/rent-repayment-order-calculator"
              className="rounded-lg border border-navy-700 px-6 py-3 text-sm font-semibold text-navy-200 transition-all hover:border-navy-600 hover:bg-navy-800"
            >
              What it could be worth
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
