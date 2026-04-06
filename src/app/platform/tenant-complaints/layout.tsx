import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tenant Complaint Triage",
  description: "Structured complaint intake with auto-enrichment and priority scoring. Replace unstructured emails with a system that triages automatically.",
  alternates: { canonical: "https://prscheck.co.uk/platform/tenant-complaints" },
  openGraph: {
    title: "Structured Tenant Reports | PRSCheck",
    description: "Automated complaint intake, enrichment, and triage for housing teams.",
    url: "https://prscheck.co.uk/platform/tenant-complaints",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
