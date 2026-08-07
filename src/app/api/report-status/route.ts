import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { isValidReportToken } from "@/lib/report";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.json({ error: "token_required" }, { status: 400 });
  // The lookup below is a LIKE pattern, where `%` and `_` are wildcards. A token
  // of "%" matched every report row and returned the newest customer's status,
  // so the token's entropy bought nothing. Reject anything that is not the exact
  // shape we issue, which removes every LIKE metacharacter.
  if (!isValidReportToken(token)) {
    return NextResponse.json({ status: "pending" });
  }
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("reports")
      .select("status")
      .ilike("stripe_session_id", `%${token}`)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    return NextResponse.json({ status: data?.status ?? "pending" });
  } catch {
    return NextResponse.json({ status: "pending" });
  }
}
