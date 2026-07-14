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
  searchParams: Promise<{ postcode?: string }>;
}) {
  const { postcode } = await searchParams;
  return (
    <div className="grid-pattern">
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <span className="mb-4 inline-block rounded-full border border-accent-500/30 bg-accent-600/10 px-3 py-1 text-xs font-medium text-accent-400">
            Free instant check
          </span>
          <h1 className="text-3xl font-bold text-navy-100 sm:text-4xl">
            Does your rental property need a licence?
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-navy-400">
            Operating an unlicensed property risks a civil penalty of up to £40,000, a Rent Repayment Order of up to 24
            months&apos; rent, and being unable to serve notice. Check your postcode in seconds.
          </p>
        </div>
        <Suspense fallback={<div className="h-24" />}>
          <CheckClient initialPostcode={postcode} />
        </Suspense>
      </section>
    </div>
  );
}
