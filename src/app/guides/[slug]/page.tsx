import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { GUIDES, getGuide } from "@/data/guides";
import PostcodeCTA from "@/components/PostcodeCTA";

export const dynamicParams = false;

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) return {};
  return {
    title: guide.metaTitle,
    description: guide.metaDescription,
    alternates: { canonical: `https://prscheck.co.uk/guides/${slug}` },
  };
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: guide.metaTitle,
      description: guide.metaDescription,
      author: { "@type": "Organization", name: "PRSCheck" },
      publisher: { "@type": "Organization", name: "PRSCheck" },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: guide.faq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav className="mb-6 text-sm text-navy-500">
        <Link href="/guides" className="hover:text-accent-400">
          Guides
        </Link>{" "}
        / <span className="text-navy-300">{guide.title}</span>
      </nav>

      <article>
        <h1 className="text-3xl font-bold text-navy-100 sm:text-4xl">{guide.title}</h1>
        <p className="mt-4 text-lg text-navy-300">{guide.intro}</p>

        {guide.sections.map((s) => (
          <section key={s.heading} className="mt-8">
            <h2 className="text-2xl font-bold text-navy-100">{s.heading}</h2>
            {s.body.map((p, i) => (
              <p key={i} className="mt-3 text-navy-300">
                {p}
              </p>
            ))}
          </section>
        ))}
      </article>

      <div className="mt-10">
        <PostcodeCTA />
      </div>

      <section className="mt-10">
        <h2 className="mb-4 text-2xl font-bold text-navy-100">Frequently asked questions</h2>
        <div className="space-y-4">
          {guide.faq.map((f, i) => (
            <div key={i} className="rounded-xl border border-navy-700 bg-navy-800/60 p-5">
              <h3 className="font-semibold text-navy-100">{f.q}</h3>
              <p className="mt-2 text-sm text-navy-300">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      <nav className="mt-12 flex flex-wrap gap-3 border-t border-navy-800 pt-8">
        {GUIDES.filter((g) => g.slug !== guide.slug).map((g) => (
          <Link
            key={g.slug}
            href={`/guides/${g.slug}`}
            className="rounded-lg border border-navy-700 px-4 py-2 text-sm text-navy-300 transition-colors hover:border-accent-500/50 hover:text-accent-400"
          >
            {g.title}
          </Link>
        ))}
      </nav>

      <p className="mt-8 text-xs text-navy-600">
        PRSCheck is an information service based on published legislation and council designations, not legal advice.
        Figures current as of July 2026.
      </p>
    </div>
  );
}
