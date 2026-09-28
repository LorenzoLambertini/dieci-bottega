"use client";

/** Scheda progetto modificabile in linea: ogni campo si salva quando cambia. */
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { deleteProject, saveChecklist, updateProject } from "@/app/crm/(app)/projects/actions";
import { checklistFor, type CheckItem } from "@/lib/crm/checklists";

export const PHASES: { id: string; label: string; color: string }[] = [
  { id: "brief", label: "Brief", color: "#9CA3AF" },
  { id: "design", label: "Design", color: "#8B5CF6" },
  { id: "revisioni", label: "Revisioni", color: "#F59E0B" },
  { id: "sviluppo", label: "Sviluppo", color: "#3B82F6" },
  { id: "online", label: "Online", color: "#10B981" },
  { id: "manutenzione", label: "Manutenzione", color: "#14B8A6" },
  { id: "chiuso", label: "Chiuso", color: "#6B7280" },
];

export interface ProjectRow {
  id: string;
  lead_id: string;
  name: string;
  phase: string;
  value: number;
  deposit_amount: number;
  deposit_paid_at: string | null;
  balance_paid_at: string | null;
  start_date: string | null;
  due_date: string | null;
  care_plan: string | null;
  care_monthly: number | null;
  care_renewal_date: string | null;
  notes: string | null;
  checklist?: CheckItem[] | null;
  lead: { name: string; company: string | null } | null;
}

const input =
  "w-full bg-[#1a1a1a] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-white/85 text-sm focus:outline-none focus:border-[#E63B2E]/50 [color-scheme:dark]";
const label = "text-white/30 text-[10px] uppercase tracking-wider block mb-1";
const eur = (n: number) => new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
const today = () => new Date().toISOString().slice(0, 10);

export function ProjectCard({ p, isAdmin }: { p: ProjectRow; isAdmin: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<CheckItem[]>(p.checklist ?? []);
  const [newItem, setNewItem] = useState("");
  const doneCount = items.filter((i) => i.done).length;
  const saveItems = (next: CheckItem[]) => {
    setItems(next);
    start(async () => {
      const r = await saveChecklist(p.id, next);
      if (!r.ok) setError(r.error ?? "Errore");
    });
  };
  const phase = PHASES.find((x) => x.id === p.phase) ?? PHASES[0];
  const overdue = p.due_date && !["online", "manutenzione", "chiuso"].includes(p.phase) && p.due_date < today();
  const toCollect = Number(p.value) - (p.deposit_paid_at ? Number(p.deposit_amount) : 0) - (p.balance_paid_at ? Number(p.value) - Number(p.deposit_amount) : 0);

  const save = (patch: Record<string, string | number | null>) =>
    start(async () => {
      setError(null);
      const r = await updateProject(p.id, patch);
      if (!r.ok) setError(r.error ?? "Errore");
      router.refresh();
    });

  return (
    <div id={p.id} className="bg-[#141414] border border-white/[0.06] rounded-xl p-4 space-y-3 scroll-mt-20">
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-white/90 text-sm font-semibold truncate">{p.name}</p>
          <Link href={`/crm/leads/${p.lead_id}`} className="text-white/40 hover:text-white/70 text-xs truncate block">
            {p.lead?.company ?? p.lead?.name ?? "Cliente"}
          </Link>
        </div>
        <select
          value={p.phase}
          disabled={pending}
          onChange={(e) => save({ phase: e.target.value })}
          className="text-xs font-semibold rounded-full px-2.5 py-1 border bg-transparent"
          style={{ color: phase.color, borderColor: `${phase.color}55` }}
        >
          {PHASES.map((x) => <option key={x.id} value={x.id} className="bg-[#141414] text-white">{x.label}</option>)}
        </select>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
        <span className="text-white/60">{eur(Number(p.value))}</span>
        {toCollect > 0 && <span className="text-yellow-400">da incassare {eur(toCollect)}</span>}
        {p.due_date && <span className={overdue ? "text-[#E63B2E] font-semibold" : "text-white/40"}>consegna {new Date(p.due_date).toLocaleDateString("it-IT")}</span>}
        {p.care_plan && <span className="text-teal-400">{p.care_plan}{p.care_renewal_date ? ` · rinnovo ${new Date(p.care_renewal_date).toLocaleDateString("it-IT")}` : ""}</span>}
      </div>

      {items.length > 0 ? (
        <details className="group">
          <summary className="cursor-pointer list-none flex items-center gap-2 text-xs text-white/50">
            <span className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
              <span className="block h-full bg-green-500/70" style={{ width: `${(doneCount / items.length) * 100}%` }} />
            </span>
            <span className="tabular-nums shrink-0">Checklist {doneCount}/{items.length}</span>
          </summary>
          <div className="mt-2 space-y-1">
            {items.map((it, i) => (
              <label key={i} className="flex items-start gap-2 text-sm text-white/70">
                <input type="checkbox" checked={it.done} onChange={() => saveItems(items.map((x, j) => (j === i ? { ...x, done: !x.done } : x)))} className="mt-1 accent-green-500" />
                <span className={it.done ? "line-through text-white/30" : ""}>{it.label}</span>
              </label>
            ))}
            <form onSubmit={(e) => { e.preventDefault(); if (newItem.trim()) { saveItems([...items, { label: newItem.trim(), done: false }]); setNewItem(""); } }} className="flex gap-2 pt-1">
              <input value={newItem} onChange={(e) => setNewItem(e.target.value)} placeholder="Aggiungi voce…" className={input} />
            </form>
          </div>
        </details>
      ) : (
        <button type="button" onClick={() => saveItems(checklistFor(p.name))} className="text-[11px] text-white/45 hover:text-white border border-dashed border-white/15 rounded-md px-2 py-1">
          + Crea la checklist di avvio (materiali da chiedere al cliente)
        </button>
      )}

      <div className="flex flex-wrap gap-1.5">
        <button type="button" disabled={pending} onClick={() => save({ deposit_paid_at: p.deposit_paid_at ? null : today() })} className={`text-[11px] rounded-md px-2 py-1 ${p.deposit_paid_at ? "bg-green-500/10 text-green-400" : "bg-white/[0.05] text-white/50"}`}>
          {p.deposit_paid_at ? "✓ Acconto incassato" : "Acconto da incassare"}
        </button>
        <button type="button" disabled={pending} onClick={() => save({ balance_paid_at: p.balance_paid_at ? null : today() })} className={`text-[11px] rounded-md px-2 py-1 ${p.balance_paid_at ? "bg-green-500/10 text-green-400" : "bg-white/[0.05] text-white/50"}`}>
          {p.balance_paid_at ? "✓ Saldo incassato" : "Saldo da incassare"}
        </button>
        <button type="button" onClick={() => setOpen((o) => !o)} className="text-[11px] rounded-md px-2 py-1 bg-white/[0.05] text-white/50 hover:text-white ml-auto">
          {open ? "Chiudi" : "Dettagli"}
        </button>
      </div>

      {open && (
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/[0.06]">
          <div className="col-span-2"><label className={label}>Nome progetto</label><input defaultValue={p.name} onBlur={(e) => e.target.value !== p.name && save({ name: e.target.value })} className={input} /></div>
          <div><label className={label}>Valore €</label><input defaultValue={p.value} inputMode="decimal" onBlur={(e) => save({ value: e.target.value })} className={input} /></div>
          <div><label className={label}>Acconto €</label><input defaultValue={p.deposit_amount} inputMode="decimal" onBlur={(e) => save({ deposit_amount: e.target.value })} className={input} /></div>
          <div><label className={label}>Inizio</label><input type="date" defaultValue={p.start_date ?? ""} onChange={(e) => save({ start_date: e.target.value })} className={input} /></div>
          <div><label className={label}>Consegna</label><input type="date" defaultValue={p.due_date ?? ""} onChange={(e) => save({ due_date: e.target.value })} className={input} /></div>
          <div><label className={label}>Manutenzione</label>
            <select defaultValue={p.care_plan ?? ""} onChange={(e) => save({ care_plan: e.target.value })} className={input}>
              <option value="">Nessuna</option><option>Care Basic</option><option>Care Plus</option><option>Care Pro</option>
            </select>
          </div>
          <div><label className={label}>€ / mese</label><input defaultValue={p.care_monthly ?? ""} inputMode="decimal" onBlur={(e) => save({ care_monthly: e.target.value })} className={input} /></div>
          <div className="col-span-2"><label className={label}>Rinnovo manutenzione</label><input type="date" defaultValue={p.care_renewal_date ?? ""} onChange={(e) => save({ care_renewal_date: e.target.value })} className={input} /></div>
          <div className="col-span-2"><label className={label}>Note</label><textarea defaultValue={p.notes ?? ""} rows={3} onBlur={(e) => e.target.value !== (p.notes ?? "") && save({ notes: e.target.value })} className={`${input} resize-none`} /></div>
          {isAdmin && (
            <button type="button" onClick={() => { if (confirm(`Eliminare il progetto "${p.name}"?`)) start(async () => { await deleteProject(p.id); router.refresh(); }); }} className="col-span-2 text-left text-xs text-white/25 hover:text-[#E63B2E]">
              Elimina progetto
            </button>
          )}
        </div>
      )}
      {error && <p className="text-[#E63B2E] text-xs">{error}</p>}
    </div>
  );
}
