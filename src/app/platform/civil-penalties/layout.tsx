import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Civil Penalty Calculator",
  description: "Auto-calculate civil penalty amounts per MHCLG guidance. Factor in severity, culpability, landlord history, and harm to tenants.",
  alternates: { canonical: "https://prscheck.co.uk/platform/civil-penalties" },
  openGraph: {
    title: "Civil Penalty Calculator | PRSCheck",
    description: "Standardised penalty calculations following MHCLG guidance.",
    url: "https://prscheck.co.uk/platform/civil-penalties",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
