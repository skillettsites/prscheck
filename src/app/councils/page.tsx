import type { Metadata } from "next";
import Link from "next/link";
import { COUNCILS, councilsWithLiveSchemes } from "@/lib/licensing";
import PostcodeCTA from "@/components/PostcodeCTA";

export const metadata: Metadata = {
  title: "UK Landlord Licensing by Council 2026: Selective & Additional Schemes",
  description:
    "Browse selective and additional (HMO) licensing schemes for every council in the UK. See which areas require a landlord licence, with dates, fees and a free postcode check.",
  alternates: { canonical: "https://prscheck.co.uk/councils" },
};

export default function CouncilsHub() {
  // Every UK council has a researched record and a page, so the directory
  // lists them all. Listing England only left the 65 Welsh, Scottish and NI
  // pages built but unlinked from anywhere on the site.
  const all = COUNCILS;
  const live = councilsWithLiveSchemes();
  const liveGss = new Set(live.map((l) => l.council.gss));

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-navy-100 sm:text-4xl">Landlord licensing by council</h1>
      <p className="mt-3 max-w-2xl text-navy-400">
        {live.length} of the {all.length} councils in the UK currently run a selective or additional (HMO) licensing
        scheme, and more are coming under the Renters&apos; Rights Act 2025. Those powers exist in England and Wales
        only; Scottish and Northern Irish councils use national registration and HMO licensing instead. Find your
        council below, or check a specific property by postcode.
      </p>

      <div className="mt-8">
        <PostcodeCTA />
      </div>

      <section className="mt-12">
        <h2 className="mb-4 text-2xl font-bold text-navy-100">Councils with active or upcoming schemes</h2>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {live.map(({ council, schemes }) => {
            const hasSel = schemes.some((s) => s.type === "selective");
            const hasAdd = schemes.some((s) => s.type === "additional");
            return (
              <Link
                key={council.gss}
                href={`/councils/${council.slug}`}
                className="rounded-lg border border-navy-700 bg-navy-800/60 p-4 transition-colors hover:border-accent-500/50 hover:bg-navy-800"
              >
                <div className="font-semibold text-navy-100">{council.name}</div>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {hasSel && (
                    <span className="rounded-full border border-success/40 bg-success/10 px-2 py-0.5 text-xs text-emerald-300">
                      Selective
                    </span>
                  )}
                  {hasAdd && (
                    <span className="rounded-full border border-accent-500/40 bg-accent-600/10 px-2 py-0.5 text-xs text-accent-300">
                      Additional
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="mb-4 text-2xl font-bold text-navy-100">All councils in England</h2>
        <p className="mb-4 text-sm text-navy-400">
          Every council has a page covering its licensing position, mandatory HMO rules and penalties.
        </p>
        <div className="columns-1 gap-x-8 sm:columns-2 lg:columns-3">
          {all.map((c) => (
            <Link
              key={c.gss}
              href={`/councils/${c.slug}`}
              className={`block break-inside-avoid py-1 text-sm hover:text-accent-400 ${
                liveGss.has(c.gss) ? "font-medium text-navy-200" : "text-navy-400"
              }`}
            >
              {c.name}
              {liveGss.has(c.gss) && <span className="ml-1.5 text-xs text-accent-500">●</span>}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
