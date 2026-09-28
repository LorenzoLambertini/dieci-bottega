"use server";

/** Progetti/clienti: modifica fase, pagamenti, scadenze, manutenzione. */
import { revalidatePath } from "next/cache";
import { requireCrmUser } from "@/lib/social-ai/auth";
import { createSocialClient } from "@/lib/social-ai/db";
import { sanitizeChecklist } from "@/lib/crm/checklists";

const PHASES = ["brief", "design", "revisioni", "sviluppo", "online", "manutenzione", "chiuso"];
const DATE = /^\d{4}-\d{2}-\d{2}$/;

export async function updateProject(id: string, patch: Record<string, string | number | null>): Promise<{ ok: boolean; error?: string }> {
  const user = await requireCrmUser();
  const db = await createSocialClient();
  const clean: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const [k, v] of Object.entries(patch)) {
    if (k === "phase" && typeof v === "string" && PHASES.includes(v)) clean.phase = v;
    else if (["name", "care_plan", "notes"].includes(k)) clean[k] = typeof v === "string" ? v.trim().slice(0, k === "notes" ? 5000 : 200) || null : null;
    else if (["value", "deposit_amount", "care_monthly"].includes(k)) clean[k] = v === null || v === "" ? (k === "care_monthly" ? null : 0) : Math.max(0, Number(String(v).replace(",", ".")) || 0);
    else if (["due_date", "deposit_paid_at", "balance_paid_at", "care_renewal_date", "start_date"].includes(k)) clean[k] = typeof v === "string" && DATE.test(v) ? v : null;
  }
  if (clean.name === null) return { ok: false, error: "Il nome è obbligatorio" };
  const { data, error } = await db.from("projects").update(clean).eq("id", id).select("lead_id, name").maybeSingle();
  if (error) return { ok: false, error: error.message };
  const p = data as { lead_id: string; name: string } | null;
  if (p && "phase" in clean) {
    await db.from("activities").insert({ lead_id: p.lead_id, user_id: user.id, type: "note", subject: `Progetto "${p.name}" → ${clean.phase}` });
  }
  revalidatePath("/crm/projects");
  return { ok: true };
}

export async function createProject(leadId: string, name: string, value: number): Promise<{ ok: boolean; error?: string }> {
  await requireCrmUser();
  const db = await createSocialClient();
  if (!name.trim()) return { ok: false, error: "Nome obbligatorio" };
  const { error } = await db.from("projects").insert({ lead_id: leadId, name: name.trim().slice(0, 200), value: Math.max(0, value || 0) });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/crm/projects");
  revalidatePath(`/crm/leads/${leadId}`);
  return { ok: true };
}

export async function deleteProject(id: string): Promise<{ ok: boolean }> {
  await requireCrmUser(["admin"]);
  const db = await createSocialClient();
  await db.from("projects").delete().eq("id", id);
  revalidatePath("/crm/projects");
  return { ok: true };
}

export async function saveChecklist(id: string, items: unknown): Promise<{ ok: boolean; error?: string }> {
  await requireCrmUser();
  const db = await createSocialClient();
  const { error } = await db.from("projects").update({ checklist: sanitizeChecklist(items), updated_at: new Date().toISOString() }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/crm/projects");
  return { ok: true };
}
