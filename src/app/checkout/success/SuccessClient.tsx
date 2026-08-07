"use client";

import { useEffect, useState } from "react";

export default function SuccessClient({ token }: { token: string | null }) {
  const [state, setState] = useState<"polling" | "ready" | "failed" | "slow">("polling");

  useEffect(() => {
    if (!token) {
      setState("failed");
      return;
    }
    let tries = 0;
    let active = true;
    const poll = async () => {
      tries++;
      try {
        const res = await fetch(`/api/report-status?token=${encodeURIComponent(token)}`, { cache: "no-store" });
        const data = await res.json();
        if (!active) return;
        if (data.status === "ready") {
          window.location.href = `/r/${token}`;
          return;
        }
        if (data.status === "failed") {
          setState("failed");
          return;
        }
      } catch {
        /* keep polling */
      }
      if (tries >= 20) {
        setState("slow");
        return;
      }
      if (tries > 8 && active) setState("polling");
      setTimeout(poll, 1500);
    };
    poll();
    return () => {
      active = false;
    };
  }, [token]);

  if (state === "failed") {
    // This branch means fulfilment did NOT complete, so the report has not been
    // emailed. Telling the customer it had was a plain untruth at the one moment
    // they most need to know something has gone wrong, and it discouraged them
    // from contacting us by implying the email was already on its way.
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold text-navy-100">Your payment went through, but the report did not</h1>
        <p className="mt-3 text-navy-400">
          Something went wrong generating your report, so it has not been emailed. Your payment succeeded, and we have
          been alerted automatically. Email us at reports@prscheck.co.uk and we will either send your report or refund
          you the same day.
        </p>
        {token && <p className="mt-3 text-sm text-navy-500">Quote this reference: {token}</p>}
      </div>
    );
  }

  if (state === "slow") {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold text-navy-100">Your report is on its way</h1>
        <p className="mt-3 text-navy-400">
          It&apos;s taking a little longer than usual. We&apos;ve emailed your report to you with a permanent link, so
          you can safely close this page and open it from your inbox.
        </p>
        {token && (
          <a href={`/r/${token}`} className="mt-4 inline-block text-accent-400 underline">
            Try opening your report now
          </a>
        )}
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="mx-auto mb-6 h-10 w-10 animate-spin rounded-full border-4 border-navy-700 border-t-accent-500" />
      <h1 className="text-2xl font-bold text-navy-100">Payment received, building your report</h1>
      <p className="mt-3 text-navy-400">
        We&apos;re running your property against every current and upcoming licensing scheme. This takes a few seconds.
      </p>
    </div>
  );
}
