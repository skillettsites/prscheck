import type { Metadata } from "next";
import { Suspense } from "react";
import SuccessClient from "./SuccessClient";
import { deriveReportToken } from "@/lib/report";

export const metadata: Metadata = {
  title: "Your report is being prepared",
  robots: { index: false, follow: false },
};

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;
  const token = session_id ? deriveReportToken(session_id) : null;
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl items-center px-4 py-16 sm:px-6">
      <div className="w-full">
        <Suspense fallback={<div className="h-24" />}>
          <SuccessClient token={token} />
        </Suspense>
      </div>
    </div>
  );
}
