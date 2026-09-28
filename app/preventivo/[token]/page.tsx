import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { eur, quoteTotals, sanitizeItems } from "@/lib/crm/quotes";
import { AcceptQuote, PrintButton } from "./AcceptQuote";

export const dynamic = "force-dynamic";
export const metadata = { title: "Preventivo · Dieci Bottega", robots: { index: false, follow: false } };

const fmtDate = (d: string) => new Date(d).toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Rome" });

export default async function QuotePage({ params, searchParams }: { params: Promise<{ token: string }>; searchParams: Promise<{ anteprima?: string }> }) {
  const { token } = await params;
  const { anteprima } = await searchParams;
  if (!/^[a-f0-9]{32,80}$/.test(token)) notFound();
  const db = createAdminClient();
  const { data } = await db
    .from("quotes")
    .select("id, number, title, items, discount, total, notes, valid_until, status, created_at, accepted_at, accepted_name, viewed_at, lead:leads(name, company)")
    .eq("public_token", token)
    .maybeSingle();
  const q = data as unknown as {
    id: string; number: string; title: string; items: unknown; discount: number; total: number; notes: string | null; valid_until: string | null;
    status: string; created_at: string; accepted_at: string | null; accepted_name: string | null; viewed_at: string | null;
    lead: { name: string; company: string | null } | null;
  } | null;
  if (!q || q.status === "draft") notFound();
  if (!q.viewed_at && !anteprima) await db.from("quotes").update({ viewed_at: new Date().toISOString() }).eq("id", q.id);

  const items = sanitizeItems(q.items);
  const t = quoteTotals(items, Number(q.discount));
  const expired = q.valid_until ? new Date(`${q.valid_until}T23:59:59`) < new Date() : false;

  return (
    <div className="min-h-screen bg-[#F4EFE6] text-[#1A1414] print:bg-white">
      <div className="mx-auto max-w-3xl px-5 py-10 sm:py-16">
        <header className="flex items-start justify-between gap-6 mb-12">
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-mark.png" alt="Dieci Bottega" className="h-10 w-auto mb-3" />
            <p className="text-sm text-black/50">Dieci Bottega · Bologna<br />diecibottega.it · info@diecibottega.it</p>
          </div>
          <div className="text-right">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#E63B2E]">Preventivo</p>
            <p className="text-2xl font-black">{q.number}</p>
            <p className="text-sm text-black/50">{fmtDate(q.created_at)}</p>
          </div>
        </header>

        <section className="mb-10">
          <p className="text-xs uppercase tracking-wider text-black/40 mb-1">Per</p>
          <p className="text-lg font-semibold">{q.lead?.company ?? q.lead?.name}</p>
          {q.lead?.company && <p className="text-black/60">{q.lead.name}</p>}
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight mt-6" style={{ fontSize: "clamp(1.75rem,4vw,2.25rem)" }}>{q.title}</h1>
        </section>

        <table className="w-full text-sm mb-6">
          <thead>
            <tr className="border-b-2 border-black/80 text-left">
              <th className="py-2 font-semibold">Descrizione</th>
              <th className="py-2 font-semibold text-center w-16">Q.tà</th>
              <th className="py-2 font-semibold text-right w-28">Prezzo</th>
              <th className="py-2 font-semibold text-right w-28">Totale</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, i) => (
              <tr key={i} className="border-b border-black/10 align-top">
                <td className="py-3 pr-3">{it.description}{it.unit && it.unit !== "una tantum" ? <span className="text-black/45"> · al {it.unit}</span> : null}</td>
                <td className="py-3 text-center">{it.qty}</td>
                <td className="py-3 text-right">{eur(it.unit_price)}</td>
                <td className="py-3 text-right font-medium">{eur(it.qty * it.unit_price)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end mb-10">
          <div className="w-64 text-sm space-y-1">
            {t.discount > 0 && (
              <>
                <div className="flex justify-between"><span className="text-black/55">Subtotale</span><span>{eur(t.subtotal)}</span></div>
                <div className="flex justify-between"><span className="text-black/55">Sconto</span><span>−{eur(t.discount)}</span></div>
              </>
            )}
            <div className="flex justify-between border-t-2 border-black/80 pt-2 text-lg font-black"><span>Totale</span><span>{eur(t.total)}</span></div>
            <p className="text-xs text-black/45 text-right">Importi IVA esclusa, se dovuta.</p>
          </div>
        </div>

        {q.notes && (
          <section className="mb-10">
            <p className="text-xs uppercase tracking-wider text-black/40 mb-2">Note e condizioni</p>
            <p className="text-sm text-black/70 whitespace-pre-wrap leading-relaxed">{q.notes}</p>
          </section>
        )}
        {q.valid_until && <p className="text-sm text-black/55 mb-8">Offerta valida fino al {fmtDate(q.valid_until)}.</p>}

        <div className="print:hidden">
          {q.status === "accepted" ? (
            <div className="rounded-xl bg-green-600/10 border border-green-700/20 p-5">
              <p className="font-semibold text-green-800">✓ Preventivo accettato{q.accepted_name ? ` da ${q.accepted_name}` : ""}{q.accepted_at ? ` il ${fmtDate(q.accepted_at)}` : ""}.</p>
              <p className="text-sm text-green-900/70 mt-1">Grazie! Ti contatteremo a brevissimo per iniziare.</p>
            </div>
          ) : q.status === "rejected" ? (
            <p className="text-black/60">Questo preventivo non è più attivo. Scrivici per aggiornarlo.</p>
          ) : expired ? (
            <p className="text-black/60">Il preventivo è scaduto. Scrivici a info@diecibottega.it e te lo aggiorniamo.</p>
          ) : (
            <AcceptQuote token={token} />
          )}
          <div className="mt-6"><PrintButton /></div>
        </div>
        {q.status === "accepted" && <p className="hidden print:block text-sm mt-8">Accettato da {q.accepted_name} il {q.accepted_at ? fmtDate(q.accepted_at) : ""}.</p>}
      </div>
    </div>
  );
}
