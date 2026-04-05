import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Transparent pricing for PRSCheck PRS enforcement platform. Starter from \u00a3500/mo, Professional \u00a31,500/mo, Enterprise custom. All include PRS Database integration.",
  alternates: { canonical: "https://prscheck.co.uk/pricing" },
};

const tiers = [
  {
    name: "Starter",
    price: "\u00a3500",
    period: "/mo",
    description: "For district councils with smaller PRS portfolios",
    highlighted: false,
    features: {
      "PRS properties": "Up to 5,000",
      "Team seats": "2",
      "Compliance screening": true,
      "EPC checks": true,
      "Gas safety checks": true,
      "Licensing checks": true,
      "Deposit protection checks": true,
      "HMO detection engine": false,
      "Risk-based prioritisation": false,
      "Tenant complaint triage": false,
      "Enforcement pipeline": false,
      "Civil penalty calculator": false,
      "MHCLG reporting": false,
      "API access": false,
      "PRS Database integration": true,
      "Monthly compliance reports": true,
      "Support": "Email (48h response)",
      "Data refresh frequency": "Weekly",
      "Custom integrations": false,
      "Dedicated account manager": false,
      "On-site training": false,
      "SLA": "99.5%",
    },
  },
  {
    name: "Professional",
    price: "\u00a31,500",
    period: "/mo",
    description: "For borough and city councils with active enforcement",
    highlighted: true,
    features: {
      "PRS properties": "Up to 25,000",
      "Team seats": "10",
      "Compliance screening": true,
      "EPC checks": true,
      "Gas safety checks": true,
      "Licensing checks": true,
      "Deposit protection checks": true,
      "HMO detection engine": true,
      "Risk-based prioritisation": true,
      "Tenant complaint triage": true,
      "Enforcement pipeline": true,
      "Civil penalty calculator": true,
      "MHCLG reporting": true,
      "API access": true,
      "PRS Database integration": true,
      "Monthly compliance reports": true,
      "Support": "Priority (4h response)",
      "Data refresh frequency": "Daily",
      "Custom integrations": false,
      "Dedicated account manager": false,
      "On-site training": false,
      "SLA": "99.9%",
    },
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For large metropolitan authorities with complex needs",
    highlighted: false,
    features: {
      "PRS properties": "Unlimited",
      "Team seats": "Unlimited",
      "Compliance screening": true,
      "EPC checks": true,
      "Gas safety checks": true,
      "Licensing checks": true,
      "Deposit protection checks": true,
      "HMO detection engine": true,
      "Risk-based prioritisation": true,
      "Tenant complaint triage": true,
      "Enforcement pipeline": true,
      "Civil penalty calculator": true,
      "MHCLG reporting": true,
      "API access": true,
      "PRS Database integration": true,
      "Monthly compliance reports": true,
      "Support": "Dedicated (1h response)",
      "Data refresh frequency": "Real-time",
      "Custom integrations": true,
      "Dedicated account manager": true,
      "On-site training": true,
      "SLA": "99.99%",
    },
  },
];

const featureRows = [
  "PRS properties",
  "Team seats",
  "Compliance screening",
  "EPC checks",
  "Gas safety checks",
  "Licensing checks",
  "Deposit protection checks",
  "HMO detection engine",
  "Risk-based prioritisation",
  "Tenant complaint triage",
  "Enforcement pipeline",
  "Civil penalty calculator",
  "MHCLG reporting",
  "API access",
  "PRS Database integration",
  "Monthly compliance reports",
  "Support",
  "Data refresh frequency",
  "Custom integrations",
  "Dedicated account manager",
  "On-site training",
  "SLA",
];

const faqs = [
  {
    q: "Is PRSCheck available on the G-Cloud Digital Marketplace?",
    a: "Yes. PRSCheck is listed on the G-Cloud 14 framework, which means your council can procure the platform through the Digital Marketplace without a full tender process. This simplifies procurement and reduces time to deployment.",
  },
  {
    q: "What happens when the PRS Database launches?",
    a: "All plans include PRS Database integration at no additional cost. We are building against the draft technical specification published by MHCLG, so when the register goes live (expected late 2026), your PRSCheck instance will connect automatically. Landlord registration status, compliance flags, and property data will flow directly into your existing dashboards.",
  },
  {
    q: "Can we trial PRSCheck before committing?",
    a: "We offer a 30-day proof of concept using your borough's actual PRS data. This lets your team evaluate the platform against real properties and real compliance gaps before making a procurement decision. Book a demo to get started.",
  },
  {
    q: "How is pricing calculated for councils that span the boundary between tiers?",
    a: "Property counts are based on the number of PRS properties in your local authority area. If you are close to a tier boundary, we can discuss flexible arrangements. Enterprise pricing is fully custom and based on your specific requirements.",
  },
  {
    q: "What data security standards does PRSCheck meet?",
    a: "PRSCheck is ISO 27001 certified and Cyber Essentials Plus accredited. All data is hosted in UK data centres. We support SSO via Azure AD, which is the standard for most council IT environments. A full Data Protection Impact Assessment is available on request.",
  },
];

export default function PricingPage() {
  return (
    <>
      {/* Header */}
      <section className="bg-gradient-to-b from-navy-950 to-navy-900 py-20">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-navy-100 sm:text-5xl">
            Pricing
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-navy-400">
            Transparent, scalable pricing designed for local authority budgets.
            All plans include PRS Database integration at no additional cost.
          </p>
        </div>
      </section>

      {/* Tier Cards */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-3">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={`rounded-2xl border p-8 ${
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
                <h2 className="text-xl font-bold text-navy-100">{tier.name}</h2>
                <p className="mt-1 text-sm text-navy-400">{tier.description}</p>
                <div className="mt-6">
                  <span className="text-4xl font-bold text-navy-100">{tier.price}</span>
                  <span className="text-navy-500">{tier.period}</span>
                </div>
                <Link
                  href={tier.name === "Enterprise" ? "/contact" : "/demo"}
                  className={`mt-8 block rounded-lg px-6 py-3 text-center text-sm font-semibold transition-all ${
                    tier.highlighted
                      ? "bg-accent-600 text-white hover:bg-accent-500"
                      : "border border-navy-700 text-navy-300 hover:border-navy-600 hover:bg-navy-800"
                  }`}
                >
                  {tier.name === "Enterprise" ? "Contact Sales" : "Book a Demo"}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="border-y border-navy-800 bg-navy-950 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-12 text-center text-2xl font-bold text-navy-100">
            Full Feature Comparison
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-navy-800">
                  <th className="py-4 text-left text-sm font-semibold text-navy-300">Feature</th>
                  {tiers.map((t) => (
                    <th key={t.name} className="py-4 text-center text-sm font-semibold text-navy-300">
                      {t.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {featureRows.map((feature) => (
                  <tr key={feature} className="border-b border-navy-800/50">
                    <td className="py-3 text-sm text-navy-400">{feature}</td>
                    {tiers.map((tier) => {
                      const val = tier.features[feature as keyof typeof tier.features];
                      return (
                        <td key={tier.name} className="py-3 text-center text-sm">
                          {val === true ? (
                            <svg className="mx-auto h-5 w-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                          ) : val === false ? (
                            <span className="text-navy-700">&mdash;</span>
                          ) : (
                            <span className="text-navy-300">{val}</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-12 text-center text-2xl font-bold text-navy-100">
            Frequently Asked Questions
          </h2>
          <div className="space-y-8">
            {faqs.map((faq) => (
              <div key={faq.q}>
                <h3 className="text-base font-semibold text-navy-100">{faq.q}</h3>
                <p className="mt-2 text-sm leading-relaxed text-navy-400">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-navy-800 bg-navy-950 py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-navy-100">
            Need help choosing the right plan?
          </h2>
          <p className="mt-4 text-navy-400">
            Book a demo and we will walk you through the platform with your borough&apos;s data.
          </p>
          <Link
            href="/demo"
            className="mt-8 inline-flex rounded-lg bg-accent-600 px-8 py-3.5 text-sm font-semibold text-white transition-all hover:bg-accent-500"
          >
            Book a Demo
          </Link>
        </div>
      </section>
    </>
  );
}
