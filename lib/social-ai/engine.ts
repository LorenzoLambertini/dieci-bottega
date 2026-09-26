/**
 * Social AI — motore principale.
 *
 *   SOCIAL → webhook → recordWebhookEvent (idempotenza) → processInbound:
 *     1. account, identità social, contatto CRM (leads), conversazione
 *     2. salva il messaggio/commento (dedup su external id)
 *     3. regole deterministiche (automazioni, guide) → nessuna chiamata AI
 *     4. se serve comprensione: Claude + tool use → decisione strutturata
 *     5. azioni: risposta, guida, tag, lead score, handoff umano, notifiche
 *     6. audit log di tutto in ai_actions / ai_runs
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import type { AiDecision, AutomationRuleRow, ConversationRow, GuideRow, InboundEvent, Platform, SocialAiSettings } from "./types";
import type { SocialProvider } from "./providers/types";
import { loadSettings, resolveModel } from "./settings";
import {
  addTag,
  createNotification,
  createSystemActivity,
  ensureContact,
  findOrCreateConversation,
  findOrCreateIdentity,
  getTags,
  logAction,
  setLeadScore,
  updateConversation,
  type LeadRow,
} from "./crm";
import { findAccountByExternalId, loadAccount, replyToComment, sendDirectMessage, type OutboundDeps } from "./outbound";
import { isLowValueComment, matchContentRules, matchGuideDeterministic, matchPostDecisionRules } from "./rules";
import { becameHot, computeScore, mergeSignals, resolveScoringConfig, scoreBand, temperatureFor } from "./scoring";
import { buildContextMessage, buildKnowledge, buildSystemText, type KnowledgeRow } from "./prompt";
import { recordRun, runDecision, summarize, type LlmClient } from "./claude";
import type { ToolRuntime } from "./tools";

export interface EngineDeps extends OutboundDeps {
  db: SupabaseClient;
  llm: LlmClient | null; // null = ANTHROPIC_API_KEY assente
  providers: Record<Platform, SocialProvider>;
  /** Email al team (Resend). Opzionale. */
  emailTeam?: (subject: string, text: string) => Promise<void>;
  now?: () => Date;
}

export type ProcessOutcome =
  | { status: "duplicate" }
  | { status: "ignored"; reason: string }
  | { status: "rule"; conversationId: string; actions: string[] }
  | { status: "ai"; conversationId: string; decision: AiDecision }
  | { status: "skipped"; conversationId: string; reason: string }
  | { status: "handoff"; conversationId: string; reason: string };

const CRM_URL = () => process.env.NEXT_PUBLIC_SITE_URL || "https://diecibottega.it";

/* ════════════════════════════════════════════════════════════════
   Webhook events: idempotenza + retry
   ════════════════════════════════════════════════════════════════ */

export const MAX_EVENT_ATTEMPTS = 5;

/** Registra l'evento. Ritorna null se già ricevuto (duplicato → non riprocessare). */
export async function recordWebhookEvent(db: SupabaseClient, ev: InboundEvent): Promise<string | null> {
  const { data, error } = await db
    .from("social_webhook_events")
    .upsert(
      { platform: ev.platform, event_key: ev.eventKey, event_type: ev.kind, payload: ev as unknown as Record<string, unknown>, status: "received" },
      { onConflict: "event_key", ignoreDuplicates: true }
    )
    .select("id");
  if (error) throw new Error(`social_webhook_events: ${error.message}`);
  const row = (data ?? [])[0] as { id: string } | undefined;
  return row?.id ?? null;
}

function backoffMs(attempt: number): number {
  return Math.min(60 * 60_000, 60_000 * 2 ** (attempt - 1)); // 1, 2, 4, 8, 16 min
}

/** Processa un evento registrato con gestione errori e retry controllati. */
export async function processRecordedEvent(deps: EngineDeps, eventId: string): Promise<ProcessOutcome | null> {
  const { data: row } = await deps.db.from("social_webhook_events").select("*").eq("id", eventId).maybeSingle();
  if (!row || row.status === "processed" || row.status === "dead" || row.status === "ignored") return null;
  // lock ottimistico: evita doppio processing concorrente
  const { data: locked } = await deps.db
    .from("social_webhook_events")
    .update({ status: "processing", attempts: row.attempts + 1 })
    .eq("id", eventId)
    .eq("status", row.status)
    .select("id");
  if (!(locked ?? []).length) return null;

  try {
    const outcome = await processInbound(deps, row.payload as InboundEvent);
    await deps.db
      .from("social_webhook_events")
      .update({ status: outcome.status === "ignored" ? "ignored" : "processed", processed_at: (deps.now?.() ?? new Date()).toISOString(), last_error: null })
      .eq("id", eventId);
    return outcome;
  } catch (e) {
    const attempts = row.attempts + 1;
    const dead = attempts >= MAX_EVENT_ATTEMPTS;
    await deps.db
      .from("social_webhook_events")
      .update({
        status: dead ? "dead" : "failed",
        last_error: (e as Error).message.slice(0, 1000),
        next_retry_at: dead ? null : new Date((deps.now?.() ?? new Date()).getTime() + backoffMs(attempts)).toISOString(),
      })
      .eq("id", eventId);
    console.error("[social-ai] event failed", eventId, (e as Error).message);
    return null;
  }
}

/** Riprocessa gli eventi falliti la cui attesa è scaduta (cron / piggyback sui webhook). */
export async function retryDueEvents(deps: EngineDeps, limit = 10): Promise<number> {
  const nowIso = (deps.now?.() ?? new Date()).toISOString();
  const { data } = await deps.db
    .from("social_webhook_events")
    .select("id")
    .eq("status", "failed")
    .lte("next_retry_at", nowIso)
    .order("next_retry_at", { ascending: true })
    .limit(limit);
  let n = 0;
  for (const r of (data ?? []) as { id: string }[]) {
    await processRecordedEvent(deps, r.id);
    n++;
  }
  return n;
}

/* ════════════════════════════════════════════════════════════════
   Processing
   ════════════════════════════════════════════════════════════════ */

interface Ctx {
  deps: EngineDeps;
  settings: SocialAiSettings;
  ev: InboundEvent;
  conv: ConversationRow;
  lead: LeadRow;
  recipientId: string;
  commentCreatedAt: string | null;
  actions: string[];
  used: { dm: boolean; commentReply: boolean; handoff: boolean };
  extraSignals: Set<string>;
}

export async function processInbound(deps: EngineDeps, ev: InboundEvent): Promise<ProcessOutcome> {
  const db = deps.db;
  const now = deps.now?.() ?? new Date();
  const settings = await loadSettings(db);

  // 1. Account / identità / contatto / conversazione
  const account = await findAccountByExternalId(db, ev.platform, ev.accountExternalId);
  let profile = null;
  const { data: knownIdentity } = await db.from("social_identities").select("id").eq("platform", ev.platform).eq("platform_user_id", ev.senderId).maybeSingle();
  if (!knownIdentity && account) {
    const provider = deps.providers[ev.platform];
    if (provider.fetchProfile) {
      const acct = await loadAccount(deps, account.id);
      if (acct) profile = await provider.fetchProfile(acct, ev.senderId).catch(() => null);
    }
  }
  const identity = await findOrCreateIdentity(db, ev, account?.id ?? null, profile);
  const lead = await ensureContact(db, identity, ev.platform);
  let conv = await findOrCreateConversation(db, {
    platform: ev.platform,
    externalId: ev.senderId, // un thread per utente per piattaforma (commenti + DM)
    contactId: lead.id,
    identityId: identity.id,
    accountId: account?.id ?? null,
  });
  if (!conv.account_id && account) {
    await updateConversation(db, conv.id, { account_id: account.id });
    conv = { ...conv, account_id: account.id };
  }

  // 2. Salvataggio (dedup anche a livello messaggio)
  if (ev.kind === "message") {
    const { data: dup } = await db.from("social_messages").select("id").eq("platform", ev.platform).eq("external_message_id", ev.externalId).maybeSingle();
    if (dup) return { status: "duplicate" };
    const { error } = await db.from("social_messages").insert({
      conversation_id: conv.id,
      contact_id: lead.id,
      platform: ev.platform,
      external_message_id: ev.externalId,
      direction: "inbound",
      message_type: "text",
      content: ev.text,
      delivery_status: "received",
      created_at: ev.timestamp,
    });
    if (error) throw new Error(`social_messages: ${error.message}`);
  } else {
    const { data: dup } = await db.from("social_comments").select("id").eq("platform", ev.platform).eq("external_comment_id", ev.externalId).maybeSingle();
    if (dup) return { status: "duplicate" };
    const { error } = await db.from("social_comments").insert({
      platform: ev.platform,
      account_id: account?.id ?? null,
      conversation_id: conv.id,
      external_comment_id: ev.externalId,
      post_id: ev.postId ?? null,
      contact_id: lead.id,
      username: ev.senderUsername ?? identity.username,
      content: ev.text,
      parent_comment_id: ev.parentCommentId ?? null,
      direction: "inbound",
      created_at: ev.timestamp,
    });
    if (error) throw new Error(`social_comments: ${error.message}`);
  }

  const convPatch: Record<string, unknown> = {
    last_message_at: ev.timestamp,
    last_message_preview: `${ev.kind === "comment" ? "💬 " : ""}${ev.text}`.slice(0, 140),
    unread_count: (conv.unread_count ?? 0) + 1,
    contact_id: conv.contact_id ?? lead.id,
  };
  // Solo un DM apre la finestra di messaggistica di 24h
  if (ev.kind === "message") convPatch.last_inbound_at = ev.timestamp;
  await updateConversation(db, conv.id, convPatch);
  conv = { ...conv, ...(convPatch as Partial<ConversationRow>) };

  const ctx: Ctx = {
    deps,
    settings,
    ev,
    conv,
    lead,
    recipientId: identity.platform_user_id,
    commentCreatedAt: ev.kind === "comment" ? ev.timestamp : null,
    actions: [],
    used: { dm: false, commentReply: false, handoff: false },
    extraSignals: new Set(),
  };
  const markCommentProcessed = () =>
    ev.kind === "comment"
      ? db.from("social_comments").update({ ai_processed: true }).eq("platform", ev.platform).eq("external_comment_id", ev.externalId)
      : Promise.resolve();

  // 3. Conversazione in mano a un umano → nessuna automazione
  if (conv.human_takeover || !conv.ai_enabled) {
    await logAction(db, { contact_id: lead.id, conversation_id: conv.id, platform: ev.platform, action_type: "skip", actor: "system", status: "skipped", summary: "Conversazione gestita da un umano: nessuna risposta automatica" });
    return { status: "skipped", conversationId: conv.id, reason: "human_takeover" };
  }
  if (!settings.auto_reply_enabled) {
    await logAction(db, { contact_id: lead.id, conversation_id: conv.id, platform: ev.platform, action_type: "skip", actor: "system", status: "skipped", summary: "Risposte automatiche disattivate" });
    return { status: "skipped", conversationId: conv.id, reason: "auto_reply_disabled" };
  }

  // 4. Regole deterministiche (nessuna chiamata AI)
  const { data: rulesData } = await db.from("social_automation_rules").select("*").eq("enabled", true);
  const rules = (rulesData ?? []) as AutomationRuleRow[];
  const { data: guidesData } = await db.from("guides").select("*").eq("active", true);
  const guides = (guidesData ?? []) as GuideRow[];

  let handled = false;
  let forceAi = false;
  const ruleHints: string[] = [];
  for (const rule of matchContentRules(rules, { platform: ev.platform, kind: ev.kind, text: ev.text })) {
    const r = await applyRule(ctx, rule, guides);
    if (r === "handled") handled = true;
    if (r === "handoff") {
      await markCommentProcessed();
      return { status: "handoff", conversationId: conv.id, reason: `Regola: ${rule.name}` };
    }
    if (r === "force_ai") {
      forceAi = true;
      const hint = (rule.configuration as { hint?: string }).hint;
      ruleHints.push(hint ? `Regola "${rule.name}": ${hint}` : `Regola "${rule.name}": qualifica il lead con domande mirate.`);
    }
  }

  if (!handled && !forceAi && settings.auto_send_guides) {
    const g = matchGuideDeterministic(ev.text, guides, ev.platform);
    if (g) {
      const r = await deliverGuide(ctx, g, "rule");
      handled = r.ok;
    }
  }

  if (handled && !forceAi) {
    await applyScoring(ctx, []);
    await markCommentProcessed();
    return { status: "rule", conversationId: conv.id, actions: ctx.actions };
  }

  // 5. Filtri di costo prima di Claude
  if (ev.kind === "comment" && isLowValueComment(ev.text)) {
    await markCommentProcessed();
    await logAction(db, { contact_id: lead.id, conversation_id: conv.id, platform: ev.platform, action_type: "skip", actor: "system", status: "skipped", summary: "Commento a basso valore (emoji/complimento): nessuna chiamata AI" });
    return { status: "skipped", conversationId: conv.id, reason: "low_value" };
  }
  if ((ev.kind === "comment" && !settings.auto_reply_comments) || (ev.kind === "message" && !settings.auto_reply_dms)) {
    return { status: "skipped", conversationId: conv.id, reason: "channel_disabled" };
  }
  if (!settings.ai_enabled || !deps.llm) {
    await logAction(db, { contact_id: lead.id, conversation_id: conv.id, platform: ev.platform, action_type: "skip", actor: "system", status: "skipped", summary: deps.llm ? "AI disattivata nelle impostazioni" : "ANTHROPIC_API_KEY non configurata" });
    return { status: "skipped", conversationId: conv.id, reason: "ai_disabled" };
  }

  // Limite di chiamate AI per conversazione (anti-abuso / anti-loop)
  const hourAgo = new Date(now.getTime() - 3600_000).toISOString();
  const { data: recentRuns } = await db.from("ai_runs").select("id").eq("conversation_id", conv.id).gte("created_at", hourAgo);
  if ((recentRuns ?? []).length >= settings.max_ai_calls_per_hour) {
    await handoff(ctx, "Limite di chiamate AI per ora raggiunto", "system");
    await markCommentProcessed();
    return { status: "handoff", conversationId: conv.id, reason: "rate_limit" };
  }

  // 6. Claude
  const decision = await decide(ctx, ruleHints);
  await markCommentProcessed();
  if (!decision) return { status: "handoff", conversationId: conv.id, reason: "ai_error" };
  if (ctx.used.handoff) return { status: "handoff", conversationId: conv.id, reason: decision.handoff_reason ?? "AI" };
  return { status: "ai", conversationId: conv.id, decision };
}

/* ─── Regole ──────────────────────────────────────────────────── */

async function applyRule(ctx: Ctx, rule: AutomationRuleRow, guides: GuideRow[]): Promise<"handled" | "handoff" | "force_ai" | "none"> {
  const { deps, lead, conv, ev } = ctx;
  const cfg = rule.configuration as { reply_text?: string; tag?: string; takeover?: boolean };
  await deps.db.from("social_automation_rules").update({ run_count: ((rule as { run_count?: number }).run_count ?? 0) + 1 }).eq("id", rule.id);
  const log = (summary: string, status: "success" | "error" = "success", error?: string) =>
    logAction(deps.db, { contact_id: lead.id, conversation_id: conv.id, platform: ev.platform, action_type: `rule:${rule.action_type}`, actor: "rule", summary: `${rule.name}: ${summary}`, input: { rule_id: rule.id, text: ev.text }, status, error });

  switch (rule.action_type) {
    case "send_guide": {
      const g = guides.find((x) => x.id === rule.guide_id);
      if (!g) {
        await log("guida non trovata o non attiva", "error");
        return "none";
      }
      const r = await deliverGuide(ctx, g, "rule");
      return r.ok ? "handled" : "none";
    }
    case "reply_text": {
      if (!cfg.reply_text) return "none";
      const ok = ev.kind === "comment" ? (await publicReply(ctx, cfg.reply_text)).ok : (await dm(ctx, cfg.reply_text, false)).ok;
      await log(`risposta "${cfg.reply_text.slice(0, 60)}"`, ok ? "success" : "error");
      return ok ? "handled" : "none";
    }
    case "add_tag": {
      if (cfg.tag) await addTag(deps.db, lead.id, cfg.tag);
      await log(`tag ${cfg.tag}`);
      return "none";
    }
    case "notify_admin": {
      await notifyTeam(ctx, `Regola "${rule.name}"`, `${lead.name} su ${ev.platform}: "${ev.text.slice(0, 200)}"`);
      await log("notifica inviata");
      return "none";
    }
    case "human_takeover": {
      await handoff(ctx, `Regola "${rule.name}"`, "rule");
      return "handoff";
    }
    case "ai_qualification":
      await log("inoltrato a Claude per qualificazione");
      return "force_ai";
  }
  return "none";
}

/* ─── Azioni di base ─────────────────────────────────────────── */

async function dm(ctx: Ctx, text: string, aiGenerated: boolean, preferPrivateReply = false) {
  const { deps, conv, ev } = ctx;
  const usePrivate =
    ev.kind === "comment" && deps.providers[ev.platform].capabilities.private_reply.status === "supported" &&
    (preferPrivateReply || !conv.last_inbound_at);
  const r = await sendDirectMessage(deps, conv, ctx.recipientId, text, {
    aiGenerated,
    privateReplyToCommentId: usePrivate ? ev.externalId : null,
    commentCreatedAt: ctx.commentCreatedAt,
  });
  return { ...r, channel: usePrivate ? ("private_reply" as const) : ("dm" as const) };
}

async function publicReply(ctx: Ctx, text: string) {
  const { deps, conv, ev, lead } = ctx;
  return replyToComment(deps, {
    platform: ev.platform,
    accountId: conv.account_id,
    conversationId: conv.id,
    contactId: lead.id,
    commentExternalId: ev.externalId,
    postId: ev.postId ?? null,
    text,
  });
}

/**
 * Consegna di una guida:
 *   commento → risposta pubblica breve + DM privato (private reply) con il link
 *              (se la piattaforma non consente DM: link nella risposta pubblica)
 *   DM       → messaggio con il link
 * Poi: guide_delivery, tag guida:<slug>, segnale guide_download, attività CRM.
 */
export async function deliverGuide(ctx: Ctx, guide: GuideRow, actor: "ai" | "rule"): Promise<{ ok: boolean; error?: string }> {
  const { deps, lead, conv, ev, settings } = ctx;
  const link = `Ecco la guida "${guide.name}": ${guide.url}`;
  const caps = deps.providers[ev.platform].capabilities;
  let ok = false;
  let channel: "dm" | "private_reply" | "comment" = "dm";
  let error: string | undefined;

  if (ev.kind === "comment") {
    if (caps.private_reply.status === "supported") {
      const r = await dm(ctx, `Ciao! ${link}`, actor === "ai", true);
      ok = r.ok;
      error = r.error;
      channel = r.channel;
      if (ok && settings.auto_reply_comments && !ctx.used.commentReply) {
        await publicReply(ctx, settings.comment_guide_reply);
        ctx.used.commentReply = true;
      }
    } else {
      const r = await publicReply(ctx, link);
      ok = r.ok;
      error = r.error;
      channel = "comment";
      ctx.used.commentReply = true;
    }
  } else {
    const r = await dm(ctx, link, actor === "ai");
    ok = r.ok;
    error = r.error;
  }
  if (ok && channel !== "comment") ctx.used.dm = true;

  await deps.db.from("guide_deliveries").insert({
    guide_id: guide.id,
    contact_id: lead.id,
    conversation_id: conv.id,
    platform: ev.platform,
    channel,
    status: ok ? "sent" : "failed",
    error: error ?? null,
  });
  if (ok) {
    await addTag(deps.db, lead.id, `guida:${guide.slug}`);
    ctx.extraSignals.add("guide_download");
    await createSystemActivity(deps.db, lead.id, `Guida inviata: ${guide.name}`, `Canale: ${channel} · ${ev.platform}`, { guide_id: guide.id });
  }
  await logAction(deps.db, {
    contact_id: lead.id,
    conversation_id: conv.id,
    platform: ev.platform,
    action_type: "send_guide",
    actor,
    summary: `${actor === "rule" ? "Regola" : "AI"}: invio guida "${guide.name}" (${channel})`,
    input: { text: ev.text, guide: guide.slug },
    output: { channel },
    status: ok ? "success" : "error",
    error: error ?? null,
  });
  ctx.actions.push(`send_guide:${guide.slug}:${ok ? "ok" : "failed"}`);
  return { ok, error };
}

async function notifyTeam(ctx: Ctx, title: string, body: string) {
  const link = `/crm/social/inbox?c=${ctx.conv.id}`;
  await createNotification(ctx.deps.db, { type: "social_ai", title, body, link });
  if (ctx.deps.emailTeam) {
    await ctx.deps.emailTeam(title, `${body}\n\nApri nel CRM: ${CRM_URL()}${link}`).catch((e) => console.warn("[social-ai] email team:", (e as Error).message));
  }
}

/**
 * Human handoff: disattiva l'AI nella conversazione, salva il motivo,
 * crea notifica + attività CRM, registra l'azione.
 */
export async function handoff(ctx: Ctx, reason: string, actor: "ai" | "rule" | "system") {
  const { deps, conv, lead, ev } = ctx;
  if (ctx.used.handoff) return;
  ctx.used.handoff = true;
  await updateConversation(deps.db, conv.id, { ai_enabled: false, human_takeover: true, status: "needs_human", handoff_reason: reason.slice(0, 300) });
  ctx.conv = { ...conv, ai_enabled: false, human_takeover: true, status: "needs_human", handoff_reason: reason };
  await createSystemActivity(deps.db, lead.id, "Richiede intervento umano", `${ev.platform}: ${reason}`, { conversation_id: conv.id });
  await notifyTeam(ctx, `Richiede intervento umano · ${lead.name}`, `${ev.platform} · Motivo: ${reason}\nUltimo messaggio: "${ev.text.slice(0, 300)}"`);
  await logAction(deps.db, { contact_id: lead.id, conversation_id: conv.id, platform: ev.platform, action_type: "request_human", actor, summary: `Handoff umano: ${reason}` });
  ctx.actions.push("handoff");
}

/* ─── Lead scoring ───────────────────────────────────────────── */

async function applyScoring(ctx: Ctx, decisionSignals: string[], intent?: string | null) {
  const { deps, conv, lead, settings, ev } = ctx;
  if (!settings.lead_scoring_enabled) return { score: conv.lead_score, temperature: conv.temperature, prev: conv.lead_score };
  const cfg = resolveScoringConfig(settings.scoring_config);
  const signals = mergeSignals(conv.signals ?? [], [...decisionSignals, ...ctx.extraSignals], cfg);
  const prev = conv.lead_score ?? 0;
  const score = computeScore(signals, cfg);
  const temperature = temperatureFor(score, cfg);
  await updateConversation(deps.db, conv.id, { signals, lead_score: score, temperature, ...(intent ? { intent } : {}) });
  ctx.conv = { ...ctx.conv, signals, lead_score: score, temperature, intent: intent ?? ctx.conv.intent };

  // Il punteggio del lead nel CRM è il massimo tra le sue conversazioni
  const newLeadScore = Math.max(score, lead.score ?? 0);
  const band = scoreBand(newLeadScore, cfg);
  if (newLeadScore !== lead.score || temperatureFor(newLeadScore, cfg) !== lead.temperature) {
    await setLeadScore(deps.db, lead.id, newLeadScore, temperatureFor(newLeadScore, cfg));
    lead.score = newLeadScore;
    lead.temperature = temperatureFor(newLeadScore, cfg);
  }
  if ((band === "qualified" || band === "hot") && (lead.status === "new" || lead.status === "contacted")) {
    await deps.db.from("leads").update({ status: "qualified", updated_at: new Date().toISOString() }).eq("id", lead.id);
    lead.status = "qualified";
  }
  if (score !== prev) {
    await logAction(deps.db, { contact_id: lead.id, conversation_id: conv.id, platform: ev.platform, action_type: "update_lead_score", actor: "system", summary: `Lead score ${prev} → ${score} (${temperature})`, output: { signals } });
  }
  if (becameHot(prev, score, cfg)) {
    await createSystemActivity(deps.db, lead.id, `Lead caldo (${score}/100)`, `Segnali: ${signals.join(", ")}`, { conversation_id: conv.id });
    await notifyTeam(ctx, `🔥 Lead caldo · ${lead.name} (${score}/100)`, `${ev.platform} · Segnali: ${signals.join(", ")}\nUltimo messaggio: "${ev.text.slice(0, 300)}"`);
  }
  return { score, temperature, prev };
}

/* ─── Decisione AI ───────────────────────────────────────────── */

async function maybeSummarize(ctx: Ctx, model: string) {
  const { deps, conv, settings } = ctx;
  const { data: all } = await deps.db
    .from("social_messages")
    .select("direction, content, created_at")
    .eq("conversation_id", conv.id)
    .order("created_at", { ascending: true });
  const msgs = (all ?? []) as { direction: string; content: string | null; created_at: string }[];
  const cutoff = msgs.length - settings.history_limit; // quelli oltre la finestra di contesto
  if (cutoff - (conv.summarized_count ?? 0) < settings.summarize_after || !deps.llm) return;
  const slice = msgs.slice(conv.summarized_count ?? 0, cutoff);
  const transcript = slice.map((m) => `${m.direction === "inbound" ? "UTENTE" : "NOI"}: ${m.content ?? ""}`).join("\n");
  try {
    const r = await summarize(deps.llm, model, conv.summary, transcript);
    await updateConversation(deps.db, conv.id, { summary: r.text, summarized_count: cutoff });
    ctx.conv = { ...ctx.conv, summary: r.text, summarized_count: cutoff };
    await recordRun(deps.db, { conversationId: conv.id, contactId: ctx.lead.id, purpose: "summary", model, usage: r.usage, latencyMs: 0, toolCalls: 0 });
  } catch (e) {
    console.warn("[social-ai] summarize failed:", (e as Error).message);
  }
}

async function loadHistory(ctx: Ctx) {
  const { deps, conv, settings, ev } = ctx;
  const [msgs, comments] = await Promise.all([
    deps.db.from("social_messages").select("direction, content, created_at, ai_generated").eq("conversation_id", conv.id).order("created_at", { ascending: false }).limit(settings.history_limit + 1),
    deps.db.from("social_comments").select("direction, content, created_at, external_comment_id").eq("conversation_id", conv.id).order("created_at", { ascending: false }).limit(6),
  ]);
  const items = [
    ...((msgs.data ?? []) as { direction: string; content: string | null; created_at: string; ai_generated: boolean }[]).map((m) => ({ direction: m.direction, kind: "message", content: m.content ?? "", at: m.created_at, ai: m.ai_generated })),
    ...((comments.data ?? []) as { direction: string; content: string | null; created_at: string; external_comment_id: string | null }[])
      .filter((c) => c.external_comment_id !== ev.externalId)
      .map((c) => ({ direction: c.direction, kind: "comment", content: c.content ?? "", at: c.created_at })),
  ]
    // il messaggio corrente è già in <nuovo_evento>
    .filter((h) => !(h.kind === "message" && h.direction === "inbound" && h.content === ev.text && h.at === ev.timestamp))
    .sort((a, b) => a.at.localeCompare(b.at));
  return items.slice(-settings.history_limit);
}

async function decide(ctx: Ctx, ruleHints: string[]): Promise<AiDecision | null> {
  const { deps, settings, ev, lead } = ctx;
  const model = resolveModel(settings);
  await maybeSummarize(ctx, model);

  const [{ data: kn }, tags, { data: deliveries }, history] = await Promise.all([
    deps.db.from("ai_knowledge").select("category, title, content, position").eq("active", true),
    getTags(deps.db, lead.id),
    deps.db.from("guide_deliveries").select("guide_id").eq("contact_id", lead.id).eq("status", "sent"),
    loadHistory(ctx),
  ]);
  let guidesReceived: string[] = [];
  const gIds = [...new Set(((deliveries ?? []) as { guide_id: string }[]).map((d) => d.guide_id))];
  if (gIds.length) {
    const { data: gs } = await deps.db.from("guides").select("name").in("id", gIds);
    guidesReceived = ((gs ?? []) as { name: string }[]).map((g) => g.name);
  }
  const { data: ident } = await deps.db.from("social_identities").select("username").eq("id", ctx.conv.identity_id).maybeSingle();

  const context = buildContextMessage({
    platform: ev.platform,
    kind: ev.kind,
    text: ev.text,
    contact: {
      name: lead.name, email: lead.email, phone: lead.phone, company: lead.company, status: lead.status,
      score: lead.score ?? 0, temperature: lead.temperature, interests: lead.interests ?? [], tags, guidesReceived,
      username: (ident as { username?: string } | null)?.username ?? null,
    },
    conversation: { intent: ctx.conv.intent, signals: ctx.conv.signals ?? [], summary: ctx.conv.summary },
    history,
    ruleHints,
    now: deps.now?.() ?? new Date(),
  });

  const runtime: ToolRuntime = {
    db: deps.db,
    settings,
    event: ev,
    conversation: ctx.conv,
    lead,
    extraSignals: ctx.extraSignals,
    used: ctx.used,
    sendToUser: (text, o) => dm(ctx, text, true, !!o?.preferPrivateReply),
    replyToCurrentComment: async (text) => {
      const r = await publicReply(ctx, text);
      return { ok: r.ok, error: r.error };
    },
    deliverGuide: (g, actor) => deliverGuide(ctx, g, actor),
    requestHuman: (reason, actor) => handoff(ctx, reason, actor),
    notifyTeam: (t, b) => notifyTeam(ctx, t, b),
  };

  const run = await runDecision({
    llm: deps.llm!,
    model,
    settings,
    systemText: buildSystemText(settings),
    knowledge: buildKnowledge((kn ?? []) as KnowledgeRow[]),
    context,
    runtime,
  });

  const d = run.decision;
  if (!d) {
    await recordRun(deps.db, { conversationId: ctx.conv.id, contactId: lead.id, purpose: "decision", model, usage: run.usage, latencyMs: run.latencyMs, toolCalls: run.toolCalls.length, error: run.error ?? "decisione non valida" });
    await logAction(deps.db, { contact_id: lead.id, conversation_id: ctx.conv.id, platform: ev.platform, action_type: "ai_decision", status: "error", summary: "Claude non ha prodotto una decisione valida", error: run.error ?? null });
    if (settings.human_handoff_enabled) await handoff(ctx, `AI non disponibile o incerta (${run.error ?? "decisione non valida"})`, "system");
    return null;
  }

  // 7. Applica la decisione
  const scoring = await applyScoring(ctx, d.signals, d.intent);
  const lowConfidence = d.confidence < settings.confidence_threshold;
  const needsHuman = d.needs_human || lowConfidence || d.intent === "complaint";
  const reason = d.handoff_reason ?? (lowConfidence ? `Confidenza bassa (${d.confidence.toFixed(2)})` : d.intent === "complaint" ? "Reclamo" : "Richiesta dell'AI");

  let sent: "none" | "dm" | "comment" | "failed" = "none";
  let response = d.response.slice(0, settings.max_response_chars).trim();

  if (d.intent === "spam") {
    response = "";
  } else if (needsHuman && settings.human_handoff_enabled) {
    await handoff(ctx, reason, "ai");
    // Risposta di cortesia: testo fisso configurato (niente contenuti AI non verificati)
    if (!ctx.used.dm && !(ev.kind === "comment" && d.intent === "complaint")) {
      const ack = settings.handoff_message;
      if (ev.kind === "message") {
        const r = await dm(ctx, ack, false);
        sent = r.ok ? "dm" : "failed";
      } else if (!ctx.used.commentReply) {
        const r = await publicReply(ctx, ack);
        sent = r.ok ? "comment" : "failed";
      }
      response = ack;
    }
  } else if (needsHuman && lowConfidence) {
    // Handoff disattivato ma AI incerta: non inviare nulla di non verificato
    response = "";
  } else if (response) {
    if (ev.kind === "message" && !ctx.used.dm) {
      const r = await dm(ctx, response, true);
      sent = r.ok ? "dm" : "failed";
    } else if (ev.kind === "comment" && !ctx.used.commentReply) {
      const r = await publicReply(ctx, response);
      sent = r.ok ? "comment" : "failed";
    }
  }

  // Regole post-decisione (intent / soglia lead score)
  const { data: rulesData } = await deps.db.from("social_automation_rules").select("*").eq("enabled", true);
  for (const rule of matchPostDecisionRules((rulesData ?? []) as AutomationRuleRow[], {
    platform: ev.platform, kind: ev.kind, text: ev.text, intent: d.intent, leadScore: scoring.score, previousScore: scoring.prev,
  })) {
    if (rule.action_type === "notify_admin" || rule.action_type === "add_tag" || rule.action_type === "human_takeover") {
      await applyRule(ctx, rule, []);
    }
    if (rule.action_type === "notify_admin" && (rule.configuration as { takeover?: boolean }).takeover) {
      await handoff(ctx, `Regola "${rule.name}"`, "rule");
    }
  }

  if (d.interest) {
    await deps.db.from("leads").update({ interests: [...new Set([...(lead.interests ?? []), d.interest.toLowerCase()])].slice(0, 20) }).eq("id", lead.id);
  }

  const decision: AiDecision = {
    intent: d.intent,
    interest: d.interest,
    signals: ctx.conv.signals,
    lead_score: scoring.score,
    temperature: scoring.temperature,
    needs_human: needsHuman,
    handoff_reason: needsHuman ? reason : null,
    confidence: d.confidence,
    response,
    actions: run.toolCalls,
  };

  await recordRun(deps.db, { conversationId: ctx.conv.id, contactId: lead.id, purpose: "decision", model, usage: run.usage, latencyMs: run.latencyMs, toolCalls: run.toolCalls.length, result: decision });
  await logAction(deps.db, {
    contact_id: lead.id,
    conversation_id: ctx.conv.id,
    platform: ev.platform,
    action_type: "ai_decision",
    summary: `Intent ${d.intent}${d.interest ? ` · ${d.interest}` : ""} · score ${scoring.score} · ${needsHuman ? "richiede umano" : sent === "none" ? "nessuna risposta" : `risposta ${sent}`}`,
    input: { text: ev.text, kind: ev.kind },
    output: decision,
    status: sent === "failed" ? "error" : "success",
    error: sent === "failed" ? "Invio non riuscito" : null,
  });
  return decision;
}
