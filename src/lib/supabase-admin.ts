import { createClient, SupabaseClient } from "@supabase/supabase-js";

let admin: SupabaseClient | null = null;

export function createAdminClient(): SupabaseClient {
  if (!admin) {
    const url = (process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\\n$/, "").trim();
    const key = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? "").replace(/\\n$/, "").trim();
    if (!url || !key) throw new Error("Supabase admin credentials not configured");
    admin = createClient(url, key, { auth: { persistSession: false } });
  }
  return admin;
}
