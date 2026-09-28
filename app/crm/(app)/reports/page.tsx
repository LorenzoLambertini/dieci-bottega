import { createSocialClient } from "@/lib/social-ai/db";
import { ColumnChart, HBarList, CHART_AQUA, type Point } from "@/components/crm/Charts";
import { STATUS_LABEL_IT } from "@/lib/crm/lead-filters";

export const dynamic = "force-dynamic";

const eur = (n: number) => new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
const SOURCE_LABEL: Record<string, string> = { website: "Sito (form)", "website-quiz": "Sito (quiz)", chatbot: "Chatbot", manuale: "Inserito a mano" };

function monthKeys(n: number): { key: string; label: string; full: string }[] {
  const out = [];
  const d = new Date();
  d.setUTCDate(1);
  for (let i = n - 1; i >= 0; i--) {
    const m = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() - i, 1));
    out.push({
      key: m.toISOString().slice(0, 7),
      label: m.toLocaleDateString("it-IT", { month: "short", timeZone: "UTC" }).replace(".", "").slice(0, 3),
      full: m.toLocaleDateString("it-IT", { month: "long", year: "numeric", timeZone: "UTC" }),
    });
  }
  return out;
}

export default async function ReportsPage() {
  const db = await createSocialClient();
  const months = monthKeys(12);
  const since = `${months[0].key}-01T00:00:00Z`;
  const [leadsRes, quotesRes] = await Promise.all([
    db.from("leads").select("id, created_at, source, status").gte("created_at", since).limit(10000),
    db.from("quotes").select("total, accepted_at, status, created_at, lead:leads(created_at)").limit(5000),
  ]);
  const leads = (leadsRes.data ?? []) as { id: string; created_at: string; source: string | null; status: string }[];
  const quotes = (quotesRes.data ?? []) as unknown as { total: number; accepted_at: string | null; status: string; created_at: string; lead: { created_at: string } | null }[];
  const accepted = quotes.filter((q) => q.status === "accepted" && q.accepted_at);

  const leadsPerMonth: Point[] = months.map((m) => ({ label: m.label, full: m.full, value: leads.filter((l) => l.created_at.slice(0, 7) === m.key).length }));
  const revenuePerMonth: Point[] = months.map((m) => ({ label: m.label, full: m.full, value: accepted.filter((q) => q.accepted_at!.slice(0, 7) === m.key).reduce((s, q) => s + Number(q.total), 0) }));

  const bySource = new Map<string, { n: number; won: number }>();
  for (const l of leads) {
    const k = l.source ?? "altro";
    const cur = bySource.get(k) ?? { n: 0, won: 0 };
    cur.n++;
    if (l.status === "won") cur.won++;
    bySource.set(k, cur);
  }
  const sourceRows = [...bySource.entries()]
    .sort((a, b) => b[1].n - a[1].n)
    .map(([k, v]) => ({ label: SOURCE_LABEL[k] ?? k, value: v.n, note: v.won ? `${v.won} vint${v.won === 1 ? "o" : "i"} (${Math.round((v.won / v.n) * 100)}%)` : undefined }));

  const funnel = ["new", "contacted", "qualified", "proposal", "won", "lost"].map((s) => ({ label: STATUS_LABEL_IT[s], value: leads.filter((l) => l.status === s).length }));

  const won = leads.filter((l) => l.status === "won").length;
  const closed = won + leads.filter((l) => l.status === "lost").length;
  const revenue = accepted.reduce((s, q) => s + Number(q.total), 0);
  const days = accepted.filter((q) => q.lead?.created_at).map((q) => (new Date(q.accepted_at!).getTime() - new Date(q.lead!.created_at).getTime()) / 86_400_000);
  const avgDays = days.length ? Math.round(days.reduce((a, b) => a + b, 0) / days.length) : null;
  const sentQuotes = quotes.filter((q) => q.status !== "draft").length;

  const tiles = [
    ["Contatti (12 mesi)", String(leads.length)],
    ["Tasso di chiusura", closed ? `${Math.round((won / closed) * 100)}%` : "—"],
    ["Fatturato preventivi accettati", eur(revenue)],
    ["Giorni medi per chiudere", avgDays != null ? String(avgDays) : "—"],
    ["Preventivi accettati", sentQuotes ? `${accepted.length} su ${sentQuotes}` : "—"],
    ["Valore medio", accepted.length ? eur(revenue / accepted.length) : "—"],
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-white text-2xl font-bold">Report</h1>
        <p className="text-white/40 text-sm mt-0.5">Ultimi 12 mesi: da dove arrivano i contatti, quanti diventano clienti, quanto fatturate.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 mb-6">
        {tiles.map(([k, v]) => (
          <div key={k} className="bg-[#141414] border border-white/[0.06] rounded-xl p-4">
            <p className="text-white/40 text-xs leading-tight">{k}</p>
            <p className="text-white text-xl font-bold mt-1.5 tabular-nums">{v}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <div className="bg-[#141414] border border-white/[0.06] rounded-xl p-5">
          <h2 className="text-white font-semibold text-sm mb-6">Nuovi contatti al mese</h2>
          <ColumnChart data={leadsPerMonth} unit="contatti" />
        </div>
        <div className="bg-[#141414] border border-white/[0.06] rounded-xl p-5">
          <h2 className="text-white font-semibold text-sm mb-6">Preventivi accettati al mese (€)</h2>
          <ColumnChart data={revenuePerMonth} color={CHART_AQUA} format={eur} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-[#141414] border border-white/[0.06] rounded-xl p-5">
          <h2 className="text-white font-semibold text-sm mb-4">Da dove arrivano</h2>
          {sourceRows.length ? <HBarList rows={sourceRows} /> : <p className="text-white/30 text-sm">Ancora nessun contatto.</p>}
        </div>
        <div className="bg-[#141414] border border-white/[0.06] rounded-xl p-5">
          <h2 className="text-white font-semibold text-sm mb-4">A che punto sono</h2>
          <HBarList rows={funnel} />
        </div>
      </div>

      <details className="mt-4 bg-[#141414] border border-white/[0.06] rounded-xl p-5">
        <summary className="text-white/50 text-sm cursor-pointer">Vedi i numeri in tabella</summary>
        <table className="w-full text-sm mt-3">
          <thead><tr className="text-white/35 text-xs text-left"><th className="py-1.5">Mese</th><th className="py-1.5 text-right">Contatti</th><th className="py-1.5 text-right">Accettato</th></tr></thead>
          <tbody>
            {months.map((m, i) => (
              <tr key={m.key} className="border-t border-white/[0.04] text-white/70">
                <td className="py-1.5 capitalize">{m.full}</td>
                <td className="py-1.5 text-right tabular-nums">{leadsPerMonth[i].value}</td>
                <td className="py-1.5 text-right tabular-nums">{eur(revenuePerMonth[i].value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}
