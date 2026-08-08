import HeroSearch from "./HeroSearch";

/**
 * Council and guide pages carry the bulk of search impressions, and the visitor
 * arrives already asking "does my property need a licence". Sending them to
 * /check via a link costs a whole click before they have entered anything, so
 * the box lives here rather than a button pointing at the box.
 */
export default function PostcodeCTA({
  heading = "Does your property need a licence?",
  sub = "Enter your postcode for an instant free check of every scheme that could apply.",
}: {
  heading?: string;
  sub?: string;
}) {
  return (
    <div className="rounded-2xl border border-accent-500/30 bg-gradient-to-br from-accent-600/15 to-navy-800/40 p-6 text-center sm:p-8">
      <h2 className="text-xl font-bold text-navy-100 sm:text-2xl">{heading}</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm text-navy-300">{sub}</p>
      <HeroSearch className="mx-auto mt-5 flex max-w-xl flex-col gap-3 sm:flex-row" buttonLabel="Check free" />
      <p className="mt-3 text-xs text-navy-500">Free scheme check · £7.99 for the full property report</p>
    </div>
  );
}
