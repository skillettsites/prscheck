"use client";

import { useState, FormEvent } from "react";

interface RegisterInterestCTAProps {
  variant?: "inline" | "banner";
}

const roles = [
  "Head of Housing",
  "Enforcement Officer",
  "Director of Environment",
  "Team Leader",
  "Other",
];

export default function RegisterInterestCTA({ variant = "inline" }: RegisterInterestCTAProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    councilName: "",
    role: "",
  });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg("");

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Something went wrong.");
      }

      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  if (status === "success") {
    return (
      <div className={`rounded-xl border border-green-800/50 bg-green-900/20 p-8 text-center ${variant === "banner" ? "mx-auto max-w-2xl" : ""}`}>
        <svg className="mx-auto mb-4 h-12 w-12 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-lg font-semibold text-navy-100">Thank you for registering your interest.</h3>
        <p className="mt-2 text-navy-400">
          We will be in touch when the PRS Database integration goes live.
        </p>
      </div>
    );
  }

  const isBanner = variant === "banner";

  return (
    <div className={isBanner ? "rounded-2xl border border-navy-700 bg-navy-800/50 p-8 sm:p-12" : ""}>
      {isBanner && (
        <div className="mb-8 text-center">
          <h3 className="text-2xl font-bold text-navy-100">Register Your Interest</h3>
          <p className="mt-2 text-navy-400">
            Be first to know when PRS Database integration goes live.
          </p>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className={`grid gap-4 ${isBanner ? "mx-auto max-w-2xl sm:grid-cols-2" : ""}`}
      >
        <div>
          <label htmlFor="ri-name" className="mb-1.5 block text-sm font-medium text-navy-300">
            Full Name
          </label>
          <input
            id="ri-name"
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full rounded-lg border border-navy-700 bg-navy-900 px-4 py-2.5 text-sm text-navy-100 placeholder-navy-600 transition-colors focus:border-accent-500 focus:outline-none"
            placeholder="Jane Smith"
          />
        </div>

        <div>
          <label htmlFor="ri-email" className="mb-1.5 block text-sm font-medium text-navy-300">
            Work Email
          </label>
          <input
            id="ri-email"
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full rounded-lg border border-navy-700 bg-navy-900 px-4 py-2.5 text-sm text-navy-100 placeholder-navy-600 transition-colors focus:border-accent-500 focus:outline-none"
            placeholder="j.smith@council.gov.uk"
          />
        </div>

        <div>
          <label htmlFor="ri-council" className="mb-1.5 block text-sm font-medium text-navy-300">
            Council Name
          </label>
          <input
            id="ri-council"
            type="text"
            required
            value={formData.councilName}
            onChange={(e) => setFormData({ ...formData, councilName: e.target.value })}
            className="w-full rounded-lg border border-navy-700 bg-navy-900 px-4 py-2.5 text-sm text-navy-100 placeholder-navy-600 transition-colors focus:border-accent-500 focus:outline-none"
            placeholder="London Borough of Camden"
          />
        </div>

        <div>
          <label htmlFor="ri-role" className="mb-1.5 block text-sm font-medium text-navy-300">
            Role
          </label>
          <select
            id="ri-role"
            required
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            className="w-full rounded-lg border border-navy-700 bg-navy-900 px-4 py-2.5 text-sm text-navy-100 transition-colors focus:border-accent-500 focus:outline-none"
          >
            <option value="">Select your role</option>
            {roles.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        <div className={isBanner ? "sm:col-span-2" : ""}>
          <button
            type="submit"
            disabled={status === "submitting"}
            className="w-full rounded-lg bg-accent-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-accent-500 hover:shadow-lg hover:shadow-accent-600/25 disabled:opacity-50"
          >
            {status === "submitting" ? "Submitting..." : "Register Interest"}
          </button>
        </div>

        {status === "error" && (
          <p className={`text-sm text-danger ${isBanner ? "sm:col-span-2 text-center" : ""}`}>
            {errorMsg}
          </p>
        )}
      </form>
    </div>
  );
}
