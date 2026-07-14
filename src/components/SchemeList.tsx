import type { Scheme } from "@/lib/licensing";

function fmtDate(d: string | null): string {
  if (!d) return "TBC";
  const parsed = new Date(d + "T00:00:00Z");
  if (isNaN(parsed.getTime())) return d;
  return parsed.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

const STATUS_BADGE: Record<string, string> = {
  active: "border-success/40 bg-success/10 text-emerald-300",
  upcoming: "border-accent-500/40 bg-accent-600/10 text-accent-300",
  expired: "border-navy-600 bg-navy-800 text-navy-400",
  proposed: "border-warning/40 bg-warning/10 text-amber-200",
  unverified: "border-warning/30 bg-warning/10 text-amber-200",
};

export default function SchemeList({ schemes }: { schemes: Scheme[] }) {
  if (schemes.length === 0) return null;
  return (
    <div className="space-y-4">
      {schemes.map((s, i) => (
        <div key={i} className="rounded-xl border border-navy-700 bg-navy-800/60 p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-semibold text-navy-100">
              {s.type === "selective" ? "Selective licensing" : "Additional (HMO) licensing"}
            </h3>
            <span className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${STATUS_BADGE[s.status] ?? STATUS_BADGE.proposed}`}>
              {s.status}
            </span>
          </div>
          {s.areaDescription && <p className="mt-2 text-sm text-navy-300">{s.areaDescription}</p>}
          <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
            <dt className="text-navy-500">Dates</dt>
            <dd className="text-navy-200">
              {s.start || s.end ? `${fmtDate(s.start)} – ${fmtDate(s.end)}` : "To be confirmed"}
            </dd>
            {s.feeApprox && (
              <>
                <dt className="text-navy-500">Approx. fee</dt>
                <dd className="text-navy-200">{s.feeApprox}</dd>
              </>
            )}
            {s.wards && s.wards.length > 0 && (
              <>
                <dt className="text-navy-500">Wards / areas</dt>
                <dd className="text-navy-200">{s.wards.join(", ")}</dd>
              </>
            )}
          </dl>
          <p className="mt-3 text-xs text-navy-500">Official local authority licensing designation</p>
        </div>
      ))}
    </div>
  );
}
