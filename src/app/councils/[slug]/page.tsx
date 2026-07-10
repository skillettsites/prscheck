import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { englishCouncils, getCouncilBySlug, councilSummary, COUNCILS } from "@/lib/licensing";
import SchemeList from "@/components/SchemeList";
import PostcodeCTA from "@/components/PostcodeCTA";

export const dynamicParams = false;

export function generateStaticParams() {
  return COUNCILS.filter((c) => c.nation === "england").map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const council = getCouncilBySlug(slug);
  if (!council) return {};
  const summary = councilSummary(council.gss)!;
  const hasLive = summary.activeSelective.length + summary.activeAdditional.length > 0;
  const title = `${council.name} Landlord Licensing 2026: Selective, Additional & HMO`;
  const description = hasLive
    ? `${council.name} operates ${summary.activeSelective.length > 0 ? "selective" : ""}${summary.activeSelective.length > 0 && summary.activeAdditional.length > 0 ? " and " : ""}${summary.activeAdditional.length > 0 ? "additional (HMO)" : ""} licensing. Check dates, fees, covered areas and whether your property needs a licence.`
    : `Does your rental property in ${council.name} need a licence? Current selective, additional and mandatory HMO licensing rules, penalties, and a free postcode check.`;
  return {
    title,
    description,
    alternates: { canonical: `https://prscheck.co.uk/councils/${slug}` },
  };
}

export default async function CouncilPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const council = getCouncilBySlug(slug);
  if (!council || council.nation !== "england") notFound();
  const summary = councilSummary(council.gss)!;

  const activeSchemes = [...summary.activeSelective, ...summary.activeAdditional];
  const hasLive = activeSchemes.length > 0;
  const hasUpcoming = summary.upcoming.length > 0;

  const faq = [
    {
      q: `Do I need a landlord licence in ${council.name}?`,
      a: hasLive
        ? `${council.name} operates ${summary.activeSelective.length > 0 ? `${summary.activeSelective.length} selective licensing scheme(s)` : ""}${summary.activeSelective.length > 0 && summary.activeAdditional.length > 0 ? " and " : ""}${summary.activeAdditional.length > 0 ? `${summary.activeAdditional.length} additional (HMO) licensing scheme(s)` : ""}. Whether your specific property needs a licence depends on its exact location and how it is let, plus mandatory HMO licensing which applies England-wide to properties let to 5+ people in 2+ households.`
        : `${council.name} does not currently operate a selective or additional licensing scheme. However, mandatory HMO licensing still applies to any property let to 5 or more people forming 2 or more households and sharing facilities.`,
    },
    {
      q: `What is the penalty for an unlicensed property in ${council.name}?`,
      a: `Operating a licensable property without a licence can lead to a civil penalty of up to £40,000 per offence, a Rent Repayment Order of up to 24 months' rent, an unlimited fine on prosecution, and a banning order for serious or repeat offenders.`,
    },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav className="mb-6 text-sm text-navy-500">
        <Link href="/councils" className="hover:text-accent-400">
          Councils
        </Link>{" "}
        / <span className="text-navy-300">{council.name}</span>
      </nav>

      <h1 className="text-3xl font-bold text-navy-100 sm:text-4xl">{council.name}: landlord licensing</h1>
      <p className="mt-3 text-navy-400">
        {hasLive
          ? `${council.name} operates discretionary property licensing. Here is what is in force, what is coming, and how to check whether your property is affected.`
          : hasUpcoming
            ? `${council.name} has a licensing scheme approved and starting soon. Here is what is coming and how to check your property.`
            : `${council.name} does not currently run a selective or additional licensing scheme, but mandatory HMO licensing still applies. Here is the full picture.`}
      </p>

      <div className="mt-8">
        <PostcodeCTA
          heading={`Check a ${council.name} property`}
          sub="Enter your postcode for an instant scheme check, then get the property-specific report."
        />
      </div>

      {summary.activeSelective.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 text-2xl font-bold text-navy-100">Active selective licensing</h2>
          <p className="mb-4 text-sm text-navy-400">
            Selective licensing applies to ordinary private rented homes (not just HMOs) within a designated area.
          </p>
          <SchemeList schemes={summary.activeSelective} />
        </section>
      )}

      {summary.activeAdditional.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 text-2xl font-bold text-navy-100">Active additional (HMO) licensing</h2>
          <p className="mb-4 text-sm text-navy-400">
            Additional licensing extends HMO licensing to smaller shared houses (typically 3-4 sharers) that fall below
            the mandatory threshold.
          </p>
          <SchemeList schemes={summary.activeAdditional} />
        </section>
      )}

      {summary.upcoming.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 text-2xl font-bold text-navy-100">Upcoming schemes</h2>
          <SchemeList schemes={summary.upcoming} />
        </section>
      )}

      {summary.proposed.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 text-2xl font-bold text-navy-100">Proposed / under review</h2>
          <p className="mb-4 text-sm text-navy-400">
            These schemes are consulted on or otherwise not yet formally in force. They do not require a licence today
            but are worth watching.
          </p>
          <SchemeList schemes={summary.proposed} />
        </section>
      )}

      {summary.expired.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 text-2xl font-bold text-navy-100">Recently expired</h2>
          <SchemeList schemes={summary.expired} />
        </section>
      )}

      {/* Mandatory HMO always applies */}
      <section className="mt-10 rounded-2xl border border-navy-700 bg-navy-800/60 p-6">
        <h2 className="text-xl font-bold text-navy-100">Mandatory HMO licensing (applies everywhere)</h2>
        <p className="mt-2 text-sm text-navy-300">
          Regardless of local schemes, any property in {council.name} let to 5 or more people forming 2 or more
          households, who share a kitchen, bathroom or toilet, needs a mandatory HMO licence under the Housing Act 2004.
          Licences last up to 5 years and the fee is set by the council.
        </p>
      </section>

      {/* Penalties */}
      <section className="mt-6 rounded-2xl border border-danger/30 bg-danger/5 p-6">
        <h2 className="text-xl font-bold text-navy-100">Penalties for operating unlicensed</h2>
        <ul className="mt-3 space-y-2 text-sm text-navy-300">
          <li>Civil penalty of up to <strong className="text-red-300">£40,000</strong> per offence (raised from £30,000 on 1 May 2026).</li>
          <li>Rent Repayment Order of up to <strong className="text-red-300">24 months&apos;</strong> rent, claimable by the tenant.</li>
          <li>Unlimited fine on criminal prosecution, plus possible banning order.</li>
          <li>Once the national PRS Database is live, unregistered landlords can be blocked from regaining possession.</li>
        </ul>
      </section>

      {summary.notes && (
        <section className="mt-6 rounded-2xl border border-navy-700 bg-navy-800/60 p-6">
          <h2 className="text-lg font-bold text-navy-100">Notes</h2>
          <p className="mt-2 text-sm text-navy-400">{summary.notes}</p>
        </section>
      )}

      {/* FAQ */}
      <section className="mt-10">
        <h2 className="mb-4 text-2xl font-bold text-navy-100">Frequently asked questions</h2>
        <div className="space-y-4">
          {faq.map((f, i) => (
            <div key={i} className="rounded-xl border border-navy-700 bg-navy-800/60 p-5">
              <h3 className="font-semibold text-navy-100">{f.q}</h3>
              <p className="mt-2 text-sm text-navy-300">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-10">
        <PostcodeCTA />
      </div>

      <p className="mt-8 text-xs text-navy-600">
        Data verified against council sources as of July 2026. PRSCheck is an information service, not legal advice.
        Many schemes are designated at street or part-ward level; confirm the exact boundary for your address with the
        council before relying on this page. <Link href="/councils" className="text-accent-400 underline">Browse all councils</Link>.
      </p>
    </div>
  );
}
