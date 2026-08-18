import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import RegisterInterestCTA from "@/components/RegisterInterestCTA";

export const metadata: Metadata = {
  title: "API Documentation",
  description:
    "PRSCheck REST API documentation. Check property compliance, run bulk screenings, and look up addresses programmatically. API access included in Professional and Enterprise plans.",
  alternates: { canonical: "https://prscheck.co.uk/api-docs" },
  openGraph: {
    title: "API Documentation | PRSCheck",
    description: "REST API for property compliance checks, bulk screening, and address lookups. Full documentation with code examples.",
    url: "https://prscheck.co.uk/api-docs",
    siteName: "PRSCheck",
    type: "website",
  },
};

export default function APIDocsPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://prscheck.co.uk" },
      { "@type": "ListItem", position: 2, name: "API Documentation", item: "https://prscheck.co.uk/api-docs" },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Header />
      <main className="min-h-screen">
        {/* Hero */}
        <section className="relative overflow-hidden bg-navy-950 pt-32 pb-20">
          <div className="absolute inset-0 grid-pattern opacity-40" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
                API Documentation
              </h1>
              <p className="mt-6 text-lg leading-8 text-navy-300">
                Integrate PRSCheck property compliance data directly into your existing systems. Our REST API provides programmatic access to property checks, bulk screening, and address lookups.
              </p>
              <p className="mt-4 rounded-lg bg-accent-600/10 px-4 py-2 text-sm text-accent-300 inline-block">
                API access is included in Professional and Enterprise plans
              </p>
            </div>
          </div>
        </section>

        {/* Overview */}
        <section className="bg-navy-900 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl">
              <h2 className="text-3xl font-bold text-white">REST API overview</h2>
              <p className="mt-4 text-navy-300">
                The PRSCheck API is a JSON-based REST API. All requests use HTTPS and require authentication via API key. Responses include standard HTTP status codes and descriptive error messages.
              </p>
              <div className="mt-8 rounded-xl border border-navy-800 bg-navy-950 p-6">
                <table className="w-full text-sm">
                  <tbody className="text-navy-400">
                    <tr className="border-b border-navy-800/50">
                      <td className="py-3 pr-4 font-medium text-navy-200">Base URL</td>
                      <td className="py-3"><code className="rounded bg-navy-800 px-2 py-0.5 text-accent-400">https://api.prscheck.co.uk/v1</code></td>
                    </tr>
                    <tr className="border-b border-navy-800/50">
                      <td className="py-3 pr-4 font-medium text-navy-200">Content type</td>
                      <td className="py-3"><code className="rounded bg-navy-800 px-2 py-0.5 text-accent-400">application/json</code></td>
                    </tr>
                    <tr className="border-b border-navy-800/50">
                      <td className="py-3 pr-4 font-medium text-navy-200">Authentication</td>
                      <td className="py-3"><code className="rounded bg-navy-800 px-2 py-0.5 text-accent-400">Authorization: Bearer YOUR_API_KEY</code></td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-4 font-medium text-navy-200">Versioning</td>
                      <td className="py-3">URL path versioning (currently v1)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* Endpoints */}
        <section className="bg-navy-950 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl">
              <h2 className="text-3xl font-bold text-white">Endpoints</h2>

              {/* /api/check */}
              <div className="mt-10">
                <div className="flex items-center gap-3">
                  <span className="rounded bg-success/20 px-2 py-0.5 text-xs font-bold text-success">GET</span>
                  <h3 className="text-xl font-semibold text-navy-100">/api/check</h3>
                </div>
                <p className="mt-3 text-navy-300">
                  Check a single property&apos;s compliance status. Returns EPC data, gas safety status, licensing status, deposit protection, and an overall compliance score.
                </p>
                <div className="mt-4 rounded-xl border border-navy-800 bg-navy-900 p-6">
                  <p className="text-sm font-semibold text-navy-200">Parameters</p>
                  <table className="mt-3 w-full text-sm">
                    <thead>
                      <tr className="border-b border-navy-800">
                        <th className="pb-2 text-left text-navy-400">Name</th>
                        <th className="pb-2 text-left text-navy-400">Type</th>
                        <th className="pb-2 text-left text-navy-400">Required</th>
                        <th className="pb-2 text-left text-navy-400">Description</th>
                      </tr>
                    </thead>
                    <tbody className="text-navy-300">
                      <tr className="border-b border-navy-800/50">
                        <td className="py-2"><code className="text-accent-400">uprn</code></td>
                        <td className="py-2">string</td>
                        <td className="py-2">Yes*</td>
                        <td className="py-2">Unique Property Reference Number</td>
                      </tr>
                      <tr className="border-b border-navy-800/50">
                        <td className="py-2"><code className="text-accent-400">postcode</code></td>
                        <td className="py-2">string</td>
                        <td className="py-2">Yes*</td>
                        <td className="py-2">UK postcode (with or without space)</td>
                      </tr>
                      <tr>
                        <td className="py-2"><code className="text-accent-400">address</code></td>
                        <td className="py-2">string</td>
                        <td className="py-2">No</td>
                        <td className="py-2">First line of address (for disambiguation)</td>
                      </tr>
                    </tbody>
                  </table>
                  <p className="mt-3 text-xs text-navy-500">*Provide either uprn or postcode. UPRN is preferred for exact matching.</p>
                </div>

                {/* Response */}
                <div className="mt-4 rounded-xl border border-navy-800 bg-navy-900 p-6">
                  <p className="text-sm font-semibold text-navy-200">Example response</p>
                  <pre className="mt-3 overflow-x-auto rounded-lg bg-navy-950 p-4 text-xs leading-6 text-navy-300">
{`{
  "uprn": "100023336956",
  "address": "10 Downing Street, London, SW1A 2AA",
  "compliance_score": 72,
  "checks": {
    "epc": {
      "status": "pass",
      "rating": "C",
      "expiry": "2028-03-15"
    },
    "gas_safety": {
      "status": "warning",
      "last_certificate": "2025-02-20",
      "expiry": "2026-02-20"
    },
    "eicr": {
      "status": "fail",
      "detail": "No EICR record found"
    },
    "licensing": {
      "status": "not_required",
      "scheme": null
    },
    "deposit_protection": {
      "status": "pass",
      "scheme": "TDS",
      "protected_date": "2024-11-01"
    }
  },
  "risk_level": "medium",
  "last_updated": "2026-04-05T10:30:00Z"
}`}
                  </pre>
                </div>
              </div>

              {/* /api/check/bulk */}
              <div className="mt-12">
                <div className="flex items-center gap-3">
                  <span className="rounded bg-accent-500/20 px-2 py-0.5 text-xs font-bold text-accent-400">POST</span>
                  <h3 className="text-xl font-semibold text-navy-100">/api/check/bulk</h3>
                </div>
                <p className="mt-3 text-navy-300">
                  Submit a batch of properties for compliance screening. Returns a job ID for polling results. Supports up to 10,000 properties per request.
                </p>
                <div className="mt-4 rounded-xl border border-navy-800 bg-navy-900 p-6">
                  <p className="text-sm font-semibold text-navy-200">Request body</p>
                  <pre className="mt-3 overflow-x-auto rounded-lg bg-navy-950 p-4 text-xs leading-6 text-navy-300">
{`{
  "properties": [
    { "uprn": "100023336956" },
    { "postcode": "SW1A 2AA", "address": "11 Downing Street" },
    { "uprn": "200003541287" }
  ],
  "checks": ["epc", "gas_safety", "eicr", "licensing"],
  "callback_url": "https://your-council.gov.uk/webhook/prscheck"
}`}
                  </pre>
                </div>
                <div className="mt-4 rounded-xl border border-navy-800 bg-navy-900 p-6">
                  <p className="text-sm font-semibold text-navy-200">Response</p>
                  <pre className="mt-3 overflow-x-auto rounded-lg bg-navy-950 p-4 text-xs leading-6 text-navy-300">
{`{
  "job_id": "bulk_7f3a9b2c",
  "status": "processing",
  "total_properties": 3,
  "estimated_completion": "2026-04-05T11:00:00Z",
  "results_url": "/api/check/bulk/bulk_7f3a9b2c/results"
}`}
                  </pre>
                </div>
              </div>

              {/* /api/addresses */}
              <div className="mt-12">
                <div className="flex items-center gap-3">
                  <span className="rounded bg-success/20 px-2 py-0.5 text-xs font-bold text-success">GET</span>
                  <h3 className="text-xl font-semibold text-navy-100">/api/addresses</h3>
                </div>
                <p className="mt-3 text-navy-300">
                  Look up addresses by postcode or partial address string. Returns UPRNs and full address details for use with the /api/check endpoint.
                </p>
                <div className="mt-4 rounded-xl border border-navy-800 bg-navy-900 p-6">
                  <p className="text-sm font-semibold text-navy-200">Parameters</p>
                  <table className="mt-3 w-full text-sm">
                    <thead>
                      <tr className="border-b border-navy-800">
                        <th className="pb-2 text-left text-navy-400">Name</th>
                        <th className="pb-2 text-left text-navy-400">Type</th>
                        <th className="pb-2 text-left text-navy-400">Description</th>
                      </tr>
                    </thead>
                    <tbody className="text-navy-300">
                      <tr className="border-b border-navy-800/50">
                        <td className="py-2"><code className="text-accent-400">postcode</code></td>
                        <td className="py-2">string</td>
                        <td className="py-2">UK postcode to search</td>
                      </tr>
                      <tr>
                        <td className="py-2"><code className="text-accent-400">query</code></td>
                        <td className="py-2">string</td>
                        <td className="py-2">Free-text address search</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <RegisterInterestCTA />
        </div>

        {/* Authentication */}
        <section className="bg-navy-900 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl">
              <h2 className="text-3xl font-bold text-white">Authentication</h2>
              <p className="mt-4 text-navy-300">
                All API requests require a valid API key passed in the Authorization header. API keys are generated in your PRSCheck dashboard under Settings &gt; API Keys.
              </p>
              <div className="mt-6 rounded-xl border border-navy-800 bg-navy-950 p-6">
                <p className="text-sm font-semibold text-navy-200">Example header</p>
                <pre className="mt-3 overflow-x-auto rounded-lg bg-navy-900 p-4 text-xs leading-6 text-navy-300">
{`Authorization: Bearer prs_live_k7x9m2p4q8r1s5t3`}
                </pre>
              </div>
              <p className="mt-4 text-sm text-navy-400">
                Keep your API key secure. Do not expose it in client-side code or public repositories. If you believe your key has been compromised, regenerate it immediately from your dashboard.
              </p>
            </div>
          </div>
        </section>

        {/* Rate Limits */}
        <section className="bg-navy-950 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl">
              <h2 className="text-3xl font-bold text-white">Rate limits</h2>
              <div className="mt-8 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-navy-700">
                      <th className="pb-3 text-left font-semibold text-navy-200">Plan</th>
                      <th className="pb-3 text-left font-semibold text-navy-200">Requests per minute</th>
                      <th className="pb-3 text-left font-semibold text-navy-200">Requests per day</th>
                      <th className="pb-3 text-left font-semibold text-navy-200">Bulk batch size</th>
                    </tr>
                  </thead>
                  <tbody className="text-navy-400">
                    <tr className="border-b border-navy-800/50">
                      <td className="py-3 font-medium text-navy-100">Professional</td>
                      <td className="py-3">60</td>
                      <td className="py-3">10,000</td>
                      <td className="py-3">1,000</td>
                    </tr>
                    <tr>
                      <td className="py-3 font-medium text-navy-100">Enterprise</td>
                      <td className="py-3">300</td>
                      <td className="py-3">100,000</td>
                      <td className="py-3">10,000</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-4 text-sm text-navy-400">
                Rate limit headers are included in every response: <code className="text-accent-400">X-RateLimit-Limit</code>, <code className="text-accent-400">X-RateLimit-Remaining</code>, and <code className="text-accent-400">X-RateLimit-Reset</code>. If you exceed the limit, you will receive a 429 status code.
              </p>
            </div>
          </div>
        </section>

        {/* Code Examples */}
        <section className="bg-navy-900 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl">
              <h2 className="text-3xl font-bold text-white">Code examples</h2>

              {/* curl */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-navy-100">cURL</h3>
                <pre className="mt-3 overflow-x-auto rounded-xl border border-navy-800 bg-navy-950 p-6 text-xs leading-6 text-navy-300">
{`curl -X GET "https://api.prscheck.co.uk/v1/api/check?uprn=100023336956" \\
  -H "Authorization: Bearer prs_live_k7x9m2p4q8r1s5t3" \\
  -H "Content-Type: application/json"`}
                </pre>
              </div>

              {/* Python */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-navy-100">Python</h3>
                <pre className="mt-3 overflow-x-auto rounded-xl border border-navy-800 bg-navy-950 p-6 text-xs leading-6 text-navy-300">
{`import requests

API_KEY = "prs_live_k7x9m2p4q8r1s5t3"
BASE_URL = "https://api.prscheck.co.uk/v1"

response = requests.get(
    f"{BASE_URL}/api/check",
    params={"uprn": "100023336956"},
    headers={"Authorization": f"Bearer {API_KEY}"}
)

data = response.json()
print(f"Compliance score: {data['compliance_score']}")
print(f"EPC rating: {data['checks']['epc']['rating']}")
print(f"Risk level: {data['risk_level']}")`}
                </pre>
              </div>

              {/* Node.js */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-navy-100">Node.js</h3>
                <pre className="mt-3 overflow-x-auto rounded-xl border border-navy-800 bg-navy-950 p-6 text-xs leading-6 text-navy-300">
{`const API_KEY = "prs_live_k7x9m2p4q8r1s5t3";
const BASE_URL = "https://api.prscheck.co.uk/v1";

const response = await fetch(
  \`\${BASE_URL}/api/check?uprn=100023336956\`,
  {
    headers: {
      "Authorization": \`Bearer \${API_KEY}\`,
      "Content-Type": "application/json",
    },
  }
);

const data = await response.json();
console.log(\`Compliance score: \${data.compliance_score}\`);
console.log(\`EPC rating: \${data.checks.epc.rating}\`);
console.log(\`Risk level: \${data.risk_level}\`);`}
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-navy-950 py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <RegisterInterestCTA variant="banner" />
            <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm text-navy-400">
              <Link href="/pricing" className="hover:text-accent-400 transition-colors">View Pricing</Link>
              <span className="text-navy-700">|</span>
              <Link href="/solutions" className="hover:text-accent-400 transition-colors">All Solutions</Link>
              <span className="text-navy-700">|</span>
              <Link href="/contact" className="hover:text-accent-400 transition-colors">Contact Us</Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
