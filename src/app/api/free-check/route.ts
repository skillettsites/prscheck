import { NextRequest, NextResponse } from "next/server";
import { councilSummary, wardMatches } from "@/lib/licensing";
import { createAdminClient } from "@/lib/supabase-admin";

export const runtime = "nodejs";

interface PostcodesIoResult {
  postcode: string;
  country: string;
  region: string | null;
  admin_district: string | null;
  admin_ward: string | null;
  codes: { admin_district: string; admin_ward: string };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const raw = String(body.postcode ?? "").trim();
    if (!raw) return NextResponse.json({ error: "postcode_required" }, { status: 400 });

    const res = await fetch(
      `https://api.postcodes.io/postcodes/${encodeURIComponent(raw)}`,
      { next: { revalidate: 0 } },
    );
    if (!res.ok) {
      return NextResponse.json({ error: "postcode_not_found" }, { status: 404 });
    }
    const data = (await res.json()) as { result: PostcodesIoResult };
    const pc = data.result;
    const gss = pc.codes?.admin_district;
    if (!gss) return NextResponse.json({ error: "council_not_resolved" }, { status: 404 });

    const summary = councilSummary(gss);
    if (!summary) return NextResponse.json({ error: "council_unknown", gss }, { status: 404 });

    // Log the search; never let logging failures break the check.
    // NB: the shared `searches` table uses `search_query`/`result_found` and has
    // no `metadata` column, so inserting `query`/`metadata` silently 400s (PGRST204).
    // result_found = "their area has a licensing scheme" (active or upcoming) so
    // the dashboard's green/red dot flags hot leads (licensed areas) vs not.
    const schemeFound =
      summary.activeSelective.length + summary.activeAdditional.length + summary.upcoming.length > 0;
    // `log: false` marks an auto-run (a ?postcode= URL loaded from a bookmark,
    // refresh or prefetch) — not a genuine user search, so don't log it.
    if (body.log !== false) {
      try {
        const admin = createAdminClient();
        await admin.from("searches").insert({
          site_id: "prscheck",
          search_query: pc.postcode,
          result_found: schemeFound,
          search_type: "licence-check-free",
        });
      } catch {}
    }

    return NextResponse.json({
      postcode: pc.postcode,
      nation: summary.council.nation,
      council: {
        name: summary.council.name,
        slug: summary.council.slug,
        gss: summary.council.gss,
      },
      ward: pc.admin_ward,
      schemes: {
        hasData: summary.hasData,
        activeSelective: summary.activeSelective.length,
        activeAdditional: summary.activeAdditional.length,
        upcoming: summary.upcoming.length,
        proposed: summary.proposed.length,
        // Free tier shows that schemes exist + their type/dates/fees/area, but NOT
        // the council source URL, which is the freely-available source we don't hand
        // out. The PAID report adds the property-specific verdict (occupancy-based
        // mandatory HMO, definitive per-scheme determination, penalty exposure,
        // action plan) AND the official council source + boundary map.
        details: [...summary.activeSelective, ...summary.activeAdditional, ...summary.upcoming].map((s) => ({
          type: s.type,
          status: s.status,
          coverage: s.coverage,
          start: s.start,
          end: s.end,
          feeApprox: s.feeApprox ?? null,
          areaDescription: s.areaDescription ?? null,
          wards: s.wards ?? null,
          // Preliminary signal only: does the resident's ward appear in this
          // scheme's designated ward list? Many schemes are street/part-ward, so
          // this is a hint, not the determination (that's the paid report).
          wardInList:
            s.coverage === "wards" && pc.admin_ward ? wardMatches(s.wards, pc.admin_ward) : null,
        })),
        proposedDetails: summary.proposed.map((s) => ({
          type: s.type,
          status: s.status,
          areaDescription: s.areaDescription ?? null,
        })),
      },
    });
  } catch (err) {
    console.error("free-check error", err);
    return NextResponse.json({ error: "check_failed" }, { status: 500 });
  }
}
