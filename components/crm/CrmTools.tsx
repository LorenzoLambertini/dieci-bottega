"use client";

/** Strumenti: modifica/elimina attività, unisci doppioni, importa CSV, utenti. */
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  deleteActivity,
  importLeads,
  inviteUser,
  mergeLeads,
  searchLeads,
  setUserRole,
  updateActivity,
  type ImportRow,
} from "@/app/crm/(app)/leads/tools-actions";
import { parseCsv } from "@/lib/crm/csv";

const input = "w-full bg-[#1a1a1a] border border-white/[0.08] rounded-lg px-3 py-2 text-white/85 text-sm placeholder:text-white/20 focus:outline-none focus:border-[#E63B2E]/50";
const btn = "bg-white/[0.08] hover:bg-white/[0.14] text-white/80 text-xs font-semibold rounded-lg px-3 py-2 transition-colors disabled:opacity-40";

/* ─── Attività ───────────────────────────────────────────── */

export function ActivityActions({ id, body }: { id: string; body: string | null }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(body ?? "");
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const run = (fn: () => Promise<{ ok: boolean; error?: string }>) =>
    start(async () => {
      const r = await fn();
      if (!r.ok) return setError(r.error ?? "Errore");
      setEditing(false);
      router.refresh();
    });
  if (editing) {
    return (
      <div className="mt-2 space-y-2">
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} className={`${input} resize-y`} />
        <div className="flex gap-2">
          <button type="button" disabled={pending} onClick={() => run(() => updateActivity(id, text))} className={btn}>Salva</button>
          <button type="button" onClick={() => setEditing(false)} className="text-white/40 text-xs px-2">Annulla</button>
        </div>
        {error && <p className="text-[#E63B2E] text-xs">{error}</p>}
      </div>
    );
  }
  return (
    <span className="inline-flex gap-2 ml-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
      <button type="button" onClick={() => setEditing(true)} className="text-white/30 hover:text-white text-[11px]">Modifica</button>
      <button type="button" disabled={pending} onClick={() => { if (confirm("Eliminare questa attività?")) run(() => deleteActivity(id)); }} className="text-white/30 hover:text-[#E63B2E] text-[11px]">Elimina</button>
      {error && <span className="text-[#E63B2E] text-[11px]">{error}</span>}
    </span>
  );
}

/* ─── Doppioni ───────────────────────────────────────────── */

export function MergeButton({ keepId, keepName, suggested }: { keepId: string; keepName: string; suggested?: { id: string; name: string } }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [results, setResults] = useState<{ id: string; name: string; email: string | null; company: string | null }[]>([]);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const merge = (other: { id: string; name: string }) => {
    if (!confirm(`Unire "${other.name}" dentro "${keepName}"?\n\nStorico, preventivi, progetti, tag e chat passano qui; "${other.name}" viene eliminato.`)) return;
    start(async () => {
      const r = await mergeLeads(keepId, other.id);
      if (!r.ok) return setError(r.error ?? "Errore");
      setOpen(false);
      router.refresh();
    });
  };

  if (suggested) {
    return <button type="button" disabled={pending} onClick={() => merge(suggested)} className="text-xs font-semibold text-yellow-300 underline underline-offset-2">{pending ? "Unisco…" : "Unisci qui"}</button>;
  }
  if (!open) return <button type="button" onClick={() => setOpen(true)} className="w-full text-xs text-white/40 hover:text-white border border-white/[0.08] rounded-lg px-3 py-2">Unisci un doppione…</button>;
  return (
    <div className="bg-[#141414] border border-white/[0.06] rounded-xl p-4 space-y-2">
      <p className="text-white/70 text-sm font-medium">Cerca il doppione da unire qui</p>
      <input
        value={q}
        autoFocus
        onChange={(e) => {
          setQ(e.target.value);
          const v = e.target.value;
          start(async () => setResults(await searchLeads(v, keepId)));
        }}
        placeholder="Nome, email, telefono…"
        className={input}
      />
      {results.map((r) => (
        <button key={r.id} type="button" onClick={() => merge(r)} className="w-full text-left px-3 py-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.07]">
          <p className="text-white/80 text-sm">{r.name}</p>
          <p className="text-white/35 text-xs">{r.company ?? r.email ?? ""}</p>
        </button>
      ))}
      {error && <p className="text-[#E63B2E] text-xs">{error}</p>}
      <button type="button" onClick={() => setOpen(false)} className="text-white/40 text-xs">Chiudi</button>
    </div>
  );
}

/* ─── Import CSV ─────────────────────────────────────────── */

const FIELDS: { key: keyof ImportRow; label: string; match: RegExp }[] = [
  { key: "name", label: "Nome", match: /^(nome|name|nome e cognome|contatto|full ?name|ragione sociale)$/i },
  { key: "email", label: "Email", match: /e-?mail/i },
  { key: "phone", label: "Telefono", match: /(telefono|phone|cellulare|tel|mobile|whatsapp)/i },
  { key: "company", label: "Azienda", match: /(azienda|company|attivit|società|societa|business)/i },
  { key: "website", label: "Sito", match: /(sito|website|web|url)/i },
  { key: "notes", label: "Note", match: /(note|notes|commento|descrizione)/i },
];

export function CsvImport() {
  const router = useRouter();
  const [rows, setRows] = useState<string[][] | null>(null);
  const [map, setMap] = useState<Record<string, number>>({});
  const [tag, setTag] = useState("import");
  const [pending, start] = useTransition();
  const [result, setResult] = useState<string | null>(null);

  function onFile(f: File) {
    f.text().then((t) => {
      const r = parseCsv(t);
      setRows(r);
      setResult(null);
      const header = r[0] ?? [];
      const m: Record<string, number> = {};
      for (const fld of FIELDS) {
        const i = header.findIndex((h) => fld.match.test(h.trim()));
        if (i >= 0) m[fld.key] = i;
      }
      setMap(m);
    });
  }

  const header = rows?.[0] ?? [];
  const body = rows?.slice(1) ?? [];
  const toRows = (): ImportRow[] =>
    body.map((r) => Object.fromEntries(FIELDS.map((f) => [f.key, map[f.key] != null ? (r[map[f.key]] ?? "") : ""])) as unknown as ImportRow);

  return (
    <div className="space-y-4">
      <label className="block bg-[#141414] border border-dashed border-white/15 hover:border-[#E63B2E]/50 rounded-xl p-8 text-center cursor-pointer">
        <input type="file" accept=".csv,text/csv,.txt" className="hidden" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
        <p className="text-white/70 text-sm font-medium">Scegli un file CSV</p>
        <p className="text-white/30 text-xs mt-1">Da Excel: File → Salva con nome → CSV. La prima riga deve contenere i titoli delle colonne.</p>
      </label>

      {rows && (
        <div className="bg-[#141414] border border-white/[0.06] rounded-xl p-5 space-y-4">
          <p className="text-white/70 text-sm">{body.length} righe trovate. Controlla quale colonna corrisponde a cosa:</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {FIELDS.map((f) => (
              <div key={f.key}>
                <label className="text-white/30 text-[10px] uppercase tracking-wider block mb-1">{f.label}</label>
                <select value={map[f.key] ?? ""} onChange={(e) => setMap((m) => ({ ...m, [f.key]: e.target.value === "" ? (undefined as unknown as number) : Number(e.target.value) }))} className={input}>
                  <option value="">— non importare —</option>
                  {header.map((h, i) => <option key={i} value={i}>{h || `Colonna ${i + 1}`}</option>)}
                </select>
              </div>
            ))}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="text-white/35 text-left">{FIELDS.filter((f) => map[f.key] != null).map((f) => <th key={f.key} className="py-1 pr-3">{f.label}</th>)}</tr></thead>
              <tbody>
                {body.slice(0, 5).map((r, i) => (
                  <tr key={i} className="border-t border-white/[0.04] text-white/65">{FIELDS.filter((f) => map[f.key] != null).map((f) => <td key={f.key} className="py-1 pr-3 truncate max-w-[160px]">{r[map[f.key]]}</td>)}</tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="grid sm:grid-cols-[1fr_auto] gap-3 items-end">
            <div>
              <label className="text-white/30 text-[10px] uppercase tracking-wider block mb-1">Tag da aggiungere a tutti</label>
              <input value={tag} onChange={(e) => setTag(e.target.value)} className={input} />
            </div>
            <button
              type="button"
              disabled={pending || (map.name == null && map.email == null)}
              onClick={() =>
                start(async () => {
                  const r = await importLeads(toRows(), tag);
                  setResult(r.ok ? `Importati ${r.created} contatti · ${r.skipped} saltati (doppioni o righe vuote)` : `Errore: ${r.error}`);
                  if (r.ok) router.refresh();
                })
              }
              className="bg-[#E63B2E] hover:bg-[#C44A38] disabled:opacity-40 text-white text-sm font-semibold px-4 py-2 rounded-lg"
            >
              {pending ? "Importo…" : `Importa ${body.length} contatti`}
            </button>
          </div>
          <p className="text-white/30 text-xs">Le email già presenti nel CRM vengono saltate. I contatti importati non fanno partire le automazioni &quot;nuovo contatto&quot;.</p>
          {result && <p className="text-green-400 text-sm">{result}</p>}
        </div>
      )}
    </div>
  );
}

/* ─── Utenti ─────────────────────────────────────────────── */

export function InviteUserForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("sales");
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  return (
    <div className="space-y-2">
      <div className="grid sm:grid-cols-[1fr_1fr_120px_auto] gap-2">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome" className={input} />
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@esempio.it" type="email" className={input} />
        <select value={role} onChange={(e) => setRole(e.target.value)} className={input}>
          <option value="sales">Sales</option>
          <option value="marketing">Marketing</option>
          <option value="admin">Admin</option>
        </select>
        <button
          type="button"
          disabled={pending || !email}
          onClick={() =>
            start(async () => {
              const r = await inviteUser(email, name, role);
              setMsg(r.ok ? { ok: true, text: `Invito mandato a ${email}` } : { ok: false, text: r.error ?? "Errore" });
              if (r.ok) { setEmail(""); setName(""); router.refresh(); }
            })
          }
          className="bg-[#E63B2E] hover:bg-[#C44A38] disabled:opacity-40 text-white text-sm font-semibold px-4 py-2 rounded-lg"
        >
          {pending ? "…" : "Invita"}
        </button>
      </div>
      <p className="text-white/30 text-xs">Admin: tutto. Sales: vede e modifica solo i contatti assegnati a lui. Marketing: vede tutto, gestisce tag e social.</p>
      {msg && <p className={`text-xs ${msg.ok ? "text-green-400" : "text-[#E63B2E]"}`}>{msg.text}</p>}
    </div>
  );
}

export function RoleSelect({ userId, role }: { userId: string; role: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <select
      defaultValue={role}
      disabled={pending}
      onChange={(e) => {
        const v = e.target.value;
        start(async () => {
          const r = await setUserRole(userId, v);
          if (!r.ok) alert(r.error);
          router.refresh();
        });
      }}
      className="bg-[#1a1a1a] border border-white/[0.08] rounded-full px-2.5 py-1 text-white/70 text-xs"
    >
      <option value="admin">Admin</option>
      <option value="sales">Sales</option>
      <option value="marketing">Marketing</option>
    </select>
  );
}
