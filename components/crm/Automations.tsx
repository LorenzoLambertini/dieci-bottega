"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createAutomation, deleteAutomation, toggleAutomation } from "@/app/crm/(app)/automations/actions";

const input = "w-full bg-[#1a1a1a] border border-white/[0.08] rounded-lg px-3 py-2 text-white/85 text-sm focus:outline-none focus:border-[#E63B2E]/50";

export function AutomationToggle({ id, active, table }: { id: string; active: boolean; table?: "crm_automations" | "workflows" }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => start(async () => { await toggleAutomation(id, !active, table); router.refresh(); })}
      className={`relative w-10 h-6 rounded-full transition-colors shrink-0 ${active ? "bg-green-500/70" : "bg-white/10"}`}
      aria-label={active ? "Disattiva" : "Attiva"}
    >
      <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${active ? "left-5" : "left-1"}`} />
    </button>
  );
}

export function AutomationDelete({ id }: { id: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <button type="button" disabled={pending} onClick={() => { if (confirm("Eliminare questa automazione?")) start(async () => { await deleteAutomation(id); router.refresh(); }); }} className="text-white/25 hover:text-[#E63B2E] text-xs">
      Elimina
    </button>
  );
}

export function NewAutomationForm({ stages, people }: { stages: string[]; people: { id: string; name: string }[] }) {
  const [state, action, pending] = useActionState(createAutomation, null);
  const [kind, setKind] = useState("follow_up");
  const [when, setWhen] = useState("lead_created");
  const form = useRef<HTMLFormElement>(null);
  const router = useRouter();
  useEffect(() => {
    if (state?.ok) { form.current?.reset(); router.refresh(); }
  }, [state, router]);
  return (
    <form ref={form} action={action} className="bg-[#141414] border border-white/[0.06] rounded-xl p-5 space-y-3">
      <p className="text-white font-semibold text-sm">+ Nuova automazione</p>
      <input name="name" placeholder="Nome (es. Lead da Instagram → tag)" className={input} />
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="text-white/30 text-xs uppercase tracking-wider block mb-1.5">Quando</label>
          <select name="when" value={when} onChange={(e) => setWhen(e.target.value)} className={input}>
            <option value="lead_created">Arriva un nuovo contatto</option>
            <optgroup label="Lo stato diventa">
              <option value="status:contacted">Contattato</option>
              <option value="status:qualified">Qualificato</option>
              <option value="status:proposal">Proposta inviata</option>
              <option value="status:won">Vinto</option>
              <option value="status:lost">Perso</option>
            </optgroup>
            <optgroup label="Entra nello stage">
              {stages.map((s) => <option key={s} value={`stage:${s}`}>{s}</option>)}
            </optgroup>
          </select>
        </div>
        <div>
          <label className="text-white/30 text-xs uppercase tracking-wider block mb-1.5">Allora</label>
          <select name="action" value={kind} onChange={(e) => setKind(e.target.value)} className={input}>
            <option value="follow_up">Imposta un promemoria</option>
            <option value="add_tag">Aggiungi un tag</option>
            <option value="assign">Assegna a una persona</option>
            <option value="create_project">Crea il progetto</option>
          </select>
        </div>
      </div>
      {when === "lead_created" && (
        <div className="flex flex-wrap gap-3 text-xs text-white/50">
          <span className="text-white/30">Solo se arriva da:</span>
          {["website", "chatbot", "manuale", "instagram", "facebook", "linkedin", "tiktok"].map((s) => (
            <label key={s} className="flex items-center gap-1"><input type="checkbox" name="source" value={s} className="accent-[#E63B2E]" /> {s}</label>
          ))}
          <span className="text-white/25">(nessuna spunta = tutti)</span>
        </div>
      )}
      {kind === "follow_up" && (
        <div className="grid grid-cols-[100px_1fr] gap-3">
          <input name="days" type="number" min={0} max={90} defaultValue={1} className={input} aria-label="Giorni" />
          <input name="note" placeholder="Nota (es. Mandare preventivo)" className={input} />
        </div>
      )}
      {kind === "add_tag" && <input name="tag" placeholder="Tag (es. instagram, caldo)" className={input} />}
      {kind === "assign" && (
        <select name="user_id" className={input} defaultValue="">
          <option value="" disabled>Chi se ne occupa?</option>
          {people.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      )}
      {state && !state.ok && <p className="text-[#E63B2E] text-xs">{state.error}</p>}
      <button type="submit" disabled={pending} className="bg-[#E63B2E] hover:bg-[#C44A38] disabled:opacity-40 text-white text-sm font-semibold px-4 py-2 rounded-lg">
        {pending ? "Salvataggio…" : "Crea automazione"}
      </button>
    </form>
  );
}
