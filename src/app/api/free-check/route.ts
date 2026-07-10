import { NextRequest, NextResponse } from "next/server";
import { councilSummary } from "@/lib/licensing";
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
    try {
      const admin = createAdminClient();
      await admin.from("searches").insert({
        site_id: "prscheck",
        query: pc.postcode,
        search_type: "licence-check-free",
        metadata: { council: summary.council.name, gss, ward: pc.admin_ward },
      });
    } catch {}

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
        // Free tier deliberately gives counts + types, not the property-level determination.
        summaries: [...summary.activeSelective, ...summary.activeAdditional, ...summary.upcoming].map((s) => ({
          type: s.type,
          status: s.status,
          coverage: s.coverage,
          start: s.start,
          end: s.end,
        })),
      },
    });
  } catch (err) {
    console.error("free-check error", err);
    return NextResponse.json({ error: "check_failed" }, { status: 500 });
  }
}
