import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HMO Detection Engine",
  description: "Cross-reference six data signals to find unlicensed HMOs. 85% detection rate in the first month of deployment.",
  alternates: { canonical: "https://prscheck.co.uk/platform/hmo-detection" },
  openGraph: {
    title: "Find Every Unlicensed HMO | PRSCheck",
    description: "Cross-reference council tax, EPC, and licensing data to identify unlicensed HMOs.",
    url: "https://prscheck.co.uk/platform/hmo-detection",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
