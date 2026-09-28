/**
 * Email ai clienti dal CRM (Resend): modelli con variabili, invio con
 * rispondi-a del mittente, registrazione nello storico e in email_logs.
 */
import type { SupabaseClient } from "@supabase/supabase-js";

export interface TemplateVars {
  nome: string;
  azienda: string;
  mittente: string;
  link_preventivo: string;
}

export function fillTemplate(text: string, v: Partial<TemplateVars>): string {
  return text.replace(/\{\{\s*(nome|azienda|mittente|link_preventivo)\s*\}\}/g, (_m, k: keyof TemplateVars) => v[k] ?? "");
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** Testo semplice → HTML leggibile: paragrafi, a capo e link cliccabili. */
export function textToHtml(text: string): string {
  const body = text
    .split(/\n{2,}/)
    .map((p) => `<p style="margin:0 0 14px">${esc(p).replace(/\n/g, "<br>").replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" style="color:#E63B2E">$1</a>')}</p>`)
    .join("");
  return `<div style="font:15px/1.6 system-ui,-apple-system,sans-serif;color:#222;max-width:560px">${body}<p style="margin-top:24px;font-size:12px;color:#999">Dieci Bottega · Bologna · diecibottega.it</p></div>`;
}

export async function sendLeadEmail(
  db: SupabaseClient,
  a: { leadId: string; to: string; subject: string; body: string; senderName: string; senderEmail: string | null; userId: string }
): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { ok: false, error: "RESEND_API_KEY non configurata" };
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: `${a.senderName} · Dieci Bottega <crm@diecibottega.it>`,
      to: [a.to],
      reply_to: a.senderEmail ?? undefined,
      subject: a.subject,
      text: a.body,
      html: textToHtml(a.body),
    }),
  });
  const ok = res.ok;
  const error = ok ? undefined : `Resend ${res.status}: ${(await res.text().catch(() => "")).slice(0, 200)}`;
  await Promise.all([
    db.from("email_logs").insert({ lead_id: a.leadId, to_email: a.to, subject: a.subject, status: ok ? "sent" : "failed", error: error ?? null }),
    ok
      ? db.from("activities").insert({ lead_id: a.leadId, user_id: a.userId, type: "email", subject: `Email inviata: ${a.subject}`, body: a.body })
      : Promise.resolve(),
  ]);
  return ok ? { ok } : { ok, error };
}
