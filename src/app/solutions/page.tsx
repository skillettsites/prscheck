import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import RegisterInterestCTA from "@/components/RegisterInterestCTA";

export const metadata: Metadata = {
  title: "Solutions | PRSCheck - PRS Enforcement Platform",
  description:
    "Explore PRSCheck solutions for local authority PRS enforcement: HMO detection, compliance screening, civil penalties, enforcement pipelines, and PRS Database integration.",
  alternates: { canonical: "https://prscheck.co.uk/solutions" },
  openGraph: {
    title: "Solutions | PRSCheck",
    description:
      "Comprehensive PRS enforcement solutions for local authorities. From HMO detection to PRS Database readiness.",
    url: "https://prscheck.co.uk/solutions",
    siteName: "PRSCheck",
    type: "website",
  },
};

const solutions = [
  {
    title: "PRS Database Integration",
    description:
      "Be PRS Database ready from day one. Auto-sync registered landlords, cross-reference compliance, and flag unregistered properties.",
    href: "/solutions/prs-database",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125"
      />
    ),
    tag: "Coming 2026",
  },
  {
    title: "Automated HMO Detection",
    description:
      "Find every unlicensed HMO in your borough using cross-referenced data signals from council tax, EPC records, and occupancy data.",
    href: "/solutions/hmo-detection",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
      />
    ),
  },
  {
    title: "Compliance Screening",
    description:
      "Check every property in your borough against 15 data sources. Generate compliance scores, risk flags, and enforcement priority lists.",
    href: "/solutions/compliance-screening",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
      />
    ),
  },
  {
    title: "Enforcement Pipeline",
    description:
      "From complaint to resolution in one dashboard. Kanban-style case management with full audit trails and MHCLG reporting.",
    href: "/solutions/enforcement-pipeline",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
      />
    ),
  },
  {
    title: "Tenant Complaint Triage",
    description:
      "Receive structured tenant reports with property data, compliance status, and evidence. Auto-prioritise by severity and hazard type.",
    href: "/solutions/tenant-complaints",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
      />
    ),
  },
  {
    title: "Civil Penalty Management",
    description:
      "Calculate, issue, and track civil penalties with built-in tariff tables. Councils retain 100% of penalty income for reinvestment.",
    href: "/solutions/civil-penalties",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z"
      />
    ),
  },
  {
    title: "Decent Homes Standard",
    description:
      "Prepare for the Decent Homes Standard extending to private rentals. Screen properties against all five DHS criteria at scale.",
    href: "/solutions/decent-homes",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205l3 1m1.5.5l-1.5-.5M6.75 7.364V3h-3v18m3-13.636l10.5-3.819"
      />
    ),
    tag: "2035 Deadline",
  },
  {
    title: "Selective Licensing",
    description:
      "Manage your licensing scheme end to end. Application processing, compliance monitoring, renewals, and penalty recovery.",
    href: "/solutions/selective-licensing",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
      />
    ),
  },
  {
    title: "Reporting and Analytics",
    description:
      "Real-time enforcement metrics, automated MHCLG returns, KPI dashboards, and trend analysis across your borough.",
    href: "/solutions/reporting",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
      />
    ),
  },
];

export default function SolutionsPage() {
  const jsonLd = {
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
        name: "Solutions",
        item: "https://prscheck.co.uk/solutions",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <main className="min-h-screen">
        {/* Hero */}
        <section className="relative overflow-hidden bg-navy-950 pt-32 pb-20">
          <div className="absolute inset-0 grid-pattern opacity-40" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-semibold uppercase tracking-wider text-accent-400">
                Solutions
              </p>
              <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
                Everything you need to enforce PRS compliance
              </h1>
              <p className="mt-6 text-lg leading-8 text-navy-300">
                PRSCheck brings together property data, enforcement workflows,
                and reporting into one platform built specifically for local
                authority housing teams.
              </p>
            </div>
          </div>
        </section>

        {/* Solutions Grid */}
        <section className="bg-navy-950 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {solutions.map((solution) => (
                <Link
                  key={solution.href}
                  href={solution.href}
                  className="group relative rounded-2xl border border-navy-800 bg-navy-900 p-8 transition-all hover:border-accent-500/30 hover:shadow-lg hover:shadow-accent-600/5"
                >
                  {solution.tag && (
                    <span className="absolute top-4 right-4 rounded-full bg-accent-600/20 px-3 py-1 text-xs font-medium text-accent-400">
                      {solution.tag}
                    </span>
                  )}
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-600/10">
                    <svg
                      className="h-6 w-6 text-accent-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      {solution.icon}
                    </svg>
                  </div>
                  <h2 className="mt-5 text-xl font-semibold text-navy-100 group-hover:text-accent-400 transition-colors">
                    {solution.title}
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-navy-400">
                    {solution.description}
                  </p>
                  <span className="mt-4 inline-flex items-center text-sm font-medium text-accent-500 group-hover:text-accent-400">
                    Learn more
                    <svg
                      className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1"
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

            <div className="mx-auto mt-16 max-w-3xl">
              <RegisterInterestCTA variant="banner" />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
