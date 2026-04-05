import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "PRSCheck privacy policy. How we collect, use, and protect your data.",
  alternates: { canonical: "https://prscheck.co.uk/privacy" },
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <>
      <section className="bg-gradient-to-b from-navy-950 to-navy-900 py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-navy-100">Privacy Policy</h1>
          <p className="mt-4 text-navy-400">Last updated: April 2026</p>
        </div>
      </section>

      <section className="py-16">
        <div className="prose-navy mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-8 text-sm leading-relaxed text-navy-400">
            <div>
              <h2 className="mb-3 text-lg font-semibold text-navy-100">1. Who We Are</h2>
              <p>
                PRSCheck Ltd (&quot;PRSCheck&quot;, &quot;we&quot;, &quot;us&quot;, &quot;our&quot;) operates the PRSCheck platform at prscheck.co.uk. We provide PRS enforcement software to local authorities in England. We are the data controller for personal data collected through this website.
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-lg font-semibold text-navy-100">2. Data We Collect</h2>
              <p className="mb-2">We collect the following categories of personal data:</p>
              <ul className="ml-4 list-disc space-y-1">
                <li><strong className="text-navy-300">Contact information:</strong> name, email address, council name, job role, phone number</li>
                <li><strong className="text-navy-300">Usage data:</strong> pages visited, features used, session duration, IP address</li>
                <li><strong className="text-navy-300">Platform data:</strong> enforcement case data, property data, and compliance records entered by authorised council users</li>
                <li><strong className="text-navy-300">Technical data:</strong> browser type, device type, operating system</li>
              </ul>
            </div>

            <div>
              <h2 className="mb-3 text-lg font-semibold text-navy-100">3. How We Use Your Data</h2>
              <ul className="ml-4 list-disc space-y-1">
                <li>To provide and maintain the PRSCheck platform</li>
                <li>To respond to enquiries and demo requests</li>
                <li>To send service updates and product communications (you can unsubscribe at any time)</li>
                <li>To improve the platform based on usage patterns</li>
                <li>To comply with legal obligations</li>
              </ul>
            </div>

            <div>
              <h2 className="mb-3 text-lg font-semibold text-navy-100">4. Legal Basis for Processing</h2>
              <p>We process personal data under the following legal bases as defined in UK GDPR:</p>
              <ul className="ml-4 list-disc space-y-1">
                <li><strong className="text-navy-300">Contract:</strong> to provide the services you have contracted for</li>
                <li><strong className="text-navy-300">Legitimate interests:</strong> to improve our platform and communicate with prospects</li>
                <li><strong className="text-navy-300">Consent:</strong> for marketing communications, which you can withdraw at any time</li>
                <li><strong className="text-navy-300">Legal obligation:</strong> to comply with applicable laws and regulations</li>
              </ul>
            </div>

            <div>
              <h2 className="mb-3 text-lg font-semibold text-navy-100">5. Data Sharing</h2>
              <p>
                We do not sell personal data. We share data only with: hosting providers (UK-based data centres), analytics providers (Vercel Analytics), and where required by law. All sub-processors are bound by data processing agreements.
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-lg font-semibold text-navy-100">6. Data Security</h2>
              <p>
                We implement appropriate technical and organisational measures to protect personal data, including encryption in transit and at rest, access controls, and regular security reviews. We are working towards ISO 27001 certification and Cyber Essentials Plus accreditation.
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-lg font-semibold text-navy-100">7. Data Retention</h2>
              <p>
                We retain personal data for as long as necessary to provide services or as required by law. Contact form submissions are retained for 24 months. Platform data is retained for the duration of the contract plus 12 months. You may request deletion at any time.
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-lg font-semibold text-navy-100">8. Your Rights</h2>
              <p className="mb-2">Under UK GDPR, you have the right to:</p>
              <ul className="ml-4 list-disc space-y-1">
                <li>Access the personal data we hold about you</li>
                <li>Rectify inaccurate data</li>
                <li>Request erasure of your data</li>
                <li>Restrict or object to processing</li>
                <li>Data portability</li>
                <li>Withdraw consent at any time</li>
                <li>Lodge a complaint with the ICO (ico.org.uk)</li>
              </ul>
            </div>

            <div>
              <h2 className="mb-3 text-lg font-semibold text-navy-100">9. Cookies</h2>
              <p>
                We use essential cookies to operate the platform and analytics cookies (Vercel Analytics) to understand usage patterns. Analytics cookies do not use personal identifiers. You can control cookies through your browser settings.
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-lg font-semibold text-navy-100">10. Contact</h2>
              <p>
                For privacy enquiries or to exercise your rights, contact us at: councils@prscheck.co.uk
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
