import type { Metadata } from "next";
import Link from "next/link";
import { allArticles } from "@/data/articles";
import RegisterInterestCTA from "@/components/RegisterInterestCTA";

export const metadata: Metadata = {
  title: "Resources",
  description:
    "Guides, legislation explainers, and enforcement best practice for local authority housing teams. Covering the Renters' Rights Act 2025, PRS Database, civil penalties, HMO detection, and more.",
  alternates: { canonical: "https://prscheck.co.uk/resources" },
  openGraph: {
    title: "Resources | PRSCheck",
    description:
      "Guides, legislation explainers, and enforcement best practice for local authority housing teams.",
    url: "https://prscheck.co.uk/resources",
  },
};

const categoryOrder = [
  "Legislation",
  "Enforcement",
  "Compliance",
  "Technology",
  "Guides",
] as const;

const categoryDescriptions: Record<string, string> = {
  Legislation:
    "Understand the Renters' Rights Act 2025, PRS Database, civil penalties framework, and other key legislation shaping PRS enforcement.",
  Enforcement:
    "Practical guidance on HMO detection, compliance screening, evidence gathering, and managing your enforcement pipeline.",
  Compliance:
    "Monitoring and enforcing gas safety, electrical safety, EPC standards, deposit protection, fire safety, and damp and mould requirements.",
  Technology:
    "Data tools, API integration, and automated compliance checking for modern PRS enforcement teams.",
  Guides:
    "Strategic guidance for councils of all sizes, from setting up new teams to procuring enforcement software through G-Cloud.",
};

const categoryColours: Record<string, string> = {
  Legislation: "bg-accent-600/20 text-accent-300 border-accent-600/30",
  Enforcement: "bg-warning/20 text-warning border-warning/30",
  Compliance: "bg-success/20 text-success border-success/30",
  Technology: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  Guides: "bg-purple-500/20 text-purple-300 border-purple-500/30",
};

export default function ResourcesPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-navy-700 bg-navy-900 py-20 sm:py-28">
        <div className="absolute inset-0 grid-pattern opacity-40" />
        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-navy-100 sm:text-5xl">
            PRS Enforcement Resources
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-navy-400">
            Legislation guides, enforcement best practice, and compliance
            monitoring guidance for local authority housing teams.
          </p>
        </div>
      </section>

      {/* Articles by Category */}
      <section className="mx-auto max-w-7xl px-6 py-16 sm:py-24">
        {categoryOrder.map((category) => {
          const categoryArticles = allArticles.filter(
            (a) => a.category === category
          );
          if (categoryArticles.length === 0) return null;

          return (
            <div key={category} className="mb-20 last:mb-0">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-navy-100 sm:text-3xl">
                  {category}
                </h2>
                <p className="mt-2 max-w-3xl text-navy-400">
                  {categoryDescriptions[category]}
                </p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {categoryArticles.map((article) => (
                  <Link
                    key={article.slug}
                    href={`/resources/${article.slug}`}
                    className="group rounded-xl border border-navy-700 bg-navy-800/50 p-6 transition-all hover:border-navy-600 hover:bg-navy-800"
                  >
                    <div className="mb-4 flex items-center gap-3">
                      <span
                        className={`inline-flex rounded-md border px-2.5 py-1 text-xs font-medium ${categoryColours[article.category]}`}
                      >
                        {article.category}
                      </span>
                      <span className="text-xs text-navy-500">
                        {article.readTime} min read
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-navy-100 transition-colors group-hover:text-accent-400">
                      {article.title}
                    </h3>
                    <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-navy-400">
                      {article.metaDescription}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent-400 opacity-0 transition-opacity group-hover:opacity-100">
                      Read article
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                        />
                      </svg>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </section>

      {/* CTA Banner */}
      <section className="border-t border-navy-700 bg-navy-900 py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-6">
          <RegisterInterestCTA variant="banner" />
        </div>
      </section>
    </>
  );
}
