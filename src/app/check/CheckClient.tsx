"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

interface SchemeDetail {
  type: "selective" | "additional";
  status: string;
  coverage: string;
  start: string | null;
  end: string | null;
  feeApprox: string | null;
  areaDescription: string | null;
  wards: string[] | null;
  wardInList: boolean | null;
}

interface FreeResult {
  postcode: string;
  nation: string;
  council: { name: string; slug: string; gss: string };
  ward: string | null;
  /** Postcode centroid, carried through to the paid determination so it can be
   *  tested against councils' own published designation boundaries. */
  latitude: number | null;
  longitude: number | null;
  schemes: {
    hasData: boolean;
    activeSelective: number;
    activeAdditional: number;
    upcoming: number;
    proposed: number;
    details: SchemeDetail[];
    proposedDetails: { type: string; status: string; areaDescription: string | null }[];
  };
}

function fmtDate(d: string | null): string {
  // See SchemeList: the council has not published a date, we are not awaiting one.
  if (!d) return "not published";
  const p = new Date(d + "T00:00:00Z");
  if (isNaN(p.getTime())) return d;
  return p.toLocaleDateString("en-GB", { month: "short", year: "numeric", timeZone: "UTC" });
}

function attribution() {
  if (typeof window === "undefined") return {};
  const p = new URLSearchParams(window.location.search);
  return {
    utm_source: p.get("utm_source") ?? "",
    utm_medium: p.get("utm_medium") ?? "",
    utm_campaign: p.get("utm_campaign") ?? "",
    referrer_source: document.referrer ? new URL(document.referrer).hostname : "",
    landing_page: window.location.pathname,
  };
}

export default function CheckClient({
  initialPostcode,
  fromSearchBox = false,
}: {
  initialPostcode?: string;
  fromSearchBox?: boolean;
}) {
  const [postcode, setPostcode] = useState(initialPostcode ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<FreeResult | null>(null);

  const [address, setAddress] = useState("");
  const [addresses, setAddresses] = useState<string[]>([]);
  // Structured address list from OS Places. We need the street, not just the
  // display string: ~35 live schemes are designated street by street and a
  // postcode cannot resolve them.
  const [addressItems, setAddressItems] = useState<
    {
      address: string;
      street: string | null;
      buildingNumber: string | null;
      streetSource?: "os" | "epc-numbered" | "epc-derived";
    }[]
  >([]);
  const [addressLoading, setAddressLoading] = useState(false);
  const [manualAddress, setManualAddress] = useState(false);
  const [addressError, setAddressError] = useState(false);
  const [occupants, setOccupants] = useState("");
  const [households, setHouseholds] = useState("");
  // Per-field messages for the purchase form. The page-level `error` banner only
  // renders on the search screen, so a validation failure set there while a
  // result was showing produced a button that silently did nothing.
  const [occupantsError, setOccupantsError] = useState<string | null>(null);
  const [householdsError, setHouseholdsError] = useState<string | null>(null);
  const [buyError, setBuyError] = useState<string | null>(null);
  const [buying, setBuying] = useState(false);
  const autoRan = useRef(false);

  // Clear the result to bring the search box back for another postcode.
  const reset = () => {
    setResult(null);
    setError(null);
    setPostcode("");
  };

  // When we have an England result, load the address list for that postcode so
  // the buyer can pick the exact property (mirrors HBC/PCC). Falls back to a
  // free-text field if the lookup returns nothing.
  useEffect(() => {
    if (!result || !(result.nation === "england" || result.nation === "wales")) {
      setAddresses([]);
      setAddressItems([]);
      return;
    }
    let active = true;
    setAddressLoading(true);
    setAddress("");
    setManualAddress(false);
    fetch(`/api/addresses?postcode=${encodeURIComponent(result.postcode)}`)
      .then((r) => r.json())
      .then((d) => {
        if (!active) return;
        const list: string[] = Array.isArray(d.addresses) ? d.addresses : [];
        setAddresses(list);
        setAddressItems(Array.isArray(d.items) ? d.items : []);
        if (list.length === 0) setManualAddress(true);
      })
      .catch(() => {
        if (active) setManualAddress(true);
      })
      .finally(() => {
        if (active) setAddressLoading(false);
      });
    return () => {
      active = false;
    };
  }, [result]);

  // If we arrived with a postcode in the URL (e.g. from the homepage hero),
  // run the check automatically once.
  useEffect(() => {
    if (initialPostcode && !autoRan.current) {
      autoRan.current = true;
      // Strip `s=1` as soon as it has been consumed. Left in the address bar it
      // is part of the URL the visitor bookmarks, reloads and navigates back
      // to, and every one of those would log another search: the phantom-search
      // problem the `log` flag exists to prevent, reintroduced through the
      // parameter added to fix it.
      if (fromSearchBox && typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.delete("s");
        window.history.replaceState(null, "", url.pathname + url.search);
      }
      runCheck(undefined, { auto: !fromSearchBox });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPostcode]);

  async function runCheck(e?: React.FormEvent, opts?: { auto?: boolean }) {
    e?.preventDefault();
    if (!postcode.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/free-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // auto-runs (from a ?postcode= URL, e.g. a bookmark/refresh/prefetch)
        // shouldn't be logged as searches — only genuine form submissions are.
        body: JSON.stringify({ postcode: postcode.trim(), log: !opts?.auto }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(
          data.error === "postcode_not_found"
            ? "We couldn't find that postcode. Please check and try again."
            : data.error === "council_unknown"
              ? "We don't yet have licensing data for that council."
              : "Something went wrong. Please try again.",
        );
        return;
      }
      setResult(data);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function buy() {
    if (!result) return;
    const occ = parseInt(occupants, 10);
    const hh = parseInt(households, 10);

    // Validate every field before returning, so all three problems are shown at
    // once rather than one per click.
    const missingAddress = !address.trim();
    const occMsg = !occ || occ < 1 ? "Required" : occ > 50 ? "Must be 50 or fewer" : null;
    const hhMsg = !hh || hh < 1 ? "Required" : occMsg === null && hh > occ ? "Cannot exceed occupants" : null;
    setAddressError(missingAddress);
    setOccupantsError(occMsg);
    setHouseholdsError(hhMsg);
    if (missingAddress || occMsg || hhMsg) {
      setBuyError("Please complete the fields marked above before continuing.");
      return;
    }
    setBuyError(null);
    // Matches only when the buyer picked from the lookup, not when they typed
    // their own address, which is what keeps a hand-typed street out of the
    // street matcher.
    const selectedItem = addressItems.find((i) => i.address === address.trim());
    setBuying(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postcode: result.postcode,
          address: address.trim(),
          gss: result.council.gss,
          ward: result.ward ?? "",
          // Street of the selected address, plus where it came from. A typed-in
          // address has no entry here, so both stay empty and the report falls
          // back to a boundary check. The source matters: only an Ordnance
          // Survey street is trusted to rule a designation OUT.
          street: selectedItem?.street ?? "",
          streetSource: selectedItem?.streetSource ?? "",
          houseNumber: selectedItem?.buildingNumber ?? "",
          // Postcode centroid from the free check, used to test the property
          // against the council's own published designation boundary.
          latitude: result.latitude ?? null,
          longitude: result.longitude ?? null,
          occupants: occ,
          households: hh,
          attribution: attribution(),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setBuyError(
          data.error === "unsupported_nation"
            ? "The paid report covers England and Wales, where councils can run licensing schemes. See the guidance below for your nation."
            : "Could not start checkout. Please try again.",
        );
        setBuying(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setBuyError("Could not start checkout. Please try again.");
      setBuying(false);
    }
  }

  // Wales has the same Housing Act 2004 powers as England and nine of its
  // twenty-two councils run live schemes, so Welsh searches must get the real
  // scheme answer rather than a national fallback. `isEngland` is kept only for
  // the paid report, which is still England-only at checkout.
  const hasCouncilSchemes = result?.nation === "england" || result?.nation === "wales";
  // Hot lead: the searcher's ward appears in an active/upcoming scheme's designated list.
  const hotMatch = hasCouncilSchemes && !!result?.schemes.details.some((d) => d.wardInList === true);

  return (
    <div className="mx-auto max-w-2xl">
      {/* Hero + search: hidden once a result is showing, so the result sits at the top */}
      {!result && (
        <>
          <div className="mb-8 text-center">
            <span className="mb-4 inline-block rounded-full border border-accent-500/30 bg-accent-600/10 px-3 py-1 text-xs font-medium text-accent-400">
              Free instant check
            </span>
            <h1 className="text-3xl font-bold text-navy-100 sm:text-4xl">
              Does your rental property need a licence?
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-navy-400">
              Operating an unlicensed property risks a civil penalty of up to £40,000, a Rent Repayment Order of up to
              24 months&apos; rent, and being unable to serve notice. Check your postcode in seconds.
            </p>
          </div>
          <form onSubmit={runCheck} className="flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              value={postcode}
              onChange={(e) => setPostcode(e.target.value)}
              placeholder="Enter a postcode, e.g. B12 9QR"
              aria-label="Postcode"
              className="flex-1 rounded-lg border border-navy-700 bg-navy-800 px-4 py-3.5 text-navy-100 placeholder-navy-500 focus:border-accent-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-accent-600 px-6 py-3.5 font-semibold text-white transition-all hover:bg-accent-500 disabled:opacity-60"
            >
              {loading ? "Checking..." : "Check licensing"}
            </button>
          </form>

          {error && (
            <p className="mt-4 rounded-lg border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-red-300">{error}</p>
          )}
        </>
      )}

      {/* Free teaser result */}
      {result && (
        <>
          <button
            type="button"
            onClick={reset}
            className="mb-4 inline-flex items-center gap-1 text-sm text-navy-400 transition-colors hover:text-accent-400"
          >
            ← Check another postcode
          </button>
        <div className="animate-slide-up rounded-2xl border border-navy-700 bg-navy-800/60 p-6">
          <p className="text-sm text-navy-400">Licensing authority for {result.postcode}</p>
          <h2 className="mt-1 text-2xl font-bold text-navy-100">{result.council.name}</h2>
          {result.ward && <p className="mt-1 text-sm text-navy-400">Ward: {result.ward}</p>}
          {/* Only claim to be showing official licensing data when we actually
              hold research for this council. Sitting this badge above "we have
              not yet verified this council" would undo the point of saying so. */}
          <p className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-navy-700 bg-navy-800 px-2.5 py-1 text-xs text-navy-400">
            {hasCouncilSchemes && !result.schemes.hasData ? (
              <>
                <span aria-hidden>📍</span> Council identified from official postcode data · scheme research pending
              </>
            ) : (
              <>
                <span aria-hidden>🏛️</span> Based on official government &amp; local authority licensing data
              </>
            )}
          </p>

          {hotMatch && (
            <div className="mt-4 rounded-lg border border-warning/50 bg-warning/10 p-4">
              <p className="text-sm font-semibold text-amber-200">⚠️ Your ward is inside an active licensing scheme</p>
              <p className="mt-1 text-sm text-navy-200">
                That means a rental at this postcode very likely needs a licence. Operating without one risks{" "}
                {/* This banner renders above the nation gate and hotMatch includes
                    Wales, so a Cathays postcode read "up to £40,000" directly
                    above the Welsh stakes box saying £150-£250. */}
                {result.nation === "wales"
                  ? "a fixed penalty and an unlimited fine on conviction"
                  : "a penalty of up to £40,000"}
                . Confirm your property&apos;s exact position below before you let, rent or buy.
              </p>
            </div>
          )}

          {!hasCouncilSchemes ? (
            <div className="mt-4 rounded-lg border border-accent-500/30 bg-accent-600/10 p-4 text-sm text-navy-200">
              <p className="font-semibold text-navy-100">This property is in {nationLabel(result.nation)}.</p>
              {result.nation === "wales" ? (
                <>
                  {/* The Housing Act 2004 extends to England AND Wales (s.270(11)), so Welsh
                      councils can and do designate additional licensing schemes. Telling a Welsh
                      landlord that only a national regime applies would be false, and could leave
                      them operating an unlicensed HMO. */}
                  <p className="mt-1">
                    Welsh councils can run their own additional and selective licensing schemes under the same
                    Housing Act 2004 powers as England, and several do. We are still verifying scheme data for
                    Welsh councils, so please confirm directly with {result.council.name} before letting.
                  </p>
                  <p className="mt-2">
                    Separately, every landlord in Wales must register with Rent Smart Wales, and must also hold a
                    licence if they manage the property themselves rather than through a licensed agent. See our free{" "}
                    <Link href="/guides/landlord-licensing" className="text-accent-400 underline">
                      Wales licensing guide
                    </Link>
                    .
                  </p>
                </>
              ) : (
                <p className="mt-1">
                  {nationLabel(result.nation)} does not use council-by-council selective or additional licensing.
                  The Housing Act 2004 does not extend there. Instead a national registration and licensing regime
                  applies to every private rental. See our free{" "}
                  <Link href="/guides/landlord-licensing" className="text-accent-400 underline">
                    {nationLabel(result.nation)} licensing guide
                  </Link>{" "}
                  for what you need to do.
                </p>
              )}
            </div>
          ) : (
            <>
              {/* Real scheme detail (the public facts) */}
              {result.schemes.details.length > 0 ? (
                <div className="mt-5 space-y-3">
                  <div className="rounded-lg border border-warning/40 bg-warning/10 p-4">
                    <p className="text-base font-bold text-amber-100">You could need a licence for this property.</p>
                    <p className="mt-1.5 text-sm text-navy-200">
                      {result.council.name} has{" "}
                      <span className="font-semibold text-navy-100">
                        {result.schemes.details.filter((d) => d.status !== "upcoming").length > 0
                          ? `${result.schemes.details.filter((d) => d.status !== "upcoming").length} active licensing scheme${result.schemes.details.filter((d) => d.status !== "upcoming").length === 1 ? "" : "s"}`
                          : ""}
                        {result.schemes.upcoming > 0
                          ? `${result.schemes.details.filter((d) => d.status !== "upcoming").length > 0 ? " and " : ""}${result.schemes.upcoming} upcoming scheme${result.schemes.upcoming === 1 ? "" : "s"}`
                          : ""}
                      </span>{" "}
                      covering rentals in this area. Whether your specific property needs a licence depends on its exact
                      address and how it is let. Get a bespoke report for{" "}
                      {result.nation === "wales" ? "your property's exact position" : "a definitive answer"}.
                    </p>
                  </div>
                  <p className="text-xs font-medium uppercase tracking-wide text-navy-500">The schemes here</p>
                  {result.schemes.details.map((s, i) => (
                    <div key={i} className="rounded-lg border border-navy-700 bg-navy-900/50 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h4 className="text-sm font-semibold text-navy-100">
                          {s.type === "selective" ? "Selective licensing" : "Additional (HMO) licensing"}
                        </h4>
                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${
                            s.status === "upcoming"
                              ? "border-accent-500/40 bg-accent-600/10 text-accent-300"
                              : "border-success/40 bg-success/10 text-emerald-300"
                          }`}
                        >
                          {s.status === "upcoming" ? `From ${fmtDate(s.start)}` : "Active"}
                        </span>
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-navy-400">
                        <span>Runs</span>
                        <span className="text-navy-200">
                          {fmtDate(s.start)} – {fmtDate(s.end)}
                        </span>
                        {s.feeApprox && (
                          <>
                            <span>Council fee</span>
                            <span className="text-navy-200">{s.feeApprox}</span>
                          </>
                        )}
                        <span>Covers</span>
                        <span className="text-navy-200">
                          {s.coverage === "borough-wide" || s.coverage === "district" || s.coverage === "whole district"
                            ? "Whole council area"
                            : s.wards && s.wards.length > 0
                              ? `${s.wards.length} ward${s.wards.length === 1 ? "" : "s"}/areas`
                              : s.areaDescription
                                ? "Designated streets/areas"
                                : "Designated areas"}
                        </span>
                      </div>
                      {/* Ward-match hint */}
                      {s.wardInList === true && result.ward && (
                        <p className="mt-2 rounded bg-warning/10 px-2.5 py-1.5 text-xs font-medium text-amber-200">
                          ⚠️ Your ward ({result.ward}) is inside this scheme, so a rental here very likely needs a
                          licence. The report confirms your exact position.
                        </p>
                      )}
                      {s.wardInList === false && result.ward && (
                        <p className="mt-2 rounded bg-navy-800 px-2.5 py-1.5 text-xs text-navy-400">
                          Your ward ({result.ward}) is not in this scheme&apos;s designated list, but nearby designations
                          or occupancy rules may still apply. The report confirms.
                        </p>
                      )}
                      {(s.coverage === "streets" || s.coverage === "areas" || s.coverage === "part") && (
                        <p className="mt-2 rounded bg-navy-800 px-2.5 py-1.5 text-xs text-navy-400">
                          This scheme is designated at street/part-ward level, so it can apply to one address and not the
                          one next door. The report resolves your exact position.
                        </p>
                      )}
                    </div>
                  ))}
                  {result.schemes.proposedDetails.length > 0 && (
                    <p className="text-xs text-navy-500">
                      Plus {result.schemes.proposedDetails.length} scheme
                      {result.schemes.proposedDetails.length === 1 ? "" : "s"} proposed / under consultation here.
                    </p>
                  )}
                </div>
              ) : !result.schemes.hasData ? (
                /* We hold no verified scheme research for this council. Saying
                   "no scheme here" would be asserting an absence we cannot
                   support, so say what is actually true instead. */
                <div className="mt-5 rounded-lg border border-navy-700 bg-navy-900/60 p-4 text-sm text-navy-300">
                  <p>
                    <span className="font-semibold text-navy-100">
                      We have not yet verified {result.council.name}&apos;s licensing schemes.
                    </span>{" "}
                    Most councils run no blanket scheme, but we will not tell you that as fact until we have checked
                    this one against the council&apos;s own designations. Here is what applies either way:
                  </p>
                  <ul className="mt-3 space-y-1.5">
                    <li>
                      {/* The mandatory HMO test differs by nation and this block
                          renders for Wales too. Wales kept the three-storey
                          requirement England dropped in 2018, and has no £40,000
                          civil penalty, so the England wording asserted both a
                          test and a penalty that do not apply there. */}
                      • A <span className="font-semibold text-navy-100">mandatory HMO licence</span> is required{" "}
                      {result.nation === "wales" ? (
                        <>
                          <span className="font-semibold">anywhere in Wales</span> once a property is let to 5+ people in
                          2+ households AND has three or more storeys, whatever your council does. An unlimited fine can
                          follow on conviction.
                        </>
                      ) : (
                        <>
                          <span className="font-semibold">anywhere in England</span> once a property is let to 5+ people
                          in 2+ households, whatever your council does. Penalties reach £40,000.
                        </>
                      )}
                    </li>
                    <li>
                      • Selective and additional schemes are often street or part-ward designations, so they can apply
                      to your exact address even where most of the district is unaffected.
                    </li>
                  </ul>
                  <p className="mt-3">
                    {/* "Rules a mandatory HMO licence in or out" is a promise we
                        cannot keep in Wales. The Welsh test also requires three
                        or more storeys and we never ask for storeys, so the
                        report returns "depends on storeys" there. Selling a
                        definitive answer and delivering a conditional one is a
                        refund waiting to happen. */}
                    The £7.99 report includes a manual check of {result.council.name}&apos;s current designations,{" "}
                    {result.nation === "wales"
                      ? "applies the Welsh mandatory HMO test to your occupancy and tells you whether the storey count is what decides it"
                      : "rules a mandatory HMO licence in or out"}
                    , and gives you the council source in writing.
                  </p>
                </div>
              ) : (
                <div className="mt-5 rounded-lg border border-navy-700 bg-navy-900/60 p-4 text-sm text-navy-300">
                  <p>
                    <span className="font-semibold text-navy-100">No blanket selective or additional scheme</span> in{" "}
                    {result.council.name} right now
                    {result.schemes.proposedDetails.length > 0 ? ", though one is proposed or under consultation" : ""}.
                    But that isn&apos;t the whole picture:
                  </p>
                  <ul className="mt-3 space-y-1.5">
                    <li>
                      • A <span className="font-semibold text-navy-100">mandatory HMO licence</span> is required{" "}
                      {result.nation === "wales" ? (
                        <>
                          <span className="font-semibold">anywhere in Wales</span> once a property is let to 5+ people in
                          2+ households AND has three or more storeys, with no council scheme needed. This is where
                          landlords most often get caught.
                        </>
                      ) : (
                        <>
                          <span className="font-semibold">anywhere in England</span> once a property is let to 5+ people
                          in 2+ households, with no council scheme needed. This is where landlords most often get caught,
                          with penalties up to £40,000.
                        </>
                      )}
                    </li>
                    <li>
                      • Schemes change, and street or part-ward designations nearby can still apply to your exact address.
                    </li>
                  </ul>
                  <p className="mt-3">
                    The £7.99 report confirms your position,{" "}
                    {result.nation === "wales"
                      ? "applies the Welsh mandatory HMO test to your occupancy and tells you whether the storey count is what decides it"
                      : "rules a mandatory HMO licence in or out"}
                    , and gives you documented proof.
                  </p>
                </div>
              )}

              {/* Purchase CTA: address + occupancy, button goes straight to Stripe checkout */}
              <div className="mt-6 rounded-xl border border-accent-500/40 bg-accent-600/10 p-5">
                <p className="text-center text-base font-bold text-navy-100">
                  Confirm if your specific address needs a licence.
                </p>
                <p className="mt-1 text-center text-xs text-navy-400">
                  All three fields below are required. They decide the answer, so we cannot run the report without them.
                </p>
                <div className="mt-4">
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <label className="block text-xs font-medium text-navy-400">
                      Property address <span className="text-red-400" aria-hidden>*</span>
                    </label>
                    {addressError && (
                      <span className="text-xs font-medium text-red-400">
                        Please select or enter the property address
                      </span>
                    )}
                  </div>
                  {addressLoading ? (
                    <div className="flex items-center gap-2 rounded-lg border border-navy-700 bg-navy-800 px-3 py-2.5 text-sm text-navy-400">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-navy-600 border-t-accent-500" />
                      Finding addresses at {result.postcode}...
                    </div>
                  ) : !manualAddress && addresses.length > 0 ? (
                    <>
                      <select
                        value={address}
                        onChange={(e) => { setAddress(e.target.value); setAddressError(false); setBuyError(null); }}
                        className="w-full rounded-lg border border-navy-700 bg-navy-800 px-3 py-2.5 text-sm text-navy-100 focus:border-accent-500 focus:outline-none"
                      >
                        <option value="">Select your property...</option>
                        {addresses.map((a) => (
                          <option key={a} value={a}>
                            {a}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => {
                          setManualAddress(true);
                          setAddress("");
                        }}
                        className="mt-1 text-xs text-navy-500 underline hover:text-accent-400"
                      >
                        My address isn&apos;t listed
                      </button>
                    </>
                  ) : (
                    <>
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => { setAddress(e.target.value); setAddressError(false); setBuyError(null); }}
                        placeholder="e.g. 14 Example Street"
                        className="w-full rounded-lg border border-navy-700 bg-navy-800 px-3 py-2.5 text-sm text-navy-100 placeholder-navy-500 focus:border-accent-500 focus:outline-none"
                      />
                      {addresses.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            setManualAddress(false);
                            setAddress("");
                          }}
                          className="mt-1 text-xs text-navy-500 underline hover:text-accent-400"
                        >
                          Choose from the address list instead
                        </button>
                      )}
                    </>
                  )}
                </div>
                <div className="mt-3 grid grid-cols-2 items-start gap-3">
                  <div>
                    <div className="mb-1 flex items-baseline justify-between gap-2">
                      <label className="block text-xs font-medium text-navy-400">
                        People living there <span className="text-red-400" aria-hidden>*</span>
                      </label>
                      {occupantsError && <span className="text-xs font-medium text-red-400">{occupantsError}</span>}
                    </div>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      required
                      aria-invalid={!!occupantsError}
                      value={occupants}
                      onChange={(e) => {
                        setOccupants(e.target.value);
                        setOccupantsError(null);
                        setHouseholdsError(null);
                        setBuyError(null);
                        // NO AUTOFILL HERE. Setting households to 1 when this
                        // reads "1" looks harmless but fires on every keystroke,
                        // so typing "12" passes through "1", pins households at
                        // 1 and never resets. The report then computes
                        // isMandatoryHmo as false and tells a twelve-person
                        // shared house it is below the HMO threshold, which is
                        // the single most expensive answer we can get wrong.
                      }}
                      placeholder="e.g. 4"
                      className={`w-full rounded-lg border bg-navy-800 px-3 py-2.5 text-sm text-navy-100 placeholder-navy-500 focus:outline-none ${
                        occupantsError ? "border-red-500/70 focus:border-red-500" : "border-navy-700 focus:border-accent-500"
                      }`}
                    />
                  </div>
                  <div>
                    <div className="mb-1 flex items-baseline justify-between gap-2">
                      <label className="block text-xs font-medium text-navy-400">
                        Households <span className="text-red-400" aria-hidden>*</span>
                      </label>
                      {householdsError && <span className="text-xs font-medium text-red-400">{householdsError}</span>}
                    </div>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      required
                      aria-invalid={!!householdsError}
                      value={households}
                      onChange={(e) => {
                        setHouseholds(e.target.value);
                        setHouseholdsError(null);
                        setBuyError(null);
                      }}
                      placeholder="e.g. 3"
                      className={`w-full rounded-lg border bg-navy-800 px-3 py-2.5 text-sm text-navy-100 placeholder-navy-500 focus:outline-none ${
                        householdsError ? "border-red-500/70 focus:border-red-500" : "border-navy-700 focus:border-accent-500"
                      }`}
                    />
                  </div>
                </div>
                <p className="mt-2 text-xs text-navy-500">
                  A &quot;household&quot; is one person or a family/couple. Five unrelated tenants sharing = 5 households.
                  A couple plus a lodger = 2 households. We ask because 5+ people in 2+ households needs a mandatory HMO
                  licence anywhere in {result.nation === "wales" ? "Wales, if the property also has three or more storeys" : "England, whatever your council does"}.
                </p>
                {buyError && (
                  <p
                    role="alert"
                    className="mt-3 rounded-lg border border-danger/40 bg-danger/10 px-3 py-2.5 text-sm text-red-300"
                  >
                    {buyError}
                  </p>
                )}
                <button
                  onClick={buy}
                  disabled={buying}
                  className="mt-4 w-full rounded-lg bg-accent-600 px-6 py-3.5 font-semibold text-white shadow-lg shadow-accent-600/25 transition-all hover:bg-accent-500 disabled:opacity-60"
                >
                  {buying ? "Starting checkout..." : "Get my bespoke report for £7.99 →"}
                </button>
                <p className="mt-3 text-center text-xs text-navy-500">
                  Instant online report, permanent link and email. Secure payment via Stripe.
                </p>
              </div>

              {/* Stakes */}
              <div className="mt-6 rounded-lg border border-danger/30 bg-danger/5 p-3.5">
                {/* The £40,000 civil penalty and the 24-month Rent Repayment
                    Order are Housing Act 2004 s.249A powers, and the 24-month
                    uplift is England-only. Quoting them to a Welsh landlord
                    states a penalty regime that does not apply to them. */}
                {/* Wales has no civil penalty of England's kind. The £30,000
                    previously shown here was England's own pre-May-2026 figure,
                    not a Welsh one, so a Welsh landlord saw one number on the
                    free check and a different one in the paid report. Housing
                    (Wales) Act 2014: fixed penalty notices of £150-£250 plus an
                    unlimited fine on conviction, and no banning-order regime. */}
                {result.nation === "wales" ? (
                  <p className="text-sm text-navy-200">
                    <span className="font-semibold text-red-300">Getting this wrong is expensive.</span> Letting without
                    a required licence in Wales risks a{" "}
                    <span className="font-semibold text-red-300">fixed penalty of £150-£250</span>, an{" "}
                    <span className="font-semibold text-red-300">unlimited fine</span> on conviction, a rent-repayment
                    order of up to <span className="font-semibold text-red-300">12 months&apos; rent</span>, a rent
                    stopping order, and being unable to serve a valid possession notice.
                  </p>
                ) : (
                  <p className="text-sm text-navy-200">
                    <span className="font-semibold text-red-300">Getting this wrong is expensive.</span> Letting without
                    a required licence risks a civil penalty of up to{" "}
                    <span className="font-semibold text-red-300">£40,000</span>, a rent-repayment order of up to{" "}
                    <span className="font-semibold text-red-300">24 months&apos; rent</span>, and a possible banning
                    order.
                  </p>
                )}
                <p className="mt-2 text-sm text-navy-300">
                  <span className="font-semibold text-navy-100">£7.99 once</span> for{" "}
                  {result.nation === "wales" ? "your property's exact position" : "a definitive answer"}, set against{" "}
                  {result.nation === "wales" ? "an unlimited fine" : "a five-figure fine"} for getting it wrong.
                </p>
              </div>

              {/* What your report gives you */}
              <div className="mt-6 border-t border-navy-700 pt-6">
                <h3 className="text-lg font-bold text-navy-100">Get the verdict for YOUR property</h3>
                <p className="mt-1 text-sm text-navy-400">
                  The schemes above are the general picture. Your report answers the one question that matters: does{" "}
                  <span className="font-semibold text-navy-200">this specific property</span> need a licence?{" "}
                  {result.nation === "wales"
                    ? "In Wales the mandatory HMO test also turns on storeys, which only you can count, so the report tells you exactly what to check."
                    : ""}
                  You get:
                </p>

                <ul className="mt-4 space-y-2">
                  {[
                    result.nation === "wales"
                      ? "Your licensing position for this exact address, scheme by scheme"
                      : "A definitive licence verdict for your exact address",
                    result.nation === "wales"
                      ? "How the Welsh mandatory HMO test applies to your let, and whether the storey count is what decides it"
                      : "Whether it needs a mandatory HMO licence, based on how it's let",
                    "Whether your address falls inside each scheme's designated boundary",
                    "Your exact penalty exposure and the deadlines that apply",
                    "A step-by-step action plan to get compliant",
                    "A permanent, shareable report plus an emailed copy",
                  ].map((item) => (
                    <li key={item} className="flex gap-2.5 text-sm text-navy-200">
                      <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
        </>
      )}

      {/* navy-600 on the page background is 2.7:1, below the 4.5:1 WCAG AA
          minimum, and this is the text that limits our liability. navy-400
          clears it comfortably. */}
      <p className="mt-6 text-center text-xs text-navy-400">
        PRSCheck is an information service based on published council designations, not legal advice. Always confirm
        exact scheme boundaries with the council before acting.
      </p>
    </div>
  );
}

function nationLabel(nation: string): string {
  return nation === "wales"
    ? "Wales"
    : nation === "scotland"
      ? "Scotland"
      : nation === "northern-ireland"
        ? "Northern Ireland"
        : "the UK";
}
