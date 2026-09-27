"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  deleteGuide,
  deleteKnowledge,
  deleteRule,
  disconnectAccount,
  saveGuide,
  saveKnowledge,
  saveRule,
  saveSettings,
  toggleRule,
  type ActionResult,
} from "@/app/crm/(app)/social/actions";
import { btnGhost, btnPrimary, inputCls, labelCls } from "./ui";

function Feedback({ state }: { state: ActionResult | null }) {
  if (!state) return null;
  return state.ok ? <p className="text-green-400 text-xs">Salvato.</p> : <p className="text-[#E63B2E] text-xs">{state.error}</p>;
}

function Check({ name, label, defaultChecked }: { name: string; label: string; defaultChecked?: boolean }) {
  return (
    <label className="flex items-center gap-2 text-sm text-white/60 cursor-pointer select-none">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="accent-[#E63B2E] w-4 h-4" />
      {label}
    </label>
  );
}

function useResetOnSuccess(state: ActionResult | null, reset: boolean) {
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.ok && reset) ref.current?.reset();
  }, [state, reset]);
  return ref;
}

export function DeleteButton({ action, confirmText }: { action: () => Promise<ActionResult>; confirmText: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!confirm(confirmText)) return;
        start(async () => {
          await action();
          router.refresh();
        });
      }}
      className="text-white/30 hover:text-[#E63B2E] text-xs disabled:opacity-40"
    >
      Elimina
    </button>
  );
}

/* ─── Guide ─────────────────────────────────────────────────── */

export interface GuideFormValue {
  id?: string;
  name?: string;
  slug?: string;
  description?: string | null;
  url?: string;
  active?: boolean;
  trigger_keywords?: string[];
  platforms?: string[];
}

export function GuideForm({ guide, onDone }: { guide?: GuideFormValue; onDone?: () => void }) {
  const [state, action, pending] = useActionState(saveGuide, null);
  const ref = useResetOnSuccess(state, !guide?.id);
  useEffect(() => {
    if (state?.ok) onDone?.();
  }, [state, onDone]);
  const platforms = guide?.platforms ?? ["instagram", "facebook", "linkedin", "tiktok"];
  return (
    <form ref={ref} action={action} className="space-y-3">
      {guide?.id && <input type="hidden" name="id" value={guide.id} />}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div><label className={labelCls}>Nome</label><input name="name" required defaultValue={guide?.name} className={inputCls} placeholder="Checklist sito web PMI" /></div>
        <div><label className={labelCls}>Slug</label><input name="slug" defaultValue={guide?.slug} className={inputCls} placeholder="(automatico dal nome)" /></div>
      </div>
      <div><label className={labelCls}>URL</label><input name="url" required type="url" defaultValue={guide?.url} className={inputCls} placeholder="https://diecibottega.it/guide/…" /></div>
      <div><label className={labelCls}>Descrizione</label><textarea name="description" rows={2} defaultValue={guide?.description ?? ""} className={`${inputCls} resize-none`} /></div>
      <div>
        <label className={labelCls}>Trigger keywords (separate da virgola)</label>
        <input name="keywords" defaultValue={guide?.trigger_keywords?.join(", ")} className={inputCls} placeholder="guida, guida sito, checklist" />
        <p className="text-white/25 text-[11px] mt-1">Un messaggio breve che è essenzialmente una keyword (es. &quot;GUIDA&quot;) invia la guida senza chiamare Claude. Frasi più complesse passano all&apos;AI.</p>
      </div>
      <div className="flex flex-wrap gap-4">
        {["instagram", "facebook", "linkedin", "tiktok"].map((p) => <Check key={p} name={`p_${p}`} label={p} defaultChecked={platforms.includes(p)} />)}
      </div>
      <div className="flex items-center justify-between gap-3">
        <Check name="active" label="Attiva" defaultChecked={guide?.active ?? true} />
        <div className="flex items-center gap-3"><Feedback state={state} /><button disabled={pending} className={btnPrimary}>{pending ? "Salvataggio…" : guide?.id ? "Salva" : "Crea guida"}</button></div>
      </div>
    </form>
  );
}

export function EditableGuide({ guide, children }: { guide: GuideFormValue; children: React.ReactNode }) {
  const [editing, setEditing] = useState(false);
  return (
    <div className="px-5 py-4">
      {editing ? <GuideForm guide={guide} onDone={() => setEditing(false)} /> : children}
      <div className="flex gap-3 mt-2">
        <button type="button" onClick={() => setEditing(!editing)} className="text-white/30 hover:text-white/60 text-xs">{editing ? "Annulla" : "Modifica"}</button>
        {!editing && guide.id && <DeleteButton action={() => deleteGuide(guide.id!)} confirmText={`Eliminare la guida "${guide.name}"?`} />}
      </div>
    </div>
  );
}

/* ─── Automazioni ──────────────────────────────────────────── */

export const TRIGGER_LABEL: Record<string, string> = {
  comment_keyword: "Commento contiene",
  dm_keyword: "DM contiene",
  any_keyword: "Commento o DM contiene",
  intent: "L'AI rileva intent",
  lead_score_above: "Lead score supera",
};
export const ACTION_LABEL: Record<string, string> = {
  send_guide: "Invia guida",
  ai_qualification: "Qualificazione AI",
  notify_admin: "Notifica admin",
  human_takeover: "Passa a umano",
  add_tag: "Aggiungi tag",
  reply_text: "Risposta fissa",
};

export function RuleForm({ guides }: { guides: { id: string; name: string }[] }) {
  const [state, action, pending] = useActionState(saveRule, null);
  const ref = useResetOnSuccess(state, true);
  const [trigger, setTrigger] = useState("comment_keyword");
  const [act, setAct] = useState("send_guide");
  return (
    <form ref={ref} action={action} className="space-y-3">
      <div><label className={labelCls}>Nome</label><input name="name" className={inputCls} placeholder="Commento GUIDA → Checklist sito" /></div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className={labelCls}>Trigger</label>
          <select name="trigger_type" value={trigger} onChange={(e) => setTrigger(e.target.value)} className={inputCls}>
            {Object.entries(TRIGGER_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className={labelCls}>{trigger === "lead_score_above" ? "Soglia (0–100)" : trigger === "intent" ? "Intent (es. pricing, consultation)" : "Keyword (separate da virgola)"}</label>
          <input name="trigger_value" required className={inputCls} placeholder={trigger === "lead_score_above" ? "80" : trigger === "intent" ? "pricing" : "GUIDA"} />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className={labelCls}>Azione</label>
          <select name="action_type" value={act} onChange={(e) => setAct(e.target.value)} className={inputCls}>
            {Object.entries(ACTION_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Piattaforma</label>
          <select name="platform" className={inputCls} defaultValue="all">
            <option value="all">Tutte</option><option value="instagram">Instagram</option><option value="facebook">Facebook</option><option value="linkedin">LinkedIn</option><option value="tiktok">TikTok</option>
          </select>
        </div>
        <div><label className={labelCls}>Priorità</label><input name="priority" type="number" defaultValue={100} min={1} max={1000} className={inputCls} /></div>
      </div>
      {act === "send_guide" && (
        <div>
          <label className={labelCls}>Guida</label>
          <select name="guide_id" className={inputCls} required>
            <option value="">— Seleziona —</option>
            {guides.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
        </div>
      )}
      {act === "reply_text" && <div><label className={labelCls}>Testo risposta</label><input name="reply_text" className={inputCls} /></div>}
      {act === "add_tag" && <div><label className={labelCls}>Tag</label><input name="tag" className={inputCls} placeholder="interesse-prezzi" /></div>}
      {act === "ai_qualification" && <div><label className={labelCls}>Indicazione per Claude (opzionale)</label><input name="hint" className={inputCls} placeholder="Chiedi tipo di attività e tempistiche" /></div>}
      {act === "notify_admin" && <Check name="takeover" label="Attiva anche human takeover" />}
      <div className="flex items-center justify-between">
        <Check name="enabled" label="Attiva" defaultChecked />
        <div className="flex items-center gap-3"><Feedback state={state} /><button disabled={pending} className={btnPrimary}>{pending ? "Salvataggio…" : "Crea automazione"}</button></div>
      </div>
    </form>
  );
}

export function RuleRowControls({ id, enabled, name }: { id: string; enabled: boolean; name: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <div className="flex items-center gap-3 shrink-0">
      <button
        type="button"
        disabled={pending}
        onClick={() => start(async () => { await toggleRule(id, !enabled); router.refresh(); })}
        className={`text-xs px-2 py-0.5 rounded-full font-medium ${enabled ? "bg-green-500/10 text-green-400" : "bg-white/[0.06] text-white/30"}`}
      >
        {enabled ? "Attiva" : "Inattiva"}
      </button>
      <DeleteButton action={() => deleteRule(id)} confirmText={`Eliminare "${name}"?`} />
    </div>
  );
}

/* ─── Knowledge ────────────────────────────────────────────── */

export const KNOWLEDGE_CATEGORIES: Record<string, string> = {
  company: "Informazioni azienda",
  services: "Servizi",
  pricing: "Prezzi",
  faq: "FAQ",
  case_study: "Case study",
  portfolio: "Portfolio",
  policy: "Policy",
  tone: "Tono di voce",
  rules: "Regole AI / commerciali",
};

export interface KnowledgeValue { id?: string; category?: string; title?: string; content?: string; active?: boolean; position?: number }

export function KnowledgeForm({ item, onDone }: { item?: KnowledgeValue; onDone?: () => void }) {
  const [state, action, pending] = useActionState(saveKnowledge, null);
  const ref = useResetOnSuccess(state, !item?.id);
  useEffect(() => {
    if (state?.ok) onDone?.();
  }, [state, onDone]);
  return (
    <form ref={ref} action={action} className="space-y-3">
      {item?.id && <input type="hidden" name="id" value={item.id} />}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className={labelCls}>Categoria</label>
          <select name="category" defaultValue={item?.category ?? "services"} className={inputCls}>
            {Object.entries(KNOWLEDGE_CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <div className="sm:col-span-2"><label className={labelCls}>Titolo</label><input name="title" required defaultValue={item?.title} className={inputCls} /></div>
      </div>
      <div><label className={labelCls}>Contenuto</label><textarea name="content" required rows={6} defaultValue={item?.content} className={`${inputCls} font-mono text-xs`} /></div>
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-4">
          <Check name="active" label="Attiva" defaultChecked={item?.active ?? true} />
          <label className="flex items-center gap-2 text-sm text-white/40">Ordine <input name="position" type="number" defaultValue={item?.position ?? 100} className={`${inputCls} w-20`} /></label>
        </div>
        <div className="flex items-center gap-3"><Feedback state={state} /><button disabled={pending} className={btnPrimary}>{pending ? "Salvataggio…" : item?.id ? "Salva" : "Aggiungi"}</button></div>
      </div>
    </form>
  );
}

export function EditableKnowledge({ item, children }: { item: KnowledgeValue; children: React.ReactNode }) {
  const [editing, setEditing] = useState(false);
  return (
    <div className="px-5 py-4">
      {editing ? <KnowledgeForm item={item} onDone={() => setEditing(false)} /> : children}
      <div className="flex gap-3 mt-2">
        <button type="button" onClick={() => setEditing(!editing)} className="text-white/30 hover:text-white/60 text-xs">{editing ? "Annulla" : "Modifica"}</button>
        {!editing && item.id && <DeleteButton action={() => deleteKnowledge(item.id!)} confirmText={`Eliminare "${item.title}"?`} />}
      </div>
    </div>
  );
}

/* ─── Impostazioni ─────────────────────────────────────────── */

export interface SettingsValue {
  ai_enabled: boolean; auto_reply_enabled: boolean; auto_reply_comments: boolean; auto_reply_dms: boolean; auto_send_guides: boolean;
  lead_scoring_enabled: boolean; human_handoff_enabled: boolean; model: string | null; max_response_chars: number; brand_tone: string | null;
  confidence_threshold: number; history_limit: number; summarize_after: number; max_ai_calls_per_hour: number; system_prompt: string | null;
  handoff_message: string; comment_guide_reply: string; scoring_config: Record<string, unknown>;
}

export function SettingsForm({ value, envModel, defaultPrompt, defaultScoring, isAdmin }: { value: SettingsValue; envModel: string; defaultPrompt: string; defaultScoring: string; isAdmin: boolean }) {
  const [state, action, pending] = useActionState(saveSettings, null);
  return (
    <form action={action} className="space-y-5">
      <fieldset disabled={!isAdmin} className="space-y-5 disabled:opacity-60">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Check name="ai_enabled" label="AI enabled (usa Claude)" defaultChecked={value.ai_enabled} />
          <Check name="auto_reply_enabled" label="AI auto reply enabled (qualsiasi risposta automatica)" defaultChecked={value.auto_reply_enabled} />
          <Check name="auto_reply_comments" label="Auto reply comments" defaultChecked={value.auto_reply_comments} />
          <Check name="auto_reply_dms" label="Auto reply DMs" defaultChecked={value.auto_reply_dms} />
          <Check name="auto_send_guides" label="Auto send guides" defaultChecked={value.auto_send_guides} />
          <Check name="lead_scoring_enabled" label="Lead scoring" defaultChecked={value.lead_scoring_enabled} />
          <Check name="human_handoff_enabled" label="Human handoff" defaultChecked={value.human_handoff_enabled} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className={labelCls}>Default AI model</label>
            <input name="model" defaultValue={value.model ?? ""} className={inputCls} placeholder={envModel} />
            <p className="text-white/25 text-[11px] mt-1">Vuoto = ANTHROPIC_MODEL ({envModel})</p>
          </div>
          <div><label className={labelCls}>Max response length (caratteri)</label><input name="max_response_chars" type="number" min={80} max={2000} defaultValue={value.max_response_chars} className={inputCls} /></div>
          <div><label className={labelCls}>Confidence threshold (0–1)</label><input name="confidence_threshold" type="number" step="0.05" min={0} max={1} defaultValue={value.confidence_threshold} className={inputCls} /></div>
          <div><label className={labelCls}>Messaggi di storico inviati a Claude</label><input name="history_limit" type="number" min={2} max={50} defaultValue={value.history_limit} className={inputCls} /></div>
          <div><label className={labelCls}>Riassumi dopo N messaggi fuori contesto</label><input name="summarize_after" type="number" min={10} max={500} defaultValue={value.summarize_after} className={inputCls} /></div>
          <div><label className={labelCls}>Max chiamate AI / ora / conversazione</label><input name="max_ai_calls_per_hour" type="number" min={1} max={500} defaultValue={value.max_ai_calls_per_hour} className={inputCls} /></div>
        </div>
        <div><label className={labelCls}>Brand tone</label><textarea name="brand_tone" rows={3} defaultValue={value.brand_tone ?? ""} className={`${inputCls} resize-y`} placeholder="Diretto, concreto, artigiano. Dai del tu." /></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div><label className={labelCls}>Messaggio di handoff (inviato quando serve un umano)</label><input name="handoff_message" defaultValue={value.handoff_message} className={inputCls} /></div>
          <div><label className={labelCls}>Risposta pubblica quando si invia una guida in DM</label><input name="comment_guide_reply" defaultValue={value.comment_guide_reply} className={inputCls} /></div>
        </div>
        <details className="group">
          <summary className="text-white/50 text-sm cursor-pointer">System prompt (lascia vuoto per usare quello di default)</summary>
          <textarea name="system_prompt" rows={14} defaultValue={value.system_prompt ?? ""} placeholder={defaultPrompt} className={`${inputCls} font-mono text-xs mt-2`} />
        </details>
        <details>
          <summary className="text-white/50 text-sm cursor-pointer">Lead scoring (JSON, vuoto = default documentati)</summary>
          <textarea name="scoring_config" rows={10} defaultValue={Object.keys(value.scoring_config ?? {}).length ? JSON.stringify(value.scoring_config, null, 2) : ""} placeholder={defaultScoring} className={`${inputCls} font-mono text-xs mt-2`} />
        </details>
      </fieldset>
      <div className="flex items-center justify-end gap-3">
        <Feedback state={state} />
        {isAdmin ? <button disabled={pending} className={btnPrimary}>{pending ? "Salvataggio…" : "Salva impostazioni"}</button> : <span className="text-white/30 text-xs">Solo gli admin possono modificare.</span>}
      </div>
    </form>
  );
}

export function DisconnectButton({ id, name }: { id: string; name: string }) {
  return <DeleteButtonLike label="Scollega" action={() => disconnectAccount(id)} confirmText={`Scollegare ${name}? Il token verrà eliminato.`} />;
}

function DeleteButtonLike({ label, action, confirmText }: { label: string; action: () => Promise<ActionResult>; confirmText: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <button type="button" disabled={pending} className={btnGhost} onClick={() => { if (confirm(confirmText)) start(async () => { await action(); router.refresh(); }); }}>
      {label}
    </button>
  );
}
