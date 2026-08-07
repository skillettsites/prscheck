import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import { DemoPopup } from "@/components/DemoPopup";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://prscheck.co.uk"),
  title: {
    default: "PRSCheck | Do I Need a Landlord Licence? Check Your Postcode",
    template: "%s | PRSCheck",
  },
  description:
    "Check whether your rental property needs a selective, additional or HMO licence. Free postcode check, £7.99 property report. Avoid penalties up to £40,000.",
  keywords: [
    "landlord licence check",
    "do I need a landlord licence",
    "selective licensing",
    "additional licensing",
    "HMO licence",
    "property licensing by postcode",
    "landlord licensing UK",
    "Renters Rights Act 2025",
    "unlicensed property penalty",
    "private rented sector",
  ],
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: "https://prscheck.co.uk",
    siteName: "PRSCheck",
    title: "PRSCheck | Do I Need a Landlord Licence?",
    description:
      "Check whether your rental property needs a licence. Free postcode check, £7.99 property report. Avoid penalties up to £40,000.",
  },
  twitter: {
    card: "summary_large_image",
    title: "PRSCheck | Do I Need a Landlord Licence?",
    description:
      "Check whether your rental property needs a licence. Free postcode check, £7.99 property report.",
  },
  verification: {
    other: {
      'msvalidate.01': '8467B89365C947F24710AB7D84B06F92',
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
};

/**
 * Site-wide identity and search action.
 *
 * Emitted from the layout so every page carries it, including the ten that had
 * no structured data at all. It also gives search engines and AI answers a
 * single description of what this service does and which country it covers,
 * which matters here because the answer to "do I need a landlord licence" is
 * entirely jurisdiction-dependent.
 */
const siteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://prscheck.co.uk/#organization",
      name: "PRSCheck",
      url: "https://prscheck.co.uk",
      description:
        "Checks whether a UK rental property needs a selective, additional or mandatory HMO licence, using councils' own published designations.",
      areaServed: { "@type": "Country", name: "United Kingdom" },
    },
    {
      "@type": "WebSite",
      "@id": "https://prscheck.co.uk/#website",
      url: "https://prscheck.co.uk",
      name: "PRSCheck",
      publisher: { "@id": "https://prscheck.co.uk/#organization" },
      inLanguage: "en-GB",
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: "https://prscheck.co.uk/check?postcode={search_term_string}",
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "Service",
      "@id": "https://prscheck.co.uk/#service",
      name: "Landlord Licence Check",
      provider: { "@id": "https://prscheck.co.uk/#organization" },
      areaServed: { "@type": "Country", name: "United Kingdom" },
      serviceType: "Property licensing check",
      description:
        "Free postcode check against every UK council's licensing designations, plus a property-specific report giving the licensing position for a named address and occupancy.",
      offers: {
        "@type": "Offer",
        price: "7.99",
        priceCurrency: "GBP",
        category: "Property licensing report",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-navy-900 font-sans text-navy-100">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }}
        />
        <Header />
        <main className="flex-1 pt-16">{children}</main>
        <Footer />
        <DemoPopup />
        <Analytics />
        <GoogleAnalytics />
      </body>
    </html>
  );
}
