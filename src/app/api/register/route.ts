import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

/**
 * Council "register interest" enquiries.
 *
 * This endpoint used to validate the body, `console.log` it and return success.
 * The form sits on all 50 resources articles plus every /platform and /solutions
 * page, which is exactly where the council-officer search traffic lands, so
 * every enquiry the B2B side ever received was answered with a tick and then
 * dropped. Persist first, notify second: a Telegram outage must not lose a lead.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, councilName, role } = body ?? {};

    if (!name || !email || !councilName || !role) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
    }

    const lead = {
      name: String(name).slice(0, 200),
      email: String(email).slice(0, 200),
      council_name: String(councilName).slice(0, 200),
      role: String(role).slice(0, 200),
      referrer: request.headers.get("referer") || null,
      geo_city: (() => {
        const c = request.headers.get("x-vercel-ip-city");
        return c ? decodeURIComponent(c) : null;
      })(),
      geo_country: request.headers.get("x-vercel-ip-country") || null,
    };

    let stored = false;
    try {
      const admin = createAdminClient();
      const { error } = await admin.from("conversion_events").insert({
        site_id: "prscheck",
        event_type: "council_interest",
        metadata: lead,
      });
      if (error) throw new Error(error.message);
      stored = true;
    } catch (err) {
      // Log loudly rather than silently: a swallowed failure here is the exact
      // bug this rewrite exists to fix.
      console.error("[PRSCheck] council interest NOT stored", err, lead);
    }

    await notifyInterest(lead, stored);

    return NextResponse.json({ success: true, message: "Registration received successfully." });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}

async function notifyInterest(
  lead: { name: string; email: string; council_name: string; role: string; referrer: string | null },
  stored: boolean,
): Promise<void> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!botToken || !chatId) return;
  const text = [
    "🏛️ *PRSCheck: council interest*",
    "",
    `Name: ${lead.name}`,
    `Email: ${lead.email}`,
    `Council: ${lead.council_name}`,
    `Role: ${lead.role}`,
    lead.referrer ? `Page: ${lead.referrer}` : "",
    stored ? "" : "⚠️ NOT saved to Supabase, this message is the only record",
  ]
    .filter(Boolean)
    .join("\n");
  try {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "Markdown" }),
    });
  } catch (err) {
    console.error("[PRSCheck] council interest Telegram notify failed", err);
  }
}
