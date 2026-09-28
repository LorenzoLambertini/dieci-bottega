"use server";

/** Azioni AI ed email della scheda contatto. */
import { revalidatePath } from "next/cache";
import { requireCrmUser } from "@/lib/social-ai/auth";
import { createSocialClient } from "@/lib/social-ai/db";
import { anthropicConfigured } from "@/lib/social-ai/claude";
import { rateLimit } from "@/lib/social-ai/rate-limit";
import { buildLeadContext, extractFromText, runCrmAi, type AiTask } from "@/lib/crm/ai";
import { sendLeadEmail } from "@/lib/crm/email";
import { romeOffset } from "@/lib/crm/today";

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
      await saveMemory(leadId, r.text);
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

/** Memoria AI del cliente: sintesi sempre aggiornata, usata in ogni richiesta successiva. */
async function saveMemory(leadId: string, text: string) {
  const db = await createSocialClient();
  const { data } = await db.from("leads").select("metadata").eq("id", leadId).maybeSingle();
  const meta = ((data as { metadata: Record<string, unknown> | null } | null)?.metadata ?? {}) as Record<string, unknown>;
  await db.from("leads").update({ metadata: { ...meta, ai_memory: { text: text.slice(0, 2000), at: new Date().toISOString() } } }).eq("id", leadId);
}

/** Incolla un messaggio del cliente: l'AI aggiorna azienda, temperatura, prossima azione, note e memoria. */
export async function updateFromMessage(leadId: string, message: string): Promise<{ ok: boolean; text?: string; error?: string }> {
  try {
    const user = await requireCrmUser();
    if (!anthropicConfigured()) return { ok: false, error: "ANTHROPIC_API_KEY non configurata su Vercel" };
    if (message.trim().length < 5) return { ok: false, error: "Incolla il messaggio del cliente" };
    if (!rateLimit(`crm-ai:${user.id}`, 40, 3600_000)) return { ok: false, error: "Troppe richieste AI nell'ultima ora" };
    const db = await createSocialClient();
    const ctx = await buildLeadContext(db, leadId);
    if (!ctx) return { ok: false, error: "Contatto non trovato" };
    const x = await extractFromText(db, ctx, message);

    const { data } = await db.from("leads").select("company, notes, metadata, do_not_contact").eq("id", leadId).maybeSingle();
    const lead = data as { company: string | null; notes: string | null; metadata: Record<string, unknown> | null; do_not_contact: boolean } | null;
    if (!lead) return { ok: false, error: "Contatto non trovato" };
    const date = new Date().toLocaleDateString("it-IT", { timeZone: "Europe/Rome" });
    const facts = [x.service && `Servizio: ${x.service}`, x.budget && `Budget: ${x.budget}`, x.deadline && `Tempi: ${x.deadline}`, x.objections && `Obiezioni: ${x.objections}`].filter(Boolean) as string[];
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (!lead.company && x.company) patch.company = x.company;
    if (x.temperature) patch.temperature = x.temperature;
    if (facts.length) patch.notes = [lead.notes, `📌 ${date} · ${facts.join(" · ")}`].filter(Boolean).join("\n");
    if (x.follow_up_days != null && !lead.do_not_contact) {
      const day = new Date(Date.now() + x.follow_up_days * 86_400_000);
      const ymd = day.toLocaleDateString("sv-SE", { timeZone: "Europe/Rome" });
      patch.next_action_at = new Date(`${ymd}T09:00:00${romeOffset(day)}`).toISOString(); // alle 9 ora italiana
      patch.next_action_note = x.next_step ?? "Ricontattare";
    }
    if (x.memory) patch.metadata = { ...(lead.metadata ?? {}), ai_memory: { text: x.memory, at: new Date().toISOString() } };
    await db.from("leads").update(patch).eq("id", leadId);
    await db.from("activities").insert({
      lead_id: leadId,
      user_id: user.id,
      type: "note",
      subject: "Messaggio del cliente (analizzato dall'AI)",
      body: `${message.trim().slice(0, 4000)}${facts.length ? `\n\n→ ${facts.join(" · ")}` : ""}`,
    });
    revalidatePath(`/crm/leads/${leadId}`);
    const summary = [
      ...facts,
      patch.company ? `Azienda: ${patch.company}` : null,
      x.temperature ? `Temperatura: ${x.temperature}` : null,
      patch.next_action_at ? `Promemoria: ${x.next_step ?? "Ricontattare"} tra ${x.follow_up_days} giorni` : null,
    ].filter(Boolean);
    return { ok: true, text: summary.length ? `Scheda aggiornata:\n${summary.join("\n")}` : "Nessuna informazione nuova trovata nel messaggio." };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}
