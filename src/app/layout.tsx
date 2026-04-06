import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import { DemoPopup } from "@/components/DemoPopup";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://prscheck.co.uk"),
  title: {
    default: "PRSCheck | PRS Enforcement Platform for Local Authorities",
    template: "%s | PRSCheck",
  },
  description:
    "Automated compliance screening, HMO detection, and enforcement tools for council housing teams. Built for the PRS Database and Renters' Rights Act 2025.",
  keywords: [
    "PRS enforcement",
    "PRS Database",
    "council housing",
    "HMO detection",
    "local authority",
    "compliance screening",
    "Renters Rights Act",
    "private rented sector",
    "civil penalties",
    "housing enforcement",
  ],
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: "https://prscheck.co.uk",
    siteName: "PRSCheck",
    title: "PRSCheck | PRS Enforcement Platform for Local Authorities",
    description:
      "Automated compliance screening, HMO detection, and enforcement tools for council housing teams. Built for the PRS Database.",
  },
  twitter: {
    card: "summary_large_image",
    title: "PRSCheck | PRS Enforcement Platform for Local Authorities",
    description:
      "Automated compliance screening, HMO detection, and enforcement tools for council housing teams.",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-navy-900 font-sans text-navy-100">
        <Header />
        <main className="flex-1 pt-16">{children}</main>
        <Footer />
        <DemoPopup />
        <Analytics />
      </body>
    </html>
  );
}
