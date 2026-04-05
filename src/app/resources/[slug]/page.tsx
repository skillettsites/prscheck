import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getAllSlugs,
  getArticleBySlug,
} from "@/data/articles";
import RegisterInterestCTA from "@/components/RegisterInterestCTA";
import FAQAccordion from "./FAQAccordion";
import TableOfContents from "./TableOfContents";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return {};

  return {
    title: article.title,
    description: article.metaDescription,
    alternates: { canonical: `https://prscheck.co.uk/resources/${slug}` },
    openGraph: {
      title: `${article.title} | PRSCheck`,
      description: article.metaDescription,
      url: `https://prscheck.co.uk/resources/${slug}`,
      type: "article",
      publishedTime: article.publishDate,
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.metaDescription,
    },
  };
}

const categoryColours: Record<string, string> = {
  Legislation: "bg-accent-600/20 text-accent-300 border-accent-600/30",
  Enforcement: "bg-warning/20 text-warning border-warning/30",
  Compliance: "bg-success/20 text-success border-success/30",
  Technology: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  Guides: "bg-purple-500/20 text-purple-300 border-purple-500/30",
};

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  const relatedArticles = article.relatedSlugs
    .map((s) => getArticleBySlug(s))
    .filter(Boolean);

  const publishDate = new Date(article.publishDate).toLocaleDateString(
    "en-GB",
    { day: "numeric", month: "long", year: "numeric" }
  );

  // JSON-LD structured data
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.metaDescription,
    datePublished: article.publishDate,
    publisher: {
      "@type": "Organization",
      name: "PRSCheck",
      url: "https://prscheck.co.uk",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://prscheck.co.uk/resources/${slug}`,
    },
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: article.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://prscheck.co.uk",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Resources",
        item: "https://prscheck.co.uk/resources",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: article.title,
        item: `https://prscheck.co.uk/resources/${slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleJsonLd),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqJsonLd),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd),
        }}
      />

      {/* Breadcrumbs */}
      <nav
        aria-label="Breadcrumb"
        className="border-b border-navy-800 bg-navy-900"
      >
        <div className="mx-auto max-w-7xl px-6 py-3">
          <ol className="flex items-center gap-2 text-sm text-navy-500">
            <li>
              <Link href="/" className="transition-colors hover:text-navy-300">
                Home
              </Link>
            </li>
            <li aria-hidden="true">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </li>
            <li>
              <Link
                href="/resources"
                className="transition-colors hover:text-navy-300"
              >
                Resources
              </Link>
            </li>
            <li aria-hidden="true">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </li>
            <li className="truncate text-navy-300" aria-current="page">
              {article.title}
            </li>
          </ol>
        </div>
      </nav>

      <article className="mx-auto max-w-7xl px-6 py-12 sm:py-16">
        <div className="lg:grid lg:grid-cols-[1fr_280px] lg:gap-12">
          {/* Main Content */}
          <div className="min-w-0">
            {/* Header */}
            <header className="mb-12">
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <span
                  className={`inline-flex rounded-md border px-2.5 py-1 text-xs font-medium ${categoryColours[article.category]}`}
                >
                  {article.category}
                </span>
                <span className="text-sm text-navy-500">
                  {publishDate}
                </span>
                <span className="text-sm text-navy-500">
                  {article.readTime} min read
                </span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-navy-100 sm:text-4xl">
                {article.title}
              </h1>
              <p className="mt-4 text-lg leading-relaxed text-navy-400">
                {article.metaDescription}
              </p>
            </header>

            {/* Mobile TOC */}
            <div className="mb-10 lg:hidden">
              <TableOfContents sections={article.sections} />
            </div>

            {/* Article Sections */}
            <div className="space-y-10">
              {article.sections.map((section, idx) => (
                <div key={section.id}>
                  <section id={section.id} className="scroll-mt-24">
                    <h2 className="mb-4 text-2xl font-bold text-navy-100">
                      {section.heading}
                    </h2>
                    <div className="prose-custom text-base leading-relaxed text-navy-300">
                      {section.content}
                    </div>
                  </section>

                  {/* Inline CTA after section 3 */}
                  {idx === 2 && (
                    <div className="mt-10 rounded-xl border border-navy-700 bg-navy-800/50 p-6 sm:p-8">
                      <h3 className="mb-2 text-lg font-semibold text-navy-100">
                        See how PRSCheck can help your team
                      </h3>
                      <p className="mb-4 text-sm text-navy-400">
                        Automated compliance screening, HMO detection, and
                        enforcement pipeline management built for the PRS
                        Database.
                      </p>
                      <div className="flex flex-wrap gap-3">
                        <Link
                          href="/demo"
                          className="inline-flex items-center rounded-lg bg-accent-600 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-accent-500 hover:shadow-lg hover:shadow-accent-600/25"
                        >
                          Book a Demo
                        </Link>
                        <Link
                          href="/pricing"
                          className="inline-flex items-center rounded-lg border border-navy-600 px-5 py-2.5 text-sm font-semibold text-navy-300 transition-colors hover:border-navy-500 hover:text-navy-100"
                        >
                          View Pricing
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* FAQ Section */}
            {article.faqs.length > 0 && (
              <section className="mt-16 border-t border-navy-700 pt-12">
                <h2 className="mb-8 text-2xl font-bold text-navy-100">
                  Frequently Asked Questions
                </h2>
                <FAQAccordion faqs={article.faqs} />
              </section>
            )}

            {/* Banner CTA */}
            <section className="mt-16 border-t border-navy-700 pt-12">
              <RegisterInterestCTA variant="banner" />
            </section>

            {/* Related Articles */}
            {relatedArticles.length > 0 && (
              <section className="mt-16 border-t border-navy-700 pt-12">
                <h2 className="mb-8 text-2xl font-bold text-navy-100">
                  Related Resources
                </h2>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {relatedArticles.map((related) =>
                    related ? (
                      <Link
                        key={related.slug}
                        href={`/resources/${related.slug}`}
                        className="group rounded-xl border border-navy-700 bg-navy-800/50 p-5 transition-all hover:border-navy-600 hover:bg-navy-800"
                      >
                        <span
                          className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-medium ${categoryColours[related.category]}`}
                        >
                          {related.category}
                        </span>
                        <h3 className="mt-3 text-sm font-semibold text-navy-100 transition-colors group-hover:text-accent-400">
                          {related.title}
                        </h3>
                        <p className="mt-1 text-xs text-navy-500">
                          {related.readTime} min read
                        </p>
                      </Link>
                    ) : null
                  )}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar TOC (desktop) */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <TableOfContents sections={article.sections} />

              {/* Book a Demo sidebar card */}
              <div className="mt-8 rounded-xl border border-navy-700 bg-navy-800/50 p-5">
                <h3 className="text-sm font-semibold text-navy-100">
                  Ready to modernise enforcement?
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-navy-400">
                  See how PRSCheck automates compliance screening for your
                  council.
                </p>
                <Link
                  href="/demo"
                  className="mt-4 block rounded-lg bg-accent-600 px-4 py-2.5 text-center text-sm font-semibold text-white transition-all hover:bg-accent-500"
                >
                  Book a Demo
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </article>
    </>
  );
}
