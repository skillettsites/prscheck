import type { Metadata } from "next";
import Link from "next/link";
import PostcodeCTA from "@/components/PostcodeCTA";

export const metadata: Metadata = {
  title: "Property Licence Check | Check If Your Rental Needs a Licence",
  description:
    "Property licence checker for UK landlords. Enter a postcode for a free selective, additional and HMO scheme check, then get a £7.99 property-specific report.",
  alternates: { canonical: "https://prscheck.co.uk/property-licence-check" },
};

export default function PropertyLicenceCheckPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-navy-100 sm:text-4xl">
        Property licence check
      </h1>
      <p className="mt-4 text-lg text-navy-300">
        A UK rental can need a licence even when it is a normal family house.
        Selective licensing covers ordinary private rented homes in designated streets.
        Additional and mandatory HMO licensing cover shared houses. The only way to
        know is the postcode and how the property is let.
      </p>
      <p className="mt-3 text-navy-300">
        Use the free checker for every live scheme that could apply. The £7.99 report
        is the property-specific verdict: scheme dates, fees, penalty exposure, and
        what to do next. England and Wales are paid; Scotland and Northern Ireland
        get the national rules without a charge.
      </p>

      <div className="mt-10">
        <PostcodeCTA
          heading="Check this property"
          sub="Enter the postcode. Free scheme check, then a £7.99 report if you want the written verdict."
        />
      </div>

      <section className="mt-10">
        <h2 className="text-2xl font-bold text-navy-100">What the checker looks at</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-navy-300">
          <li>Selective licensing on ordinary single-let homes in a designated area</li>
          <li>Additional HMO licensing for smaller shared houses where the council has designated</li>
          <li>Mandatory HMO licensing (England: 5 or more people in 2 or more households)</li>
        </ul>
        <p className="mt-4 text-navy-300">
          This is the same check as{" "}
          <Link href="/check" className="text-accent-400 hover:underline">
            /check
          </Link>
          . Open that page if you already have a postcode ready.
        </p>
      </section>
    </div>
  );
}
