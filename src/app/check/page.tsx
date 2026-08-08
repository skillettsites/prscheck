import type { Metadata } from "next";
import { Suspense } from "react";
import CheckClient from "./CheckClient";

export const metadata: Metadata = {
  title: "Landlord Licence Check by Postcode | Do I Need a Licence?",
  description:
    "Check whether your rental property needs a selective, additional or mandatory HMO licence. Enter a postcode for an instant free scheme check, then get a property-specific report for £7.99.",
  alternates: { canonical: "https://prscheck.co.uk/check" },
};

export default async function CheckPage({
  searchParams,
}: {
  searchParams: Promise<{ postcode?: string; s?: string }>;
}) {
  const { postcode, s } = await searchParams;
  return (
    <div className="grid-pattern">
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <Suspense fallback={<div className="h-24" />}>
          {/* `s=1` is stamped only by our own postcode boxes, so an auto-run
              that came from a real submission is logged while a bookmarked or
              bot-replayed ?postcode= URL still is not. */}
          <CheckClient initialPostcode={postcode} fromSearchBox={s === "1"} />
        </Suspense>
      </section>
    </div>
  );
}
