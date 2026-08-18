import type { Metadata } from "next";
import Link from "next/link";
import PostcodeCTA from "@/components/PostcodeCTA";
import RroCalculator from "@/components/RroCalculator";
import {
  AWARD_BAND,
  RRO_DEFENCES,
  RRO_FACTS,
  RRO_OFFENCES,
  RRO_SECTION_44_FACTORS,
  RRO_SOURCES,
} from "@/lib/rro";

export const metadata: Metadata = {
  title: "Rent Repayment Order: Claim Up To 24 Months' Rent Back (2026)",
  description:
    "How to claim rent back from an unlicensed landlord. Which offences qualify, how much tribunals really award, the two-year deadline, and the Form RRO1 route step by step.",
  alternates: { canonical: "https://prscheck.co.uk/tenants/rent-repayment-order" },
  openGraph: {
    title: "Rent Repayment Orders: Claim Your Rent Back",
    description:
      "If your landlord let an unlicensed property you can apply for up to 24 months' rent. What qualifies, what tribunals award, and how to apply.",
    url: "https://prscheck.co.uk/tenants/rent-repayment-order",
  },
};

const steps = [
  {
    t: "Establish that a licence was required",
    b: "This is the whole claim. A licence was required if the property sat inside a live selective or additional licensing designation, or if it met the mandatory HMO test of five or more people in two or more households. Designations are often drawn street by street, so the address matters, not the town.",
  },
  {
    t: "Establish that no licence was held",
    b: "Councils keep a public register of licensed properties and must let you inspect it. Ask in writing whether this address held a licence, had an application pending, or held a temporary exemption notice, for each month of your tenancy. Keep the reply.",
  },
  {
    t: "Work out what you paid",
    b: "The order is capped at the rent you actually paid during the offence. Gather bank statements, the tenancy agreement and any receipts. If housing benefit or the housing element of universal credit covered part of the rent, that part belongs to the council's claim, not yours.",
  },
  {
    t: `Complete Form ${RRO_FACTS.applicationForm} and file it`,
    b: `The application goes to the ${RRO_FACTS.tribunal}. An application fee is payable, and the current amount is stated on the form. If you win you can ask the tribunal to order the landlord to reimburse it. Joint tenants on one agreement pay one fee between them.`,
  },
  {
    t: "Prepare the bundle",
    b: "You are proving a criminal offence to a civil tribunal, so present it like evidence: the designation with its dates and the council's own source, the council's reply about the licence, your tenancy agreement, and your rent payment record. Vagueness is what loses these cases.",
  },
];

export default function RentRepaymentOrderPage() {
  const pct = (n: number) => `${Math.round(n * 100)}%`;

  const faqs = [
    {
      q: "How much can I claim with a rent repayment order?",
      a: `Up to ${RRO_FACTS.maxMonths} months' rent for an offence committed on or after 1 May 2026, or ${RRO_FACTS.maxMonthsBeforeUplift} months for one that ended before then. The order cannot exceed the rent you actually paid. In practice tribunals award a percentage: they deduct any part of the rent that paid for utilities you alone consumed, then apply a percentage reflecting how serious the offence was, commonly between ${pct(AWARD_BAND.low)} and ${pct(AWARD_BAND.high)} for a straightforward licensing breach.`,
    },
    {
      q: "How long do I have to apply?",
      a: `Two years. Section 41 of the Housing and Planning Act 2016 requires an occupier to apply within ${RRO_FACTS.applicationWindowMonths} months of the offence. Where the offence continued over a period, the last date it was committed must fall inside that window. This is a hard deadline.`,
    },
    {
      q: "Does my landlord need to be convicted first?",
      a: "No. The tribunal can make an order without any conviction or civil penalty having been imposed. But it must be satisfied beyond reasonable doubt, the criminal standard, that the offence was committed.",
    },
    {
      q: "Can I still claim if I have moved out?",
      a: "Yes, as long as you occupied the property while the offence was being committed and you apply within two years of it. Moving out does not end the claim.",
    },
    {
      q: "Can we claim together if we shared the house?",
      a: "Yes. Each tenant claims the rent they paid, and a group of sharers can apply over the same unlicensed period using the same designation evidence. Joint tenants on a single agreement pay one application fee; separate agreements mean separate applications and separate fees.",
    },
    {
      q: "What if my landlord had applied for a licence?",
      a: "Then no offence was committed for the period the application was effective, under section 72(4) or section 95(3) of the Housing Act 2004, and the claim fails on that period. The same is true where a temporary exemption notice was in force. Check this with the council before you file.",
    },
    {
      q: "What if the landlord says they did not know about the scheme?",
      a: "There is a reasonable excuse defence at section 72(5) and section 95(4) of the Housing Act 2004, and the tribunal decides what counts. Simply not knowing a scheme existed has repeatedly failed as an excuse, but it is for the tribunal, not us, to weigh it.",
    },
    {
      q: "Does this apply in Scotland or Northern Ireland?",
      a: "No. The licensing offences and the rent repayment order sit in the Housing Act 2004 and the Housing and Planning Act 2016, which extend to England and Wales only. Scotland and Northern Ireland have landlord registration and HMO licensing with their own, different, enforcement routes.",
    },
  ];

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: "How to apply for a Rent Repayment Order",
      description:
        "The five steps a tenant in England or Wales takes to claim rent back from a landlord who let an unlicensed property.",
      step: steps.map((s, i) => ({
        "@type": "HowToStep",
        position: i + 1,
        name: s.t,
        text: s.b,
      })),
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:py-16">
        <nav className="text-sm text-navy-500">
          <Link href="/tenants" className="hover:text-navy-300">
            For tenants
          </Link>
          <span className="mx-2">/</span>
          <span className="text-navy-400">Rent Repayment Orders</span>
        </nav>

        <h1 className="mt-4 text-3xl font-bold text-navy-100 sm:text-4xl">
          Rent Repayment Orders: claiming your rent back
        </h1>
        <p className="mt-4 text-lg text-navy-300">
          A Rent Repayment Order makes a landlord pay back rent they have already received. For an unlicensed property
          let on or after 1 May 2026, the order can be up to {RRO_FACTS.maxMonths}{" "}
          months&apos; rent. You apply to a
          tribunal yourself. Your landlord does not have to be prosecuted first, and you do not need a solicitor.
        </p>
        <p className="mt-3 text-navy-400">
          This page covers what qualifies, what tribunals actually award as opposed to what the cap allows, the deadline
          that catches most people out, and the exact route to applying.
        </p>

        {/* Qualifying */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold text-navy-100">Which offences qualify</h2>
          <p className="mt-3 text-navy-300">
            Section 40(3) of the Housing and Planning Act 2016 lists them. The two licensing offences are the most
            common route, and they are the two PRSCheck can evidence from a postcode.
          </p>
          <ul className="mt-5 space-y-2.5">
            {RRO_OFFENCES.map((o) => (
              <li
                key={o.statute}
                className={`flex flex-wrap items-baseline justify-between gap-2 rounded-lg border p-3.5 text-sm ${
                  o.licensingOffence ? "border-accent-500/30 bg-accent-600/5" : "border-navy-800 bg-navy-800/30"
                }`}
              >
                <span className="text-navy-200">{o.offence}</span>
                <span className="font-mono text-xs text-navy-500">{o.statute}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* How much */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold text-navy-100">How much you actually get</h2>
          <p className="mt-3 text-navy-300">
            The cap is {RRO_FACTS.maxMonths}{" "}
            months&apos; rent. Almost nobody receives it, and it is worth understanding
            why before you build your hopes on a headline figure.
          </p>
          <p className="mt-3 text-navy-300">
            The Upper Tribunal set out the method in{" "}
            <a
              href="https://www.bailii.org/uk/cases/UKUT/LC/2022/239.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-400 underline"
            >
              Acheampong v Roman [2022] UKUT 239 (LC)
            </a>
            : take the whole rent for the relevant period, subtract any part of it that paid for utilities only you
            consumed, then decide a percentage reflecting how serious the offence was, then adjust for the section 44(4)
            factors. In Acheampong itself the tribunal landed on {pct(AWARD_BAND.high)} of the rent after utilities.
          </p>
          <div className="mt-5 rounded-xl border border-navy-800 bg-navy-800/30 p-5">
            <p className="text-sm font-semibold text-navy-100">
              Section 44(4) requires the tribunal to take into account:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-navy-400">
              {RRO_SECTION_44_FACTORS.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
            <p className="mt-3 text-sm text-navy-400">
              A landlord with one property, a clean record and a prompt apology is treated differently from a portfolio
              landlord who has been penalised before. None of that is visible from a postcode, which is why any estimate
              is a range.
            </p>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-bold text-navy-100">Work out your range</h3>
            <p className="mt-2 text-sm text-navy-400">
              This uses the Acheampong method and shows every step, including what the cap removes.
            </p>
            <div className="mt-4">
              <RroCalculator compact />
            </div>
            <p className="mt-3 text-sm text-navy-500">
              More detail, and the worked example, on the{" "}
              <Link href="/tenants/rent-repayment-order-calculator" className="text-accent-400 hover:underline">
                full calculator page
              </Link>
              .
            </p>
          </div>
        </section>

        {/* Steps */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold text-navy-100">How to apply, step by step</h2>
          <ol className="mt-6 space-y-5">
            {steps.map((s, i) => (
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
        </section>

        {/* Check CTA */}
        <section className="mt-12">
          <PostcodeCTA
            audience="tenant"
            heading="Step one, free: was your address inside a designated area?"
            sub="Enter the postcode. We show every live selective, additional and mandatory HMO scheme that could have applied, with the council's own source link."
          />
          <p className="mt-4 text-sm text-navy-400">
            If it was, the {"£"}29 evidence report puts the designation, its dates, the council source, your claim
            worked through the Acheampong method and the Form RRO1 route into one document you can print for the
            tribunal.
          </p>
        </section>

        {/* Defences */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold text-navy-100">What defeats a claim</h2>
          <p className="mt-3 text-navy-300">
            Check these before you pay a tribunal fee. Each one means no offence was committed, however clearly the
            property sat inside a designation.
          </p>
          <dl className="mt-5 space-y-4">
            {RRO_DEFENCES.map((d) => (
              <div key={d.defence} className="rounded-xl border border-warning/30 bg-warning/5 p-5">
                <dt className="font-semibold text-navy-100">
                  {d.defence} <span className="font-normal text-navy-500">({d.statute})</span>
                </dt>
                <dd className="mt-1.5 text-sm text-navy-400">{d.detail}</dd>
              </div>
            ))}
            <div className="rounded-xl border border-warning/30 bg-warning/5 p-5">
              <dt className="font-semibold text-navy-100">
                The two-year deadline has passed{" "}
                <span className="font-normal text-navy-500">(Housing and Planning Act 2016 s.41)</span>
              </dt>
              <dd className="mt-1.5 text-sm text-navy-400">
                An occupier must apply within {RRO_FACTS.applicationWindowMonths} months of the offence. For a
                continuing offence, the last date it was committed must fall inside that window. There is no discretion
                to extend it.
              </dd>
            </div>
          </dl>
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

        {/* Sources */}
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
            PRSCheck is an information service based on published council designations and national legislation. It is
            not legal advice, and nothing here predicts what a tribunal will decide. For advice on your own claim,
            speak to Shelter, Citizens Advice, a housing solicitor, or your council&apos;s private-sector housing team.
          </p>
        </section>

        {/* Landlord counterpart */}
        <section className="mt-12 rounded-2xl border border-navy-800 bg-navy-950 p-6 text-center">
          <p className="text-sm text-navy-400">
            Landlord reading this? The same exposure looks different from your side.
          </p>
          <Link
            href="/landlords/rent-repayment-orders"
            className="mt-2 inline-block text-sm font-medium text-accent-400 hover:text-accent-300"
          >
            Rent Repayment Orders: the landlord&apos;s view →
          </Link>
        </section>
      </div>
    </>
  );
}
