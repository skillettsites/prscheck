import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Enforcement Analytics and Reporting",
  description: "Real-time KPI dashboards, MHCLG-ready reports, and ward-level compliance tracking for local authority housing teams.",
  alternates: { canonical: "https://prscheck.co.uk/platform/reporting" },
  openGraph: {
    title: "Real-Time Enforcement Analytics | PRSCheck",
    description: "KPI dashboards and MHCLG reporting for housing enforcement teams.",
    url: "https://prscheck.co.uk/platform/reporting",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
