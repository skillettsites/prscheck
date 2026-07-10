import type { Metadata } from "next";
import Link from "next/link";
import PostcodeCTA from "@/components/PostcodeCTA";

export const metadata: Metadata = {
  title: "Landlord Licensing Guides | Selective, Additional & HMO Explained",
  description:
    "Plain-English guides to UK landlord licensing: selective licensing, additional and mandatory HMO licensing, the Renters' Rights Act 2025, penalties, and rules for England, Wales and Scotland.",
  alternates: { canonical: "https://prscheck.co.uk/guides" },
};

const guides = [
  { slug: "landlord-licensing", title: "Landlord licensing explained", desc: "The complete guide to the three licence types and how to tell which your property needs." },
  { slug: "selective-licensing", title: "Selective licensing", desc: "What selective licensing is, where it applies, fees, and how to check your address." },
  { slug: "hmo-licensing", title: "HMO licensing (mandatory & additional)", desc: "When an HMO needs a licence, the mandatory 5-person rule, and additional schemes for smaller HMOs." },
  { slug: "renters-rights-act", title: "The Renters' Rights Act 2025", desc: "What changed for landlords: £40,000 penalties, 24-month RROs, the PRS Database and the end of Section 21." },
  { slug: "penalties", title: "Penalties for unlicensed letting", desc: "Civil penalties, rent repayment orders, banning orders and prosecution, and how to avoid them." },
];

export default function GuidesHub() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-navy-100 sm:text-4xl">Landlord licensing guides</h1>
      <p className="mt-3 max-w-2xl text-navy-400">
        Everything a landlord needs to understand UK property licensing, written in plain English and kept current with
        the 2026 rules.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {guides.map((g) => (
          <Link
            key={g.slug}
            href={`/guides/${g.slug}`}
            className="rounded-2xl border border-navy-700 bg-navy-800/60 p-6 transition-colors hover:border-accent-500/50 hover:bg-navy-800"
          >
            <h2 className="text-lg font-semibold text-navy-100">{g.title}</h2>
            <p className="mt-2 text-sm text-navy-400">{g.desc}</p>
          </Link>
        ))}
      </div>

      <div className="mt-10">
        <PostcodeCTA />
      </div>
    </div>
  );
}
