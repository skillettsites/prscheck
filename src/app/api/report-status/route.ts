import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { applyReportTokenFilter, isValidReportToken } from "@/lib/report";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.json({ error: "token_required" }, { status: 400 });
  // Reject anything that is not the exact 12-character alphanumeric shape we
  // issue. The lookup is exact suffix equality on stripe_session_id, not LIKE.
  if (!isValidReportToken(token)) {
    return NextResponse.json({ status: "pending" });
  }
  try {
    const admin = createAdminClient();
    const { data } = await applyReportTokenFilter(
      admin.from("reports").select("status"),
      token,
    )
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    return NextResponse.json({ status: data?.status ?? "pending" });
  } catch {
    return NextResponse.json({ status: "pending" });
  }
}
