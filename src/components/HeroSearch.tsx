"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HeroSearch({
  className = "mx-auto mt-10 flex max-w-xl flex-col gap-3 sm:flex-row",
  buttonLabel = "Check my property",
  audience = "landlord",
  placeholder = "Enter your postcode, e.g. B12 9QR",
}: {
  className?: string;
  buttonLabel?: string;
  /** Carries the visitor's side of the transaction into /check, so a tenant who
   *  searched from a tenant page is not then asked the landlord question. */
  audience?: "landlord" | "tenant";
  placeholder?: string;
} = {}) {
  const [postcode, setPostcode] = useState("");
  const router = useRouter();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!postcode.trim()) return;
    // `s=1` tells /check this auto-run came from a real submission, so it gets
    // logged. Without it the council-page funnel would be invisible in the
    // `searches` table, which is the only clean record we have (GA4 is polluted
    // by a bot replaying one ?postcode= URL).
    const forParam = audience === "tenant" ? "&for=tenant" : "";
    router.push(`/check?postcode=${encodeURIComponent(postcode.trim())}&s=1${forParam}`);
  }

  return (
    <form onSubmit={submit} className={className}>
      <input
        type="text"
        value={postcode}
        onChange={(e) => setPostcode(e.target.value)}
        placeholder={placeholder}
        aria-label="Postcode"
        className="flex-1 rounded-lg border border-navy-700 bg-navy-800/80 px-4 py-3.5 text-navy-100 placeholder-navy-500 backdrop-blur focus:border-accent-500 focus:outline-none"
      />
      <button
        type="submit"
        className="rounded-lg bg-accent-600 px-7 py-3.5 font-semibold text-white shadow-lg shadow-accent-600/25 transition-all hover:bg-accent-500"
      >
        {buttonLabel}
      </button>
    </form>
  );
}
