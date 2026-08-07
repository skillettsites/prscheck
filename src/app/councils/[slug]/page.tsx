import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getCouncilBySlug, councilSummary, COUNCILS, hasCouncilLicensingPowers } from "@/lib/licensing";
import SchemeList from "@/components/SchemeList";
import PostcodeCTA from "@/components/PostcodeCTA";

/**
 * The licensing rule that applies regardless of any council designation.
 * These genuinely differ by nation and must not be stated with England's test:
 * Wales kept the three-storey requirement England dropped in 2018, Scotland's
 * HMO threshold is lower, and Northern Ireland's is narrower.
 */
function mandatoryRule(nation: string): string {
  switch (nation) {
    case "wales":
      return "mandatory HMO licensing still applies, to properties of three or more storeys let to 5 or more people forming 2 or more households. Every Welsh landlord must also register with Rent Smart Wales.";
    case "scotland":
      return "every landlord must register with the council, and an HMO housing 3 or more people from 3 or more households needs an HMO licence under the Housing (Scotland) Act 2006.";
    case "northern-ireland":
      return "landlords must join the landlord registration scheme, and an HMO housing more than two households needs a licence from the NIHMO Unit at Belfast City Council, which administers licensing for all 11 councils.";
    default:
      return "mandatory HMO licensing still applies, to any property let to 5 or more people forming 2 or more households.";
  }
}

/**
 * Heading and body for the "mandatory HMO" panel, which is the largest thing on
 * the page and the first threshold a reader sees.
 *
 * It hardcoded England's 5-people-in-2-households test on every page in the UK.
 * Scotland's threshold is 3 people from 3 households and Northern Ireland's is
 * 3 people in more than two households, so the commonest licensable share in
 * either nation read "5 or more" and concluded no licence was needed. The
 * correct rule was three panels further down in the FAQ, contradicting it.
 */
function mandatoryPanel(nation: string, councilName: string): { heading: string; body: string } {
  switch (nation) {
    case "wales":
      return {
        heading: "Mandatory HMO licensing (applies everywhere in Wales)",
        body: `Regardless of local schemes, a property in ${councilName} needs a mandatory HMO licence where it has three or more storeys and is let to 5 or more people forming 2 or more households who share a kitchen, bathroom or toilet. Wales kept that three-storey test when England dropped it in 2018. Separately, every landlord in Wales must register with Rent Smart Wales, and must hold a licence too unless a licensed agent manages the property.`,
      };
    case "scotland":
      return {
        heading: "HMO licensing in Scotland",
        body: `Scottish councils cannot run selective or additional licensing, but HMO licensing is stricter here than in England. A property in ${councilName} needs an HMO licence where 3 or more people from 3 or more households share it, under the Housing (Scotland) Act 2006, not the 5 people in 2 households that applies in England. Every landlord must also be registered with the council.`,
      };
    case "northern-ireland":
      return {
        heading: "HMO licensing in Northern Ireland",
        body: `Councils in Northern Ireland cannot run selective or additional licensing, but an HMO licence is needed where a property in ${councilName} is occupied by 3 or more people forming more than two households, under the Houses in Multiple Occupation Act (Northern Ireland) 2016. That is a lower threshold than England's 5 people in 2 households. Licensing for all 11 councils is administered by the NIHMO Unit at Belfast City Council, and landlords must also join the landlord registration scheme.`,
      };
    default:
      return {
        heading: "Mandatory HMO licensing (applies everywhere)",
        body: `Regardless of local schemes, any property in ${councilName} let to 5 or more people forming 2 or more households, who share a kitchen, bathroom or toilet, needs a mandatory HMO licence under the Housing Act 2004. Licences last up to 5 years and the fee is set by the council.`,
      };
  }
}

/**
 * Penalty bullets. The £40,000 civil penalty and 24-month Rent Repayment Order
 * are Housing Act 2004 s.249A powers, so they exist in England and Wales only,
 * and the 24-month uplift is England-only. Showing them in Scotland or Northern
 * Ireland quoted a penalty regime that does not exist there.
 */
function penaltyBullets(nation: string): string[] {
  switch (nation) {
    case "wales":
      return [
        "Civil penalty of up to £30,000 per offence.",
        "Rent Repayment Order of up to 12 months' rent, claimable by the tenant. The 24-month uplift applies in England only.",
        "Unlimited fine on criminal prosecution.",
        "Renting out an unregistered or unlicensed property can also block a section 21 notice under Rent Smart Wales.",
      ];
    case "scotland":
      return [
        "Fine of up to £50,000 for operating an unlicensed HMO.",
        "The council can refuse or revoke landlord registration, which stops you letting lawfully.",
        "Letting while unregistered can lead to a rent penalty notice.",
      ];
    case "northern-ireland":
      return [
        "£5,000 fixed penalty, or a fine of up to £20,000 on summary conviction, for an unlicensed HMO.",
        "Up to £10,000 for breaching licence conditions.",
        "Failing to register as a landlord carries a £500 fixed penalty, or a court fine of up to £2,500.",
      ];
    default:
      return [
        "Civil penalty of up to £40,000 per offence (raised from £30,000 on 1 May 2026).",
        "Rent Repayment Order of up to 24 months' rent, claimable by the tenant.",
        "Unlimited fine on criminal prosecution, plus possible banning order.",
        "Once the national PRS Database is live, unregistered landlords can be blocked from regaining possession.",
      ];
  }
}

/**
 * Penalties for operating unlicensed. Also nation-specific: the £40,000 civil
 * penalty and 24-month Rent Repayment Order are Housing Act 2004 s.249A powers
 * and do not exist in Scotland or Northern Ireland, which have their own
 * (different) maxima.
 */
function penaltyRule(nation: string): string {
  switch (nation) {
    case "scotland":
      return "Letting an unregistered property, or operating an unlicensed HMO, can lead to a fine of up to £50,000, and the council can refuse or revoke registration.";
    case "northern-ireland":
      return "Operating an unlicensed HMO can lead to a £5,000 fixed penalty or a fine of up to £20,000 on summary conviction, with up to £10,000 for breaching licence conditions. Failing to register as a landlord carries a £500 fixed penalty or a court fine up to £2,500.";
    default:
      return "Operating a licensable property without a licence can lead to a civil penalty of up to £40,000 per offence, a Rent Repayment Order of up to 24 months' rent, an unlimited fine on prosecution, and a banning order for serious or repeat offenders.";
  }
}

export const dynamicParams = false;

export function generateStaticParams() {
  // Every UK council now has a researched record, so every council gets a page.
  // Wales has live schemes; Scotland and NI get a definite "no council scheme is
  // possible here, this is what applies instead" answer, which is a result rather
  // than a gap. Building England only left 65 councils with no landing page at all.
  return COUNCILS.map((c) => ({ slug: c.slug }));
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
  if (!council) notFound();
  const summary = councilSummary(council.gss)!;

  const activeSchemes = [...summary.activeSelective, ...summary.activeAdditional];
  const hasLive = activeSchemes.length > 0;
  const hasUpcoming = summary.upcoming.length > 0;
  // Scotland and NI have no power to designate at all (Housing Act 2004 s.270(11)).
  const canDesignate = hasCouncilLicensingPowers(council.nation);

  const faq = [
    {
      q: `Do I need a landlord licence in ${council.name}?`,
      // Each branch ends a sentence before joining, because `mandatoryRule`
      // returns a full clause. Appending it after "plus " produced a verbless
      // sentence on 228 council pages, and this answer is also the `text` of the
      // FAQPage structured data, so Google and AI answers were served the same
      // fragment.
      a: hasLive
        ? `${council.name} operates ${summary.activeSelective.length > 0 ? `${summary.activeSelective.length} selective licensing scheme(s)` : ""}${summary.activeSelective.length > 0 && summary.activeAdditional.length > 0 ? " and " : ""}${summary.activeAdditional.length > 0 ? `${summary.activeAdditional.length} additional (HMO) licensing scheme(s)` : ""}. Whether your specific property needs a licence depends on its exact location and how it is let. Separately, ${mandatoryRule(council.nation)}`
        : canDesignate
          ? `${council.name} does not currently operate a selective or additional licensing scheme. However, ${mandatoryRule(council.nation)}`
          : `${council.name} cannot operate a selective or additional licensing scheme, because the Housing Act 2004 that creates those powers extends to England and Wales only. Instead, ${mandatoryRule(council.nation)}`,
    },
    {
      q: `What is the penalty for an unlicensed property in ${council.name}?`,
      a: penaltyRule(council.nation),
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
        {!canDesignate
          ? `${council.name} cannot run a selective or additional licensing scheme: those powers come from the Housing Act 2004, which extends to England and Wales only. Here is what applies instead.`
          : hasLive
            ? `${council.name} operates discretionary property licensing. Here is what is in force, what is coming, and how to check whether your property is affected.`
            : hasUpcoming
              ? `${council.name} has a licensing scheme approved and starting soon. Here is what is coming and how to check your property.`
              : `${council.name} does not currently run a selective or additional licensing scheme, but mandatory HMO licensing still applies. Here is the full picture.`}
      </p>

      <div className="mt-8">
        <PostcodeCTA
          heading={`Check a property in ${council.name}`}
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

      {/* Mandatory HMO always applies, but the threshold is nation-specific */}
      <section className="mt-10 rounded-2xl border border-navy-700 bg-navy-800/60 p-6">
        <h2 className="text-xl font-bold text-navy-100">{mandatoryPanel(council.nation, council.name).heading}</h2>
        <p className="mt-2 text-sm text-navy-300">{mandatoryPanel(council.nation, council.name).body}</p>
      </section>

      {/* Penalties, also nation-specific */}
      <section className="mt-6 rounded-2xl border border-danger/30 bg-danger/5 p-6">
        <h2 className="text-xl font-bold text-navy-100">Penalties for operating unlicensed</h2>
        <ul className="mt-3 space-y-2 text-sm text-navy-300">
          {penaltyBullets(council.nation).map((b, i) => (
            <li key={i}>{b}</li>
          ))}
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
        🏛️ Government-backed data: built from official local authority licensing designations, ONS council boundaries
        and UK housing legislation (Housing Act 2004), verified as of July 2026. PRSCheck is an information service, not
        legal advice. Many schemes are designated at street or part-ward level; the paid report confirms the exact
        boundary and official source for your address. <Link href="/councils" className="text-accent-400 underline">Browse all councils</Link>.
      </p>
    </div>
  );
}
