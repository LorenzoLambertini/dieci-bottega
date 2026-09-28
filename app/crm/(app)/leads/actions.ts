"use server";

/**
 * Azioni CRM sui contatti: creazione, modifica dati, promemoria, opportunità.
 * Usano la sessione dell'utente (RLS attiva): valgono gli stessi permessi del CRM.
 */
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireCrmUser } from "@/lib/social-ai/auth";
import { createSocialClient } from "@/lib/social-ai/db";
import { createAdminClient } from "@/lib/supabase/admin";
import { addTag } from "@/lib/social-ai/crm";
import { sendDigest } from "@/lib/crm/digest";

export type FormState = { ok: boolean; error?: string } | null;

function str(v: FormDataEntryValue | null, max = 500): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim().slice(0, max);
  return t || null;
}
function normalizeUrl(v: string | null): string | null {
  if (!v) return null;
  return /^https?:\/\//i.test(v) ? v : `https://${v}`;
}
function validEmail(v: string | null): boolean {
  return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

/* ─── Nuovo contatto ─────────────────────────────────────── */

export async function createLead(_prev: FormState, fd: FormData): Promise<FormState> {
  const user = await requireCrmUser();
  const db = await createSocialClient();
  const name = str(fd.get("name"), 200);
  const email = str(fd.get("email"), 200)?.toLowerCase() ?? null;
  if (!name) return { ok: false, error: "Il nome è obbligatorio" };
  if (!validEmail(email)) return { ok: false, error: "Email non valida" };

  // Email già presente: si apre il contatto esistente invece di creare un doppione
  if (email) {
    const { data: existing } = await db.from("leads").select("id").eq("email", email).maybeSingle();
    if (existing) redirect(`/crm/leads/${existing.id}?duplicate=1`);
  }

  const followDays = Number(fd.get("follow_days") ?? 0);
  const { data: lead, error } = await db
    .from("leads")
    .insert({
      name,
      email,
      phone: str(fd.get("phone"), 50),
      company: str(fd.get("company"), 200),
      website: normalizeUrl(str(fd.get("website"), 300)),
      source: str(fd.get("source"), 50) ?? "manuale",
      notes: str(fd.get("notes"), 5000),
      status: "new",
      score: 0,
      assigned_to: user.id,
      next_action_at: followDays > 0 ? new Date(Date.now() + followDays * 86_400_000).toISOString() : null,
      next_action_note: followDays > 0 ? "Primo contatto" : null,
    })
    .select("id")
    .single();
  if (error || !lead) return { ok: false, error: error?.message ?? "Errore di salvataggio" };

  await db.from("activities").insert({ lead_id: lead.id, user_id: user.id, type: "system", subject: "Contatto creato a mano" });
  revalidatePath("/crm/leads");
  redirect(`/crm/leads/${lead.id}`);
}

/* ─── Modifica dati contatto ─────────────────────────────── */

export async function updateLeadContact(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireCrmUser();
  const db = await createSocialClient();
  const id = str(fd.get("id"), 64);
  const name = str(fd.get("name"), 200);
  const email = str(fd.get("email"), 200)?.toLowerCase() ?? null;
  if (!id || !name) return { ok: false, error: "Il nome è obbligatorio" };
  if (!validEmail(email)) return { ok: false, error: "Email non valida" };
  if (email) {
    const { data: other } = await db.from("leads").select("id, name").eq("email", email).neq("id", id).maybeSingle();
    if (other) return { ok: false, error: `Email già usata da "${other.name}"` };
  }
  const { error } = await db
    .from("leads")
    .update({
      name,
      email,
      phone: str(fd.get("phone"), 50),
      company: str(fd.get("company"), 200),
      website: normalizeUrl(str(fd.get("website"), 300)),
      notes: str(fd.get("notes"), 5000),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/crm/leads/${id}`);
  revalidatePath("/crm/leads");
  return { ok: true };
}

/* ─── Promemoria (prossima azione) ───────────────────────── */

export async function setFollowUp(leadId: string, at: string | null, note: string | null): Promise<FormState> {
  const user = await requireCrmUser();
  const db = await createSocialClient();
  const when = at ? new Date(at) : null;
  if (when && Number.isNaN(when.getTime())) return { ok: false, error: "Data non valida" };
  const { error } = await db
    .from("leads")
    .update({ next_action_at: when?.toISOString() ?? null, next_action_note: when ? note?.trim().slice(0, 300) || null : null, updated_at: new Date().toISOString() })
    .eq("id", leadId);
  if (error) return { ok: false, error: error.message };
  await db.from("activities").insert({
    lead_id: leadId,
    user_id: user.id,
    type: "note",
    subject: when
      ? `Promemoria: ${when.toLocaleString("it-IT", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Rome" })}`
      : "Promemoria completato",
    body: when ? note?.trim() || null : null,
  });
  revalidatePath(`/crm/leads/${leadId}`);
  revalidatePath("/crm/dashboard");
  return { ok: true };
}

/* ─── Opportunità ────────────────────────────────────────── */

export async function addOpportunity(_prev: FormState, fd: FormData): Promise<FormState> {
  const user = await requireCrmUser();
  const db = await createSocialClient();
  const leadId = str(fd.get("lead_id"), 64);
  const title = str(fd.get("title"), 200);
  const value = Number(String(fd.get("value") ?? "").replace(/\./g, "").replace(",", "."));
  const probability = Math.max(0, Math.min(100, Number(fd.get("probability") ?? 50) || 0));
  if (!leadId || !title) return { ok: false, error: "Titolo obbligatorio" };
  if (!Number.isFinite(value) || value < 0) return { ok: false, error: "Valore non valido" };
  const { error } = await db.from("opportunities").insert({
    lead_id: leadId,
    title,
    value,
    currency: "EUR",
    probability,
    expected_close: str(fd.get("expected_close"), 10),
    assigned_to: user.id,
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/crm/leads/${leadId}`);
  revalidatePath("/crm/dashboard");
  return { ok: true };
}

export async function deleteOpportunity(id: string, leadId: string): Promise<FormState> {
  await requireCrmUser(["admin"]);
  const db = await createSocialClient();
  const { error } = await db.from("opportunities").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/crm/leads/${leadId}`);
  revalidatePath("/crm/dashboard");
  return { ok: true };
}

/* ─── Tag ────────────────────────────────────────────────── */

export async function addLeadTag(leadId: string, name: string): Promise<FormState> {
  await requireCrmUser(["admin", "marketing"]);
  const db = await createSocialClient();
  const added = await addTag(db, leadId, name);
  if (!added) return { ok: false, error: "Nome tag non valido (almeno 2 caratteri)" };
  revalidatePath(`/crm/leads/${leadId}`);
  revalidatePath("/crm/leads");
  return { ok: true };
}

export async function removeLeadTag(leadId: string, tagId: string): Promise<FormState> {
  await requireCrmUser(["admin", "marketing"]);
  const db = await createSocialClient();
  const { error } = await db.from("lead_tags").delete().eq("lead_id", leadId).eq("tag_id", tagId);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/crm/leads/${leadId}`);
  revalidatePath("/crm/leads");
  return { ok: true };
}

export async function deleteTag(tagId: string): Promise<FormState> {
  await requireCrmUser(["admin"]);
  const db = await createSocialClient();
  const { error } = await db.from("tags").delete().eq("id", tagId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/crm/settings");
  revalidatePath("/crm/leads");
  return { ok: true };
}

/* ─── Email del mattino: invio manuale (prova) ───────────── */

export async function sendDigestNow(): Promise<FormState & { info?: string }> {
  await requireCrmUser(["admin"]);
  const r = await sendDigest(createAdminClient());
  return r.sent
    ? { ok: true, info: `Inviata: ${r.counts?.due ?? 0} promemoria, ${r.counts?.fresh ?? 0} nuovi contatti, ${r.counts?.needsHuman ?? 0} chat` }
    : { ok: false, error: r.reason === "niente da segnalare" ? "Oggi non c'è niente da segnalare: nessuna email inviata" : r.reason };
}
