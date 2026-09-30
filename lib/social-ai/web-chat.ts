/**
 * Chat del sito collegata al Social AI: ogni messaggio del widget passa dallo stesso
 * motore di Instagram/Facebook (knowledge base, lezioni, guide/lead magnet, scoring,
 * handoff, notifiche) e la conversazione compare nell'Inbox del CRM.
 */
import { randomUUID } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { InboundEvent } from "./types";
import { processRecordedEvent, recordWebhookEvent, type EngineDeps } from "./engine";
import { addTag, createSystemActivity } from "./crm";

export const VISITOR_RE = /^[a-zA-Z0-9-]{16,64}$/;

export interface WebChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  at: string;
  /** Scritto da una persona del team dal CRM (non dall'AI). */
  human?: boolean;
}

export interface WebChatState {
  messages: WebChatMessage[];
  /** Conversazione passata a una persona: il widget aspetta la risposta del team. */
  waiting: boolean;
}

async function conversationOf(db: SupabaseClient, visitorId: string) {
  const { data: ident } = await db.from("social_identities").select("id").eq("platform", "web").eq("platform_user_id", visitorId).maybeSingle();
  if (!ident) return null;
  const { data: conv } = await db
    .from("social_conversations")
    .select("id, status, human_takeover")
    .eq("platform", "web")
    .eq("identity_id", (ident as { id: string }).id)
    .maybeSingle();
  return conv as { id: string; status: string; human_takeover: boolean } | null;
}

/** Messaggi della conversazione (per ripristinare la chat o leggere le risposte del team). */
export async function getWebChat(db: SupabaseClient, visitorId: string, after?: string | null): Promise<WebChatState> {
  const conv = await conversationOf(db, visitorId);
  if (!conv) return { messages: [], waiting: false };
  let q = db
    .from("social_messages")
    .select("id, direction, content, created_at, ai_generated, sent_by, delivery_status")
    .eq("conversation_id", conv.id)
    .order("created_at", { ascending: true })
    .limit(60);
  if (after) q = q.gt("created_at", after);
  const { data } = await q;
  const rows = (data ?? []) as { id: string; direction: string; content: string | null; created_at: string; ai_generated: boolean; sent_by: string | null; delivery_status: string }[];
  return {
    messages: rows
      .filter((m) => m.content && (m.direction === "inbound" || m.delivery_status === "sent"))
      .map((m) => ({ id: m.id, role: m.direction === "inbound" ? "user" : "assistant", content: m.content!, at: m.created_at, human: m.direction === "outbound" && !!m.sent_by })),
    waiting: conv.human_takeover || conv.status === "needs_human",
  };
}

/** Un messaggio dal widget: lo registra, lo fa gestire al motore e restituisce le risposte. */
export async function handleWebMessage(deps: EngineDeps, visitorId: string, text: string): Promise<WebChatState & { ok: boolean }> {
  const now = deps.now?.() ?? new Date();
  const id = randomUUID();
  const ev: InboundEvent = {
    platform: "web",
    kind: "message",
    eventKey: `web:message:${id}`,
    accountExternalId: "site",
    senderId: visitorId,
    text: text.slice(0, 1000),
    externalId: id,
    timestamp: now.toISOString(),
  };
  const eventId = await recordWebhookEvent(deps.db, ev);
  if (eventId) await processRecordedEvent(deps, eventId);
  // tutto quello che è stato scritto da questo messaggio in poi (risposta AI, guida, handoff)
  const since = new Date(now.getTime() - 1000).toISOString();
  const state = await getWebChat(deps.db, visitorId, since);
  return { ok: true, messages: state.messages.filter((m) => m.role === "assistant"), waiting: state.waiting };
}

/**
 * Il visitatore lascia i dati nel form della chat: completa il contatto creato dalla chat
 * (niente doppioni). Se l'email appartiene già a un contatto, la chat viene collegata a quello.
 * Ritorna l'id del contatto aggiornato, o null se il visitatore non ha mai scritto in chat.
 */
export async function linkWebVisitor(
  db: SupabaseClient,
  visitorId: string,
  data: { name: string; email: string; phone?: string | null; company?: string | null; note?: string | null }
): Promise<string | null> {
  const { data: identData } = await db.from("social_identities").select("id, lead_id").eq("platform", "web").eq("platform_user_id", visitorId).maybeSingle();
  const ident = identData as { id: string; lead_id: string | null } | null;
  if (!ident?.lead_id) return null;
  const email = data.email.trim().toLowerCase();
  const { data: existing } = await db.from("leads").select("id").eq("email", email).neq("id", ident.lead_id).maybeSingle();
  const now = new Date().toISOString();

  if (existing) {
    // Contatto già noto: la chat passa a lui, il contatto anonimo della chat viene rimosso
    const target = (existing as { id: string }).id;
    const anon = ident.lead_id;
    await db.from("social_identities").update({ lead_id: target, display_name: data.name, updated_at: now }).eq("id", ident.id);
    await db.from("social_conversations").update({ contact_id: target }).eq("contact_id", anon);
    await db.from("social_messages").update({ contact_id: target }).eq("contact_id", anon);
    await db.from("guide_deliveries").update({ contact_id: target }).eq("contact_id", anon);
    await db.from("activities").update({ lead_id: target }).eq("lead_id", anon);
    await db.from("ai_actions").update({ contact_id: target }).eq("contact_id", anon);
    await db.from("ai_runs").update({ contact_id: target }).eq("contact_id", anon);
    await db.from("lead_tags").delete().eq("lead_id", anon);
    await db.from("leads").delete().eq("id", anon);
    await addTag(db, target, "chat-sito");
    await createSystemActivity(db, target, "💬 Ha scritto nella chat del sito", data.note ?? null, { source: "web-chat" });
    return target;
  }

  const patch: Record<string, unknown> = { name: data.name, email, updated_at: now };
  if (data.phone) patch.phone = data.phone;
  if (data.company) patch.company = data.company;
  await db.from("leads").update(patch).eq("id", ident.lead_id);
  await db.from("social_identities").update({ display_name: data.name, updated_at: now }).eq("id", ident.id);
  await addTag(db, ident.lead_id, "chat-sito");
  await createSystemActivity(db, ident.lead_id, "📝 Dati lasciati nel form della chat", data.note ?? null, { source: "web-chat" });
  return ident.lead_id;
}
