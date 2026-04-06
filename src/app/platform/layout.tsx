import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | PRSCheck Platform",
    default: "Platform | PRSCheck",
  },
};

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
