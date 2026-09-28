/**
 * Email del mattino al team: promemoria di oggi (e scaduti), nuovi contatti
 * delle ultime 24 ore, conversazioni social che aspettano una persona.
 * Parte dal cron giornaliero; se non c'è niente da segnalare non invia nulla.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { endOfToday } from "./lead-filters";

const SITE = () => (process.env.NEXT_PUBLIC_SITE_URL || "https://diecibottega.it").replace(/\/$/, "");

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function when(iso: string): string {
  return new Date(iso).toLocaleString("it-IT", { timeZone: "Europe/Rome", weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

export interface Digest {
  subject: string;
  html: string;
  text: string;
  counts: { due: number; fresh: number; needsHuman: number };
}

export async function buildDigest(db: SupabaseClient, now = new Date()): Promise<Digest | null> {
  const dayAgo = new Date(now.getTime() - 86_400_000).toISOString();
  const [dueRes, freshRes, humanRes] = await Promise.all([
    db.from("leads").select("id, name, company, next_action_at, next_action_note").lte("next_action_at", endOfToday()).order("next_action_at").limit(30),
    db.from("leads").select("id, name, company, source").gte("created_at", dayAgo).order("created_at", { ascending: false }).limit(30),
    db.from("social_conversations").select("id", { count: "exact", head: true }).eq("status", "needs_human"),
  ]);
  const due = (dueRes.data ?? []) as { id: string; name: string; company: string | null; next_action_at: string; next_action_note: string | null }[];
  const fresh = (freshRes.data ?? []) as { id: string; name: string; company: string | null; source: string | null }[];
  const needsHuman = humanRes.count ?? 0;
  if (!due.length && !fresh.length && !needsHuman) return null;

  const base = SITE();
  const link = (id: string) => `${base}/crm/leads/${id}`;
  const late = (iso: string) => new Date(iso).getTime() < now.getTime();

  const parts: string[] = [];
  const text: string[] = [];
  const section = (title: string, rows: string[]) =>
    `<h2 style="font:600 15px system-ui,sans-serif;color:#111;margin:24px 0 8px">${title}</h2><ul style="padding-left:18px;margin:0;font:14px/1.5 system-ui,sans-serif;color:#333">${rows.join("")}</ul>`;

  if (due.length) {
    parts.push(
      section(
        `⏰ Da ricontattare (${due.length})`,
        due.map(
          (l) =>
            `<li style="margin-bottom:6px"><a href="${link(l.id)}" style="color:#E63B2E;font-weight:600;text-decoration:none">${esc(l.name)}</a>${l.company ? ` · ${esc(l.company)}` : ""}<br><span style="color:${late(l.next_action_at) ? "#E63B2E" : "#666"}">${late(l.next_action_at) ? "Scaduto: " : ""}${when(l.next_action_at)}</span>${l.next_action_note ? ` — ${esc(l.next_action_note)}` : ""}</li>`
        )
      )
    );
    text.push(`DA RICONTATTARE (${due.length})`, ...due.map((l) => `- ${l.name}${l.company ? ` (${l.company})` : ""}: ${when(l.next_action_at)}${l.next_action_note ? ` — ${l.next_action_note}` : ""} ${link(l.id)}`), "");
  }
  if (fresh.length) {
    parts.push(
      section(
        `✨ Nuovi contatti nelle ultime 24 ore (${fresh.length})`,
        fresh.map((l) => `<li style="margin-bottom:6px"><a href="${link(l.id)}" style="color:#E63B2E;font-weight:600;text-decoration:none">${esc(l.name)}</a>${l.company ? ` · ${esc(l.company)}` : ""}${l.source ? ` <span style="color:#888">(${esc(l.source)})</span>` : ""}</li>`)
      )
    );
    text.push(`NUOVI CONTATTI (${fresh.length})`, ...fresh.map((l) => `- ${l.name}${l.source ? ` [${l.source}]` : ""} ${link(l.id)}`), "");
  }
  if (needsHuman) {
    parts.push(
      `<p style="font:14px system-ui,sans-serif;color:#333;margin:24px 0 0">💬 <strong>${needsHuman}</strong> conversazion${needsHuman === 1 ? "e" : "i"} social aspett${needsHuman === 1 ? "a" : "ano"} una persona: <a href="${base}/crm/social/inbox" style="color:#E63B2E">apri l'Inbox</a></p>`
    );
    text.push(`${needsHuman} conversazioni social aspettano una persona: ${base}/crm/social/inbox`);
  }

  const bits = [due.length ? `${due.length} da ricontattare` : "", fresh.length ? `${fresh.length} nuovi contatti` : "", needsHuman ? `${needsHuman} chat da seguire` : ""].filter(Boolean);
  const subject = `Buongiorno! ${bits.join(" · ")}`;
  const html = `<div style="max-width:560px;margin:0 auto;padding:24px"><p style="font:700 13px system-ui,sans-serif;letter-spacing:.08em;color:#E63B2E;text-transform:uppercase;margin:0">Dieci Bottega CRM</p><h1 style="font:800 22px system-ui,sans-serif;color:#111;margin:6px 0 0">La tua giornata</h1>${parts.join("")}<p style="margin-top:28px"><a href="${base}/crm/dashboard" style="display:inline-block;background:#E63B2E;color:#fff;font:600 14px system-ui,sans-serif;padding:10px 18px;border-radius:8px;text-decoration:none">Apri il CRM</a></p></div>`;
  return { subject, html, text: text.join("\n"), counts: { due: due.length, fresh: fresh.length, needsHuman } };
}

export async function sendDigest(db: SupabaseClient): Promise<{ sent: boolean; reason?: string; counts?: Digest["counts"] }> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = (process.env.TEAM_EMAILS ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  if (!apiKey || !to.length) return { sent: false, reason: "RESEND_API_KEY o TEAM_EMAILS mancanti" };
  const d = await buildDigest(db);
  if (!d) return { sent: false, reason: "niente da segnalare" };
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: "Dieci Bottega CRM <crm@diecibottega.it>", to, subject: d.subject, html: d.html, text: d.text }),
  });
  return res.ok ? { sent: true, counts: d.counts } : { sent: false, reason: `Resend ${res.status}` };
}
