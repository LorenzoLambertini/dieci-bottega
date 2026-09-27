/**
 * Tool use — strumenti che Claude può RICHIEDERE; li esegue il backend.
 *
 * Per ogni tool: schema JSON (inviato a Claude) · validazione dell'input ·
 * autorizzazione (il contesto è vincolato al contatto/conversazione corrente:
 * nessun tool accetta id arbitrari) · limiti di utilizzo · logging in
 * ai_actions · gestione errori (l'errore torna a Claude come tool_result
 * is_error, il flusso non si interrompe).
 *
 * Claude non esegue codice: sceglie solo quale tool chiamare e con quali
 * argomenti; qui decidiamo se e come eseguirlo.
 */
import type Anthropic from "@anthropic-ai/sdk";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { ConversationRow, GuideRow, InboundEvent, SocialAiSettings } from "./types";
import { INTENTS } from "./types";
import { KNOWN_SIGNALS } from "./scoring";
import {
  AI_ALLOWED_STATUSES,
  addTag,
  createNote,
  createNotification,
  getTags,
  logAction,
  removeTag,
  updateContactFields,
  type LeadRow,
} from "./crm";
import { normalize } from "./rules";

/* ─── Validazione minimale (niente dipendenze extra) ──────────── */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ToolInput = Record<string, any>;
type Validator<T = ToolInput> = (input: unknown) => { ok: true; value: T } | { ok: false; error: string };

function obj(input: unknown): Record<string, unknown> | null {
  return input && typeof input === "object" && !Array.isArray(input) ? (input as Record<string, unknown>) : null;
}
function str(o: Record<string, unknown>, k: string, opts: { required?: boolean; max: number; min?: number }): string | undefined | Error {
  const v = o[k];
  if (v === undefined || v === null || v === "") return opts.required ? new Error(`${k} obbligatorio`) : undefined;
  if (typeof v !== "string") return new Error(`${k} deve essere una stringa`);
  const t = v.trim();
  if (t.length < (opts.min ?? 1)) return new Error(`${k} troppo corto`);
  if (t.length > opts.max) return new Error(`${k} troppo lungo (max ${opts.max})`);
  return t;
}
function strArray(o: Record<string, unknown>, k: string, max: number, allowed?: readonly string[]): string[] | Error {
  const v = o[k];
  if (v === undefined || v === null) return [];
  if (!Array.isArray(v) || v.some((x) => typeof x !== "string")) return new Error(`${k} deve essere un array di stringhe`);
  if (v.length > max) return new Error(`${k}: massimo ${max} elementi`);
  if (allowed) {
    const bad = (v as string[]).filter((x) => !allowed.includes(x));
    if (bad.length) return new Error(`${k}: valori non validi ${bad.join(", ")}`);
  }
  return v as string[];
}
function build(fn: (o: Record<string, unknown>) => ToolInput): Validator {
  return (input) => {
    const o = obj(input) ?? {};
    try {
      const value = fn(o);
      for (const v of Object.values(value as Record<string, unknown>)) if (v instanceof Error) return { ok: false, error: v.message };
      return { ok: true, value };
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
  };
}

/* ─── Contesto di esecuzione ──────────────────────────────────── */

export interface ToolRuntime {
  db: SupabaseClient;
  settings: SocialAiSettings;
  event: InboundEvent;
  conversation: ConversationRow;
  lead: LeadRow;
  /** Invia un DM (o private reply) al solo utente della conversazione corrente. */
  sendToUser: (text: string, opts?: { preferPrivateReply?: boolean }) => Promise<{ ok: boolean; error?: string; channel: "dm" | "private_reply" | "comment" }>;
  /** Risponde pubblicamente al solo commento corrente. */
  replyToCurrentComment: (text: string) => Promise<{ ok: boolean; error?: string }>;
  deliverGuide: (guide: GuideRow, actor: "ai" | "rule") => Promise<{ ok: boolean; error?: string }>;
  requestHuman: (reason: string, actor: "ai" | "rule") => Promise<void>;
  notifyTeam: (title: string, body: string) => Promise<void>;
  /** Segnali aggiunti dai tool durante la run (uniti a quelli della decisione). */
  extraSignals: Set<string>;
  /** Canali già usati dai tool (per non duplicare la response finale). */
  used: { dm: boolean; commentReply: boolean; handoff: boolean };
}

interface ToolDef {
  name: string;
  description: string;
  input_schema: Anthropic.Tool["input_schema"];
  /** Numero massimo di chiamate per singola run. */
  maxCalls: number;
  validate: Validator;
  run: (rt: ToolRuntime, input: ToolInput) => Promise<{ summary: string; result: unknown }>;
}

function def(d: ToolDef): ToolDef {
  return d;
}

const S = (description: string, extra: Record<string, unknown> = {}) => ({ type: "string", description, ...extra });

export const ACTION_TOOLS = [
  def({
    name: "search_contact",
    description:
      "Verifica se un'email o un telefono dichiarati dall'utente corrispondono al contatto corrente o a un altro contatto del CRM. Non restituisce dati di altri contatti.",
    input_schema: { type: "object", properties: { email: S("Email dichiarata"), phone: S("Telefono dichiarato") } },
    maxCalls: 2,
    validate: build((o) => ({ email: str(o, "email", { max: 200 }), phone: str(o, "phone", { max: 30 }) })),
    async run(rt, i) {
      const email = typeof i.email === "string" ? i.email.toLowerCase() : null;
      const phone = typeof i.phone === "string" ? i.phone : null;
      if (!email && !phone) return { summary: "Nessun criterio", result: { match: "none" } };
      let q = rt.db.from("leads").select("id");
      q = email ? q.eq("email", email) : q.eq("phone", phone);
      const { data } = await q.limit(1);
      const hit = (data ?? [])[0] as { id: string } | undefined;
      const match = !hit ? "none" : hit.id === rt.lead.id ? "this_contact" : "other_contact";
      return { summary: `Ricerca contatto: ${match}`, result: { match } };
    },
  }),
  def({
    name: "create_contact",
    description: "Garantisce che l'utente corrente esista come contatto nel CRM (idempotente: il contatto viene creato automaticamente alla prima interazione).",
    input_schema: { type: "object", properties: {} },
    maxCalls: 1,
    validate: build(() => ({})),
    async run(rt) {
      return { summary: "Contatto già presente", result: { contact_exists: true, name: rt.lead.name } };
    },
  }),
  def({
    name: "update_contact",
    description: "Aggiorna i dati del contatto corrente con informazioni DICHIARATE esplicitamente dall'utente (mai dedotte).",
    input_schema: {
      type: "object",
      properties: {
        name: S("Nome e cognome"),
        email: S("Email"),
        phone: S("Telefono"),
        company: S("Azienda o attività"),
        website: S("Sito web attuale"),
        interests: { type: "array", items: { type: "string" }, description: "Servizi di interesse" },
      },
    },
    maxCalls: 2,
    validate: build((o) => ({
      name: str(o, "name", { max: 120 }),
      email: str(o, "email", { max: 200 }),
      phone: str(o, "phone", { max: 30 }),
      company: str(o, "company", { max: 160 }),
      website: str(o, "website", { max: 200 }),
      interests: strArray(o, "interests", 10),
    })),
    async run(rt, i) {
      const r = await updateContactFields(rt.db, rt.lead, {
        name: i.name as string | undefined,
        email: i.email as string | undefined,
        phone: i.phone as string | undefined,
        company: i.company as string | undefined,
        website: i.website as string | undefined,
        interests: i.interests as string[],
      });
      if (r.updated.includes("email") || r.updated.includes("phone")) rt.extraSignals.add("contact_request");
      if (r.updated.includes("company")) rt.extraSignals.add("real_company");
      return { summary: `Contatto aggiornato: ${r.updated.join(", ") || "nessun campo"}${r.conflicts.length ? ` (conflitti: ${r.conflicts.join(", ")})` : ""}`, result: r };
    },
  }),
  def({
    name: "add_tag",
    description: "Aggiunge un tag al contatto corrente (es. 'interesse-ecommerce').",
    input_schema: { type: "object", properties: { tag: S("Nome del tag") }, required: ["tag"] },
    maxCalls: 3,
    validate: build((o) => ({ tag: str(o, "tag", { required: true, max: 40, min: 2 }) })),
    async run(rt, i) {
      const t = await addTag(rt.db, rt.lead.id, i.tag as string);
      if (!t) throw new Error("Tag non valido");
      return { summary: `Tag aggiunto: ${t}`, result: { tag: t } };
    },
  }),
  def({
    name: "remove_tag",
    description: "Rimuove un tag dal contatto corrente.",
    input_schema: { type: "object", properties: { tag: S("Nome del tag") }, required: ["tag"] },
    maxCalls: 2,
    validate: build((o) => ({ tag: str(o, "tag", { required: true, max: 40, min: 2 }) })),
    async run(rt, i) {
      const ok = await removeTag(rt.db, rt.lead.id, i.tag as string);
      return { summary: ok ? `Tag rimosso: ${i.tag}` : `Tag non presente: ${i.tag}`, result: { removed: ok } };
    },
  }),
  def({
    name: "update_lead_score",
    description:
      "Registra segnali commerciali aggiuntivi per il lead scoring. Il punteggio viene calcolato dal sistema in base a criteri documentati: non puoi impostare un numero.",
    input_schema: {
      type: "object",
      properties: {
        signals: { type: "array", items: { type: "string", enum: KNOWN_SIGNALS }, description: "Segnali rilevati" },
        reason: S("Motivazione breve"),
      },
      required: ["signals"],
    },
    maxCalls: 1,
    validate: build((o) => ({ signals: strArray(o, "signals", 10, KNOWN_SIGNALS), reason: str(o, "reason", { max: 300 }) })),
    async run(rt, i) {
      for (const s of i.signals as string[]) rt.extraSignals.add(s);
      return { summary: `Segnali: ${(i.signals as string[]).join(", ")}`, result: { accepted: i.signals } };
    },
  }),
  def({
    name: "create_lead",
    description:
      "Crea un'opportunità commerciale nel CRM per il contatto corrente quando c'è un interesse concreto verso un servizio (es. richiesta preventivo per un sito).",
    input_schema: {
      type: "object",
      properties: { title: S("Titolo breve, es. 'Sito vetrina ristorante'"), notes: S("Dettagli raccolti nella conversazione") },
      required: ["title"],
    },
    maxCalls: 1,
    validate: build((o) => ({ title: str(o, "title", { required: true, max: 120, min: 3 }), notes: str(o, "notes", { max: 2000 }) })),
    async run(rt, i) {
      // Al massimo un'opportunità AI aperta per contatto negli ultimi 30 giorni
      const since = new Date(Date.now() - 30 * 86400_000).toISOString();
      const { data: recent } = await rt.db.from("opportunities").select("id, title").eq("lead_id", rt.lead.id).gte("created_at", since).limit(1);
      if ((recent ?? []).length) return { summary: "Opportunità già esistente", result: { existing: recent![0] } };
      const { data, error } = await rt.db
        .from("opportunities")
        .insert({ lead_id: rt.lead.id, title: i.title, notes: i.notes ?? null, probability: 20 })
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      if (rt.lead.status === "new" || rt.lead.status === "contacted") {
        await rt.db.from("leads").update({ status: "qualified", updated_at: new Date().toISOString() }).eq("id", rt.lead.id);
        rt.lead.status = "qualified";
      }
      return { summary: `Opportunità creata: ${i.title}`, result: { opportunity_id: data?.id } };
    },
  }),
  def({
    name: "update_lead",
    description: "Aggiorna lo stato del lead corrente (solo new, contacted, qualified) e/o aggiunge note.",
    input_schema: {
      type: "object",
      properties: { status: { type: "string", enum: [...AI_ALLOWED_STATUSES] }, notes_append: S("Testo da aggiungere alle note") },
    },
    maxCalls: 1,
    validate: build((o) => {
      const status = str(o, "status", { max: 20 });
      if (typeof status === "string" && !(AI_ALLOWED_STATUSES as readonly string[]).includes(status)) throw new Error("Stato non consentito all'AI");
      return { status, notes_append: str(o, "notes_append", { max: 1000 }) };
    }),
    async run(rt, i) {
      const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (i.status) patch.status = i.status;
      if (i.notes_append) patch.notes = [rt.lead.notes, `[AI ${new Date().toISOString().slice(0, 10)}] ${i.notes_append}`].filter(Boolean).join("\n");
      await rt.db.from("leads").update(patch).eq("id", rt.lead.id);
      Object.assign(rt.lead, patch);
      return { summary: `Lead aggiornato${i.status ? `: stato ${i.status}` : ""}`, result: { ok: true } };
    },
  }),
  def({
    name: "get_conversation_history",
    description: "Recupera messaggi più vecchi della conversazione corrente (oltre a quelli già nel contesto). Usalo solo se serve davvero.",
    input_schema: { type: "object", properties: { limit: { type: "integer", minimum: 1, maximum: 30 } } },
    maxCalls: 1,
    validate: build((o) => ({ limit: typeof o.limit === "number" ? Math.min(30, Math.max(1, Math.floor(o.limit))) : 20 })),
    async run(rt, i) {
      const { data } = await rt.db
        .from("social_messages")
        .select("direction, content, created_at")
        .eq("conversation_id", rt.conversation.id)
        .order("created_at", { ascending: false })
        .limit(i.limit as number);
      return { summary: `Storico: ${(data ?? []).length} messaggi`, result: (data ?? []).reverse() };
    },
  }),
  def({
    name: "get_customer_context",
    description: "Restituisce la scheda CRM del contatto corrente (dati, tag, guide ricevute, opportunità).",
    input_schema: { type: "object", properties: {} },
    maxCalls: 1,
    validate: build(() => ({})),
    async run(rt) {
      const [tags, deliveries, opps] = await Promise.all([
        getTags(rt.db, rt.lead.id),
        rt.db.from("guide_deliveries").select("guide_id, sent_at, status").eq("contact_id", rt.lead.id),
        rt.db.from("opportunities").select("title, created_at").eq("lead_id", rt.lead.id),
      ]);
      return {
        summary: "Contesto cliente letto",
        result: {
          name: rt.lead.name, email: rt.lead.email, phone: rt.lead.phone, company: rt.lead.company,
          status: rt.lead.status, score: rt.lead.score, interests: rt.lead.interests ?? [], tags,
          guides_delivered: (deliveries.data ?? []).length, opportunities: (opps.data ?? []).map((o: { title: string }) => o.title),
        },
      };
    },
  }),
  def({
    name: "find_guide",
    description: "Cerca tra le guide (lead magnet) attive quella più adatta alla richiesta.",
    input_schema: { type: "object", properties: { query: S("Argomento richiesto") }, required: ["query"] },
    maxCalls: 2,
    validate: build((o) => ({ query: str(o, "query", { required: true, max: 200 }) })),
    async run(rt, i) {
      const { data } = await rt.db.from("guides").select("*").eq("active", true);
      const q = normalize(i.query as string).split(" ").filter((w) => w.length > 2);
      const scored = ((data ?? []) as GuideRow[])
        .filter((g) => !g.platforms.length || g.platforms.includes(rt.event.platform))
        .map((g) => {
          const hay = normalize([g.name, g.description ?? "", ...g.trigger_keywords].join(" "));
          return { g, score: q.filter((w) => hay.includes(w)).length };
        })
        .sort((a, b) => b.score - a.score);
      const list = scored.slice(0, 3).map(({ g }) => ({ slug: g.slug, name: g.name, description: g.description }));
      return { summary: `Guide trovate: ${list.length}`, result: list };
    },
  }),
  def({
    name: "send_guide",
    description: "Invia una guida (per slug) all'utente corrente: DM se consentito dalla piattaforma, altrimenti risposta al commento. Registra la consegna nel CRM.",
    input_schema: { type: "object", properties: { slug: S("Slug della guida") }, required: ["slug"] },
    maxCalls: 1,
    validate: build((o) => ({ slug: str(o, "slug", { required: true, max: 120 }) })),
    async run(rt, i) {
      const { data: guide } = await rt.db.from("guides").select("*").eq("slug", i.slug).eq("active", true).maybeSingle();
      if (!guide) throw new Error("Guida non trovata o non attiva");
      const r = await rt.deliverGuide(guide as GuideRow, "ai");
      if (!r.ok) throw new Error(r.error ?? "Invio non riuscito");
      return { summary: `Guida inviata: ${(guide as GuideRow).name}`, result: { sent: true } };
    },
  }),
  def({
    name: "send_social_message",
    description: "Invia un messaggio privato AGGIUNTIVO all'utente corrente. Normalmente NON serve: la response finale viene già inviata.",
    input_schema: { type: "object", properties: { text: S("Testo del messaggio") }, required: ["text"] },
    maxCalls: 1,
    validate: build((o) => ({ text: str(o, "text", { required: true, max: 1000 }) })),
    async run(rt, i) {
      const r = await rt.sendToUser(i.text as string, { preferPrivateReply: true });
      if (!r.ok) throw new Error(r.error ?? "Invio non riuscito");
      if (r.channel !== "comment") rt.used.dm = true;
      return { summary: "Messaggio inviato", result: { channel: r.channel } };
    },
  }),
  def({
    name: "reply_to_comment",
    description: "Risponde pubblicamente al commento corrente. Normalmente NON serve: la response finale di un commento viene già pubblicata.",
    input_schema: { type: "object", properties: { text: S("Risposta pubblica breve") }, required: ["text"] },
    maxCalls: 1,
    validate: build((o) => ({ text: str(o, "text", { required: true, max: 500 }) })),
    async run(rt, i) {
      if (rt.event.kind !== "comment") throw new Error("L'evento corrente non è un commento");
      const r = await rt.replyToCurrentComment(i.text as string);
      if (!r.ok) throw new Error(r.error ?? "Invio non riuscito");
      rt.used.commentReply = true;
      return { summary: "Risposta al commento pubblicata", result: { ok: true } };
    },
  }),
  def({
    name: "request_human",
    description: "Passa la conversazione a una persona del team e sospende l'AI per questa conversazione.",
    input_schema: { type: "object", properties: { reason: S("Motivo") }, required: ["reason"] },
    maxCalls: 1,
    validate: build((o) => ({ reason: str(o, "reason", { required: true, max: 300 }) })),
    async run(rt, i) {
      await rt.requestHuman(i.reason as string, "ai");
      rt.used.handoff = true;
      return { summary: `Richiesto intervento umano: ${i.reason}`, result: { ok: true } };
    },
  }),
  def({
    name: "create_note",
    description: "Aggiunge una nota interna alla scheda del contatto corrente.",
    input_schema: { type: "object", properties: { subject: S("Oggetto"), body: S("Testo") }, required: ["subject"] },
    maxCalls: 2,
    validate: build((o) => ({ subject: str(o, "subject", { required: true, max: 200 }), body: str(o, "body", { max: 2000 }) })),
    async run(rt, i) {
      await createNote(rt.db, rt.lead.id, i.subject as string, (i.body as string | undefined) ?? null, { conversation_id: rt.conversation.id });
      return { summary: `Nota: ${i.subject}`, result: { ok: true } };
    },
  }),
  def({
    name: "notify_admin",
    description: "Invia una notifica al team (es. lead importante). Non sospende l'AI.",
    input_schema: { type: "object", properties: { title: S("Titolo"), message: S("Messaggio") }, required: ["title"] },
    maxCalls: 1,
    validate: build((o) => ({ title: str(o, "title", { required: true, max: 150 }), message: str(o, "message", { max: 1000 }) })),
    async run(rt, i) {
      await rt.notifyTeam(i.title as string, (i.message as string | undefined) ?? "");
      return { summary: `Notifica: ${i.title}`, result: { ok: true } };
    },
  }),
];

export const SUBMIT_DECISION_TOOL: Anthropic.Tool = {
  name: "submit_decision",
  description: "Decisione finale strutturata. Chiamalo una sola volta, alla fine.",
  strict: true,
  input_schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      intent: { type: "string", enum: [...INTENTS] },
      interest: { type: ["string", "null"] },
      signals: { type: "array", items: { type: "string", enum: KNOWN_SIGNALS } },
      needs_human: { type: "boolean" },
      handoff_reason: { type: ["string", "null"] },
      confidence: { type: "number" },
      response: { type: "string" },
    },
    required: ["intent", "interest", "signals", "needs_human", "handoff_reason", "confidence", "response"],
  },
};

/** Definizioni inviate a Claude (ordine stabile → prompt caching). */
export function toolDefinitions(): Anthropic.Tool[] {
  return [
    ...ACTION_TOOLS.map((t) => ({ name: t.name, description: t.description, input_schema: t.input_schema })),
    SUBMIT_DECISION_TOOL,
  ];
}

export interface ToolCallRecord {
  tool: string;
  status: "success" | "error";
  summary: string;
}

/** Esegue un tool richiesto da Claude con validazione, limiti, logging. */
export async function executeTool(
  rt: ToolRuntime,
  name: string,
  input: unknown,
  counts: Map<string, number>
): Promise<{ content: string; isError: boolean; record: ToolCallRecord }> {
  const tool = ACTION_TOOLS.find((t) => t.name === name);
  const base = { contact_id: rt.lead.id, conversation_id: rt.conversation.id, platform: rt.event.platform, action_type: name, actor: "ai" as const };
  if (!tool) {
    return { content: `Tool sconosciuto: ${name}`, isError: true, record: { tool: name, status: "error", summary: "Tool sconosciuto" } };
  }
  const n = (counts.get(name) ?? 0) + 1;
  counts.set(name, n);
  if (n > tool.maxCalls) {
    const msg = `Limite di chiamate raggiunto per ${name}`;
    await logAction(rt.db, { ...base, status: "skipped", summary: msg, input });
    return { content: msg, isError: true, record: { tool: name, status: "error", summary: msg } };
  }
  const v = tool.validate(input);
  if (!v.ok) {
    await logAction(rt.db, { ...base, status: "error", summary: "Input non valido", input, error: v.error });
    return { content: `Input non valido: ${v.error}`, isError: true, record: { tool: name, status: "error", summary: v.error } };
  }
  try {
    const { summary, result } = await tool.run(rt, v.value);
    await logAction(rt.db, { ...base, summary, input: v.value, output: result });
    return { content: JSON.stringify(result ?? { ok: true }).slice(0, 4000), isError: false, record: { tool: name, status: "success", summary } };
  } catch (e) {
    const msg = (e as Error).message;
    await logAction(rt.db, { ...base, status: "error", summary: `Errore ${name}`, input: v.value, error: msg });
    return { content: `Errore: ${msg}`, isError: true, record: { tool: name, status: "error", summary: msg } };
  }
}

/** Valida l'output di submit_decision (output validation). */
export function parseDecisionInput(input: unknown): {
  intent: (typeof INTENTS)[number];
  interest: string | null;
  signals: string[];
  needs_human: boolean;
  handoff_reason: string | null;
  confidence: number;
  response: string;
} | null {
  const o = obj(input);
  if (!o) return null;
  const intent = (INTENTS as readonly string[]).includes(String(o.intent)) ? (o.intent as (typeof INTENTS)[number]) : "other";
  const signals = Array.isArray(o.signals) ? (o.signals as unknown[]).filter((s): s is string => typeof s === "string" && KNOWN_SIGNALS.includes(s)) : [];
  const confidence = typeof o.confidence === "number" && Number.isFinite(o.confidence) ? Math.max(0, Math.min(1, o.confidence)) : 0;
  if (typeof o.response !== "string" || typeof o.needs_human !== "boolean") return null;
  return {
    intent,
    interest: typeof o.interest === "string" && o.interest.trim() ? o.interest.trim().slice(0, 80) : null,
    signals,
    needs_human: o.needs_human,
    handoff_reason: typeof o.handoff_reason === "string" && o.handoff_reason.trim() ? o.handoff_reason.trim().slice(0, 300) : null,
    confidence,
    response: o.response.trim(),
  };
}
