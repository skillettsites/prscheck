import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase-admin";
import { determine, councilSummary } from "@/lib/licensing";
import { sendLicenceReportEmail } from "@/lib/email";
import { deriveReportToken, type LicenceReportData } from "@/lib/report";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "missing_signature" }, { status: 400 });

  const body = await req.text();
  const secret = (process.env.STRIPE_WEBHOOK_SECRET ?? "").replace(/\\n$/, "").trim();
  if (!secret) {
    console.error("webhook: STRIPE_WEBHOOK_SECRET not configured");
    return NextResponse.json({ error: "webhook_not_configured" }, { status: 500 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch {
    return NextResponse.json({ error: "bad_signature" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Idempotency: insert-claim on event id; 23505 means a retry already handled it.
  // Same pattern as PCC/HBC (insert + unique-violation check, not upsert).
  const { error: dedupeErr } = await admin.from("stripe_events").insert({
    id: event.id,
    type: event.type,
    payload: event as unknown as Record<string, unknown>,
  });
  if (dedupeErr) {
    if (dedupeErr.code === "23505") return NextResponse.json({ ok: true, deduped: true });
    console.error("stripe_events insert failed", dedupeErr);
    return NextResponse.json({ error: "event_record_failed" }, { status: 500 });
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ ok: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  if (session.metadata?.product !== "licence_check") {
    return NextResponse.json({ ok: true });
  }

  // At-most-one fulfilment per checkout session.
  const { error: claimErr } = await admin.from("stripe_events").insert({
    id: `fulfil:${session.id}`,
    type: "fulfilment_claim",
    payload: { session_id: session.id, event_id: event.id },
  });
  if (claimErr) {
    if (claimErr.code === "23505") return NextResponse.json({ ok: true, deduped: "session" });
    console.error("session claim insert failed", claimErr);
    await admin.from("stripe_events").delete().eq("id", event.id);
    return NextResponse.json({ error: "claim_failed" }, { status: 500 });
  }

  const meta = session.metadata ?? {};
  const customerEmail = session.customer_details?.email ?? session.customer_email ?? null;
  const postcode = meta.postcode ?? "";
  const gss = meta.gss ?? "";
  if (!postcode || !gss || !customerEmail) {
    console.error("licence_check webhook missing fields", { postcode, gss, customerEmail });
    return NextResponse.json({ ok: true });
  }

  const { data: insertRow, error: reportInsertErr } = await admin
    .from("reports")
    .insert({
      tier: "licence_check",
      status: "processing",
      stripe_session_id: session.id,
      stripe_payment_intent: typeof session.payment_intent === "string" ? session.payment_intent : null,
      customer_email: customerEmail,
      amount_paid: session.amount_total,
    })
    .select("id")
    .single();

  if (reportInsertErr || !insertRow) {
    if (reportInsertErr?.code === "23505") return NextResponse.json({ ok: true, deduped: "report" });
    console.error("reports insert failed", reportInsertErr);
    await admin.from("stripe_events").delete().eq("id", `fulfil:${session.id}`);
    await admin.from("stripe_events").delete().eq("id", event.id);
    return NextResponse.json({ error: "report_record_failed" }, { status: 500 });
  }

  try {
    const determination = determine(gss, {
      occupants: Number(meta.occupants ?? 0),
      households: Number(meta.households ?? 0),
      wardName: meta.ward || null,
      // Street-level designations cannot be resolved from a postcode; this is
      // what turns "check the boundary" into a definite yes or no. The source
      // gates that: only an Ordnance Survey street may produce a definite "no".
      street: meta.street || null,
      streetSource:
        meta.street_source === "os" || meta.street_source === "epc-numbered" || meta.street_source === "epc-derived"
          ? meta.street_source
          : null,
      // Manchester designates by house-number range throughout, so the number
      // is what turns a hedge into a definite answer there.
      houseNumber: meta.house_number || null,
      // Known exactly rather than derived, so it is the most reliable match we
      // have wherever a council publishes its designated postcodes.
      postcode: meta.postcode || null,
      // Tested against the councils' own published designation boundaries,
      // which is the only signal that works where no list of any kind exists.
      latitude: meta.lat ? Number(meta.lat) : null,
      longitude: meta.lon ? Number(meta.lon) : null,
    });
    if (!determination) throw new Error("determination_failed");

    const report: LicenceReportData = {
      postcode,
      address: meta.address ?? "",
      ward: meta.ward || null,
      occupants: Number(meta.occupants ?? 0),
      households: Number(meta.households ?? 0),
      determination,
      councilNotes: councilSummary(gss)?.notes,
      generatedAt: new Date().toISOString(),
    };

    await admin
      .from("reports")
      .update({
        status: "ready",
        data: report as unknown as Record<string, unknown>,
        ready_at: new Date().toISOString(),
      })
      .eq("id", insertRow.id);

    const token = deriveReportToken(session.id);
    let emailDelivered = false;
    try {
      await sendLicenceReportEmail(customerEmail, report, token);
      emailDelivered = true;
    } catch (emailErr) {
      console.error("licence report email failed (report still saved)", emailErr);
    }

    await admin.from("reports").update({ email_sent: emailDelivered }).eq("id", insertRow.id);

    await admin.from("conversion_events").insert({
      site_id: "prscheck",
      event_type: "licence_check_completed",
      metadata: { postcode, gss, session_id: session.id, email_delivered: emailDelivered },
    });

    await notifySaleTelegram({
      amountPence: session.amount_total ?? 0,
      address: report.address || postcode,
      council: determination.council.name,
      customerEmail,
      emailDelivered,
      token,
    });
  } catch (err) {
    console.error("licence check fulfilment failed", err);
    await admin.from("reports").update({ status: "failed" }).eq("id", insertRow.id);
  }

  return NextResponse.json({ ok: true });
}

async function notifySaleTelegram(p: {
  amountPence: number;
  address: string;
  council: string;
  customerEmail: string;
  emailDelivered: boolean;
  token: string;
}): Promise<void> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!botToken || !chatId) return;
  const lines = [
    `💰 *PRSCheck sale, £${(p.amountPence / 100).toFixed(2)} Licence Check*`,
    "",
    `Property: ${p.address}`,
    `Council: ${p.council}`,
    `Buyer: ${p.customerEmail}`,
    `Email delivered: ${p.emailDelivered ? "✅" : "❌"}`,
    "",
    `Report: https://prscheck.co.uk/r/${p.token}`,
  ].join("\n");
  try {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: lines, parse_mode: "Markdown", disable_web_page_preview: true }),
    });
  } catch (err) {
    console.error("telegram alert failed", err);
  }
}
