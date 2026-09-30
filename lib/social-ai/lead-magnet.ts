/**
 * Lead magnet: link univoco tracciato, registrazione di aperture e download,
 * follow-up (predisposto) e statistiche del funnel.
 *
 * Il tracciamento è onesto:
 *   - "Link aperto"   = una persona (non un bot di anteprima) ha aperto /g/<token>
 *   - "PDF scaricato" = dalla pagina ha richiesto il file (/g/<token>/pdf) e il server l'ha servito
 *   - Il PDF inviato come allegato nei DM NON è tracciabile: il suo download resta "N.D."
 */
import { randomBytes } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { ConversationRow, GuideRow } from "./types";
import { DM_WINDOW_MS, sendDirectMessage, type OutboundDeps } from "./outbound";
import { createNotification, createSystemActivity } from "./crm";

export const siteUrl = () => (process.env.NEXT_PUBLIC_SITE_URL || "https://diecibottega.it").replace(/\/$/, "");

export function newDeliveryToken(): string {
  return randomBytes(16).toString("hex");
}

export function trackedLink(token: string): string {
  return `${siteUrl()}/g/${token}`;
}

/** URL assoluto del PDF (per l'allegato inviato da Meta). */
export function absoluteFileUrl(fileUrl: string): string {
  return /^https?:\/\//i.test(fileUrl) ? fileUrl : `${siteUrl()}${fileUrl.startsWith("/") ? "" : "/"}${fileUrl}`;
}

const DEFAULT_TEMPLATE = 'Ciao{nome}! 🎁 Ecco la guida "{guida}":\n{link}';

/** Testo del DM: {nome} → " Marco" (o vuoto), {guida}, {link}. Il link è sempre presente. */
export function buildMagnetMessage(guide: Pick<GuideRow, "name" | "message_template">, firstName: string | null, link: string): string {
  const tpl = guide.message_template?.trim() || DEFAULT_TEMPLATE;
  const name = firstName?.trim() ? ` ${firstName.trim()}` : "";
  let text = tpl.replace(/\{nome\}/g, name).replace(/\{guida\}/g, guide.name).replace(/\{link\}/g, link);
  if (!text.includes(link)) text = `${text}\n${link}`;
  return text.slice(0, 1000);
}

/** Primo nome "umano" del contatto (non l'@username o il nome generico). */
export function firstNameOf(leadName: string | null | undefined): string | null {
  const n = (leadName ?? "").trim();
  if (!n || n.startsWith("@") || /^(utente|lead|contatto)\b/i.test(n)) return null;
  return n.split(/\s+/)[0].slice(0, 30);
}

/**
 * Anteprime dei link (Instagram, Facebook, WhatsApp, iMessage…) e crawler aprono la pagina
 * senza che la persona l'abbia toccata: non contano come apertura.
 */
const BOT_UA =
  /(bot|crawl|spider|slurp|facebookexternalhit|facebot|meta-external|facebookcatalog|whatsapp|slack|discord|embedly|preview|headless|lighthouse|curl|wget|python|go-http|node-fetch|undici|axios|okhttp|java\/|libwww|httpclient)/i;
export function isBotUserAgent(ua: string | null | undefined): boolean {
  return !ua || BOT_UA.test(ua);
}

export interface DeliveryRow {
  id: string;
  guide_id: string;
  contact_id: string | null;
  conversation_id: string | null;
  platform: string;
  channel: string;
  status: string;
  keyword: string | null;
  trigger_kind: string | null;
  opened_at: string | null;
  open_count: number;
  downloaded_at: string | null;
  download_count: number;
  attachment_sent: boolean;
  sent_at: string;
  follow_up_status?: string | null;
}

async function loadByToken(db: SupabaseClient, token: string) {
  if (!/^[a-f0-9]{32}$/.test(token)) return null;
  const { data } = await db.from("guide_deliveries").select("*, guide:guides(*)").eq("token", token).maybeSingle();
  return (data as (DeliveryRow & { guide: GuideRow | null }) | null) ?? null;
}

/** Pagina /g/<token>: registra l'apertura (solo persone) e restituisce guida e consegna. */
export async function recordOpen(db: SupabaseClient, token: string, userAgent: string | null, now = new Date()) {
  const d = await loadByToken(db, token);
  if (!d?.guide) return null;
  if (isBotUserAgent(userAgent)) return { delivery: d, guide: d.guide, counted: false };
  const first = !d.opened_at;
  await db
    .from("guide_deliveries")
    .update({ opened_at: d.opened_at ?? now.toISOString(), last_opened_at: now.toISOString(), open_count: (d.open_count ?? 0) + 1 })
    .eq("id", d.id);
  if (first && d.contact_id) {
    await createSystemActivity(db, d.contact_id, `🔗 Link aperto · ${d.guide.name}`, null, { guide_id: d.guide_id, delivery_id: d.id, event: "lead_magnet_open" });
    await db.from("leads").update({ updated_at: now.toISOString() }).eq("id", d.contact_id);
    await createNotification(db, { type: "lead_magnet", title: `🔗 Guida aperta: ${d.guide.name}`, link: `/crm/leads/${d.contact_id}` }).catch(() => undefined);
  }
  return { delivery: d, guide: d.guide, counted: true };
}

/** /g/<token>/pdf: registra il download (richiesta del file servita) e restituisce l'URL del PDF. */
export async function recordDownload(db: SupabaseClient, token: string, userAgent: string | null, now = new Date()) {
  const d = await loadByToken(db, token);
  if (!d?.guide?.file_url) return null;
  const file = absoluteFileUrl(d.guide.file_url);
  if (isBotUserAgent(userAgent)) return { file, counted: false };
  const first = !d.downloaded_at;
  await db
    .from("guide_deliveries")
    .update({
      downloaded_at: d.downloaded_at ?? now.toISOString(),
      download_count: (d.download_count ?? 0) + 1,
      // chi scarica ha per forza aperto la pagina
      opened_at: d.opened_at ?? now.toISOString(),
      open_count: Math.max(d.open_count ?? 0, 1),
      last_opened_at: now.toISOString(),
    })
    .eq("id", d.id);
  if (first && d.contact_id) {
    await createSystemActivity(db, d.contact_id, `📄 PDF scaricato · ${d.guide.name}`, null, { guide_id: d.guide_id, delivery_id: d.id, event: "lead_magnet_download" });
    await db.from("leads").update({ updated_at: now.toISOString() }).eq("id", d.contact_id);
  }
  return { file, counted: true };
}

/* ─── Statistiche ─────────────────────────────────────────── */

export interface MagnetFunnel {
  requests: number;
  sent: number;
  attachments: number;
  opened: number;
  downloaded: number;
  byPlatform: Record<string, { requests: number; sent: number; opened: number; downloaded: number }>;
}

/** Una richiesta = una consegna registrata (riuscita o no). */
export function computeFunnel(rows: Pick<DeliveryRow, "platform" | "status" | "opened_at" | "downloaded_at" | "attachment_sent">[]): MagnetFunnel {
  const f: MagnetFunnel = { requests: 0, sent: 0, attachments: 0, opened: 0, downloaded: 0, byPlatform: {} };
  for (const r of rows) {
    const p = (f.byPlatform[r.platform] ??= { requests: 0, sent: 0, opened: 0, downloaded: 0 });
    f.requests++;
    p.requests++;
    if (r.status === "sent") {
      f.sent++;
      p.sent++;
    }
    if (r.attachment_sent) f.attachments++;
    if (r.opened_at) {
      f.opened++;
      p.opened++;
    }
    if (r.downloaded_at) {
      f.downloaded++;
      p.downloaded++;
    }
  }
  return f;
}

export const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 0);

/* ─── Follow-up (predisposto, spento di default) ───────────── */

/**
 * Esegue i follow-up scaduti delle guide con follow_up_enabled = true.
 * Meta consente messaggi automatici solo entro 24h dall'ultimo messaggio dell'utente:
 *   - finestra aperta → DM con follow_up_message
 *   - finestra chiusa → promemoria nel CRM per ricontattarlo a mano (nessun invio fuori regola)
 */
export async function runLeadMagnetFollowUps(deps: OutboundDeps, limit = 20): Promise<{ sent: number; manual: number; skipped: number }> {
  const now = deps.now?.() ?? new Date();
  const out = { sent: 0, manual: 0, skipped: 0 };
  const { data } = await deps.db
    .from("guide_deliveries")
    .select("id, contact_id, conversation_id, platform, opened_at, downloaded_at, guide:guides(name, follow_up_enabled, follow_up_message)")
    .eq("follow_up_status", "scheduled")
    .lte("follow_up_due_at", now.toISOString())
    .limit(limit);
  for (const d of (data ?? []) as unknown as {
    id: string; contact_id: string | null; conversation_id: string | null; platform: string; opened_at: string | null; downloaded_at: string | null;
    guide: { name: string; follow_up_enabled: boolean; follow_up_message: string | null } | null;
  }[]) {
    const mark = (status: "sent" | "manual" | "skipped") =>
      deps.db.from("guide_deliveries").update({ follow_up_status: status, follow_up_at: now.toISOString() }).eq("id", d.id);
    const { data: lead } = d.contact_id ? await deps.db.from("leads").select("id, name, do_not_contact").eq("id", d.contact_id).maybeSingle() : { data: null };
    const l = lead as { id: string; name: string; do_not_contact: boolean | null } | null;
    if (!d.guide?.follow_up_enabled || !l || l.do_not_contact) {
      await mark("skipped");
      out.skipped++;
      continue;
    }
    const text = (d.guide.follow_up_message?.trim() || `Ciao{nome}, sei riuscito a dare un'occhiata alla guida "${d.guide.name}"?`).replace(/\{nome\}/g, firstNameOf(l.name) ? ` ${firstNameOf(l.name)}` : "");
    const { data: convData } = d.conversation_id ? await deps.db.from("social_conversations").select("*").eq("id", d.conversation_id).maybeSingle() : { data: null };
    const conv = convData as ConversationRow | null;
    const windowOpen = !!conv?.last_inbound_at && now.getTime() - new Date(conv.last_inbound_at).getTime() < DM_WINDOW_MS;
    if (conv && windowOpen && !conv.human_takeover) {
      const { data: ident } = await deps.db.from("social_identities").select("platform_user_id").eq("id", conv.identity_id).maybeSingle();
      const recipient = (ident as { platform_user_id: string } | null)?.platform_user_id;
      if (recipient) {
        const r = await sendDirectMessage(deps, conv, recipient, text, { aiGenerated: false });
        if (r.ok) {
          await mark("sent");
          await createSystemActivity(deps.db, l.id, `💬 Follow-up inviato · ${d.guide.name}`, text, { delivery_id: d.id, event: "lead_magnet_follow_up" });
          out.sent++;
          continue;
        }
      }
    }
    // Finestra chiusa (o invio non riuscito): promemoria per il team, nessun messaggio automatico
    await deps.db.from("leads").update({ next_action_at: now.toISOString(), next_action_note: `Follow-up guida "${d.guide.name}"${d.opened_at ? " (link aperto)" : " (link non aperto)"}` }).eq("id", l.id);
    await createSystemActivity(deps.db, l.id, `⏰ Follow-up da fare a mano · ${d.guide.name}`, `La finestra DM di 24h è chiusa: Meta non consente l'invio automatico. Messaggio suggerito:\n${text}`, { delivery_id: d.id, event: "lead_magnet_follow_up_manual" });
    await mark("manual");
    out.manual++;
  }
  return out;
}

/* ─── Cosa supporta davvero ogni piattaforma (dalle capability dei provider) ─── */

export interface MagnetSupport {
  platform: string;
  dm: "yes" | "no" | "approval";
  comment: "yes" | "no" | "approval";
  attachment: boolean;
  note: string;
}

export function magnetSupport(providers: Record<string, { capabilities: Record<string, { status: string; note: string }>; sendFile?: unknown }>): MagnetSupport[] {
  const st = (s: string): "yes" | "no" | "approval" => (s === "supported" ? "yes" : s === "requires_approval" ? "approval" : "no");
  const NOTES: Record<string, string> = {
    instagram: "DM: link tracciato + PDF allegato (entro 24h). Commento: risposta privata con il link (1 per commento, entro 7 giorni). Finché l'app Meta non è pubblicata funziona solo con gli account con un ruolo nell'app.",
    facebook: "Messenger: link tracciato + PDF allegato (entro 24h). Commenti alla Pagina: risposta privata con il link; la lettura dei commenti via sincronizzazione richiede il permesso pages_read_user_content.",
    linkedin: "Le API LinkedIn non consentono DM né risposte private: nessun invio automatico. Commenti solo con Community Management API approvata.",
    tiktok: "La Business Messaging API non è disponibile in UE/UK: nessun DM automatico. Commenti solo con TikTok API for Business approvata.",
    web: "Chat del sito: link tracciato mostrato nella chat, funziona con tutti i visitatori senza approvazioni.",
  };
  return ["instagram", "facebook", "linkedin", "tiktok", "web"].map((p) => {
    const c = providers[p]?.capabilities ?? {};
    const dm = st(c.receive_dm?.status ?? "not_available") === "yes" && st(c.send_dm?.status ?? "") === "yes" ? "yes" : st(c.send_dm?.status ?? "not_available");
    const privateReply = st(c.private_reply?.status ?? "not_available");
    const comment = st(c.receive_comments?.status ?? "not_available") === "no" ? "no" : privateReply === "yes" ? "yes" : st(c.receive_comments?.status ?? "not_available") === "approval" ? "approval" : "no";
    return { platform: p, dm, comment, attachment: typeof providers[p]?.sendFile === "function" && dm === "yes", note: NOTES[p] ?? "" };
  });
}
