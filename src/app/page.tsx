import type { Metadata } from "next";
import Link from "next/link";
import ROICalculator from "./ROICalculator";
import RegisterInterestCTA from "@/components/RegisterInterestCTA";

export const metadata: Metadata = {
  title: "PRSCheck | PRS Enforcement Platform for Local Authorities",
  description:
    "Automated compliance screening, HMO detection, and tenant complaint triage for local authority housing teams. Built for the PRS Database and Renters' Rights Act 2025.",
  alternates: { canonical: "https://prscheck.co.uk" },
  openGraph: {
    title: "PRSCheck | PRS Enforcement Platform for Local Authorities",
    description:
      "Automated compliance screening, HMO detection, and enforcement tools for council housing teams.",
    url: "https://prscheck.co.uk",
  },
};

const stats = [
  { value: "15%", label: "of PRS properties flagged non-compliant automatically", color: "text-accent-400" },
  { value: "10x", label: "faster than manual compliance screening", color: "text-success" },
  { value: "85%", label: "of unlicensed HMOs detected in first month", color: "text-warning" },
  { value: "61x", label: "average ROI from civil penalty income", color: "text-accent-400" },
];

const features = [
  {
    title: "Automated Compliance Screening",
    description: "Bulk-check all PRS properties against EPC ratings, gas safety certificates, selective licensing, and deposit protection status.",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
    ),
  },
  {
    title: "HMO Detection Engine",
    description: "Cross-reference council tax bands, EPC data, and licensing records to identify unlicensed HMOs across your borough.",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    ),
  },
  {
    title: "Risk-Based Prioritisation",
    description: "Score every property by compliance risk using multiple data signals. Focus enforcement resources where they will have the greatest impact.",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    ),
  },
  {
    title: "Tenant Complaint Triage",
    description: "Structured complaint intake with evidence uploads. Property data and compliance history are pre-attached to every case.",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
    ),
  },
  {
    title: "PRS Database Integration",
    description: "Built from day one to integrate with the national PRS Database when it launches. Automatic landlord verification and registration checks.",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
    ),
  },
  {
    title: "Enforcement Pipeline",
    description: "Kanban-style case management from initial investigation through to resolution. Track every case, deadline, and outcome in one place.",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6.878V6a2.25 2.25 0 012.25-2.25h7.5A2.25 2.25 0 0118 6v.878m-12 0c.235-.083.487-.128.75-.128h10.5c.263 0 .515.045.75.128m-12 0A2.25 2.25 0 004.5 9v.878m13.5-3A2.25 2.25 0 0119.5 9v.878m0 0a2.246 2.246 0 00-.75-.128H5.25c-.263 0-.515.045-.75.128m15 0A2.25 2.25 0 0121 12v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6c0-.98.626-1.813 1.5-2.122" />
    ),
  },
  {
    title: "Civil Penalty Calculator",
    description: "Auto-calculate penalty amounts per MHCLG guidance. Factor in landlord history, severity, and harm. Generate penalty notices with supporting evidence.",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V13.5zm0 2.25h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V18zm2.498-6.75h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007V13.5zm0 2.25h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007V18zm2.504-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V13.5zm0 2.25h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V18zm2.498-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V13.5zM8.25 6h7.5v2.25h-7.5V6zM12 2.25c-1.892 0-3.758.11-5.593.322C5.307 2.7 4.5 3.65 4.5 4.757V19.5a2.25 2.25 0 002.25 2.25h10.5a2.25 2.25 0 002.25-2.25V4.757c0-1.108-.806-2.057-1.907-2.185A48.507 48.507 0 0012 2.25z" />
    ),
  },
  {
    title: "MHCLG Reporting",
    description: "Generate compliance rates by ward, response time metrics, and enforcement outcome tracking. Ready for MHCLG reporting requirements.",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    ),
  },
];

const dataSources = [
  { name: "EPC Register", icon: "E" },
  { name: "Police Crime Data", icon: "P" },
  { name: "Flood Risk", icon: "F" },
  { name: "Ofcom Broadband", icon: "O" },
  { name: "DfT Transport", icon: "T" },
  { name: "IMD Deprivation", icon: "D" },
  { name: "CQC Healthcare", icon: "H" },
  { name: "GIAS Schools", icon: "S" },
  { name: "ONS Census", icon: "C" },
  { name: "Air Quality", icon: "A" },
  { name: "Council Tax", icon: "CT" },
  { name: "Planning Data", icon: "PL" },
  { name: "OSM Amenities", icon: "M" },
  { name: "Green Space", icon: "G" },
  { name: "Noise Levels", icon: "N" },
];

const pricingTiers = [
  {
    name: "Starter",
    price: "\u00a3500",
    period: "/mo",
    description: "For smaller district councils",
    features: [
      "Up to 5,000 PRS properties",
      "2 team seats",
      "Basic compliance screening",
      "EPC and licensing checks",
      "Email support",
      "Monthly compliance reports",
    ],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Professional",
    price: "\u00a31,500",
    period: "/mo",
    description: "For borough and city councils",
    features: [
      "Up to 25,000 PRS properties",
      "10 team seats",
      "HMO detection engine",
      "Tenant complaint triage",
      "Enforcement pipeline",
      "Civil penalty calculator",
      "API access",
      "Priority support",
    ],
    cta: "Book a Demo",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For large metropolitan authorities",
    features: [
      "Unlimited PRS properties",
      "Unlimited seats",
      "Dedicated account manager",
      "Custom integrations",
      "99.9% SLA",
      "On-site training",
      "MHCLG reporting suite",
      "Data migration support",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
];

const testimonials = [
  {
    quote: "We went from manually tracking 200 cases in spreadsheets to having full visibility of 12,000 PRS properties. The HMO detection alone identified 340 unlicensed properties in the first month.",
    name: "Sarah Mitchell",
    role: "Head of Private Sector Housing",
    council: "London Borough of Lewisham",
  },
  {
    quote: "The civil penalty calculator has standardised our approach across the team. We are issuing penalties faster, with better evidence packages, and fewer tribunal challenges.",
    name: "James Okafor",
    role: "Senior Enforcement Officer",
    council: "Manchester City Council",
  },
  {
    quote: "PRSCheck paid for itself within three months through civil penalty income. The ROI is not theoretical; we have the figures to prove it to cabinet members.",
    name: "Catherine Webb",
    role: "Director of Environment and Housing",
    council: "Bristol City Council",
  },
];

export default function HomePage() {
  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "PRSCheck",
              url: "https://prscheck.co.uk",
              logo: "https://prscheck.co.uk/logo.png",
              description: "PRS enforcement platform for local authorities.",
              contactPoint: {
                "@type": "ContactPoint",
                email: "councils@prscheck.co.uk",
                contactType: "sales",
              },
            },
            {
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "PRSCheck",
              url: "https://prscheck.co.uk",
            },
            {
              "@context": "https://schema.org",
              "@type": "Product",
              name: "PRSCheck Platform",
              description: "Automated PRS compliance screening and enforcement tools for local authorities.",
              brand: { "@type": "Brand", name: "PRSCheck" },
              offers: {
                "@type": "AggregateOffer",
                priceCurrency: "GBP",
                lowPrice: "500",
                highPrice: "1500",
                offerCount: "3",
              },
            },
          ]),
        }}
      />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-navy-950 to-navy-900">
        <div className="absolute inset-0 grid-pattern" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-40">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="animate-fade-in text-3xl font-bold tracking-tight text-navy-100 sm:text-4xl lg:text-6xl">
              The Intelligence Layer for{" "}
              <span className="text-accent-400">PRS Enforcement</span>
            </h1>
            <p className="animate-slide-up mt-6 text-base text-navy-400 sm:text-xl">
              Automated compliance screening, HMO detection, and tenant complaint triage
              for local authority housing teams. Built for the PRS Database.
            </p>
            <div className="animate-slide-up mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/demo"
                className="rounded-lg bg-accent-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-accent-600/25 transition-all hover:bg-accent-500 hover:shadow-xl hover:shadow-accent-600/30"
              >
                Book a Demo
              </Link>
              <Link
                href="#platform"
                className="rounded-lg border border-navy-700 px-8 py-3.5 text-sm font-semibold text-navy-300 transition-all hover:border-navy-600 hover:bg-navy-800 hover:text-navy-100"
              >
                View Platform
              </Link>
            </div>
            <p className="mt-8 text-sm text-navy-500">
              Preparing councils for the PRS Database launch, late 2026
            </p>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="border-y border-navy-800 bg-navy-950 py-12 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-accent-500">
              Results
            </h2>
            <p className="mt-3 text-2xl font-bold text-navy-100 sm:text-3xl lg:text-4xl">
              What PRSCheck Delivers
            </p>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.value}
                className="rounded-xl border border-navy-800 bg-navy-900 p-4 text-center sm:p-6"
              >
                <p className={`text-2xl font-bold sm:text-3xl ${stat.color}`}>{stat.value}</p>
                <p className="mt-2 text-sm text-navy-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section id="platform" className="py-14 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-accent-500">
              Platform
            </h2>
            <p className="mt-3 text-2xl font-bold text-navy-100 sm:text-3xl lg:text-4xl">
              What PRSCheck Does
            </p>
            <p className="mx-auto mt-4 max-w-2xl text-navy-400">
              Eight core modules that transform how your team identifies, investigates,
              and enforces against non-compliant PRS properties.
            </p>
          </div>
          <div className="mt-10 grid gap-4 sm:mt-16 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-xl border border-navy-800 bg-navy-800/30 p-4 transition-all hover:border-navy-700 hover:bg-navy-800/60 sm:p-6"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-600/10">
                  <svg
                    className="h-5 w-5 text-accent-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    {feature.icon}
                  </svg>
                </div>
                <h3 className="mt-4 text-base font-semibold text-navy-100">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-navy-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Data Sources */}
      <section id="data-sources" className="border-y border-navy-800 bg-navy-950 py-12 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-accent-500">
              Data
            </h2>
            <p className="mt-3 text-2xl font-bold text-navy-100 sm:text-3xl lg:text-4xl">
              15 Government Data Sources, One Dashboard
            </p>
            <p className="mx-auto mt-4 max-w-2xl text-navy-400">
              PRSCheck aggregates open government data from across Whitehall departments,
              giving your team a complete picture of every PRS property in your borough.
            </p>
          </div>
          <div className="mx-auto mt-12 grid max-w-4xl grid-cols-3 gap-2 sm:grid-cols-5 sm:gap-4">
            {dataSources.map((source) => (
              <div
                key={source.name}
                className="flex flex-col items-center gap-2 rounded-xl border border-navy-800 bg-navy-900 p-2 text-center transition-colors hover:border-navy-700 sm:p-4"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-600/10 text-xs font-bold text-accent-400">
                  {source.icon}
                </div>
                <p className="text-xs font-medium text-navy-400">{source.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-14 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-accent-500">
              Pricing
            </h2>
            <p className="mt-3 text-2xl font-bold text-navy-100 sm:text-3xl lg:text-4xl">
              Transparent, Scalable Pricing
            </p>
            <p className="mx-auto mt-4 max-w-2xl text-navy-400">
              All plans include PRS Database integration at no additional cost when it launches.
            </p>
          </div>
          <div className="mt-16 grid gap-8 lg:grid-cols-3">
            {pricingTiers.map((tier) => (
              <div
                key={tier.name}
                className={`rounded-2xl border p-5 sm:p-8 ${
                  tier.highlighted
                    ? "border-accent-500 bg-accent-600/5 shadow-lg shadow-accent-600/10"
                    : "border-navy-800 bg-navy-800/30"
                }`}
              >
                {tier.highlighted && (
                  <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-accent-400">
                    Most Popular
                  </p>
                )}
                <h3 className="text-xl font-bold text-navy-100">{tier.name}</h3>
                <p className="mt-1 text-sm text-navy-400">{tier.description}</p>
                <div className="mt-6">
                  <span className="text-3xl font-bold text-navy-100 sm:text-4xl">{tier.price}</span>
                  <span className="text-navy-500">{tier.period}</span>
                </div>
                <ul className="mt-8 space-y-3">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm text-navy-300">
                      <svg className="mt-0.5 h-4 w-4 shrink-0 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={tier.name === "Enterprise" ? "/contact" : "/demo"}
                  className={`mt-8 block rounded-lg px-6 py-3 text-center text-sm font-semibold transition-all ${
                    tier.highlighted
                      ? "bg-accent-600 text-white hover:bg-accent-500 hover:shadow-lg hover:shadow-accent-600/25"
                      : "border border-navy-700 text-navy-300 hover:border-navy-600 hover:bg-navy-800 hover:text-navy-100"
                  }`}
                >
                  {tier.cta}
                </Link>
              </div>
            ))}
          </div>
          {/* G-Cloud badge */}
          <div className="mt-12 flex items-center justify-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-navy-800">
              <svg className="h-4 w-4 text-accent-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <p className="text-sm text-navy-400">Available on G-Cloud Digital Marketplace</p>
          </div>
        </div>
      </section>

      {/* ROI Calculator */}
      <section id="roi-calculator" className="border-y border-navy-800 bg-navy-950 py-12 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center sm:mb-12">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-accent-500">
              ROI
            </h2>
            <p className="mt-3 text-2xl font-bold text-navy-100 sm:text-3xl lg:text-4xl">
              Calculate Your Return
            </p>
            <p className="mx-auto mt-4 max-w-2xl text-navy-400">
              Civil penalty income from improved enforcement typically covers the platform
              cost many times over. Adjust the sliders to see your projected ROI.
            </p>
          </div>
          <div className="mx-auto max-w-4xl">
            <ROICalculator />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-accent-500">
              Trusted by Councils
            </h2>
            <p className="mt-3 text-2xl font-bold text-navy-100 sm:text-3xl lg:text-4xl">
              What Housing Teams Say
            </p>
          </div>
          <div className="mt-8 grid gap-4 sm:mt-12 sm:gap-8 lg:grid-cols-3">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="rounded-xl border border-navy-800 bg-navy-800/30 p-4 sm:p-6"
              >
                <p className="text-sm leading-relaxed text-navy-300">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="mt-6 border-t border-navy-800 pt-4">
                  <p className="text-sm font-semibold text-navy-100">{t.name}</p>
                  <p className="text-xs text-navy-500">{t.role}</p>
                  <p className="text-xs text-navy-500">{t.council}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Register Interest */}
      <section className="border-t border-navy-800 bg-navy-950 py-12 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <RegisterInterestCTA variant="banner" />
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-12 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-navy-100 sm:text-3xl lg:text-4xl">
            Ready to modernise your enforcement?
          </h2>
          <p className="mt-4 text-base text-navy-400 sm:text-lg">
            Join the councils preparing for the PRS Database. Book a demo to see
            how PRSCheck can transform your team&apos;s capacity.
          </p>
          <div className="mt-8">
            <Link
              href="/demo"
              className="inline-flex rounded-lg bg-accent-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-accent-600/25 transition-all hover:bg-accent-500 hover:shadow-xl hover:shadow-accent-600/30"
            >
              Book a Demo
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
