"use client";

/** Preventivi nella scheda contatto: elenco, editor con catalogo servizi, invio, stato. */
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteQuote, markQuoteSent, saveQuote, sendQuote, setQuoteStatus } from "@/app/crm/(app)/leads/quote-actions";
import { eur, quoteTotals, QUOTE_STATUS_LABEL, type QuoteItem } from "@/lib/crm/quotes";
import { SERVICES } from "@/lib/services";

const inputCls =
  "w-full bg-[#1a1a1a] border border-white/[0.08] rounded-lg px-3 py-2 text-white/85 text-sm placeholder:text-white/20 focus:outline-none focus:border-[#E63B2E]/50 transition-colors";

export interface QuoteRow {
  id: string;
  number: string;
  title: string;
  total: number;
  status: string;
  public_token: string;
  sent_at: string | null;
  viewed_at: string | null;
  accepted_at: string | null;
  created_at: string;
  items?: QuoteItem[];
  discount?: number;
  notes?: string | null;
  valid_until?: string | null;
}

const STATUS_CLS: Record<string, string> = {
  draft: "bg-white/[0.06] text-white/50",
  sent: "bg-blue-500/10 text-blue-400",
  accepted: "bg-green-500/10 text-green-400",
  rejected: "bg-red-500/10 text-red-400",
};

export function QuotesCard({ leadId, quotes, siteBase }: { leadId: string; quotes: QuoteRow[]; siteBase: string }) {
  const router = useRouter();
  const [editing, setEditing] = useState<QuoteRow | "new" | null>(null);
  const [sending, setSending] = useState<QuoteRow | null>(null);
  const [pending, start] = useTransition();
  const [copied, setCopied] = useState<string | null>(null);

  const act = (fn: () => Promise<unknown>) => start(async () => { await fn(); router.refresh(); });

  return (
    <div className="bg-[#141414] border border-white/[0.06] rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
        <h2 className="text-white font-semibold text-sm">Preventivi ({quotes.length})</h2>
        <button type="button" onClick={() => setEditing("new")} className="text-[#E63B2E] hover:text-[#ff5a4d] text-xs font-semibold">+ Nuovo preventivo</button>
      </div>
      {quotes.length === 0 && <p className="px-5 py-4 text-white/25 text-xs">Crea un preventivo dai servizi del listino: il cliente lo apre da un link e lo accetta online.</p>}
      <div className="divide-y divide-white/[0.04]">
        {quotes.map((q) => {
          const link = `${siteBase}/preventivo/${q.public_token}`;
          return (
            <div key={q.id} className="px-5 py-3.5 space-y-2">
              <div className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-white/85 text-sm font-medium truncate">{q.number} · {q.title}</p>
                  <p className="text-white/30 text-xs">
                    {q.viewed_at ? `Aperto dal cliente il ${new Date(q.viewed_at).toLocaleDateString("it-IT")}` : q.sent_at ? "Inviato, non ancora aperto" : "Non inviato"}
                  </p>
                </div>
                <p className="text-white/85 text-sm font-semibold shrink-0">{eur(Number(q.total))}</p>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase shrink-0 ${STATUS_CLS[q.status] ?? ""}`}>{QUOTE_STATUS_LABEL[q.status] ?? q.status}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {q.status !== "draft" && <a href={`${link}?anteprima=1`} target="_blank" rel="noopener noreferrer" className="text-xs text-white/60 hover:text-white bg-white/[0.05] rounded-md px-2.5 py-1">Apri</a>}
                <button type="button" onClick={() => { navigator.clipboard?.writeText(link); setCopied(q.id); if (q.status === "draft") act(() => markQuoteSent(q.id)); }} className="text-xs text-white/60 hover:text-white bg-white/[0.05] rounded-md px-2.5 py-1">
                  {copied === q.id ? "Link copiato ✓" : "Copia link"}
                </button>
                {q.status !== "accepted" && <button type="button" onClick={() => setSending(q)} className="text-xs text-white bg-[#E63B2E]/80 hover:bg-[#E63B2E] rounded-md px-2.5 py-1">Invia per email</button>}
                {(q.status === "draft" || q.status === "sent") && <button type="button" onClick={() => setEditing(q)} className="text-xs text-white/60 hover:text-white bg-white/[0.05] rounded-md px-2.5 py-1">Modifica</button>}
                {q.status === "sent" && <button type="button" disabled={pending} onClick={() => act(() => setQuoteStatus(q.id, "accepted"))} className="text-xs text-green-400 bg-green-500/10 rounded-md px-2.5 py-1">Segna accettato</button>}
                {q.status === "sent" && <button type="button" disabled={pending} onClick={() => act(() => setQuoteStatus(q.id, "rejected"))} className="text-xs text-red-400 bg-red-500/10 rounded-md px-2.5 py-1">Rifiutato</button>}
                {q.status === "rejected" && <button type="button" disabled={pending} onClick={() => act(() => setQuoteStatus(q.id, "sent"))} className="text-xs text-white/60 bg-white/[0.05] rounded-md px-2.5 py-1">Riapri</button>}
                <button type="button" disabled={pending} onClick={() => { if (confirm(`Eliminare il preventivo ${q.number}?`)) act(() => deleteQuote(q.id)); }} className="text-xs text-white/25 hover:text-[#E63B2E] px-1.5 py-1">Elimina</button>
              </div>
            </div>
          );
        })}
      </div>
      {editing && <QuoteEditor leadId={leadId} quote={editing === "new" ? null : editing} onClose={() => setEditing(null)} />}
      {sending && <SendQuoteDialog quote={sending} onClose={() => setSending(null)} />}
    </div>
  );
}

function QuoteEditor({ leadId, quote, onClose }: { leadId: string; quote: QuoteRow | null; onClose: () => void }) {
  const router = useRouter();
  const [title, setTitle] = useState(quote?.title ?? "");
  const [items, setItems] = useState<QuoteItem[]>(quote?.items?.length ? quote.items : []);
  const [discount, setDiscount] = useState(String(quote?.discount ?? 0));
  const [notes, setNotes] = useState(quote?.notes ?? "Tempi di consegna indicativi dalla ricezione dei contenuti. Pagamento: 50% all'avvio, saldo alla messa online.");
  const [valid, setValid] = useState(quote?.valid_until ?? new Date(Date.now() + 30 * 86_400_000).toISOString().slice(0, 10));
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const totals = useMemo(() => quoteTotals(items, Number(discount.replace(",", ".")) || 0), [items, discount]);

  function addService(slug: string) {
    const s = SERVICES.find((x) => x.slug === slug);
    if (!s) return;
    setItems((it) => [...it, { description: s.title, qty: 1, unit_price: s.price, unit: s.unit === "one-shot" ? "una tantum" : s.unit }]);
    if (!title) setTitle(s.title);
  }
  const update = (i: number, patch: Partial<QuoteItem>) => setItems((it) => it.map((x, j) => (j === i ? { ...x, ...patch } : x)));

  return (
    <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full sm:max-w-2xl bg-[#141414] border border-white/[0.08] rounded-t-2xl sm:rounded-2xl p-5 space-y-4 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <p className="text-white font-semibold">{quote ? `Modifica ${quote.number}` : "Nuovo preventivo"}</p>
          <button type="button" onClick={onClose} className="text-white/40 hover:text-white text-lg leading-none">✕</button>
        </div>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Titolo (es. Sito vetrina + Care Plus)" className={inputCls} />
        <select value="" onChange={(e) => addService(e.target.value)} className={inputCls}>
          <option value="">+ Aggiungi un servizio dal listino…</option>
          {SERVICES.map((s) => (
            <option key={s.slug} value={s.slug}>{s.title} — da {eur(s.price)}{s.unit !== "one-shot" ? `/${s.unit}` : ""}</option>
          ))}
        </select>
        <div className="space-y-2">
          {items.map((it, i) => (
            <div key={i} className="grid grid-cols-[1fr_56px_96px_28px] gap-2 items-center">
              <input value={it.description} onChange={(e) => update(i, { description: e.target.value })} className={inputCls} />
              <input value={it.qty} inputMode="numeric" onChange={(e) => update(i, { qty: Number(e.target.value) || 0 })} className={`${inputCls} text-center`} aria-label="Quantità" />
              <input value={it.unit_price} inputMode="decimal" onChange={(e) => update(i, { unit_price: Number(e.target.value.replace(",", ".")) || 0 })} className={`${inputCls} text-right`} aria-label="Prezzo" />
              <button type="button" onClick={() => setItems((x) => x.filter((_, j) => j !== i))} className="text-white/30 hover:text-[#E63B2E]">✕</button>
            </div>
          ))}
          <button type="button" onClick={() => setItems((x) => [...x, { description: "", qty: 1, unit_price: 0 }])} className="text-xs text-white/50 hover:text-white">+ Voce libera</button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-white/30 text-xs uppercase tracking-wider block mb-1.5">Sconto €</label><input value={discount} inputMode="decimal" onChange={(e) => setDiscount(e.target.value)} className={inputCls} /></div>
          <div><label className="text-white/30 text-xs uppercase tracking-wider block mb-1.5">Valido fino al</label><input type="date" value={valid ?? ""} onChange={(e) => setValid(e.target.value)} className={`${inputCls} [color-scheme:dark]`} /></div>
        </div>
        <textarea value={notes ?? ""} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Note e condizioni" className={`${inputCls} resize-none`} />
        <div className="flex items-center justify-between border-t border-white/[0.06] pt-3">
          <div className="text-xs text-white/40">
            Subtotale {eur(totals.subtotal)}{totals.discount ? ` · sconto ${eur(totals.discount)}` : ""}
            <p className="text-white text-lg font-bold">Totale {eur(totals.total)}</p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="text-white/50 hover:text-white text-sm px-3 py-2">Annulla</button>
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                start(async () => {
                  setError(null);
                  const r = await saveQuote({ id: quote?.id, leadId, title, items, discount: totals.discount, notes: notes ?? "", validUntil: valid || null });
                  if (!r.ok) return setError(r.error ?? "Errore");
                  router.refresh();
                  onClose();
                })
              }
              className="bg-[#E63B2E] hover:bg-[#C44A38] disabled:opacity-40 text-white text-sm font-semibold px-4 py-2 rounded-lg"
            >
              {pending ? "Salvataggio…" : "Salva"}
            </button>
          </div>
        </div>
        {error && <p className="text-[#E63B2E] text-xs">{error}</p>}
      </div>
    </div>
  );
}

function SendQuoteDialog({ quote, onClose }: { quote: QuoteRow; onClose: () => void }) {
  const router = useRouter();
  const [msg, setMsg] = useState(
    `Ciao,\n\ncome d'accordo ti mando il preventivo "${quote.title}". Al link qui sotto trovi tutti i dettagli e puoi accettarlo direttamente online.\n\nPer qualsiasi dubbio scrivimi pure.`
  );
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  return (
    <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full sm:max-w-lg bg-[#141414] border border-white/[0.08] rounded-t-2xl sm:rounded-2xl p-5 space-y-3">
        <p className="text-white font-semibold">Invia {quote.number}</p>
        <textarea value={msg} onChange={(e) => setMsg(e.target.value)} rows={8} className={`${inputCls} resize-y`} />
        <p className="text-white/30 text-[11px]">Il link al preventivo viene aggiunto in fondo. Il contatto passa a &quot;Proposta inviata&quot;.</p>
        {error && <p className="text-[#E63B2E] text-xs">{error}</p>}
        <div className="flex gap-2 justify-end">
          <button type="button" onClick={onClose} className="text-white/50 hover:text-white text-sm px-3 py-2">Annulla</button>
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              start(async () => {
                const r = await sendQuote(quote.id, msg);
                if (!r.ok) return setError(r.error ?? "Errore");
                router.refresh();
                onClose();
              })
            }
            className="bg-[#E63B2E] hover:bg-[#C44A38] disabled:opacity-40 text-white text-sm font-semibold px-4 py-2 rounded-lg"
          >
            {pending ? "Invio…" : "Invia email"}
          </button>
        </div>
      </div>
    </div>
  );
}
