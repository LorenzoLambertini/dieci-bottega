"use server";

/** Strumenti CRM: modifica/elimina attività, unisci doppioni, importa CSV, invita utenti. */
import { revalidatePath } from "next/cache";
import { requireCrmUser } from "@/lib/social-ai/auth";
import { createSocialClient } from "@/lib/social-ai/db";
import { createAdminClient } from "@/lib/supabase/admin";

type R = { ok: boolean; error?: string };

/* ─── Attività ───────────────────────────────────────────── */

export async function updateActivity(id: string, body: string): Promise<R> {
  const user = await requireCrmUser();
  const db = await createSocialClient();
  const { data } = await db.from("activities").select("lead_id, user_id, type").eq("id", id).maybeSingle();
  const a = data as { lead_id: string; user_id: string | null; type: string } | null;
  if (!a) return { ok: false, error: "Attività non trovata" };
  if (a.type === "system") return { ok: false, error: "Le attività automatiche non si modificano" };
  if (a.user_id !== user.id && user.role !== "admin") return { ok: false, error: "Puoi modificare solo le tue attività" };
  const { error } = await db.from("activities").update({ body: body.trim().slice(0, 10_000) || null }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/crm/leads/${a.lead_id}`);
  return { ok: true };
}

export async function deleteActivity(id: string): Promise<R> {
  const user = await requireCrmUser();
  const db = await createSocialClient();
  const { data } = await db.from("activities").select("lead_id, user_id").eq("id", id).maybeSingle();
  const a = data as { lead_id: string; user_id: string | null } | null;
  if (!a) return { ok: false, error: "Attività non trovata" };
  if (a.user_id !== user.id && user.role !== "admin") return { ok: false, error: "Puoi eliminare solo le tue attività" };
  const { error } = await db.from("activities").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/crm/leads/${a.lead_id}`);
  return { ok: true };
}

/* ─── Doppioni ───────────────────────────────────────────── */

export async function searchLeads(q: string, excludeId: string): Promise<{ id: string; name: string; email: string | null; company: string | null }[]> {
  await requireCrmUser();
  const s = q.replace(/[,()*%\\:"']/g, " ").trim().slice(0, 60);
  if (s.length < 2) return [];
  const db = await createSocialClient();
  const { data } = await db
    .from("leads")
    .select("id, name, email, company")
    .or(`name.ilike.%${s}%,email.ilike.%${s}%,company.ilike.%${s}%,phone.ilike.%${s}%`)
    .neq("id", excludeId)
    .limit(8);
  return (data ?? []) as { id: string; name: string; email: string | null; company: string | null }[];
}

/** Unisce `otherId` in `keepId`: sposta storico, preventivi, progetti, tag e social; completa i campi vuoti; elimina il doppione. */
export async function mergeLeads(keepId: string, otherId: string): Promise<R> {
  const user = await requireCrmUser(["admin"]);
  if (keepId === otherId) return { ok: false, error: "Scegli un contatto diverso" };
  const db = createAdminClient();
  const [{ data: keep }, { data: other }] = await Promise.all([
    db.from("leads").select("*").eq("id", keepId).maybeSingle(),
    db.from("leads").select("*").eq("id", otherId).maybeSingle(),
  ]);
  if (!keep || !other) return { ok: false, error: "Contatto non trovato" };
  const k = keep as Record<string, unknown>;
  const o = other as Record<string, unknown>;

  const move = async (table: string, col: string) => {
    const { error } = await db.from(table).update({ [col]: keepId }).eq(col, otherId);
    if (error) throw new Error(`${table}: ${error.message}`);
  };
  try {
    for (const [t, c] of [
      ["activities", "lead_id"], ["opportunities", "lead_id"], ["quotes", "lead_id"], ["projects", "lead_id"], ["email_logs", "lead_id"],
      ["social_identities", "lead_id"], ["social_conversations", "contact_id"], ["social_messages", "contact_id"], ["social_comments", "contact_id"],
      ["ai_actions", "contact_id"], ["ai_runs", "contact_id"], ["guide_deliveries", "contact_id"],
    ] as const) await move(t, c);
    // tag: copia quelli mancanti (chiave primaria lead_id+tag_id), il resto va via con la cascata
    const { data: tags } = await db.from("lead_tags").select("tag_id").eq("lead_id", otherId);
    for (const t of (tags ?? []) as { tag_id: string }[]) {
      await db.from("lead_tags").upsert({ lead_id: keepId, tag_id: t.tag_id }, { onConflict: "lead_id,tag_id", ignoreDuplicates: true });
    }
    // completa i campi vuoti del contatto principale
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    for (const f of ["phone", "company", "website", "utm_source", "utm_medium", "utm_campaign", "next_action_at", "next_action_note"]) {
      if (!k[f] && o[f]) patch[f] = o[f];
    }
    if (k.notes !== o.notes && o.notes) patch.notes = [k.notes, o.notes].filter(Boolean).join("\n\n---\n\n");
    patch.score = Math.max(Number(k.score) || 0, Number(o.score) || 0);
    const { error: delErr } = await db.from("leads").delete().eq("id", otherId);
    if (delErr) throw new Error(delErr.message);
    // l'email del doppione si può riusare solo dopo averlo eliminato (vincolo di unicità)
    if (!k.email && o.email) patch.email = o.email;
    await db.from("leads").update(patch).eq("id", keepId);
    await db.from("activities").insert({ lead_id: keepId, user_id: user.id, type: "system", subject: `Unito con il doppione "${String(o.name)}"` });
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
  revalidatePath(`/crm/leads/${keepId}`);
  revalidatePath("/crm/leads");
  return { ok: true };
}

/* ─── Import CSV ─────────────────────────────────────────── */

export interface ImportRow {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  website?: string;
  notes?: string;
}

export async function importLeads(rows: ImportRow[], tag: string): Promise<{ ok: boolean; created: number; skipped: number; error?: string }> {
  const user = await requireCrmUser(["admin"]);
  const db = await createSocialClient();
  const clean = rows
    .slice(0, 2000)
    .map((r) => ({
      name: String(r.name ?? "").trim().slice(0, 200),
      email: String(r.email ?? "").trim().toLowerCase().slice(0, 200) || null,
      phone: String(r.phone ?? "").trim().slice(0, 50) || null,
      company: String(r.company ?? "").trim().slice(0, 200) || null,
      website: String(r.website ?? "").trim().slice(0, 300) || null,
      notes: String(r.notes ?? "").trim().slice(0, 5000) || null,
    }))
    .filter((r) => r.name || r.email);
  const emails = clean.map((r) => r.email).filter(Boolean) as string[];
  const existing = new Set<string>();
  for (let i = 0; i < emails.length; i += 200) {
    const { data } = await db.from("leads").select("email").in("email", emails.slice(i, i + 200));
    for (const e of (data ?? []) as { email: string }[]) existing.add(e.email);
  }
  const seen = new Set<string>();
  const toInsert = clean
    .filter((r) => {
      if (!r.email) return true;
      if (existing.has(r.email) || seen.has(r.email)) return false;
      seen.add(r.email);
      return true;
    })
    .map((r) => ({ ...r, name: r.name || r.email!, status: "new", score: 0, source: "import", assigned_to: user.id }));
  let created = 0;
  for (let i = 0; i < toInsert.length; i += 200) {
    const { data, error } = await db.from("leads").insert(toInsert.slice(i, i + 200)).select("id");
    if (error) return { ok: false, created, skipped: clean.length - created, error: error.message };
    const ids = ((data ?? []) as { id: string }[]).map((d) => d.id);
    created += ids.length;
    const t = tag.trim().toLowerCase().replace(/\s+/g, "-").slice(0, 40);
    if (t.length >= 2 && ids.length) {
      await db.from("tags").upsert({ name: t, color: "#3B82F6" }, { onConflict: "name", ignoreDuplicates: true });
      const { data: tg } = await db.from("tags").select("id").eq("name", t).maybeSingle();
      if (tg) await db.from("lead_tags").insert(ids.map((id) => ({ lead_id: id, tag_id: (tg as { id: string }).id })));
    }
  }
  revalidatePath("/crm/leads");
  return { ok: true, created, skipped: clean.length - created };
}

/* ─── Utenti ─────────────────────────────────────────────── */

export async function inviteUser(email: string, fullName: string, role: string): Promise<R> {
  await requireCrmUser(["admin"]);
  const e = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return { ok: false, error: "Email non valida" };
  if (!["admin", "sales", "marketing"].includes(role)) return { ok: false, error: "Ruolo non valido" };
  const site = (process.env.NEXT_PUBLIC_SITE_URL || "https://diecibottega.it").replace(/\/$/, "");
  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.inviteUserByEmail(e, { redirectTo: `${site}/crm/login`, data: { full_name: fullName.trim() || undefined, role } });
  if (error) return { ok: false, error: error.message };
  if (data.user) await admin.from("profiles").update({ role, full_name: fullName.trim() || undefined }).eq("id", data.user.id);
  revalidatePath("/crm/settings");
  return { ok: true };
}

export async function setUserRole(userId: string, role: string): Promise<R> {
  const me = await requireCrmUser(["admin"]);
  if (userId === me.id) return { ok: false, error: "Non puoi cambiare il tuo ruolo" };
  if (!["admin", "sales", "marketing"].includes(role)) return { ok: false, error: "Ruolo non valido" };
  const db = await createSocialClient();
  const { error } = await db.from("profiles").update({ role }).eq("id", userId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/crm/settings");
  return { ok: true };
}
