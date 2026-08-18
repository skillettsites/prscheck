import HeroSearch from "./HeroSearch";
import { copyFor, type Audience } from "@/lib/audience";

/**
 * Council and guide pages carry the bulk of search impressions, and the visitor
 * arrives already asking "does my property need a licence". Sending them to
 * /check via a link costs a whole click before they have entered anything, so
 * the box lives here rather than a button pointing at the box.
 *
 * Audience-aware because the same council page now serves both sides: the
 * landlord asking whether they need a licence, and the tenant asking whether
 * their landlord needed one. Same box, same dataset, different question and
 * different price underneath it.
 */
export default function PostcodeCTA({
  heading,
  sub,
  audience = "landlord",
}: {
  heading?: string;
  sub?: string;
  audience?: Audience;
}) {
  const isTenant = audience === "tenant";
  const copy = copyFor(audience);
  const h = heading ?? (isTenant ? "Should your home have been licensed?" : "Does your property need a licence?");
  const s =
    sub ??
    (isTenant
      ? "Enter the postcode of the property you rent for an instant free check of every scheme that could apply to it."
      : "Enter your postcode for an instant free check of every scheme that could apply.");

  return (
    <div className="rounded-2xl border border-accent-500/30 bg-gradient-to-br from-accent-600/15 to-navy-800/40 p-6 text-center sm:p-8">
      <h2 className="text-xl font-bold text-navy-100 sm:text-2xl">{h}</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm text-navy-300">{s}</p>
      <HeroSearch
        className="mx-auto mt-5 flex max-w-xl flex-col gap-3 sm:flex-row"
        buttonLabel="Check free"
        audience={audience}
      />
      <p className="mt-3 text-xs text-navy-500">
        Free scheme check · {copy.priceLabel} for the {isTenant ? "evidence report" : "full property report"}
      </p>
    </div>
  );
}
