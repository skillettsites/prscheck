"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function DemoPopup() {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", councilName: "", role: "", message: "" });

  // Listen for custom event from any "Book a Demo" button
  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("open-demo-popup", handler);
    return () => window.removeEventListener("open-demo-popup", handler);
  }, []);

  // Close on escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.name) return;
    setLoading(true);
    try {
      await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, source: "demo-popup" }),
      });
      setSubmitted(true);
    } catch {
      // still show success
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  }, [form]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />

          {/* Popup */}
          <motion.div
            className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative w-full max-w-lg rounded-2xl border border-navy-700 bg-navy-900 p-6 sm:p-8 shadow-2xl"
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => setOpen(false)}
                className="absolute top-4 right-4 text-navy-500 hover:text-navy-300 transition-colors cursor-pointer"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {submitted ? (
                <div className="text-center py-8">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-500/10">
                    <svg className="h-7 w-7 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-navy-100">Thank you</h3>
                  <p className="mt-2 text-sm text-navy-400">
                    We will be in touch within 24 hours to arrange your demo. We will also notify you when the PRS Database integration goes live.
                  </p>
                  <button
                    onClick={() => { setOpen(false); setSubmitted(false); setForm({ name: "", email: "", councilName: "", role: "", message: "" }); }}
                    className="mt-6 rounded-lg border border-navy-700 px-6 py-2 text-sm font-medium text-navy-300 transition-colors hover:border-navy-600 hover:text-navy-100 cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-navy-100">Book a Demo</h3>
                    <p className="mt-1 text-sm text-navy-400">
                      See how PRSCheck can help your enforcement team. We will also notify you when the PRS Database integration goes live.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-navy-400 mb-1">Your name *</label>
                        <input
                          type="text"
                          required
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          className="w-full rounded-lg border border-navy-700 bg-navy-800 px-3 py-2.5 text-sm text-navy-100 placeholder:text-navy-600 focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
                          placeholder="Jane Smith"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-navy-400 mb-1">Work email *</label>
                        <input
                          type="email"
                          required
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          className="w-full rounded-lg border border-navy-700 bg-navy-800 px-3 py-2.5 text-sm text-navy-100 placeholder:text-navy-600 focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
                          placeholder="j.smith@council.gov.uk"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-navy-400 mb-1">Council</label>
                        <input
                          type="text"
                          value={form.councilName}
                          onChange={(e) => setForm({ ...form, councilName: e.target.value })}
                          className="w-full rounded-lg border border-navy-700 bg-navy-800 px-3 py-2.5 text-sm text-navy-100 placeholder:text-navy-600 focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
                          placeholder="Tower Hamlets"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-navy-400 mb-1">Your role</label>
                        <select
                          value={form.role}
                          onChange={(e) => setForm({ ...form, role: e.target.value })}
                          className="w-full rounded-lg border border-navy-700 bg-navy-800 px-3 py-2.5 text-sm text-navy-100 focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
                        >
                          <option value="">Select...</option>
                          <option value="Head of Housing">Head of Housing</option>
                          <option value="Enforcement Officer">Enforcement Officer</option>
                          <option value="Director">Director</option>
                          <option value="Procurement">Procurement</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-navy-400 mb-1">Anything specific you want to see?</label>
                      <textarea
                        rows={2}
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        className="w-full rounded-lg border border-navy-700 bg-navy-800 px-3 py-2.5 text-sm text-navy-100 placeholder:text-navy-600 focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500 resize-none"
                        placeholder="e.g. HMO detection, PRS Database readiness..."
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full rounded-lg bg-accent-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-accent-600/25 transition-all hover:bg-accent-500 disabled:opacity-50 cursor-pointer"
                    >
                      {loading ? "Submitting..." : "Request Demo"}
                    </button>
                    <p className="text-center text-[10px] text-navy-500">
                      No commitment. We will show you the platform and answer your questions.
                    </p>
                  </form>
                </>
              )}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Helper: trigger the popup from any component
export function openDemoPopup() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("open-demo-popup"));
  }
}

// Button component that opens the popup
export function BookDemoButton({ className, children }: { className?: string; children?: React.ReactNode }) {
  return (
    <button
      onClick={() => openDemoPopup()}
      className={className || "rounded-lg bg-accent-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-accent-600/25 transition-all hover:bg-accent-500 hover:shadow-xl hover:shadow-accent-600/30 cursor-pointer"}
    >
      {children || "Book a Demo"}
    </button>
  );
}
