/**
 * Handler webhook condivisi (Meta per Instagram+Facebook, LinkedIn, TikTok).
 * Flusso: verifica firma sul body grezzo → parsing → registrazione idempotente
 * (event_key univoco) → risposta 200 immediata → processing in `after()`.
 * Se la registrazione su DB fallisce si risponde 500: la piattaforma ritenta,
 * quindi l'evento non si perde.
 */
import { after, NextResponse, type NextRequest } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { InboundEvent } from "./types";
import { linkedInChallengeResponse, safeEqual, verifyLinkedInSignature, verifyMetaSignature, verifyTikTokSignature } from "./crypto";
import { parseMetaWebhook } from "./providers/meta";
import { parseLinkedInWebhook } from "./providers/linkedin";
import { parseTikTokLeads, type TikTokLead } from "./providers/tiktok";
import { processRecordedEvent, recordWebhookEvent, retryDueEvents, type EngineDeps } from "./engine";
import { createEngineDeps } from "./runtime";
import { clientIp, rateLimit } from "./rate-limit";
import { addTag, createNotification, createSystemActivity, logAction } from "./crm";

type DepsFactory = () => EngineDeps;

async function ingest(events: InboundEvent[], makeDeps: DepsFactory): Promise<NextResponse> {
  if (!events.length) return NextResponse.json({ received: 0 });
  let deps: EngineDeps;
  try {
    deps = makeDeps();
  } catch (e) {
    console.error("[webhook] configurazione server:", (e as Error).message);
    return NextResponse.json({ error: "server not configured" }, { status: 500 });
  }
  const ids: string[] = [];
  try {
    for (const ev of events) {
      const id = await recordWebhookEvent(deps.db, ev);
      if (id) ids.push(id); // null = duplicato: già ricevuto, non si riprocessa
    }
  } catch (e) {
    console.error("[webhook] record failed:", (e as Error).message);
    return NextResponse.json({ error: "temporary failure" }, { status: 500 });
  }
  after(async () => {
    for (const id of ids) await processRecordedEvent(deps, id);
    // piggyback: ritenta eventi falliti con backoff scaduto
    await retryDueEvents(deps, 3).catch(() => 0);
  });
  return NextResponse.json({ received: events.length, queued: ids.length, duplicates: events.length - ids.length });
}

function limited(req: NextRequest, name: string): boolean {
  return !rateLimit(`${name}:${clientIp(req.headers)}`, 600, 60_000);
}

/* ─── Meta ─────────────────────────────────────────────────── */

export function metaVerify(req: NextRequest): NextResponse {
  const p = req.nextUrl.searchParams;
  const token = process.env.META_VERIFY_TOKEN;
  if (p.get("hub.mode") === "subscribe" && token && safeEqual(p.get("hub.verify_token") ?? "", token)) {
    return new NextResponse(p.get("hub.challenge") ?? "", { status: 200, headers: { "Content-Type": "text/plain" } });
  }
  return new NextResponse("Forbidden", { status: 403 });
}

export async function metaReceive(req: NextRequest, makeDeps: DepsFactory = createEngineDeps): Promise<NextResponse> {
  if (limited(req, "meta")) return new NextResponse("Too Many Requests", { status: 429 });
  const raw = await req.text();
  if (!verifyMetaSignature(raw, req.headers.get("x-hub-signature-256"), process.env.META_APP_SECRET)) {
    return new NextResponse("Invalid signature", { status: 401 });
  }
  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return new NextResponse("Invalid JSON", { status: 400 });
  }
  return ingest(parseMetaWebhook(body), makeDeps);
}

/* ─── LinkedIn ─────────────────────────────────────────────── */

export function linkedinVerify(req: NextRequest): NextResponse {
  const code = req.nextUrl.searchParams.get("challengeCode");
  const secret = process.env.LINKEDIN_CLIENT_SECRET;
  if (!code || !secret) return new NextResponse("Bad Request", { status: 400 });
  return NextResponse.json({ challengeCode: code, challengeResponse: linkedInChallengeResponse(code, secret) });
}

export async function linkedinReceive(req: NextRequest, makeDeps: DepsFactory = createEngineDeps): Promise<NextResponse> {
  if (limited(req, "linkedin")) return new NextResponse("Too Many Requests", { status: 429 });
  const raw = await req.text();
  if (!verifyLinkedInSignature(raw, req.headers.get("x-li-signature"), process.env.LINKEDIN_CLIENT_SECRET)) {
    return new NextResponse("Invalid signature", { status: 401 });
  }
  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return new NextResponse("Invalid JSON", { status: 400 });
  }
  return ingest(parseLinkedInWebhook(body), makeDeps);
}

/* ─── TikTok (lead generation) ─────────────────────────────── */

export async function ingestTikTokLead(db: SupabaseClient, lead: TikTokLead): Promise<"created" | "updated" | "duplicate"> {
  const key = `tiktok:lead:${lead.leadId}`;
  const { data: rec } = await db
    .from("social_webhook_events")
    .upsert({ platform: "tiktok", event_key: key, event_type: "lead", payload: lead as unknown as Record<string, unknown>, status: "processing" }, { onConflict: "event_key", ignoreDuplicates: true })
    .select("id");
  const eventId = ((rec ?? [])[0] as { id: string } | undefined)?.id;
  if (!eventId) return "duplicate";
  try {
    return await importTikTokLead(db, lead, eventId);
  } catch (e) {
    // rimuove il marker di idempotenza: il retry della piattaforma potrà reimportare il lead
    await db.from("social_webhook_events").delete().eq("id", eventId);
    throw e;
  }
}

async function importTikTokLead(db: SupabaseClient, lead: TikTokLead, eventId: string): Promise<"created" | "updated"> {
  const email = lead.email?.trim().toLowerCase() || null;
  let leadId: string | null = null;
  let outcome: "created" | "updated" = "created";
  if (email) {
    const { data: existing } = await db.from("leads").select("id").eq("email", email).maybeSingle();
    if (existing) {
      leadId = existing.id;
      outcome = "updated";
    }
  }
  if (!leadId) {
    const { data: created, error } = await db
      .from("leads")
      .insert({ name: lead.name || "Lead TikTok", email, phone: lead.phone, status: "new", source: "tiktok", score: 25, metadata: { tiktok_lead: lead.fields } })
      .select("id")
      .single();
    if (error || !created) throw new Error(error?.message ?? "insert lead");
    leadId = created.id;
  }
  await addTag(db, leadId!, "tiktok-lead-ads");
  await createSystemActivity(db, leadId!, "Lead da TikTok Lead Generation", Object.entries(lead.fields).map(([k, v]) => `${k}: ${v}`).join("\n"), { tiktok_lead_id: lead.leadId });
  await createNotification(db, { type: "social_lead", title: `Nuovo lead TikTok · ${lead.name ?? email ?? lead.leadId}`, link: `/crm/leads/${leadId}` });
  await logAction(db, { contact_id: leadId, platform: "tiktok", action_type: "create_lead", actor: "system", summary: `Lead TikTok ${outcome === "created" ? "creato" : "aggiornato"}` });
  await db.from("social_webhook_events").update({ status: "processed", processed_at: new Date().toISOString() }).eq("id", eventId);
  return outcome;
}

export async function tiktokReceive(req: NextRequest, makeDeps: DepsFactory = createEngineDeps): Promise<NextResponse> {
  if (limited(req, "tiktok")) return new NextResponse("Too Many Requests", { status: 429 });
  const raw = await req.text();
  if (!verifyTikTokSignature(raw, req.headers.get("tiktok-signature"), process.env.TIKTOK_CLIENT_SECRET)) {
    return new NextResponse("Invalid signature", { status: 401 });
  }
  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return new NextResponse("Invalid JSON", { status: 400 });
  }
  const leads = parseTikTokLeads(body);
  try {
    const { db } = makeDeps();
    const results = [];
    for (const l of leads) results.push(await ingestTikTokLead(db, l));
    return NextResponse.json({ received: leads.length, results });
  } catch (e) {
    console.error("[webhook tiktok]", (e as Error).message);
    return NextResponse.json({ error: "temporary failure" }, { status: 500 });
  }
}
