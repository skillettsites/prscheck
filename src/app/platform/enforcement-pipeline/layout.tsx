import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Enforcement Pipeline",
  description: "Kanban-style case management from complaint to resolution. Track every enforcement case, deadline, and outcome in one place.",
  alternates: { canonical: "https://prscheck.co.uk/platform/enforcement-pipeline" },
  openGraph: {
    title: "Enforcement Pipeline | PRSCheck",
    description: "Track every enforcement case from complaint to resolution.",
    url: "https://prscheck.co.uk/platform/enforcement-pipeline",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
