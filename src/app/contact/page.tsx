"use client";

import { useState, FormEvent } from "react";

const roles = [
  "Head of Housing",
  "Enforcement Officer",
  "Director of Environment",
  "Team Leader",
  "IT / Digital",
  "Procurement",
  "Other",
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    council: "",
    role: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("submitting");

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          councilName: formData.council,
          role: formData.role,
        }),
      });

      if (!res.ok) throw new Error("Failed to submit");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  return (
    <>
      {/* Header */}
      <section className="bg-gradient-to-b from-navy-950 to-navy-900 py-20">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-navy-100 sm:text-5xl">
            Contact Us
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-navy-400">
            Get in touch to discuss how PRSCheck can support your enforcement team.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-3">
            {/* Contact Info */}
            <div className="space-y-8">
              <div>
                <h2 className="text-lg font-semibold text-navy-100">Get in Touch</h2>
                <p className="mt-2 text-sm text-navy-400">
                  We typically respond within one working day.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-navy-800">
                    <svg className="h-5 w-5 text-accent-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-navy-300">Email</p>
                    <a href="mailto:councils@prscheck.co.uk" className="text-sm text-accent-400 hover:text-accent-300">
                      councils@prscheck.co.uk
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-navy-800">
                    <svg className="h-5 w-5 text-accent-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-navy-300">Phone</p>
                    <p className="text-sm text-navy-400">Available on request</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-navy-800">
                    <svg className="h-5 w-5 text-accent-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-navy-300">G-Cloud</p>
                    <p className="text-sm text-navy-400">Available on Digital Marketplace</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-2">
              {status === "success" ? (
                <div className="rounded-xl border border-green-800/50 bg-green-900/20 p-8 text-center">
                  <svg className="mx-auto mb-4 h-12 w-12 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-lg font-semibold text-navy-100">Message sent successfully.</h3>
                  <p className="mt-2 text-navy-400">We will be in touch within one working day.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="c-name" className="mb-1.5 block text-sm font-medium text-navy-300">Full Name</label>
                    <input
                      id="c-name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full rounded-lg border border-navy-700 bg-navy-900 px-4 py-2.5 text-sm text-navy-100 placeholder-navy-600 focus:border-accent-500 focus:outline-none"
                      placeholder="Jane Smith"
                    />
                  </div>

                  <div>
                    <label htmlFor="c-email" className="mb-1.5 block text-sm font-medium text-navy-300">Work Email</label>
                    <input
                      id="c-email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full rounded-lg border border-navy-700 bg-navy-900 px-4 py-2.5 text-sm text-navy-100 placeholder-navy-600 focus:border-accent-500 focus:outline-none"
                      placeholder="j.smith@council.gov.uk"
                    />
                  </div>

                  <div>
                    <label htmlFor="c-council" className="mb-1.5 block text-sm font-medium text-navy-300">Council</label>
                    <input
                      id="c-council"
                      type="text"
                      required
                      value={formData.council}
                      onChange={(e) => setFormData({ ...formData, council: e.target.value })}
                      className="w-full rounded-lg border border-navy-700 bg-navy-900 px-4 py-2.5 text-sm text-navy-100 placeholder-navy-600 focus:border-accent-500 focus:outline-none"
                      placeholder="London Borough of Camden"
                    />
                  </div>

                  <div>
                    <label htmlFor="c-role" className="mb-1.5 block text-sm font-medium text-navy-300">Role</label>
                    <select
                      id="c-role"
                      required
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full rounded-lg border border-navy-700 bg-navy-900 px-4 py-2.5 text-sm text-navy-100 focus:border-accent-500 focus:outline-none"
                    >
                      <option value="">Select your role</option>
                      {roles.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="c-message" className="mb-1.5 block text-sm font-medium text-navy-300">Message</label>
                    <textarea
                      id="c-message"
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full rounded-lg border border-navy-700 bg-navy-900 px-4 py-2.5 text-sm text-navy-100 placeholder-navy-600 focus:border-accent-500 focus:outline-none"
                      placeholder="Tell us about your enforcement team and what you are looking for..."
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <button
                      type="submit"
                      disabled={status === "submitting"}
                      className="w-full rounded-lg bg-accent-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-accent-500 disabled:opacity-50 sm:w-auto"
                    >
                      {status === "submitting" ? "Sending..." : "Send Message"}
                    </button>
                  </div>

                  {status === "error" && (
                    <p className="text-sm text-danger sm:col-span-2">
                      Something went wrong. Please try again or email us directly.
                    </p>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
