import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Automated Compliance Screening",
  description: "Bulk-check every PRS property against EPC, gas safety, EICR, deposit protection, and licensing. 10x faster than manual screening.",
  alternates: { canonical: "https://prscheck.co.uk/platform/compliance-screening" },
  openGraph: {
    title: "Automated Compliance Screening | PRSCheck",
    description: "Bulk-check every PRS property against six core compliance obligations.",
    url: "https://prscheck.co.uk/platform/compliance-screening",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
