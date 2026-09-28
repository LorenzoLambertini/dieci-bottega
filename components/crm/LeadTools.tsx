"use client";

/**
 * Strumenti della scheda contatto: modifica dati, promemoria, opportunità.
 * Stesso stile del CRM (card #141414, accento #E63B2E).
 */
import { useActionState, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setAppointment, addLeadTag, addOpportunity, createLead, deleteOpportunity, deleteTag, removeLeadTag, sendDigestNow, setFollowUp, updateLeadContact, type FormState } from "@/app/crm/(app)/leads/actions";

export const inputCls =
  "w-full bg-[#1a1a1a] border border-white/[0.08] rounded-lg px-3 py-2 text-white/85 text-sm placeholder:text-white/20 focus:outline-none focus:border-[#E63B2E]/50 transition-colors";
const labelCls = "text-white/30 text-xs uppercase tracking-wider block mb-1.5";
const primaryBtn =
  "bg-[#E63B2E] hover:bg-[#C44A38] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors";
const ghostBtn = "text-white/50 hover:text-white text-sm px-3 py-2 transition-colors";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      {children}
    </div>
  );
}

function ErrorLine({ state }: { state: FormState }) {
  return state && !state.ok ? <p className="text-[#E63B2E] text-xs">{state.error}</p> : null;
}

/* ─── Nuovo contatto ─────────────────────────────────────── */

export function NewLeadForm() {
  const [state, action, pending] = useActionState(createLead, null);
  return (
    <form action={action} className="bg-[#141414] border border-white/[0.06] rounded-xl p-5 lg:p-6 space-y-4 max-w-2xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Nome e cognome *"><input name="name" required autoFocus className={inputCls} placeholder="Mario Rossi" /></Field>
        <Field label="Azienda / attività"><input name="company" className={inputCls} placeholder="Trattoria da Mario" /></Field>
        <Field label="Telefono"><input name="phone" type="tel" inputMode="tel" className={inputCls} placeholder="+39 333 1234567" /></Field>
        <Field label="Email"><input name="email" type="email" inputMode="email" className={inputCls} placeholder="mario@esempio.it" /></Field>
        <Field label="Sito web"><input name="website" className={inputCls} placeholder="trattoriadamario.it" /></Field>
        <Field label="Segnalato da (se passaparola)"><input name="referred_by" className={inputCls} placeholder="es. Marco del Bar Centrale" /></Field>
        <Field label="Da dove arriva">
          <select name="source" defaultValue="manuale" className={inputCls}>
            <option value="manuale">Inserito a mano</option>
            <option value="passaparola">Passaparola</option>
            <option value="telefono">Telefono</option>
            <option value="instagram">Instagram</option>
            <option value="facebook">Facebook</option>
            <option value="linkedin">LinkedIn</option>
            <option value="tiktok">TikTok</option>
            <option value="evento">Evento</option>
            <option value="altro">Altro</option>
          </select>
        </Field>
      </div>
      <Field label="Note"><textarea name="notes" rows={3} className={`${inputCls} resize-none`} placeholder="Cosa gli serve, budget, tempi…" /></Field>
      <Field label="Promemoria per ricontattarlo">
        <select name="follow_days" defaultValue="1" className={inputCls}>
          <option value="0">Nessun promemoria</option>
          <option value="1">Domani</option>
          <option value="3">Tra 3 giorni</option>
          <option value="7">Tra una settimana</option>
        </select>
      </Field>
      <ErrorLine state={state} />
      <div className="flex gap-2">
        <button type="submit" disabled={pending} className={primaryBtn}>{pending ? "Salvataggio…" : "Crea contatto"}</button>
      </div>
    </form>
  );
}

/* ─── Modifica dati contatto ─────────────────────────────── */

export interface EditableLead {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  website: string | null;
  notes: string | null;
  referred_by?: string | null;
  marketing_consent?: boolean | null;
  do_not_contact?: boolean;
}

export function EditContactButton({ lead }: { lead: EditableLead }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(updateLeadContact, null);
  const router = useRouter();
  useEffect(() => {
    if (state?.ok) {
      setOpen(false);
      router.refresh();
    }
  }, [state, router]);

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="text-white/40 hover:text-white text-xs border border-white/[0.08] hover:border-white/20 rounded-lg px-3 py-1.5 transition-colors">
        ✎ Modifica
      </button>
    );
  }
  return (
    <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => setOpen(false)}>
      <form
        action={action}
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-lg bg-[#141414] border border-white/[0.08] rounded-t-2xl sm:rounded-2xl p-5 space-y-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between">
          <p className="text-white font-semibold">Modifica contatto</p>
          <button type="button" onClick={() => setOpen(false)} className="text-white/40 hover:text-white text-lg leading-none">✕</button>
        </div>
        <input type="hidden" name="id" value={lead.id} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Nome *"><input name="name" required defaultValue={lead.name} className={inputCls} /></Field>
          <Field label="Azienda"><input name="company" defaultValue={lead.company ?? ""} className={inputCls} /></Field>
          <Field label="Telefono"><input name="phone" type="tel" inputMode="tel" defaultValue={lead.phone ?? ""} className={inputCls} /></Field>
          <Field label="Email"><input name="email" type="email" inputMode="email" defaultValue={lead.email ?? ""} className={inputCls} /></Field>
        </div>
        <Field label="Sito web"><input name="website" defaultValue={lead.website ?? ""} className={inputCls} /></Field>
        <Field label="Note"><textarea name="notes" rows={4} defaultValue={lead.notes ?? ""} className={`${inputCls} resize-none`} /></Field>
        <Field label="Segnalato da (passaparola)"><input name="referred_by" defaultValue={lead.referred_by ?? ""} placeholder="es. Marco del Bar Centrale" className={inputCls} /></Field>
        <div className="space-y-2 text-sm text-white/70">
          <label className="flex items-center gap-2"><input type="checkbox" name="marketing_consent" defaultChecked={!!lead.marketing_consent} className="accent-[#E63B2E]" /> Consenso a ricevere comunicazioni commerciali</label>
          <label className="flex items-center gap-2"><input type="checkbox" name="do_not_contact" defaultChecked={!!lead.do_not_contact} className="accent-[#E63B2E]" /> ⛔ Non contattare (ha chiesto di non essere ricontattato)</label>
        </div>
        <ErrorLine state={state} />
        <div className="flex gap-2 justify-end">
          <button type="button" onClick={() => setOpen(false)} className={ghostBtn}>Annulla</button>
          <button type="submit" disabled={pending} className={primaryBtn}>{pending ? "Salvataggio…" : "Salva"}</button>
        </div>
      </form>
    </div>
  );
}

/* ─── Promemoria ─────────────────────────────────────────── */

function atHour(daysFromNow: number, hour = 9): Date {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(hour, 0, 0, 0);
  return d;
}
function toLocalInput(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

export function FollowUpCard({ leadId, at, note }: { leadId: string; at: string | null; note: string | null }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [custom, setCustom] = useState(at ? toLocalInput(new Date(at)) : "");
  const [text, setText] = useState(note ?? "");
  const [error, setError] = useState<string | null>(null);
  const when = at ? new Date(at) : null;
  const overdue = when ? when.getTime() < Date.now() : false;

  function save(d: Date | null) {
    start(async () => {
      setError(null);
      const r = await setFollowUp(leadId, d ? d.toISOString() : null, text);
      if (r && !r.ok) setError(r.error ?? "Errore");
      else router.refresh();
    });
  }

  return (
    <div className="bg-[#141414] border border-white/[0.06] rounded-xl p-5 space-y-3">
      <h3 className="text-white/50 text-xs font-semibold uppercase tracking-wider">Promemoria</h3>
      {when ? (
        <div className={`rounded-lg px-3 py-2.5 border ${overdue ? "bg-[#E63B2E]/10 border-[#E63B2E]/25" : "bg-white/[0.03] border-white/[0.06]"}`}>
          <p className={`text-sm font-semibold ${overdue ? "text-[#E63B2E]" : "text-white/80"}`}>
            {overdue ? "Scaduto · " : ""}
            {when.toLocaleString("it-IT", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
          </p>
          {note && <p className="text-white/45 text-xs mt-0.5">{note}</p>}
        </div>
      ) : (
        <p className="text-white/30 text-xs">Nessun promemoria. Impostane uno per non dimenticarti di ricontattarlo.</p>
      )}
      <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Cosa fare (es. mandare preventivo)" className={inputCls} />
      <div className="grid grid-cols-3 gap-2">
        {[
          ["Domani", 1],
          ["3 giorni", 3],
          ["1 settimana", 7],
        ].map(([label, d]) => (
          <button key={label} type="button" disabled={pending} onClick={() => save(atHour(d as number))} className="bg-white/[0.05] hover:bg-white/[0.1] text-white/70 text-xs font-medium rounded-lg py-2 transition-colors disabled:opacity-40">
            {label}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <input type="datetime-local" value={custom} onChange={(e) => setCustom(e.target.value)} className={`${inputCls} flex-1 [color-scheme:dark]`} />
        <button type="button" disabled={pending || !custom} onClick={() => save(new Date(custom))} className="bg-white/[0.08] hover:bg-white/[0.14] text-white/80 text-xs font-semibold rounded-lg px-3 transition-colors disabled:opacity-40">
          Imposta
        </button>
      </div>
      {when && (
        <button type="button" disabled={pending} onClick={() => save(null)} className="w-full bg-green-500/10 hover:bg-green-500/20 text-green-400 text-xs font-semibold rounded-lg py-2 transition-colors disabled:opacity-40">
          ✓ Fatto, togli promemoria
        </button>
      )}
      {error && <p className="text-[#E63B2E] text-xs">{error}</p>}
    </div>
  );
}

/* ─── Opportunità ────────────────────────────────────────── */

export function AddOpportunityForm({ leadId }: { leadId: string }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(addOpportunity, null);
  const router = useRouter();
  useEffect(() => {
    if (state?.ok) {
      setOpen(false);
      router.refresh();
    }
  }, [state, router]);

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="text-[#E63B2E] hover:text-[#ff5a4d] text-xs font-semibold">
        + Aggiungi
      </button>
    );
  }
  return (
    <form action={action} className="basis-full w-full pt-3 space-y-3">
      <input type="hidden" name="lead_id" value={leadId} />
      <Field label="Cosa proponi *">
        <select name="title" className={inputCls} defaultValue="Sito vetrina">
          <option>Sito vetrina</option>
          <option>Landing page</option>
          <option>E-commerce light</option>
          <option>CRM su misura</option>
          <option>Care Plus (manutenzione)</option>
          <option>Altro</option>
        </select>
      </Field>
      <div className="grid grid-cols-3 gap-2">
        <Field label="Valore €"><input name="value" inputMode="decimal" required placeholder="1500" className={inputCls} /></Field>
        <Field label="Probabilità">
          <select name="probability" defaultValue="50" className={inputCls}>
            {[10, 25, 50, 75, 90].map((p) => <option key={p} value={p}>{p}%</option>)}
          </select>
        </Field>
        <Field label="Chiusura"><input name="expected_close" type="date" className={`${inputCls} [color-scheme:dark]`} /></Field>
      </div>
      <ErrorLine state={state} />
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={() => setOpen(false)} className={ghostBtn}>Annulla</button>
        <button type="submit" disabled={pending} className={primaryBtn}>{pending ? "…" : "Salva"}</button>
      </div>
    </form>
  );
}

export function DeleteOpportunityButton({ id, leadId }: { id: string; leadId: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      title="Elimina opportunità"
      onClick={() => {
        if (!confirm("Eliminare questa opportunità?")) return;
        start(async () => {
          await deleteOpportunity(id, leadId);
          router.refresh();
        });
      }}
      className="text-white/20 hover:text-[#E63B2E] text-xs px-1 transition-colors"
    >
      ✕
    </button>
  );
}

/* ─── Tag ────────────────────────────────────────────────── */

export interface TagChip {
  id: string;
  name: string;
  color: string;
}

export function TagPill({ tag, onRemove }: { tag: Pick<TagChip, "name" | "color">; onRemove?: () => void }) {
  return (
    <span
      className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border"
      style={{ background: `${tag.color}1a`, color: tag.color, borderColor: `${tag.color}40` }}
    >
      #{tag.name}
      {onRemove && (
        <button type="button" onClick={onRemove} className="opacity-60 hover:opacity-100 leading-none" aria-label={`Rimuovi ${tag.name}`}>
          ✕
        </button>
      )}
    </span>
  );
}

export function TagEditor({ leadId, tags, allTags, canEdit }: { leadId: string; tags: TagChip[]; allTags: TagChip[]; canEdit: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const suggestions = allTags.filter((t) => !tags.some((x) => x.id === t.id));

  function run(fn: () => Promise<FormState>) {
    start(async () => {
      setError(null);
      const r = await fn();
      if (r && !r.ok) setError(r.error ?? "Errore");
      else {
        setName("");
        router.refresh();
      }
    });
  }

  return (
    <div className="bg-[#141414] border border-white/[0.06] rounded-xl p-5 space-y-3">
      <h3 className="text-white/50 text-xs font-semibold uppercase tracking-wider">Tag</h3>
      <div className="flex flex-wrap gap-1.5">
        {tags.length === 0 && <p className="text-white/25 text-xs">Nessun tag.</p>}
        {tags.map((t) => (
          <TagPill key={t.id} tag={t} onRemove={canEdit ? () => run(() => removeLeadTag(leadId, t.id)) : undefined} />
        ))}
      </div>
      {canEdit && (
        <>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (name.trim()) run(() => addLeadTag(leadId, name));
            }}
            className="flex gap-2"
          >
            <input value={name} onChange={(e) => setName(e.target.value)} list={`tags-${leadId}`} placeholder="es. ristorante, caldo, bologna" className={`${inputCls} flex-1`} />
            <datalist id={`tags-${leadId}`}>
              {suggestions.map((t) => <option key={t.id} value={t.name} />)}
            </datalist>
            <button type="submit" disabled={pending || !name.trim()} className="bg-white/[0.08] hover:bg-white/[0.14] text-white/80 text-xs font-semibold rounded-lg px-3 transition-colors disabled:opacity-40">
              Aggiungi
            </button>
          </form>
          {suggestions.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {suggestions.slice(0, 8).map((t) => (
                <button key={t.id} type="button" disabled={pending} onClick={() => run(() => addLeadTag(leadId, t.name))} className="text-[11px] text-white/35 hover:text-white/70 border border-dashed border-white/15 rounded-full px-2 py-0.5 transition-colors">
                  + {t.name}
                </button>
              ))}
            </div>
          )}
        </>
      )}
      {error && <p className="text-[#E63B2E] text-xs">{error}</p>}
    </div>
  );
}

export function DeleteTagButton({ id, name, count }: { id: string; name: string; count: number }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!confirm(`Eliminare il tag "${name}"?${count ? ` Verrà tolto da ${count} contatt${count === 1 ? "o" : "i"}.` : ""}`)) return;
        start(async () => {
          await deleteTag(id);
          router.refresh();
        });
      }}
      className="text-white/25 hover:text-[#E63B2E] text-xs px-2 transition-colors"
    >
      Elimina
    </button>
  );
}

/* ─── Email del mattino ──────────────────────────────────── */

export function SendDigestButton() {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  return (
    <div className="space-y-2">
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const r = await sendDigestNow();
            setMsg({ ok: r?.ok ?? false, text: (r?.ok ? r.info : r?.error) ?? "" });
          })
        }
        className="bg-white/[0.08] hover:bg-white/[0.14] text-white/80 text-xs font-semibold rounded-lg px-3 py-2 transition-colors disabled:opacity-40"
      >
        {pending ? "Invio…" : "Invia ora una prova"}
      </button>
      {msg && <p className={`text-xs ${msg.ok ? "text-green-400" : "text-white/45"}`}>{msg.text}</p>}
    </div>
  );
}

/* ─── Call fissata ───────────────────────────────────────── */

export function AppointmentCard({ leadId, slot }: { leadId: string; slot: string | null }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [value, setValue] = useState(slot ? toLocalInput(new Date(slot)) : "");
  const [error, setError] = useState<string | null>(null);
  const when = slot ? new Date(slot) : null;
  const past = when ? when.getTime() < Date.now() : false;
  const save = (iso: string | null) =>
    start(async () => {
      setError(null);
      const r = await setAppointment(leadId, iso);
      if (r && !r.ok) setError(r.error ?? "Errore");
      else router.refresh();
    });
  return (
    <div className="bg-[#141414] border border-white/[0.06] rounded-xl p-5 space-y-3">
      <h3 className="text-white/50 text-xs font-semibold uppercase tracking-wider">📞 Call</h3>
      {when ? (
        <p className={`text-sm font-semibold ${past ? "text-white/40" : "text-white/85"}`}>
          {past ? "Fatta · " : ""}
          {when.toLocaleString("it-IT", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}
        </p>
      ) : (
        <p className="text-white/30 text-xs">Nessuna call fissata.</p>
      )}
      <div className="flex gap-2">
        <input type="datetime-local" value={value} onChange={(e) => setValue(e.target.value)} className={`${inputCls} flex-1 [color-scheme:dark]`} />
        <button type="button" disabled={pending || !value} onClick={() => save(new Date(value).toISOString())} className="bg-white/[0.08] hover:bg-white/[0.14] text-white/80 text-xs font-semibold rounded-lg px-3 disabled:opacity-40">
          {when ? "Sposta" : "Fissa"}
        </button>
      </div>
      {when && !past && (
        <button type="button" disabled={pending} onClick={() => save(null)} className="text-xs text-white/35 hover:text-[#E63B2E]">Annulla la call</button>
      )}
      {error && <p className="text-[#E63B2E] text-xs">{error}</p>}
    </div>
  );
}
