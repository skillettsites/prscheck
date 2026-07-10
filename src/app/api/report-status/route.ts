import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.json({ error: "token_required" }, { status: 400 });
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
