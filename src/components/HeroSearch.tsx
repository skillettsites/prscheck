"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HeroSearch() {
  const [postcode, setPostcode] = useState("");
  const router = useRouter();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!postcode.trim()) return;
    router.push(`/check?postcode=${encodeURIComponent(postcode.trim())}`);
  }

  return (
    <form onSubmit={submit} className="mx-auto mt-10 flex max-w-xl flex-col gap-3 sm:flex-row">
      <input
        type="text"
        value={postcode}
        onChange={(e) => setPostcode(e.target.value)}
        placeholder="Enter your postcode, e.g. B12 9QR"
        aria-label="Postcode"
        className="flex-1 rounded-lg border border-navy-700 bg-navy-800/80 px-4 py-3.5 text-navy-100 placeholder-navy-500 backdrop-blur focus:border-accent-500 focus:outline-none"
      />
      <button
        type="submit"
        className="rounded-lg bg-accent-600 px-7 py-3.5 font-semibold text-white shadow-lg shadow-accent-600/25 transition-all hover:bg-accent-500"
      >
        Check my property
      </button>
    </form>
  );
}
