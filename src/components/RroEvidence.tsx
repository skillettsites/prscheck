import type { LicenceReportData } from "@/lib/report";
import {
  AWARD_BAND,
  RRO_DEFENCES,
  RRO_FACTS,
  RRO_SECTION_44_FACTORS,
  RRO_SOURCES,
  gbp,
} from "@/lib/rro";
import { DEFINITE_VERDICTS, type Determination } from "@/lib/licensing";

/**
 * The tenant half of a paid report.
 *
 * Everything here is written for someone who may put it in front of a tribunal,
 * so it does two things a marketing page would not. It shows the arithmetic
 * rather than a headline number, and it states the defences that could defeat
 * the claim as prominently as the claim itself. A tenant who pays £29, files,
 * and loses to a licence application the landlord had already made would have
 * been better served by us saying nothing.
 */

/** Does the determination support an offence, or only raise the question? */
export function evidenceStrength(d: Determination): {
  level: "supports" | "possible" | "none";
  headline: string;
  detail: string;
} {
  const definite = (v: string) => DEFINITE_VERDICTS.includes(v as never);
  const positives = [...d.selective, ...d.additional];
  const definitePositive = positives.some((a) => definite(a.verdict));
  const boundary = positives.some((a) => a.verdict === "check-boundary");

  if (d.mandatoryHmo.required) {
    return {
      level: "supports",
      headline: "This property required a mandatory HMO licence",
      detail:
        "Mandatory HMO licensing is set by statute rather than by a local designation, so it applies wherever the property is. On the occupancy you gave, this property met the test. If it was let without a licence, that is the offence at section 72(1) of the Housing Act 2004.",
    };
  }
  if (definitePositive) {
    return {
      level: "supports",
      headline: "This property fell inside a live licensing designation",
      detail:
        "The council designated this area, and the designation was in force. Letting a property inside it without a licence is an offence under section 95(1) of the Housing Act 2004 for selective licensing, or section 72(1) for additional HMO licensing.",
    };
  }
  if (boundary || d.mandatoryHmo.conditional) {
    return {
      level: "possible",
      headline: "A licence may have been required, and one fact decides it",
      detail:
        "The designation covering this address is drawn at street or part-ward level, or turns on a detail we could not resolve from the address alone. That single fact decides whether an offence was committed, and the council can confirm it from its own designation map, usually free and in writing.",
    };
  }
  return {
    level: "none",
    headline: "No licensing requirement was identified for this property",
    detail:
      "On the details given, no selective, additional or mandatory HMO licence appears to have been required. A rent repayment order based on an unlicensed-property offence is therefore unlikely to succeed. The other offences in section 40(3) of the Housing and Planning Act 2016, including illegal eviction and harassment, are separate routes that this report does not assess.",
  };
}

function Row({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-navy-800 py-2.5 last:border-b-0">
      <div>
        <span className="text-sm text-navy-300">{label}</span>
        {note && <p className="text-xs text-navy-500">{note}</p>}
      </div>
      <span className="font-mono text-sm font-semibold text-navy-100">{value}</span>
    </div>
  );
}

export default function RroEvidence({ report }: { report: LicenceReportData }) {
  const d = report.determination;
  const rro = report.rro;
  const strength = evidenceStrength(d);
  const pct = (n: number) => `${Math.round(n * 100)}%`;

  return (
    <>
      {/* What the determination means for a claim */}
      <section
        className={`mt-6 rounded-2xl border p-6 ${
          strength.level === "supports"
            ? "border-success/40 bg-success/5"
            : strength.level === "possible"
              ? "border-warning/40 bg-warning/5"
              : "border-navy-700 bg-navy-800/60"
        }`}
      >
        <h2 className="text-lg font-bold text-navy-100">What this means for a rent repayment order</h2>
        <p className="mt-3 font-semibold text-navy-100">{strength.headline}</p>
        <p className="mt-2 text-sm text-navy-300">{strength.detail}</p>
        <p className="mt-4 text-sm text-navy-400">
          The First-tier Tribunal must be satisfied {RRO_FACTS.standardOfProof} that the offence was committed. Your
          landlord does not need to have been convicted, or even investigated, first. The scheme details and council
          source links above are the designation evidence: print them, and ask the council to confirm in writing that no
          licence was held for this address across your tenancy.
        </p>
      </section>

      {/* The claim, with the working shown */}
      {rro && !rro.incomplete && (
        <section className="mt-6 rounded-2xl border border-navy-700 bg-navy-800/60 p-6">
          <h2 className="text-lg font-bold text-navy-100">What your claim could be worth</h2>
          <p className="mt-2 text-sm text-navy-400">
            Worked using the method the Upper Tribunal set out in Acheampong v Roman [2022] UKUT 239 (LC), which is the
            method the First-tier Tribunal is expected to follow.
          </p>

          <div className="mt-5 rounded-xl bg-navy-900/60 p-5">
            <Row
              label={`Rent paid over ${rro.claimableMonths} ${rro.claimableMonths === 1 ? "month" : "months"}`}
              value={gbp(rro.grossRent)}
              note={
                rro.monthsCapped > 0
                  ? `You entered ${rro.monthsUnlicensed} months. The statutory cap is ${rro.capMonths}, so ${rro.monthsCapped} cannot be claimed.`
                  : undefined
              }
            />
            <Row
              label="Less utilities you alone consumed"
              value={rro.utilitiesDeducted > 0 ? `-${gbp(rro.utilitiesDeducted)}` : "£0"}
              note="Acheampong step 2: a sum paid to the landlord for gas, electricity or internet is not really rent."
            />
            <Row label="Rent after utilities" value={gbp(rro.rentAfterUtilities)} note="This is the ceiling, not the award." />
          </div>

          <div className="mt-5 rounded-xl border border-accent-500/30 bg-accent-600/10 p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-accent-400">
              Realistic award range for a licensing breach
            </p>
            <p className="mt-2 text-3xl font-bold text-navy-100">
              {gbp(rro.low)} to {gbp(rro.high)}
            </p>
            <p className="mt-1 text-sm text-navy-400">
              Midpoint around {gbp(rro.typical)}. That is {pct(AWARD_BAND.low)} to {pct(AWARD_BAND.high)} of the rent
              after utilities.
            </p>
            <p className="mt-3 text-sm text-navy-400">
              {/* The single most important sentence in the report. Quoting the
                  statutory maximum as an expectation is the standard way these
                  calculators mislead people, and it is exactly the claim a
                  landlord's representative would use to discredit the rest. */}
              Tribunals rarely award the full amount. The upper end here is the percentage the Upper Tribunal itself
              reached in Acheampong for an unlicensed HMO. The tribunal fixes the figure case by case, and under section
              44(4) of the Housing and Planning Act 2016 it must take into account:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-navy-400">
              {RRO_SECTION_44_FACTORS.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* What could defeat the claim */}
      <section className="mt-6 rounded-2xl border border-warning/30 bg-warning/5 p-6">
        <h2 className="text-lg font-bold text-navy-100">What could defeat the claim</h2>
        <p className="mt-2 text-sm text-navy-400">
          Check these before you pay a tribunal fee. Each one means no offence was committed, however clearly the
          property sat inside a designation.
        </p>
        <dl className="mt-4 space-y-4">
          {RRO_DEFENCES.map((def) => (
            <div key={def.defence}>
              <dt className="text-sm font-semibold text-navy-100">
                {def.defence} <span className="font-normal text-navy-500">({def.statute})</span>
              </dt>
              <dd className="mt-1 text-sm text-navy-400">{def.detail}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-sm text-navy-400">
          Both are answered by the same request: ask the council whether a licence, a pending application or a temporary
          exemption notice existed for this address during your tenancy. Councils publish a public register of licensed
          properties and must let you inspect it.
        </p>
      </section>

      {/* How to apply */}
      <section className="mt-6 rounded-2xl border border-navy-700 bg-navy-800/60 p-6">
        <h2 className="text-lg font-bold text-navy-100">How to make the claim</h2>
        <ol className="mt-4 space-y-3">
          {[
            `Ask ${d.council.name} in writing whether this address held a licence, had an application pending, or held a temporary exemption notice, for each month of your tenancy. Ask to inspect the public register. Keep the reply: it is your central piece of evidence.`,
            "Gather proof you paid the rent, and how much: bank statements, the tenancy agreement, and any receipts. The order is capped at what you actually paid.",
            `Complete Form ${RRO_FACTS.applicationForm} and send it to the ${RRO_FACTS.tribunal}. An application fee is payable, and the current amount is stated on the form itself. If you win you can ask the tribunal to order the landlord to reimburse it.`,
            `Apply within ${RRO_FACTS.applicationWindowMonths} months of the offence. For an offence that continued, the last date it was committed must fall inside that window.`,
            "Consider applying jointly if you shared the property. Joint tenants on one agreement pay one fee, and a group claim over the same unlicensed period is the same evidence used once.",
            "Get advice if you can. Shelter, Citizens Advice and your council's private-sector housing team can all comment on the strength of a claim, and some councils will help you apply.",
          ].map((step, i) => (
            <li key={i} className="flex gap-3 text-sm text-navy-300">
              <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-accent-600/20 text-xs font-bold text-accent-400">
                {i + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* Sources, because this is evidence */}
      <section className="mt-6 rounded-2xl border border-navy-700 bg-navy-800/60 p-6">
        <h2 className="text-lg font-bold text-navy-100">Sources</h2>
        <ul className="mt-3 space-y-2">
          {RRO_SOURCES.map((s) => (
            <li key={s.url}>
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-accent-400 underline hover:text-accent-300"
              >
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
