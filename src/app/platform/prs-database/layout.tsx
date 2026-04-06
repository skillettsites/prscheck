import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PRS Database Integration",
  description: "Built from day one for the national PRS Database. Automatic landlord verification, registration gap detection, and seamless data migration.",
  alternates: { canonical: "https://prscheck.co.uk/platform/prs-database" },
  openGraph: {
    title: "PRS Database Integration | PRSCheck",
    description: "Ready for the national PRS Database from day one.",
    url: "https://prscheck.co.uk/platform/prs-database",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
