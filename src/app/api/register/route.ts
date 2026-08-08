import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

/**
 * Council "register interest" and "book a demo" enquiries.
 *
 * This endpoint used to validate the body, `console.log` it and return success.
 * The form sits on all 50 resources articles plus every /platform and /solutions
 * page, which is exactly where the council-officer search traffic lands, so
 * every enquiry the B2B side ever received was answered with a tick and then
 * dropped. Persist first, notify second, and never report success unless the
 * lead survived somewhere.
 *
 * Only name and email are mandatory. The two callers disagree on the rest:
 * RegisterInterestCTA marks council and role `required`, DemoPopup leaves them
 * optional, so requiring them here 400'd every demo enquiry that skipped them
 * while the popup still showed a thank-you.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, councilName, role, message, source } = body ?? {};

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required." }, { status: 400 });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(String(email))) {
      return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
    }

    const str = (v: unknown, max = 200) => (v == null ? null : String(v).slice(0, max).trim() || null);
    const lead = {
      name: str(name)!,
      email: str(email)!,
      council_name: str(councilName),
      role: str(role),
      // Both callers send a free-text message and it was being thrown away,
      // which is the part of an enquiry that actually says what they want.
      message: str(message, 4000),
      source: str(source) ?? "register-interest",
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

    const notified = await notifyInterest(lead, stored);

    if (!stored && !notified) {
      // Nothing durable happened. Telling the caller it worked is what lost
      // every previous lead, so fail and let the form show its error state.
      console.error("[PRSCheck] council interest LOST (no store, no notify)", lead);
      return NextResponse.json(
        { error: "We could not record your enquiry. Please email hello@prscheck.co.uk." },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, message: "Registration received successfully." });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}

async function notifyInterest(
  lead: {
    name: string;
    email: string;
    council_name: string | null;
    role: string | null;
    message: string | null;
    source: string;
    referrer: string | null;
  },
  stored: boolean,
): Promise<boolean> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!botToken || !chatId) return false;
  // Plain text, no parse_mode. User-supplied values reach this message, and an
  // ordinary address like jane_doe@camden.gov.uk is invalid Markdown, so
  // Telegram would 400 and drop the alert, including the "not saved" one.
  const text = [
    "PRSCheck: council interest",
    "",
    `Name: ${lead.name}`,
    `Email: ${lead.email}`,
    lead.council_name ? `Council: ${lead.council_name}` : null,
    lead.role ? `Role: ${lead.role}` : null,
    lead.message ? `Message: ${lead.message}` : null,
    `Source: ${lead.source}`,
    lead.referrer ? `Page: ${lead.referrer}` : null,
    stored ? null : "WARNING: not saved to Supabase, this message is the only record",
  ]
    .filter((l) => l !== null)
    .join("\n");
  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text }),
    });
    if (!res.ok) {
      console.error("[PRSCheck] council interest Telegram notify rejected", res.status, await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error("[PRSCheck] council interest Telegram notify failed", err);
    return false;
  }
}
