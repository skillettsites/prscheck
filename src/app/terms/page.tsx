import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "PRSCheck terms of service for local authority customers.",
  alternates: { canonical: "https://prscheck.co.uk/terms" },
  robots: { index: true, follow: true },
};

export default function TermsPage() {
  return (
    <>
      <section className="bg-gradient-to-b from-navy-950 to-navy-900 py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-navy-100">Terms of Service</h1>
          <p className="mt-4 text-navy-400">Last updated: April 2026</p>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-8 text-sm leading-relaxed text-navy-400">
            <div>
              <h2 className="mb-3 text-lg font-semibold text-navy-100">1. Introduction</h2>
              <p>
                These Terms of Service (&quot;Terms&quot;) govern your use of the PRSCheck platform operated by PRSCheck Ltd (&quot;PRSCheck&quot;, &quot;we&quot;, &quot;us&quot;). By accessing or using the platform, the subscribing local authority (&quot;Customer&quot;, &quot;you&quot;) agrees to these Terms.
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-lg font-semibold text-navy-100">2. Service Description</h2>
              <p>
                PRSCheck provides a cloud-based software platform for PRS compliance screening, HMO detection, enforcement case management, and reporting. The platform aggregates publicly available government data and integrates with council systems to support housing enforcement teams.
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-lg font-semibold text-navy-100">3. Subscription and Access</h2>
              <ul className="ml-4 list-disc space-y-1">
                <li>Access is provided on a subscription basis per the agreed pricing tier (Starter, Professional, or Enterprise).</li>
                <li>Subscriptions are billed monthly or annually as agreed. Prices are exclusive of VAT.</li>
                <li>The Customer is responsible for managing user accounts and ensuring authorised access only.</li>
                <li>We reserve the right to adjust pricing with 90 days written notice.</li>
              </ul>
            </div>

            <div>
              <h2 className="mb-3 text-lg font-semibold text-navy-100">4. Customer Responsibilities</h2>
              <ul className="ml-4 list-disc space-y-1">
                <li>The Customer must ensure that use of the platform complies with all applicable UK legislation, including the Housing Act 2004, the Renters&apos; Rights Act 2025, and UK GDPR.</li>
                <li>The Customer is responsible for the accuracy of data entered into the platform.</li>
                <li>Enforcement decisions remain the sole responsibility of the local authority. PRSCheck provides tools and data to support, not replace, professional judgement.</li>
                <li>The Customer must maintain the security of login credentials and notify us of any suspected unauthorised access.</li>
              </ul>
            </div>

            <div>
              <h2 className="mb-3 text-lg font-semibold text-navy-100">5. Data and Intellectual Property</h2>
              <ul className="ml-4 list-disc space-y-1">
                <li>The Customer retains ownership of all data entered into the platform.</li>
                <li>PRSCheck retains ownership of the platform software, algorithms, and aggregated anonymised insights.</li>
                <li>Government data used within the platform is sourced from open data registers and is subject to the Open Government Licence v3.0.</li>
                <li>On termination, the Customer may request export of all their data in a standard format within 30 days.</li>
              </ul>
            </div>

            <div>
              <h2 className="mb-3 text-lg font-semibold text-navy-100">6. Service Level</h2>
              <p>
                We target 99.5% uptime for Starter, 99.9% for Professional, and 99.99% for Enterprise tiers, measured monthly excluding scheduled maintenance. Scheduled maintenance windows are communicated at least 48 hours in advance.
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-lg font-semibold text-navy-100">7. Limitation of Liability</h2>
              <ul className="ml-4 list-disc space-y-1">
                <li>PRSCheck provides data and tools on an &quot;as is&quot; basis. While we make reasonable efforts to ensure data accuracy, we do not guarantee that government source data is complete or error-free.</li>
                <li>Our total liability under these Terms shall not exceed the fees paid by the Customer in the 12 months preceding the claim.</li>
                <li>We are not liable for enforcement decisions made by the Customer, or for the consequences of those decisions.</li>
                <li>Nothing in these Terms excludes or limits liability for fraud, death or personal injury caused by negligence, or any other liability that cannot be excluded by law.</li>
              </ul>
            </div>

            <div>
              <h2 className="mb-3 text-lg font-semibold text-navy-100">8. Termination</h2>
              <ul className="ml-4 list-disc space-y-1">
                <li>Either party may terminate with 30 days written notice for monthly subscriptions, or at the end of the annual term for annual subscriptions.</li>
                <li>We may suspend access immediately if the Customer breaches these Terms or fails to pay fees within 30 days of the due date.</li>
                <li>On termination, access to the platform ceases. Data export is available for 30 days following termination.</li>
              </ul>
            </div>

            <div>
              <h2 className="mb-3 text-lg font-semibold text-navy-100">9. Governing Law</h2>
              <p>
                These Terms are governed by the laws of England and Wales. Disputes shall be subject to the exclusive jurisdiction of the courts of England and Wales.
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-lg font-semibold text-navy-100">10. Changes to Terms</h2>
              <p>
                We may update these Terms from time to time. Material changes will be communicated to active customers at least 30 days before they take effect. Continued use of the platform after changes take effect constitutes acceptance.
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-lg font-semibold text-navy-100">11. Contact</h2>
              <p>
                For questions about these Terms, contact: councils@prscheck.co.uk
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
