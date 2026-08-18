import type { Metadata } from "next";
import { Suspense } from "react";
import CheckClient from "./CheckClient";
import { parseAudience } from "@/lib/audience";

export const metadata: Metadata = {
  title: "Property Licence Check by Postcode | Landlords and Tenants",
  description:
    "Check whether a property needs a selective, additional or mandatory HMO licence. Free instant postcode check. Landlords get a £7.99 compliance report; tenants get a £29 Rent Repayment Order evidence report.",
  // Canonical stays parameter-free. `?for=tenant` changes the framing, not the
  // page: two indexable URLs for one check would split the signal and compete
  // with each other, and the two audiences already have their own hubs to rank.
  alternates: { canonical: "https://prscheck.co.uk/check" },
};

export default async function CheckPage({
  searchParams,
}: {
  searchParams: Promise<{ postcode?: string; s?: string; for?: string }>;
}) {
  const { postcode, s, for: forParam } = await searchParams;
  return (
    <div className="grid-pattern">
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <Suspense fallback={<div className="h-24" />}>
          {/* `s=1` is stamped only by our own postcode boxes, so an auto-run
              that came from a real submission is logged while a bookmarked or
              bot-replayed ?postcode= URL still is not. */}
          <CheckClient
            initialPostcode={postcode}
            fromSearchBox={s === "1"}
            initialAudience={parseAudience(forParam)}
          />
        </Suspense>
      </section>
    </div>
  );
}
