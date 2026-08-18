import Link from "next/link";

const columns = [
  // The flagship consumer product was missing from the footer entirely, which
  // left the licence checker, all 361 council pages and the guides with no
  // site-wide internal link, and the 51 /resources articles orphaned: in the
  // sitemap, returning 200, and linked from nowhere outside their own section.
  {
    title: "For landlords",
    links: [
      { label: "Check a property", href: "/check" },
      { label: "Landlord hub", href: "/landlords" },
      { label: "Rent Repayment Orders", href: "/landlords/rent-repayment-orders" },
      { label: "Licensing guides", href: "/guides" },
      { label: "Councils A to Z", href: "/councils" },
    ],
  },
  // The tenant silo needs a site-wide link surface for exactly the reason the
  // landlord one did: without it, five pages sit in the sitemap, return 200,
  // and are linked from nowhere but each other.
  {
    title: "For tenants",
    links: [
      { label: "Tenant hub", href: "/tenants" },
      { label: "Claim rent back (RRO)", href: "/tenants/rent-repayment-order" },
      { label: "RRO calculator", href: "/tenants/rent-repayment-order-calculator" },
      { label: "Is my landlord licensed?", href: "/tenants/is-my-landlord-licensed" },
      { label: "Unlicensed HMO", href: "/tenants/unlicensed-hmo" },
    ],
  },
  {
    title: "For councils",
    links: [
      { label: "Platform overview", href: "/platform" },
      { label: "Compliance Screening", href: "/platform/compliance-screening" },
      { label: "HMO Detection", href: "/platform/hmo-detection" },
      { label: "Enforcement Pipeline", href: "/platform/enforcement-pipeline" },
      { label: "PRS Database", href: "/platform/prs-database" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Articles", href: "/resources" },
      { label: "Pricing", href: "/pricing" },
      { label: "Demo", href: "/demo" },
      { label: "API", href: "/api-docs" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Careers", href: "/about" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Cookie Policy", href: "/privacy" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-navy-800 bg-navy-950">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-6">
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-navy-400">
                {col.title}
              </h3>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-navy-500 transition-colors hover:text-navy-300"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* G-Cloud badge */}
        <div className="mt-12 flex flex-col items-center gap-6 border-t border-navy-800 pt-8 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy-800">
              <svg className="h-5 w-5 text-accent-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-navy-300">Available on G-Cloud</p>
              <p className="text-xs text-navy-500">Digital Marketplace</p>
            </div>
          </div>
          <p className="text-sm text-navy-600">
            &copy; {new Date().getFullYear()} PRSCheck Ltd. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
