import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Licensing Scheme Management",
  description: "Manage mandatory, additional, and selective licensing schemes. Track applications, monitor compliance, and collect fees in one platform.",
  alternates: { canonical: "https://prscheck.co.uk/platform/selective-licensing" },
  openGraph: {
    title: "Licensing Scheme Management | PRSCheck",
    description: "Track licensing applications, compliance, and fees across all schemes.",
    url: "https://prscheck.co.uk/platform/selective-licensing",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
