import { createClient } from "@/lib/supabase/server";
import { KPICard } from "@/components/crm/KPICard";
import type { KPI, Lead, Activity } from "@/lib/supabase/types";

function fmt(n: number | null | undefined, decimals = 0) {
  if (n == null) return "—";
  return n.toLocaleString("it-IT", { maximumFractionDigits: decimals });
}

function fmtEur(n: number | null | undefined) {
  if (n == null || n === 0) return "€0";
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);
}

export default async function DashboardPage() {
  const supabase = await createClient();

  // Fetch KPIs and recent data in parallel
  const [kpiRes, recentLeadsRes, recentActivitiesRes] = await Promise.all([
    supabase.from("crm_kpi").select("*").single<KPI>(),
    supabase
      .from("leads")
      .select("id, name, email, company, status, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("activities")
      .select("id, type, subject, created_at, lead_id, leads(name)")
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  const kpi = kpiRes.data;
  const recentLeads = (recentLeadsRes.data ?? []) as Lead[];
  const recentActivities = recentActivitiesRes.data ?? [];

  const STATUS_LABEL: Record<string, string> = {
    new: "Nuovo",
    contacted: "Contattato",
    qualified: "Qualificato",
    proposal: "Proposta",
    won: "Vinto",
    lost: "Perso",
  };

  const STATUS_COLOR: Record<string, string> = {
    new: "bg-blue-500/10 text-blue-400",
    contacted: "bg-yellow-500/10 text-yellow-400",
    qualified: "bg-purple-500/10 text-purple-400",
    proposal: "bg-orange-500/10 text-orange-400",
    won: "bg-green-500/10 text-green-400",
    lost: "bg-red-500/10 text-red-400",
  };

  const ACTIVITY_ICON: Record<string, string> = {
    note: "📝",
    call: "📞",
    email: "✉️",
    meeting: "🗓",
    stage_change: "🔄",
    assignment: "👤",
    system: "⚙️",
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-white text-2xl font-bold">Dashboard</h1>
        <p className="text-white/40 text-sm mt-1">
          Panoramica real-time del tuo funnel.
        </p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KPICard
          label="Lead totali"
          value={fmt(kpi?.total_leads)}
          sub={`+${fmt(kpi?.new_leads_this_month)} questo mese`}
        />
        <KPICard
          label="Nuovi oggi"
          value={fmt(kpi?.new_leads_today)}
          sub={`${fmt(kpi?.new_leads_this_week)} questa settimana`}
          accent
        />
        <KPICard
          label="Pipeline"
          value={fmtEur(kpi?.total_pipeline_value)}
          sub={`Media deal: ${fmtEur(kpi?.avg_deal_value)}`}
        />
        <KPICard
          label="Tasso di chiusura"
          value={`${fmt(kpi?.conversion_rate, 1)}%`}
          sub={`${fmt(kpi?.won_leads)} vinti · ${fmt(kpi?.lost_leads)} persi`}
        />
      </div>

      {/* Two-col layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent leads */}
        <div className="bg-[#141414] border border-white/[0.06] rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
            <h2 className="text-white font-semibold text-sm">Ultimi lead</h2>
            <a
              href="/crm/leads"
              className="text-white/30 hover:text-white/60 text-xs transition-colors"
            >
              Vedi tutti →
            </a>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {recentLeads.length === 0 && (
              <p className="px-5 py-8 text-white/20 text-sm text-center">
                Nessun lead ancora.
              </p>
            )}
            {recentLeads.map((lead) => (
              <a
                key={lead.id}
                href={`/crm/leads/${lead.id}`}
                className="flex items-center gap-3 px-5 py-3.5 hover:bg-white/[0.02] transition-colors group"
              >
                <div className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center shrink-0 text-white/40 text-xs font-semibold group-hover:bg-[#E63B2E]/10 group-hover:text-[#E63B2E] transition-colors">
                  {(lead.name?.[0] ?? "?").toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white/80 text-sm font-medium truncate">
                    {lead.name}
                  </p>
                  <p className="text-white/30 text-xs truncate">
                    {lead.company ?? lead.email}
                  </p>
                </div>
                <span
                  className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${
                    STATUS_COLOR[lead.status] ?? "bg-white/10 text-white/40"
                  }`}
                >
                  {STATUS_LABEL[lead.status] ?? lead.status}
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* Recent activities */}
        <div className="bg-[#141414] border border-white/[0.06] rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/[0.06]">
            <h2 className="text-white font-semibold text-sm">
              Attività recenti
            </h2>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {recentActivities.length === 0 && (
              <p className="px-5 py-8 text-white/20 text-sm text-center">
                Nessuna attività ancora.
              </p>
            )}
            {recentActivities.map((a: Record<string, unknown>) => (
              <div key={String(a.id)} className="flex items-start gap-3 px-5 py-3.5">
                <span className="text-base mt-0.5 shrink-0">
                  {ACTIVITY_ICON[String(a.type)] ?? "•"}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-white/70 text-sm truncate">
                    {String(a.subject ?? a.type)}
                  </p>
                  <p className="text-white/25 text-xs mt-0.5">
                    {(a.leads as Record<string, unknown>)?.name
                      ? String((a.leads as Record<string, unknown>).name)
                      : ""}{" "}
                    ·{" "}
                    {new Date(String(a.created_at)).toLocaleString("it-IT", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
