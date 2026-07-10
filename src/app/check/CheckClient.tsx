"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

interface FreeResult {
  postcode: string;
  nation: string;
  council: { name: string; slug: string; gss: string };
  ward: string | null;
  schemes: {
    hasData: boolean;
    activeSelective: number;
    activeAdditional: number;
    upcoming: number;
    proposed: number;
    summaries: { type: string; status: string; coverage: string; start: string | null; end: string | null }[];
  };
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

export default function CheckClient({ initialPostcode }: { initialPostcode?: string }) {
  const [postcode, setPostcode] = useState(initialPostcode ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<FreeResult | null>(null);

  const [address, setAddress] = useState("");
  const [occupants, setOccupants] = useState("");
  const [households, setHouseholds] = useState("");
  const [buying, setBuying] = useState(false);
  const autoRan = useRef(false);

  // If we arrived with a postcode in the URL (e.g. from the homepage hero),
  // run the check automatically once.
  useEffect(() => {
    if (initialPostcode && !autoRan.current) {
      autoRan.current = true;
      runCheck();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPostcode]);

  async function runCheck(e?: React.FormEvent) {
    e?.preventDefault();
    if (!postcode.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/free-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postcode: postcode.trim() }),
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
    if (!occ || occ < 1) {
      setError("Please enter how many people live in the property.");
      return;
    }
    if (!hh || hh < 1 || hh > occ) {
      setError("Households must be at least 1 and no more than the number of occupants.");
      return;
    }
    setBuying(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postcode: result.postcode,
          address: address.trim(),
          gss: result.council.gss,
          ward: result.ward ?? "",
          occupants: occ,
          households: hh,
          attribution: attribution(),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setError(
          data.error === "england_only"
            ? "The paid report currently covers England only. See the guidance below for your nation."
            : "Could not start checkout. Please try again.",
        );
        setBuying(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Could not start checkout. Please try again.");
      setBuying(false);
    }
  }

  const isEngland = result?.nation === "england";
  const liveCount = result ? result.schemes.activeSelective + result.schemes.activeAdditional : 0;

  return (
    <div className="mx-auto max-w-2xl">
      {/* Search */}
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

      {/* Free teaser result */}
      {result && (
        <div className="mt-6 animate-slide-up rounded-2xl border border-navy-700 bg-navy-800/60 p-6">
          <p className="text-sm text-navy-400">Licensing authority for {result.postcode}</p>
          <h2 className="mt-1 text-2xl font-bold text-navy-100">{result.council.name}</h2>
          {result.ward && <p className="mt-1 text-sm text-navy-400">Ward: {result.ward}</p>}

          {!isEngland ? (
            <div className="mt-4 rounded-lg border border-accent-500/30 bg-accent-600/10 p-4 text-sm text-navy-200">
              <p className="font-semibold text-navy-100">This property is in {nationLabel(result.nation)}.</p>
              <p className="mt-1">
                {nationLabel(result.nation)} uses a national landlord registration and licensing regime rather than
                council-by-council schemes. See our free {" "}
                <Link href="/guides/landlord-licensing" className="text-accent-400 underline">
                  {nationLabel(result.nation)} licensing guide
                </Link>{" "}
                for what you need to do.
              </p>
            </div>
          ) : (
            <>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <Stat label="Active selective schemes" value={result.schemes.activeSelective} />
                <Stat label="Active additional (HMO) schemes" value={result.schemes.activeAdditional} />
                <Stat label="Upcoming schemes" value={result.schemes.upcoming} />
                <Stat label="Proposed / under review" value={result.schemes.proposed} />
              </div>

              <div className="mt-5 rounded-lg bg-navy-900/60 p-4 text-sm text-navy-300">
                {liveCount > 0 ? (
                  <p>
                    <span className="font-semibold text-warning">{result.council.name} operates discretionary
                    licensing.</span>{" "}
                    Whether YOUR property needs a licence depends on exactly where it is and how it is let. Get the
                    property-specific determination below.
                  </p>
                ) : result.schemes.upcoming > 0 ? (
                  <p>
                    <span className="font-semibold text-accent-400">A licensing scheme is coming to this area.</span>{" "}
                    Get the property-specific determination below to see whether and when it affects you.
                  </p>
                ) : (
                  <p>
                    We found no active selective or additional licensing scheme for this council. Larger HMOs may still
                    need a <span className="font-semibold">mandatory HMO licence</span> anywhere in England. The full
                    report confirms your exact position.
                  </p>
                )}
              </div>

              {/* Paid form */}
              <div className="mt-6 border-t border-navy-700 pt-6">
                <h3 className="text-lg font-bold text-navy-100">Get your property-specific licence report — £9.99</h3>
                <p className="mt-1 text-sm text-navy-400">
                  Tell us about the property and we&apos;ll tell you exactly which licence(s) it needs, the scheme dates
                  and fees, your penalty exposure, and what to do next.
                </p>

                <div className="mt-4 space-y-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-navy-400">Property address (optional)</label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="e.g. 14 Example Street"
                      className="w-full rounded-lg border border-navy-700 bg-navy-800 px-3 py-2.5 text-sm text-navy-100 placeholder-navy-500 focus:border-accent-500 focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-navy-400">How many people live there?</label>
                      <input
                        type="number"
                        min={1}
                        max={50}
                        value={occupants}
                        onChange={(e) => setOccupants(e.target.value)}
                        placeholder="e.g. 4"
                        className="w-full rounded-lg border border-navy-700 bg-navy-800 px-3 py-2.5 text-sm text-navy-100 placeholder-navy-500 focus:border-accent-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-navy-400">How many households?</label>
                      <input
                        type="number"
                        min={1}
                        max={50}
                        value={households}
                        onChange={(e) => setHouseholds(e.target.value)}
                        placeholder="e.g. 3"
                        className="w-full rounded-lg border border-navy-700 bg-navy-800 px-3 py-2.5 text-sm text-navy-100 placeholder-navy-500 focus:border-accent-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-navy-500">
                    A &quot;household&quot; is one person or a family/couple. Five unrelated tenants sharing = 5
                    households. A couple plus a lodger = 2 households.
                  </p>
                </div>

                <button
                  onClick={buy}
                  disabled={buying}
                  className="mt-4 w-full rounded-lg bg-accent-600 px-6 py-3.5 font-semibold text-white transition-all hover:bg-accent-500 disabled:opacity-60"
                >
                  {buying ? "Starting checkout..." : "Get my licence report — £9.99"}
                </button>
                <p className="mt-3 text-center text-xs text-navy-500">
                  Instant online report + permanent link + email. Secure payment via Stripe.
                </p>
              </div>
            </>
          )}
        </div>
      )}

      <p className="mt-6 text-center text-xs text-navy-600">
        PRSCheck is an information service based on published council designations, not legal advice. Always confirm
        exact scheme boundaries with the council before acting.
      </p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-navy-900/60 p-3 text-center">
      <div className={`text-2xl font-bold ${value > 0 ? "text-accent-400" : "text-navy-500"}`}>{value}</div>
      <div className="mt-0.5 text-xs text-navy-400">{label}</div>
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
