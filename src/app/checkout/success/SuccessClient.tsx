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
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold text-navy-100">We couldn&apos;t load your report</h1>
        <p className="mt-3 text-navy-400">
          Your payment succeeded and your report has been emailed to you. If it hasn&apos;t arrived shortly, contact us
          at reports@prscheck.co.uk and we&apos;ll sort it out right away.
        </p>
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
