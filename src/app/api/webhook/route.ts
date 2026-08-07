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

  /**
   * Release both idempotency claims so Stripe's retry can genuinely re-run this.
   *
   * The claims are inserted before any work, which is what stops one payment
   * being fulfilled twice. The cost is that they also stop a FAILED fulfilment
   * being retried, so anything that returns non-2xx must release them first or
   * the retry short-circuits and the customer never gets their report.
   */
  const releaseClaims = async () => {
    await admin.from("stripe_events").delete().eq("id", `fulfil:${session.id}`);
    await admin.from("stripe_events").delete().eq("id", event.id);
  };

  const meta = session.metadata ?? {};
  const customerEmail = session.customer_details?.email ?? session.customer_email ?? null;
  const postcode = meta.postcode ?? "";
  const gss = meta.gss ?? "";
  // A missing email costs the customer an email, not their report: the report is
  // still built and still reachable at /r/[token], which the success page shows.
  // A missing postcode or council makes the report impossible, and retrying will
  // not conjure metadata that was never set, so alert rather than fail silently.
  if (!postcode || !gss) {
    console.error("licence_check webhook missing fields", { postcode, gss, customerEmail });
    await notifyFulfilmentFailure({
      sessionId: session.id,
      customerEmail,
      reason: `metadata missing (postcode="${postcode}", gss="${gss}")`,
    });
    return NextResponse.json({ ok: true, unfulfilled: "missing_metadata" });
  }

  let reportRowId: string | number | null = null;
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

  if (insertRow) {
    reportRowId = insertRow.id;
  } else if (reportInsertErr?.code === "23505") {
    // A row already exists for this session, which is what a RETRY of a failed
    // fulfilment looks like. Reuse it and finish the job, rather than treating
    // the collision as "already done" and leaving the customer with a row stuck
    // at "processing" that /r/[token] refuses to render.
    const { data: existing } = await admin
      .from("reports")
      .select("id, status")
      .eq("stripe_session_id", session.id)
      .maybeSingle();
    if (existing?.status === "ready") return NextResponse.json({ ok: true, deduped: "report" });
    if (!existing) {
      await releaseClaims();
      return NextResponse.json({ error: "report_record_failed" }, { status: 500 });
    }
    reportRowId = existing.id;
  } else {
    console.error("reports insert failed", reportInsertErr);
    await releaseClaims();
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

    // Mark ready BEFORE anything that talks to a third party. From this point
    // the customer has a report they can reach, whatever else fails.
    const { error: readyErr } = await admin
      .from("reports")
      .update({
        status: "ready",
        data: report as unknown as Record<string, unknown>,
        ready_at: new Date().toISOString(),
      })
      .eq("id", reportRowId);
    if (readyErr) throw new Error(`report update failed: ${readyErr.message}`);

    const token = deriveReportToken(session.id);

    // Everything below is best effort. A failure here must not fail the webhook:
    // returning non-2xx would make Stripe retry and re-send an email that already
    // went out, which is exactly how a sibling site delivered one report five
    // times over.
    let emailDelivered = false;
    if (customerEmail) {
      try {
        await sendLicenceReportEmail(customerEmail, report, token);
        emailDelivered = true;
      } catch (emailErr) {
        console.error("licence report email failed (report still saved)", emailErr);
      }
    } else {
      console.error("licence_check: no customer email on session, report saved but not emailed", session.id);
    }

    try {
      await admin.from("reports").update({ email_sent: emailDelivered }).eq("id", reportRowId);
      await admin.from("conversion_events").insert({
        site_id: "prscheck",
        event_type: "licence_check_completed",
        metadata: { postcode, gss, session_id: session.id, email_delivered: emailDelivered },
      });
    } catch (logErr) {
      console.error("post-fulfilment logging failed (report still saved)", logErr);
    }

    await notifySaleTelegram({
      amountPence: session.amount_total ?? 0,
      address: report.address || postcode,
      council: determination.council.name,
      customerEmail: customerEmail ?? "not captured",
      emailDelivered,
      token,
    });
  } catch (err) {
    // The customer has paid and has no report. Previously this returned 200,
    // which told Stripe the job was done: no retry, no email, /r/[token]
    // unreachable, and the success page still saying the report had been
    // emailed. Release the claims and fail loudly so Stripe retries, and alert
    // either way so a persistent failure cannot pass unnoticed.
    console.error("licence check fulfilment failed", err);
    await admin.from("reports").update({ status: "failed" }).eq("id", reportRowId);
    await releaseClaims();
    await notifyFulfilmentFailure({
      sessionId: session.id,
      customerEmail,
      reason: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ error: "fulfilment_failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

/**
 * Alert on a payment we could not fulfil.
 *
 * Without this a failed fulfilment is entirely silent: the customer is charged,
 * sees a success page telling them their report has been emailed, and nothing
 * anywhere says otherwise.
 */
async function notifyFulfilmentFailure(p: {
  sessionId: string;
  customerEmail: string | null;
  reason: string;
}): Promise<void> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!botToken || !chatId) return;
  const text = [
    "🚨 *PRSCheck: PAID BUT NOT FULFILLED*",
    "",
    `Session: ${p.sessionId}`,
    `Buyer: ${p.customerEmail ?? "not captured"}`,
    `Reason: ${p.reason}`,
    "",
    "The customer has been charged. Check Stripe and refund or fulfil manually.",
  ].join("\n");
  try {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "Markdown", disable_web_page_preview: true }),
    });
  } catch (err) {
    console.error("fulfilment failure alert failed", err);
  }
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
