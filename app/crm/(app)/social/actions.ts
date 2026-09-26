"use server";

/**
 * Server Actions del modulo Social AI.
 * Ogni azione verifica la sessione CRM; le azioni di configurazione sono
 * riservate agli admin. Tutte le azioni umane finiscono nell'audit log.
 */
import { revalidatePath } from "next/cache";
import { requireCrmUser } from "@/lib/social-ai/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAction } from "@/lib/social-ai/crm";
import { createEngineDeps } from "@/lib/social-ai/runtime";
import { replyToComment, retryCommentReply, retryMessage, sendDirectMessage } from "@/lib/social-ai/outbound";
import { parseKeywords } from "@/lib/social-ai/rules";
import { resolveScoringConfig } from "@/lib/social-ai/scoring";
import type { ConversationRow } from "@/lib/social-ai/types";

export type ActionResult = { ok: boolean; error?: string };

const ok = (): ActionResult => ({ ok: true });
const fail = (e: unknown): ActionResult => ({ ok: false, error: e instanceof Error ? e.message : String(e) });

function s(v: FormDataEntryValue | null, max = 5000): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}
function b(v: FormDataEntryValue | null): boolean {
  return v === "on" || v === "true" || v === "1";
}
function n(v: FormDataEntryValue | null, min: number, max: number, def: number): number {
  const x = Number(v);
  return Number.isFinite(x) ? Math.max(min, Math.min(max, x)) : def;
}

/* ─── Inbox ─────────────────────────────────────────────────── */

async function loadConv(id: string) {
  const db = createAdminClient();
  const { data } = await db.from("social_conversations").select("*").eq("id", id).maybeSingle();
  if (!data) throw new Error("Conversazione non trovata");
  return { db, conv: data as ConversationRow };
}

/** "Prendi conversazione": un umano gestisce, AI sospesa. */
export async function takeOverConversation(id: string): Promise<ActionResult> {
  try {
    const user = await requireCrmUser();
    const { db, conv } = await loadConv(id);
    await db.from("social_conversations").update({ human_takeover: true, ai_enabled: false, status: "human", assigned_to: user.id, updated_at: new Date().toISOString() }).eq("id", id);
    await logAction(db, { conversation_id: id, contact_id: conv.contact_id, platform: conv.platform, action_type: "human_takeover", actor: "human", actor_user_id: user.id, summary: `${user.email} ha preso la conversazione` });
    revalidatePath("/crm/social", "layout");
    return ok();
  } catch (e) {
    return fail(e);
  }
}

/** "Riprendi AI": riattiva le risposte automatiche. */
export async function resumeAi(id: string): Promise<ActionResult> {
  try {
    const user = await requireCrmUser();
    const { db, conv } = await loadConv(id);
    await db.from("social_conversations").update({ human_takeover: false, ai_enabled: true, status: "open", handoff_reason: null, updated_at: new Date().toISOString() }).eq("id", id);
    await logAction(db, { conversation_id: id, contact_id: conv.contact_id, platform: conv.platform, action_type: "resume_ai", actor: "human", actor_user_id: user.id, summary: `${user.email} ha riattivato l'AI` });
    revalidatePath("/crm/social", "layout");
    return ok();
  } catch (e) {
    return fail(e);
  }
}

export async function markConversationRead(id: string): Promise<ActionResult> {
  try {
    await requireCrmUser();
    const db = createAdminClient();
    await db.from("social_conversations").update({ unread_count: 0 }).eq("id", id);
    return ok();
  } catch (e) {
    return fail(e);
  }
}

export async function closeConversation(id: string): Promise<ActionResult> {
  try {
    const user = await requireCrmUser();
    const { db, conv } = await loadConv(id);
    await db.from("social_conversations").update({ status: "closed", unread_count: 0, updated_at: new Date().toISOString() }).eq("id", id);
    await logAction(db, { conversation_id: id, contact_id: conv.contact_id, platform: conv.platform, action_type: "close", actor: "human", actor_user_id: user.id, summary: "Conversazione chiusa" });
    revalidatePath("/crm/social", "layout");
    return ok();
  } catch (e) {
    return fail(e);
  }
}

/** Risposta manuale del team: DM oppure risposta pubblica all'ultimo commento. */
export async function sendManualReply(id: string, text: string, channel: "dm" | "comment"): Promise<ActionResult> {
  try {
    const user = await requireCrmUser();
    const body = text.trim().slice(0, 2000);
    if (!body) throw new Error("Testo vuoto");
    const deps = createEngineDeps();
    const { data: conv } = await deps.db.from("social_conversations").select("*").eq("id", id).maybeSingle();
    if (!conv) throw new Error("Conversazione non trovata");
    const c = conv as ConversationRow;
    let res: { ok: boolean; error?: string };
    if (channel === "comment") {
      const { data: last } = await deps.db
        .from("social_comments")
        .select("external_comment_id, post_id")
        .eq("conversation_id", id)
        .eq("direction", "inbound")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!last?.external_comment_id) throw new Error("Nessun commento a cui rispondere");
      res = await replyToComment(deps, { platform: c.platform, accountId: c.account_id, conversationId: id, contactId: c.contact_id, commentExternalId: last.external_comment_id, postId: last.post_id, text: body });
    } else {
      const { data: ident } = await deps.db.from("social_identities").select("platform_user_id").eq("id", c.identity_id).maybeSingle();
      if (!ident) throw new Error("Destinatario non trovato");
      res = await sendDirectMessage(deps, c, ident.platform_user_id, body, { sentBy: user.id });
    }
    await deps.db.from("social_conversations").update({ unread_count: 0 }).eq("id", id);
    await logAction(deps.db, { conversation_id: id, contact_id: c.contact_id, platform: c.platform, action_type: channel === "dm" ? "manual_dm" : "manual_comment_reply", actor: "human", actor_user_id: user.id, summary: `Risposta manuale (${channel})`, status: res.ok ? "success" : "error", error: res.error ?? null });
    revalidatePath("/crm/social/inbox");
    return res.ok ? ok() : { ok: false, error: res.error ?? "Invio non riuscito" };
  } catch (e) {
    return fail(e);
  }
}

export async function retryFailed(kind: "message" | "comment", id: string): Promise<ActionResult> {
  try {
    const user = await requireCrmUser();
    const deps = createEngineDeps();
    const r = kind === "message" ? await retryMessage(deps, id) : await retryCommentReply(deps, id);
    await logAction(deps.db, { action_type: "retry_send", actor: "human", actor_user_id: user.id, summary: `Retry manuale ${kind}`, status: r.ok ? "success" : "error", error: r.error ?? null });
    revalidatePath("/crm/social/inbox");
    return r.ok ? ok() : { ok: false, error: r.error };
  } catch (e) {
    return fail(e);
  }
}

export async function markNotificationsRead(): Promise<ActionResult> {
  try {
    const user = await requireCrmUser();
    const db = createAdminClient();
    await db.from("notifications").update({ read_at: new Date().toISOString() }).is("read_at", null).or(`user_id.is.null,user_id.eq.${user.id}`);
    revalidatePath("/crm/social");
    return ok();
  } catch (e) {
    return fail(e);
  }
}

/* ─── Guide ─────────────────────────────────────────────────── */

function slugify(t: string) {
  return t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
}

export async function saveGuide(_: ActionResult | null, form: FormData): Promise<ActionResult> {
  try {
    const user = await requireCrmUser(["admin"]);
    const db = createAdminClient();
    const id = s(form.get("id"), 64);
    const name = s(form.get("name"), 160);
    const url = s(form.get("url"), 500);
    if (!name) throw new Error("Nome obbligatorio");
    if (!/^https:\/\/\S+$/.test(url)) throw new Error("URL non valido (deve iniziare con https://)");
    const platforms = ["instagram", "facebook", "linkedin", "tiktok"].filter((p) => b(form.get(`p_${p}`)));
    const row = {
      name,
      slug: s(form.get("slug"), 80) ? slugify(s(form.get("slug"), 80)) : slugify(name),
      description: s(form.get("description"), 1000) || null,
      url,
      active: b(form.get("active")),
      trigger_keywords: parseKeywords(s(form.get("keywords"), 1000)).slice(0, 30),
      platforms: platforms.length ? platforms : ["instagram", "facebook", "linkedin", "tiktok"],
      updated_at: new Date().toISOString(),
    };
    const { error } = id ? await db.from("guides").update(row).eq("id", id) : await db.from("guides").insert(row);
    if (error) throw new Error(error.message.includes("duplicate") ? "Slug già in uso" : error.message);
    await logAction(db, { action_type: id ? "update_guide" : "create_guide", actor: "human", actor_user_id: user.id, summary: `Guida "${name}"` });
    revalidatePath("/crm/social/guides");
    return ok();
  } catch (e) {
    return fail(e);
  }
}

export async function deleteGuide(id: string): Promise<ActionResult> {
  try {
    const user = await requireCrmUser(["admin"]);
    const db = createAdminClient();
    await db.from("guides").delete().eq("id", id);
    await logAction(db, { action_type: "delete_guide", actor: "human", actor_user_id: user.id, summary: `Guida eliminata ${id}` });
    revalidatePath("/crm/social/guides");
    return ok();
  } catch (e) {
    return fail(e);
  }
}

/* ─── Automazioni ──────────────────────────────────────────── */

const TRIGGERS = ["comment_keyword", "dm_keyword", "any_keyword", "intent", "lead_score_above"];
const ACTIONS = ["send_guide", "ai_qualification", "notify_admin", "human_takeover", "add_tag", "reply_text"];

export async function saveRule(_: ActionResult | null, form: FormData): Promise<ActionResult> {
  try {
    const user = await requireCrmUser(["admin"]);
    const db = createAdminClient();
    const id = s(form.get("id"), 64);
    const trigger_type = s(form.get("trigger_type"), 40);
    const action_type = s(form.get("action_type"), 40);
    if (!TRIGGERS.includes(trigger_type) || !ACTIONS.includes(action_type)) throw new Error("Trigger o azione non validi");
    const trigger_value = s(form.get("trigger_value"), 500);
    if (!trigger_value) throw new Error("Valore del trigger obbligatorio");
    if (trigger_type === "lead_score_above" && !(Number(trigger_value) >= 0 && Number(trigger_value) <= 100)) throw new Error("Soglia 0–100");
    const guide_id = s(form.get("guide_id"), 64) || null;
    if (action_type === "send_guide" && !guide_id) throw new Error("Seleziona una guida");
    const configuration: Record<string, unknown> = {};
    if (s(form.get("reply_text"))) configuration.reply_text = s(form.get("reply_text"), 500);
    if (s(form.get("tag"))) configuration.tag = s(form.get("tag"), 40);
    if (s(form.get("hint"))) configuration.hint = s(form.get("hint"), 500);
    if (b(form.get("takeover"))) configuration.takeover = true;
    if (action_type === "reply_text" && !configuration.reply_text) throw new Error("Testo di risposta obbligatorio");
    if (action_type === "add_tag" && !configuration.tag) throw new Error("Tag obbligatorio");
    const row = {
      name: s(form.get("name"), 120) || `${trigger_type} → ${action_type}`,
      platform: ["all", "instagram", "facebook", "linkedin", "tiktok"].includes(s(form.get("platform"))) ? s(form.get("platform")) : "all",
      trigger_type,
      trigger_value,
      action_type,
      guide_id,
      enabled: b(form.get("enabled")),
      priority: n(form.get("priority"), 1, 1000, 100),
      configuration,
      updated_at: new Date().toISOString(),
    };
    const { error } = id ? await db.from("social_automation_rules").update(row).eq("id", id) : await db.from("social_automation_rules").insert(row);
    if (error) throw new Error(error.message);
    await logAction(db, { action_type: id ? "update_rule" : "create_rule", actor: "human", actor_user_id: user.id, summary: `Automazione "${row.name}"` });
    revalidatePath("/crm/social/automations");
    return ok();
  } catch (e) {
    return fail(e);
  }
}

export async function toggleRule(id: string, enabled: boolean): Promise<ActionResult> {
  try {
    await requireCrmUser(["admin"]);
    await createAdminClient().from("social_automation_rules").update({ enabled, updated_at: new Date().toISOString() }).eq("id", id);
    revalidatePath("/crm/social/automations");
    return ok();
  } catch (e) {
    return fail(e);
  }
}

export async function deleteRule(id: string): Promise<ActionResult> {
  try {
    const user = await requireCrmUser(["admin"]);
    const db = createAdminClient();
    await db.from("social_automation_rules").delete().eq("id", id);
    await logAction(db, { action_type: "delete_rule", actor: "human", actor_user_id: user.id, summary: `Automazione eliminata ${id}` });
    revalidatePath("/crm/social/automations");
    return ok();
  } catch (e) {
    return fail(e);
  }
}

/* ─── Knowledge base ───────────────────────────────────────── */

const CATEGORIES = ["company", "services", "pricing", "faq", "case_study", "portfolio", "policy", "tone", "rules"];

export async function saveKnowledge(_: ActionResult | null, form: FormData): Promise<ActionResult> {
  try {
    const user = await requireCrmUser(["admin"]);
    const db = createAdminClient();
    const id = s(form.get("id"), 64);
    const category = s(form.get("category"), 40);
    if (!CATEGORIES.includes(category)) throw new Error("Categoria non valida");
    const title = s(form.get("title"), 200);
    const content = s(form.get("content"), 20000);
    if (!title || !content) throw new Error("Titolo e contenuto obbligatori");
    const row = { category, title, content, active: b(form.get("active")), position: n(form.get("position"), 0, 10000, 100), updated_at: new Date().toISOString() };
    const { error } = id ? await db.from("ai_knowledge").update(row).eq("id", id) : await db.from("ai_knowledge").insert(row);
    if (error) throw new Error(error.message);
    await logAction(db, { action_type: id ? "update_knowledge" : "create_knowledge", actor: "human", actor_user_id: user.id, summary: `Knowledge "${title}"` });
    revalidatePath("/crm/ai/knowledge");
    return ok();
  } catch (e) {
    return fail(e);
  }
}

export async function deleteKnowledge(id: string): Promise<ActionResult> {
  try {
    const user = await requireCrmUser(["admin"]);
    const db = createAdminClient();
    await db.from("ai_knowledge").delete().eq("id", id);
    await logAction(db, { action_type: "delete_knowledge", actor: "human", actor_user_id: user.id, summary: `Knowledge eliminata ${id}` });
    revalidatePath("/crm/ai/knowledge");
    return ok();
  } catch (e) {
    return fail(e);
  }
}

/* ─── Impostazioni ─────────────────────────────────────────── */

export async function saveSettings(_: ActionResult | null, form: FormData): Promise<ActionResult> {
  try {
    const user = await requireCrmUser(["admin"]);
    const db = createAdminClient();
    let scoring: Record<string, unknown> = {};
    const rawScoring = s(form.get("scoring_config"), 5000);
    if (rawScoring) {
      try {
        const parsed = JSON.parse(rawScoring);
        resolveScoringConfig(parsed); // valida/normalizza
        scoring = parsed;
      } catch {
        throw new Error("Configurazione lead scoring: JSON non valido");
      }
    }
    const model = s(form.get("model"), 80);
    if (model && !/^[a-z0-9][a-z0-9.\-]+$/i.test(model)) throw new Error("Nome modello non valido");
    const row = {
      id: 1,
      ai_enabled: b(form.get("ai_enabled")),
      auto_reply_enabled: b(form.get("auto_reply_enabled")),
      auto_reply_comments: b(form.get("auto_reply_comments")),
      auto_reply_dms: b(form.get("auto_reply_dms")),
      auto_send_guides: b(form.get("auto_send_guides")),
      lead_scoring_enabled: b(form.get("lead_scoring_enabled")),
      human_handoff_enabled: b(form.get("human_handoff_enabled")),
      model: model || null,
      max_response_chars: n(form.get("max_response_chars"), 80, 2000, 600),
      brand_tone: s(form.get("brand_tone"), 3000) || null,
      confidence_threshold: n(form.get("confidence_threshold"), 0, 1, 0.6),
      history_limit: n(form.get("history_limit"), 2, 50, 12),
      summarize_after: n(form.get("summarize_after"), 10, 500, 30),
      max_ai_calls_per_hour: n(form.get("max_ai_calls_per_hour"), 1, 500, 20),
      system_prompt: s(form.get("system_prompt"), 20000) || null,
      handoff_message: s(form.get("handoff_message"), 500) || "Grazie! Ti passo a una persona del team, ti rispondiamo a breve.",
      comment_guide_reply: s(form.get("comment_guide_reply"), 300) || "Ti ho appena scritto in DM 📩",
      scoring_config: scoring,
      updated_at: new Date().toISOString(),
    };
    const { error } = await db.from("social_ai_settings").upsert(row, { onConflict: "id" });
    if (error) throw new Error(error.message);
    await logAction(db, { action_type: "update_settings", actor: "human", actor_user_id: user.id, summary: `Impostazioni Social AI aggiornate (AI ${row.ai_enabled ? "attiva" : "disattiva"})` });
    revalidatePath("/crm/settings/social-ai");
    return ok();
  } catch (e) {
    return fail(e);
  }
}

export async function disconnectAccount(id: string): Promise<ActionResult> {
  try {
    const user = await requireCrmUser(["admin"]);
    const db = createAdminClient();
    const { data: acct } = await db.from("social_accounts").select("platform, account_name").eq("id", id).maybeSingle();
    await db.from("social_account_secrets").delete().eq("account_id", id);
    await db.from("social_accounts").update({ status: "disconnected", updated_at: new Date().toISOString() }).eq("id", id);
    await logAction(db, { action_type: "disconnect_account", actor: "human", actor_user_id: user.id, platform: acct?.platform ?? null, summary: `Account scollegato: ${acct?.account_name ?? id}` });
    revalidatePath("/crm/settings/social-ai");
    return ok();
  } catch (e) {
    return fail(e);
  }
}
