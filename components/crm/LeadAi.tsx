"use client";

/** Assistente AI e composizione email nella scheda contatto. */
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { aiAssist, sendEmailToLead } from "@/app/crm/(app)/leads/ai-actions";
import { fillTemplate, type TemplateVars } from "@/lib/crm/email";
import { whatsappNumber } from "./ContactButtons";

const inputCls =
  "w-full bg-[#1a1a1a] border border-white/[0.08] rounded-lg px-3 py-2 text-white/85 text-sm placeholder:text-white/20 focus:outline-none focus:border-[#E63B2E]/50 transition-colors";
const chip = "flex-1 min-w-[120px] bg-white/[0.05] hover:bg-white/[0.1] text-white/75 text-xs font-medium rounded-lg py-2 px-2 transition-colors disabled:opacity-40";

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
}

export function LeadAiCard({
  leadId,
  phone,
  email,
  templates,
  vars,
}: {
  leadId: string;
  phone: string | null;
  email: string | null;
  templates: EmailTemplate[];
  vars: TemplateVars;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [busy, setBusy] = useState<string | null>(null);
  const [out, setOut] = useState<{ kind: string; text: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [composer, setComposer] = useState<{ subject: string; body: string; v: number } | null>(null);
  const wa = phone ? whatsappNumber(phone) : null;

  function run(task: "whatsapp" | "email" | "summary" | "score") {
    setBusy(task);
    setError(null);
    start(async () => {
      const r = await aiAssist(leadId, task);
      setBusy(null);
      if (!r.ok || !r.text) return setError(r.error ?? "Errore");
      if (task === "email") {
        const text = r.text;
        const m = text.match(/^Oggetto:\s*(.+)\n+([\s\S]*)$/i);
        setComposer((c) => ({ subject: m?.[1]?.trim() ?? "", body: (m?.[2] ?? text).trim(), v: (c?.v ?? 0) + 1 }));
        return;
      }
      setOut({ kind: task, text: r.text });
      if (task === "score" || task === "summary") router.refresh();
    });
  }

  return (
    <div className="bg-[#141414] border border-white/[0.06] rounded-xl p-5 space-y-3">
      <h3 className="text-white/50 text-xs font-semibold uppercase tracking-wider">✨ Assistente AI</h3>
      <div className="flex flex-wrap gap-2">
        {wa && <button type="button" disabled={pending} onClick={() => run("whatsapp")} className={chip}>{busy === "whatsapp" ? "Scrivo…" : "💬 Bozza WhatsApp"}</button>}
        {email && <button type="button" disabled={pending} onClick={() => run("email")} className={chip}>{busy === "email" ? "Scrivo…" : "✉️ Bozza email"}</button>}
        <button type="button" disabled={pending} onClick={() => run("summary")} className={chip}>{busy === "summary" ? "Leggo…" : "📋 Riassunto"}</button>
        <button type="button" disabled={pending} onClick={() => run("score")} className={chip}>{busy === "score" ? "Valuto…" : "🎯 Valuta"}</button>
      </div>
      {email && (
        <button type="button" onClick={() => setComposer({ subject: "", body: "", v: 0 })} className="w-full bg-[#E63B2E] hover:bg-[#C44A38] text-white text-xs font-semibold rounded-lg py-2 transition-colors">
          Scrivi email
        </button>
      )}
      {error && <p className="text-[#E63B2E] text-xs">{error}</p>}
      {out && (
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-3 space-y-2">
          <p className="text-white/75 text-sm whitespace-pre-wrap leading-relaxed">{out.text}</p>
          {out.kind === "whatsapp" && wa && (
            <div className="flex gap-2">
              <a href={`https://wa.me/${wa}?text=${encodeURIComponent(out.text)}`} target="_blank" rel="noopener noreferrer" className="flex-1 text-center bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#4be283] text-xs font-semibold rounded-lg py-2">
                Apri in WhatsApp
              </a>
              <button type="button" onClick={() => navigator.clipboard?.writeText(out.text)} className="bg-white/[0.06] hover:bg-white/[0.1] text-white/70 text-xs rounded-lg px-3">Copia</button>
            </div>
          )}
          {(out.kind === "summary" || out.kind === "score") && <p className="text-white/30 text-[11px]">Salvato nello storico attività.</p>}
        </div>
      )}
      {composer && (
        <EmailComposer key={composer.v} leadId={leadId} to={email!} templates={templates} vars={vars} initial={composer} onClose={() => setComposer(null)} onAi={() => run("email")} aiBusy={busy === "email"} />
      )}
    </div>
  );
}

function EmailComposer({
  leadId,
  to,
  templates,
  vars,
  initial,
  onClose,
  onAi,
  aiBusy,
}: {
  leadId: string;
  to: string;
  templates: EmailTemplate[];
  vars: TemplateVars;
  initial: { subject: string; body: string };
  onClose: () => void;
  onAi: () => void;
  aiBusy: boolean;
}) {
  const router = useRouter();
  const [subject, setSubject] = useState(initial.subject);
  const [body, setBody] = useState(initial.body);
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  return (
    <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full sm:max-w-xl bg-[#141414] border border-white/[0.08] rounded-t-2xl sm:rounded-2xl p-5 space-y-3 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <p className="text-white font-semibold">Email a {to}</p>
          <button type="button" onClick={onClose} className="text-white/40 hover:text-white text-lg leading-none">✕</button>
        </div>
        <div className="flex gap-2">
          <select
            defaultValue=""
            onChange={(e) => {
              const t = templates.find((x) => x.id === e.target.value);
              if (t) {
                setSubject(fillTemplate(t.subject, vars));
                setBody(fillTemplate(t.body, vars));
              }
            }}
            className={`${inputCls} flex-1`}
          >
            <option value="">Usa un modello…</option>
            {templates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <button type="button" onClick={onAi} disabled={aiBusy} className="shrink-0 bg-white/[0.08] hover:bg-white/[0.14] text-white/80 text-xs font-semibold rounded-lg px-3 disabled:opacity-40">
            {aiBusy ? "Scrivo…" : "✨ Scrivi con AI"}
          </button>
        </div>
        <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Oggetto" className={inputCls} />
        <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={12} placeholder="Testo dell'email…" className={`${inputCls} resize-y leading-relaxed`} />
        <p className="text-white/30 text-[11px]">Parte da crm@diecibottega.it con il tuo nome; le risposte arrivano alla tua email.</p>
        {msg && <p className={`text-xs ${msg.ok ? "text-green-400" : "text-[#E63B2E]"}`}>{msg.text}</p>}
        <div className="flex gap-2 justify-end">
          <button type="button" onClick={onClose} className="text-white/50 hover:text-white text-sm px-3 py-2">Annulla</button>
          <button
            type="button"
            disabled={pending || !subject.trim() || !body.trim()}
            onClick={() =>
              start(async () => {
                const r = await sendEmailToLead(leadId, subject, body);
                if (!r.ok) return setMsg({ ok: false, text: r.error ?? "Errore" });
                setMsg({ ok: true, text: "Email inviata ✓" });
                router.refresh();
                setTimeout(onClose, 900);
              })
            }
            className="bg-[#E63B2E] hover:bg-[#C44A38] disabled:opacity-40 text-white text-sm font-semibold px-4 py-2 rounded-lg"
          >
            {pending ? "Invio…" : "Invia"}
          </button>
        </div>
      </div>
    </div>
  );
}
