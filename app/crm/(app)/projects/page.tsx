import { createSocialClient } from "@/lib/social-ai/db";
import { getCrmUser } from "@/lib/social-ai/auth";
import { PHASES, ProjectCard, type ProjectRow } from "@/components/crm/ProjectCard";

export const dynamic = "force-dynamic";

const eur = (n: number) => new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

export default async function ProjectsPage({ searchParams }: { searchParams: Promise<{ all?: string }> }) {
  const { all } = await searchParams;
  const db = await createSocialClient();
  const [res, user] = await Promise.all([
    db.from("projects").select("*, lead:leads(name, company)").order("due_date", { ascending: true, nullsFirst: false }),
    getCrmUser(),
  ]);
  const projects = (res.data ?? []) as ProjectRow[];
  const visible = all ? projects : projects.filter((p) => p.phase !== "chiuso");
  const active = projects.filter((p) => !["online", "manutenzione", "chiuso"].includes(p.phase));
  const collected = projects.reduce((s, p) => s + (p.balance_paid_at ? Number(p.value) : p.deposit_paid_at ? Number(p.deposit_amount) : 0), 0);
  const toCollect = projects.reduce((s, p) => s + Number(p.value), 0) - collected;
  const mrr = projects.filter((p) => p.care_plan && p.phase !== "chiuso").reduce((s, p) => s + Number(p.care_monthly ?? 0), 0);
  const in30 = new Date(Date.now() + 30 * 86_400_000).toISOString().slice(0, 10);
  const renewals = projects.filter((p) => p.care_renewal_date && p.care_renewal_date <= in30 && p.phase !== "chiuso");

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-white text-2xl font-bold">Progetti e clienti</h1>
        <p className="text-white/40 text-sm mt-0.5">Si creano da soli quando un contatto diventa &quot;Vinto&quot; o accetta un preventivo.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          ["In lavorazione", String(active.length)],
          ["Incassato", eur(collected)],
          ["Da incassare", eur(Math.max(0, toCollect))],
          ["Manutenzioni / mese", eur(mrr)],
        ].map(([k, v]) => (
          <div key={k} className="bg-[#141414] border border-white/[0.06] rounded-xl p-4">
            <p className="text-white/40 text-xs">{k}</p>
            <p className="text-white text-xl font-bold mt-1">{v}</p>
          </div>
        ))}
      </div>

      {renewals.length > 0 && (
        <div className="bg-teal-500/10 border border-teal-500/20 text-teal-300 rounded-xl px-5 py-3 mb-6 text-sm">
          🔁 Rinnovi manutenzione nei prossimi 30 giorni: {renewals.map((p) => `${p.lead?.company ?? p.lead?.name} (${new Date(p.care_renewal_date!).toLocaleDateString("it-IT")})`).join(", ")}
        </div>
      )}

      {visible.length === 0 ? (
        <div className="bg-[#141414] border border-white/[0.06] rounded-xl p-10 text-center text-white/35 text-sm">
          Nessun progetto ancora. Quando un preventivo viene accettato, qui compare il progetto con fasi, pagamenti e scadenze.
        </div>
      ) : (
        <div className="space-y-6">
          {PHASES.filter((ph) => visible.some((p) => p.phase === ph.id)).map((ph) => (
            <section key={ph.id}>
              <h2 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: ph.color }}>{ph.label} · {visible.filter((p) => p.phase === ph.id).length}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {visible.filter((p) => p.phase === ph.id).map((p) => <ProjectCard key={p.id} p={p} isAdmin={user?.role === "admin"} />)}
              </div>
            </section>
          ))}
        </div>
      )}
      <p className="mt-6 text-xs"><a href={all ? "/crm/projects" : "/crm/projects?all=1"} className="text-white/30 hover:text-white/60">{all ? "Nascondi i chiusi" : "Mostra anche i progetti chiusi"}</a></p>
    </div>
  );
}
