import Link from "next/link";

export default function PostcodeCTA({
  heading = "Does your property need a licence?",
  sub = "Get a property-specific licence report in seconds.",
}: {
  heading?: string;
  sub?: string;
}) {
  return (
    <div className="rounded-2xl border border-accent-500/30 bg-gradient-to-br from-accent-600/15 to-navy-800/40 p-6 text-center sm:p-8">
      <h2 className="text-xl font-bold text-navy-100 sm:text-2xl">{heading}</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm text-navy-300">{sub}</p>
      <Link
        href="/check"
        className="mt-5 inline-block rounded-lg bg-accent-600 px-7 py-3.5 font-semibold text-white transition-all hover:bg-accent-500 hover:shadow-lg hover:shadow-accent-600/25"
      >
        Check your postcode — free
      </Link>
      <p className="mt-3 text-xs text-navy-500">Free scheme check · £9.99 for the full property report</p>
    </div>
  );
}
