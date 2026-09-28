"use server";

/** Azioni AI ed email della scheda contatto. */
import { revalidatePath } from "next/cache";
import { requireCrmUser } from "@/lib/social-ai/auth";
import { createSocialClient } from "@/lib/social-ai/db";
import { anthropicConfigured } from "@/lib/social-ai/claude";
import { rateLimit } from "@/lib/social-ai/rate-limit";
import { buildLeadContext, runCrmAi, type AiTask } from "@/lib/crm/ai";
import { sendLeadEmail } from "@/lib/crm/email";

async function senderOf(userId: string, fallbackEmail: string) {
  const db = await createSocialClient();
  const { data } = await db.from("profiles").select("full_name, email").eq("id", userId).maybeSingle();
  const p = data as { full_name: string | null; email: string | null } | null;
  return { name: p?.full_name?.split(" ")[0] || fallbackEmail.split("@")[0], email: p?.email ?? fallbackEmail };
}

export async function aiAssist(leadId: string, task: AiTask): Promise<{ ok: boolean; text?: string; error?: string }> {
  try {
    const user = await requireCrmUser();
    if (!anthropicConfigured()) return { ok: false, error: "ANTHROPIC_API_KEY non configurata su Vercel" };
    if (!rateLimit(`crm-ai:${user.id}`, 40, 3600_000)) return { ok: false, error: "Troppe richieste AI nell'ultima ora, riprova più tardi" };
    const db = await createSocialClient();
    const ctx = await buildLeadContext(db, leadId);
    if (!ctx) return { ok: false, error: "Contatto non trovato" };
    const sender = await senderOf(user.id, user.email);
    const r = await runCrmAi(db, task, ctx, sender.name);

    if (task === "score" && r.score) {
      await db.from("leads").update({ score: r.score.score, temperature: r.score.temperature, updated_at: new Date().toISOString() }).eq("id", leadId);
      await db.from("activities").insert({ lead_id: leadId, user_id: user.id, type: "note", subject: `Valutazione AI: ${r.score.score}/100 (${r.score.temperature})`, body: r.score.reason });
      revalidatePath(`/crm/leads/${leadId}`);
      return { ok: true, text: `${r.score.score}/100 · ${r.score.temperature} — ${r.score.reason}` };
    }
    if (task === "summary") {
      await db.from("activities").insert({ lead_id: leadId, user_id: user.id, type: "note", subject: "Riassunto AI", body: r.text });
      revalidatePath(`/crm/leads/${leadId}`);
    }
    return { ok: true, text: r.text };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function sendEmailToLead(leadId: string, subject: string, body: string): Promise<{ ok: boolean; error?: string }> {
  const user = await requireCrmUser();
  if (!subject.trim() || !body.trim()) return { ok: false, error: "Oggetto e testo sono obbligatori" };
  if (!rateLimit(`crm-mail:${user.id}`, 60, 3600_000)) return { ok: false, error: "Troppe email nell'ultima ora" };
  const db = await createSocialClient();
  const { data: lead } = await db.from("leads").select("email").eq("id", leadId).maybeSingle();
  const to = (lead as { email: string | null } | null)?.email;
  if (!to) return { ok: false, error: "Il contatto non ha un'email" };
  if (/\{\{\s*\w+\s*\}\}/.test(subject + body)) return { ok: false, error: "Nel testo ci sono ancora segnaposto {{…}} da completare" };
  const sender = await senderOf(user.id, user.email);
  const r = await sendLeadEmail(db, { leadId, to, subject: subject.trim().slice(0, 200), body: body.trim().slice(0, 20_000), senderName: sender.name, senderEmail: sender.email, userId: user.id });
  if (r.ok) revalidatePath(`/crm/leads/${leadId}`);
  return r;
}
