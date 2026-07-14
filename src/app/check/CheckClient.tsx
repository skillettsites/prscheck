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
  sourceUrl: string;
  wardInList: boolean | null;
}

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
    details: SchemeDetail[];
    proposedDetails: { type: string; status: string; areaDescription: string | null; sourceUrl: string }[];
  };
}

function fmtDate(d: string | null): string {
  if (!d) return "TBC";
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

export default function CheckClient({ initialPostcode }: { initialPostcode?: string }) {
  const [postcode, setPostcode] = useState(initialPostcode ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<FreeResult | null>(null);

  const [address, setAddress] = useState("");
  const [addresses, setAddresses] = useState<string[]>([]);
  const [addressLoading, setAddressLoading] = useState(false);
  const [manualAddress, setManualAddress] = useState(false);
  const [addressError, setAddressError] = useState(false);
  const [occupants, setOccupants] = useState("");
  const [households, setHouseholds] = useState("");
  const [buying, setBuying] = useState(false);
  const autoRan = useRef(false);

  // When we have an England result, load the address list for that postcode so
  // the buyer can pick the exact property (mirrors HBC/PCC). Falls back to a
  // free-text field if the lookup returns nothing.
  useEffect(() => {
    if (!result || result.nation !== "england") {
      setAddresses([]);
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
    if (!address.trim()) {
      setAddressError(true);
      return;
    }
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
              {/* Real scheme detail (the public facts) */}
              {result.schemes.details.length > 0 ? (
                <div className="mt-5 space-y-3">
                  <p className="text-sm text-navy-300">
                    {result.council.name} runs{" "}
                    <span className="font-semibold text-navy-100">
                      {result.schemes.details.filter((d) => d.status !== "upcoming").length > 0
                        ? `${result.schemes.details.filter((d) => d.status !== "upcoming").length} live scheme${result.schemes.details.filter((d) => d.status !== "upcoming").length === 1 ? "" : "s"}`
                        : ""}
                      {result.schemes.upcoming > 0
                        ? `${result.schemes.details.filter((d) => d.status !== "upcoming").length > 0 ? " and " : ""}${result.schemes.upcoming} upcoming scheme${result.schemes.upcoming === 1 ? "" : "s"}`
                        : ""}
                    </span>{" "}
                    that could affect a rental here:
                  </p>
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
                        <p className="mt-2 rounded bg-warning/10 px-2.5 py-1.5 text-xs text-amber-200">
                          Your ward ({result.ward}) is in this scheme&apos;s designated list. Confirm the exact
                          determination for your property below.
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
                      <a
                        href={s.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-block text-xs text-accent-400 underline"
                      >
                        Official council scheme &amp; boundary map →
                      </a>
                    </div>
                  ))}
                  {result.schemes.proposedDetails.length > 0 && (
                    <p className="text-xs text-navy-500">
                      Plus {result.schemes.proposedDetails.length} scheme
                      {result.schemes.proposedDetails.length === 1 ? "" : "s"} proposed / under consultation here.
                    </p>
                  )}
                </div>
              ) : (
                <div className="mt-5 rounded-lg bg-navy-900/60 p-4 text-sm text-navy-300">
                  <p>
                    <span className="font-semibold text-navy-100">Good news:</span> {result.council.name} has no active
                    selective or additional licensing scheme right now.{" "}
                    {result.schemes.proposedDetails.length > 0 && (
                      <>A scheme is proposed or under consultation, though. </>
                    )}
                    Larger shared houses can still need a <span className="font-semibold">mandatory HMO licence</span>{" "}
                    anywhere in England. Get the report below to confirm your exact position and mandatory-HMO status.
                  </p>
                </div>
              )}

              {/* Paid form */}
              <div className="mt-6 border-t border-navy-700 pt-6">
                <h3 className="text-lg font-bold text-navy-100">Which of these applies to YOUR property? — £7.99</h3>
                <p className="mt-1 text-sm text-navy-400">
                  You can see the schemes above. The report gives the verdict for this specific property: whether it
                  needs a mandatory HMO licence based on how it&apos;s let, whether your address falls inside each
                  scheme&apos;s designated area, your exact penalty exposure, and a step-by-step action plan.
                </p>

                <div className="mt-4 space-y-3">
                  <div>
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <label className="block text-xs font-medium text-navy-400">Property address</label>
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
                          onChange={(e) => { setAddress(e.target.value); setAddressError(false); }}
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
                          onChange={(e) => { setAddress(e.target.value); setAddressError(false); }}
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
                  {buying ? "Starting checkout..." : "Get my licence report — £7.99"}
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

function nationLabel(nation: string): string {
  return nation === "wales"
    ? "Wales"
    : nation === "scotland"
      ? "Scotland"
      : nation === "northern-ireland"
        ? "Northern Ireland"
        : "the UK";
}
