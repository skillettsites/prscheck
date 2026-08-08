import type { LicenceReportData } from "@/lib/report";
import type { SchemeAssessment, SchemeVerdict } from "@/lib/licensing";

const VERDICT_STYLE: Record<SchemeVerdict | "mandatory", { label: string; color: string; bg: string; border: string }> = {
  required: { label: "Licence required", color: "text-red-300", bg: "bg-danger/10", border: "border-danger/40" },
  "likely-required": { label: "Likely required", color: "text-orange-300", bg: "bg-warning/10", border: "border-warning/40" },
  "check-boundary": { label: "Check exact boundary", color: "text-amber-200", bg: "bg-warning/10", border: "border-warning/30" },
  upcoming: { label: "Scheme starting soon", color: "text-accent-300", bg: "bg-accent-600/10", border: "border-accent-500/30" },
  "not-in-area": { label: "Not in a designated area", color: "text-navy-300", bg: "bg-navy-800/60", border: "border-navy-700" },
  "not-applicable": { label: "Does not apply to this let", color: "text-navy-300", bg: "bg-navy-800/60", border: "border-navy-700" },
  mandatory: { label: "Mandatory HMO licence required", color: "text-red-300", bg: "bg-danger/10", border: "border-danger/40" },
};

function fmtDate(d: string | null): string {
  if (!d) return "date to be confirmed";
  const parsed = new Date(d + "T00:00:00Z");
  if (isNaN(parsed.getTime())) return d;
  return parsed.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

function SchemeCard({ a }: { a: SchemeAssessment }) {
  const style = VERDICT_STYLE[a.verdict];
  const s = a.scheme;
  return (
    <div className={`rounded-xl border ${style.border} ${style.bg} p-5`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="font-semibold text-navy-100">
          {s.type === "selective" ? "Selective licensing" : "Additional (HMO) licensing"}
        </h4>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${style.color} ${style.bg} border ${style.border}`}>
          {style.label}
        </span>
      </div>
      <p className="mt-2 text-sm text-navy-300">{a.explanation}</p>
      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
        {s.start && (
          <>
            <dt className="text-navy-500">In force</dt>
            <dd className="text-navy-200">{fmtDate(s.start)}{s.end ? ` – ${fmtDate(s.end)}` : ""}</dd>
          </>
        )}
        {s.feeApprox && (
          <>
            <dt className="text-navy-500">Approx. licence fee</dt>
            <dd className="text-navy-200">{s.feeApprox}</dd>
          </>
        )}
        {s.areaDescription && (
          <>
            <dt className="text-navy-500">Coverage</dt>
            <dd className="text-navy-200">{s.areaDescription}</dd>
          </>
        )}
      </dl>
      <a href={s.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-xs text-accent-400 underline">
        Council source &amp; boundary map →
      </a>
    </div>
  );
}

export default function LicenceReport({ report }: { report: LicenceReportData }) {
  const d = report.determination;
  const anyPositive = (a: SchemeAssessment) =>
    a.verdict === "required" || a.verdict === "likely-required" || a.verdict === "check-boundary" || a.verdict === "upcoming";

  const actions: string[] = [];
  if (d.mandatoryHmo.required) actions.push(`Apply for a mandatory HMO licence with ${d.council.name} before letting or continuing to let.`);
  // Wales meets the occupancy test but the storey test decides it, and we do
  // not collect storeys. Without this the action list can collapse to "no
  // licence appears to be required" for a property that very likely needs one.
  else if (d.mandatoryHmo.conditional)
    actions.push(
      `Count the property's storeys, including any habitable basement or attic. In Wales a mandatory HMO licence is required at three or more storeys, and this property already meets the occupancy test, so apply to ${d.council.name} if it has three.`,
    );
  d.selective.filter(anyPositive).forEach(() => actions.push(`Confirm the selective licensing boundary for this address on the council's map, and apply if covered.`));
  d.additional.filter(anyPositive).forEach(() => actions.push(`Confirm the additional (HMO) licensing requirement and apply if your property is in scope.`));
  if (actions.length === 0) actions.push(`No licence appears to be required today. Re-check if occupancy changes or a new scheme is designated.`);
  actions.push(`Keep gas safety, electrical (EICR) and smoke/CO alarm certificates up to date regardless of licensing.`);

  return (
    <article className="mx-auto max-w-3xl">
      <header className="rounded-2xl border border-navy-700 bg-navy-800/60 p-6">
        <p className="text-sm text-navy-400">Landlord Licence Report</p>
        <h1 className="mt-1 text-2xl font-bold text-navy-100">{report.address || report.postcode}</h1>
        <p className="mt-1 text-navy-400">
          {report.postcode} · {d.council.name}
          {report.ward ? ` · ${report.ward} ward` : ""}
        </p>
        <p className="mt-3 text-sm text-navy-300">
          Property let to {report.occupants} {report.occupants === 1 ? "person" : "people"} forming {report.households}{" "}
          {report.households === 1 ? "household" : "households"}.
        </p>
      </header>

      {/* Headline verdict */}
      <section className="mt-6">
        <h2 className="mb-3 text-lg font-bold text-navy-100">Your licensing position</h2>
        <div className="space-y-3">
          {/* Three states, not two. A Welsh property that meets the occupancy
              test but whose storey count we did not ask for is neither
              required nor not required, and the pill is the headline: showing
              "Not required" there asserted the opposite of the truth while the
              real answer sat in the paragraph underneath. */}
          <div
            className={`rounded-xl border p-5 ${
              d.mandatoryHmo.required
                ? "border-danger/40 bg-danger/10"
                : d.mandatoryHmo.conditional
                  ? "border-warning/40 bg-warning/10"
                  : "border-navy-700 bg-navy-800/60"
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="font-semibold text-navy-100">Mandatory HMO licensing</h4>
              <span
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                  d.mandatoryHmo.required
                    ? "border-danger/40 bg-danger/10 text-red-300"
                    : d.mandatoryHmo.conditional
                      ? "border-warning/40 bg-warning/10 text-amber-200"
                      : "border-navy-700 bg-navy-800/60 text-navy-300"
                }`}
              >
                {d.mandatoryHmo.required ? "Required" : d.mandatoryHmo.conditional ? "Depends on storeys" : "Not required"}
              </span>
            </div>
            <p className="mt-2 text-sm text-navy-300">{d.mandatoryHmo.explanation}</p>
          </div>

          {d.selective.map((a, i) => (
            <SchemeCard key={`sel-${i}`} a={a} />
          ))}
          {d.additional.map((a, i) => (
            <SchemeCard key={`add-${i}`} a={a} />
          ))}

          {d.selective.length === 0 && d.additional.length === 0 && (
            <div className="rounded-xl border border-navy-700 bg-navy-800/60 p-5 text-sm text-navy-300">
              {d.council.name} does not currently operate a selective or additional (HMO) licensing scheme. Only
              mandatory HMO licensing (above) can apply here.
            </div>
          )}
        </div>
      </section>

      {/* Penalties */}
      <section className="mt-6 rounded-2xl border border-navy-700 bg-navy-800/60 p-6">
        <h2 className="text-lg font-bold text-navy-100">What&apos;s at stake if you don&apos;t comply</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg bg-navy-900/60 p-4 text-center">
            {/* Reports are snapshotted into Supabase at purchase and /r/[token]
                re-renders that stored JSON, so every report sold before
                nation-aware penalties existed has no label. Falling back to the
                stored number keeps those reports rendering a figure instead of
                a blank. */}
            <div className="text-2xl font-bold text-danger">
              {d.penaltySummary.civilPenaltyLabel ?? `£${(d.penaltySummary.civilPenaltyMax ?? 0).toLocaleString("en-GB")}`}
            </div>
            <div className="mt-1 text-xs text-navy-400">
              {d.council.nation === "wales"
                ? "Fixed penalty notice per offence"
                : "Max civil penalty per offence (from 1 May 2026)"}
            </div>
          </div>
          <div className="rounded-lg bg-navy-900/60 p-4 text-center">
            <div className="text-2xl font-bold text-danger">{d.penaltySummary.rroMonths} months</div>
            <div className="mt-1 text-xs text-navy-400">Rent Repayment Order the tenant can claim</div>
          </div>
          <div className="rounded-lg bg-navy-900/60 p-4 text-center">
            <div className="text-2xl font-bold text-danger capitalize">{d.penaltySummary.criminalFine ?? "Unlimited"}</div>
            <div className="mt-1 text-xs text-navy-400">Fine on criminal prosecution</div>
          </div>
        </div>
        <p className="mt-4 text-xs text-navy-500">
          {d.penaltySummary.otherConsequences ??
            "Operating without a required licence is also grounds for a banning order and can block possession once the national PRS Database is live. Being unlicensed does not remove your repairing and safety obligations."}
        </p>
      </section>

      {/* Action plan */}
      <section className="mt-6 rounded-2xl border border-navy-700 bg-navy-800/60 p-6">
        <h2 className="text-lg font-bold text-navy-100">Your action plan</h2>
        <ol className="mt-4 space-y-3">
          {actions.map((a, i) => (
            <li key={i} className="flex gap-3 text-sm text-navy-300">
              <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-accent-600/20 text-xs font-bold text-accent-400">
                {i + 1}
              </span>
              <span>{a}</span>
            </li>
          ))}
        </ol>
      </section>

      {report.councilNotes && (
        <section className="mt-6 rounded-2xl border border-navy-700 bg-navy-800/60 p-6">
          <h2 className="text-lg font-bold text-navy-100">Notes on {d.council.name}</h2>
          <p className="mt-2 text-sm text-navy-400">{report.councilNotes}</p>
        </section>
      )}

      <p className="mt-6 text-xs text-navy-600">
        Generated {fmtDate(report.generatedAt.slice(0, 10))}. PRSCheck is an information service based on published
        council designations and national legislation, not legal advice. Many selective and additional schemes are
        designated at street or part-ward level; always confirm the exact boundary for your address using the council
        source links above before applying or relying on this report.
      </p>
    </article>
  );
}
