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
 * Only name and email are mandatory. The three callers (RegisterInterestCTA,
 * DemoPopup, /contact) disagree on the rest: RegisterInterestCTA marks council
 * and role `required`, the other two leave them optional, so requiring them here
 * 400'd every demo enquiry that skipped them while the popup still showed a
 * thank-you.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, councilName, role, message, source } = body ?? {};

    // Trim BEFORE validating. A whitespace-only name passed the truthy guard and
    // then trimmed away, storing a null-named lead behind a `name: string` type.
    const str = (v: unknown, max = 200) => (v == null ? null : String(v).trim().slice(0, max) || null);
    const cleanName = str(name);
    const cleanEmail = str(email);

    if (!cleanName || !cleanEmail) {
      return NextResponse.json({ error: "Name and email are required." }, { status: 400 });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
    }

    const lead = {
      name: cleanName,
      email: cleanEmail,
      council_name: str(councilName),
      role: str(role),
      // Both callers send a free-text message and it was being thrown away,
      // which is the part of an enquiry that actually says what they want.
      message: str(message, 4000),
      source: str(source) ?? "register-interest",
      // Capped like every other field. This is a raw request header on a public
      // POST, so an oversized Referer could push the truncation point into the
      // "Page:" line and cut off the "not saved to Supabase" warning after it.
      referrer: str(request.headers.get("referer"), 500),
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
  // Telegram rejects anything over 4096 characters, and a 4000-char message plus
  // the other fields clears that, so the most detailed enquiries were exactly the
  // ones whose alert got dropped. Trim the message itself rather than the
  // assembled text, and keep it LAST: slicing the whole string cut off the
  // Source, Page and "not saved" lines that come after it, so the one alert that
  // has to survive a failed insert was the one losing its warning.
  const msg = lead.message && lead.message.length > 3000 ? `${lead.message.slice(0, 3000)} [truncated]` : lead.message;
  const text = [
    "PRSCheck: council interest",
    "",
    `Name: ${lead.name}`,
    `Email: ${lead.email}`,
    lead.council_name ? `Council: ${lead.council_name}` : null,
    lead.role ? `Role: ${lead.role}` : null,
    `Source: ${lead.source}`,
    lead.referrer ? `Page: ${lead.referrer}` : null,
    stored ? null : "WARNING: not saved to Supabase, this message is the only record",
    msg ? `\nMessage: ${msg}` : null,
  ]
    .filter((l) => l !== null)
    .join("\n");
  // Belt and braces: every field is capped above, so this should never fire, but
  // if it does the reader must be told the text is incomplete rather than left
  // to assume the enquiry simply ended there.
  const safeText = text.length > 4090 ? `${text.slice(0, 4070)}\n[truncated]` : text;
  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: safeText }),
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
