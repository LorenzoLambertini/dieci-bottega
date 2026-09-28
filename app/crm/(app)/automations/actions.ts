"use server";

/** Automazioni CRM (eseguite dal database su ogni nuovo contatto o cambio di stato/stage). */
import { revalidatePath } from "next/cache";
import { requireCrmUser } from "@/lib/social-ai/auth";
import { createSocialClient } from "@/lib/social-ai/db";

const STATUSES = ["new", "contacted", "qualified", "proposal", "won", "lost"];

export async function createAutomation(_prev: { ok: boolean; error?: string } | null, fd: FormData): Promise<{ ok: boolean; error?: string }> {
  await requireCrmUser(["admin"]);
  const db = await createSocialClient();
  const name = String(fd.get("name") ?? "").trim().slice(0, 120);
  const when = String(fd.get("when") ?? "");
  const actionType = String(fd.get("action") ?? "");
  let trigger: string;
  const conditions: Record<string, unknown> = {};
  if (when === "lead_created") trigger = "lead_created";
  else if (when.startsWith("status:") && STATUSES.includes(when.slice(7))) {
    trigger = "status_changed";
    conditions.status = when.slice(7);
  } else if (when.startsWith("stage:")) {
    trigger = "stage_changed";
    conditions.stage_name = when.slice(6);
  } else return { ok: false, error: "Scegli quando deve partire" };
  const sources = fd.getAll("source").map(String).filter(Boolean);
  if (sources.length) conditions.source_in = sources;

  let action: Record<string, unknown>;
  if (actionType === "follow_up") {
    const days = Math.max(0, Math.min(90, Number(fd.get("days")) || 1));
    action = { type: "follow_up", days, note: String(fd.get("note") ?? "").trim().slice(0, 200) || "Ricontattare" };
  } else if (actionType === "add_tag") {
    const tag = String(fd.get("tag") ?? "").trim().toLowerCase().replace(/\s+/g, "-").slice(0, 40);
    if (tag.length < 2) return { ok: false, error: "Scrivi il tag" };
    action = { type: "add_tag", tag };
  } else if (actionType === "create_project") action = { type: "create_project" };
  else return { ok: false, error: "Scegli cosa deve fare" };

  const { error } = await db.from("crm_automations").insert({ name: name || "Nuova automazione", trigger, conditions, action });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/crm/automations");
  return { ok: true };
}

export async function toggleAutomation(id: string, active: boolean, table: "crm_automations" | "workflows" = "crm_automations") {
  await requireCrmUser(["admin"]);
  const db = await createSocialClient();
  await db.from(table).update({ is_active: active }).eq("id", id);
  revalidatePath("/crm/automations");
}

export async function deleteAutomation(id: string) {
  await requireCrmUser(["admin"]);
  const db = await createSocialClient();
  await db.from("crm_automations").delete().eq("id", id);
  revalidatePath("/crm/automations");
}
