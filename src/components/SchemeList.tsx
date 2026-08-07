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
            {s.streets && s.streets.length > 0 && (
              <>
                <dt className="text-navy-500">Designated streets</dt>
                <dd className="text-navy-200">{s.streets.length}</dd>
              </>
            )}
          </dl>
          {/* Publishing the schedule outright is most of the value on its own.
              Councils bury these in PDF annexes, so a landlord who just wants to
              know whether their road is on the list can answer that here without
              a phone call, whether or not our address matching can place them. */}
          {s.streets && s.streets.length > 0 && (
            <details className="mt-3 rounded-lg border border-navy-700 bg-navy-900/40 p-3">
              <summary className="cursor-pointer text-sm font-medium text-accent-400">
                Show the {s.streets.length} designated streets
              </summary>
              <p className="mt-2 text-xs text-navy-400">
                Transcribed from the council&apos;s published designation. Where only part of a street is covered, the
                house numbers are shown exactly as the council writes them.
              </p>
              <ul className="mt-3 grid gap-x-6 gap-y-1 text-sm text-navy-200 sm:grid-cols-2">
                {s.streets.map((st, j) => (
                  <li key={j}>
                    {st.name}
                    {st.numbers && <span className="text-navy-400"> ({st.numbers})</span>}
                  </li>
                ))}
              </ul>
            </details>
          )}
          {/* Where a designation is only ever a polygon on a map, the council's
              own lookup is the most useful thing we can hand over. */}
          {s.checkerUrl && (
            <a
              href={s.checkerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block text-sm font-medium text-accent-400 underline"
            >
              Check a specific address on {`the council's`} own checker
            </a>
          )}
          <p className="mt-3 text-xs text-navy-500">Official local authority licensing designation</p>
        </div>
      ))}
    </div>
  );
}
