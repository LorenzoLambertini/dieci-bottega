import { createClient } from "@/lib/supabase/server";
import { KPICard } from "@/components/crm/KPICard";
import type { KPI, Lead, Activity } from "@/lib/supabase/types";
import Link from "next/link";
import { createSocialClient } from "@/lib/social-ai/db";
import { SOCIAL_SOURCES } from "@/lib/crm/lead-filters";
import { computeToday, type TodayKind } from "@/lib/crm/today";

const ACTION_ICON: Record<TodayKind, string> = { call: "📞", followup: "⏰", chat: "💬", new: "✨", quote: "📄", due: "🚀", renewal: "🔁", dormant: "🤝" };

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
  const sdb = await createSocialClient();
  const weekAgo = new Date(Date.now() - 7 * 86_400_000).toISOString();

  // Fetch KPIs and recent data in parallel
  const [kpiRes, recentLeadsRes, recentActivitiesRes, today, needsHumanRes, socialLeadsRes] = await Promise.all([
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
    computeToday(sdb),
    // Social AI: conversazioni che aspettano una persona, contatti social della settimana
    sdb.from("social_conversations").select("id", { count: "exact", head: true }).eq("status", "needs_human"),
    sdb.from("leads").select("id", { count: "exact", head: true }).in("source", SOCIAL_SOURCES).gte("created_at", weekAgo),
  ]);
  const needsHuman = needsHumanRes.count ?? 0;
  const socialLeadsWeek = socialLeadsRes.count ?? 0;

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
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-white text-2xl font-bold">Dashboard</h1>
          <p className="text-white/40 text-sm mt-1">
            Panoramica real-time del tuo funnel.
          </p>
        </div>
        <Link
          href="/crm/leads/new"
          className="shrink-0 bg-[#E63B2E] hover:bg-[#C44A38] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          + Contatto
        </Link>
      </div>

      {/* Oggi: cosa richiede una decisione adesso */}
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-2 lg:gap-3 mb-4">
        {[
          ["Nuovi oggi", String(today.counters.newToday), "/crm/leads"],
          ["Da contattare", String(today.counters.toContact), "/crm/leads?status=new"],
          ["Promemoria", String(today.counters.followups), "/crm/leads?follow=due"],
          ["Call oggi", String(today.counters.calls), "/crm/calendar"],
          ["Preventivi aperti", today.counters.openQuotes ? `${today.counters.openQuotes} · ${fmtEur(today.counters.openQuotesValue)}` : "0", "/crm/reports"],
          ["Chat da seguire", String(today.counters.chats), "/crm/social/inbox"],
        ].map(([k, v, href]) => (
          <Link key={k} href={href} className="bg-[#141414] border border-white/[0.06] hover:border-white/15 rounded-xl px-3 py-3 transition-colors">
            <p className="text-white/40 text-[11px] leading-tight">{k}</p>
            <p className="text-white text-lg font-bold mt-1 tabular-nums truncate">{v}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
        <div className="lg:col-span-2 bg-[#141414] border border-white/[0.06] rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
            <h2 className="text-white font-semibold text-sm">Da fare adesso {today.actions.length > 0 && <span className="text-[#E63B2E]">({today.actions.length})</span>}</h2>
            <Link href="/crm/calendar" className="text-white/30 hover:text-white/60 text-xs transition-colors">Calendario →</Link>
          </div>
          {today.actions.length === 0 ? (
            <p className="px-5 py-6 text-white/30 text-sm">Tutto in ordine: niente da fare in questo momento. 🎉</p>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {today.actions.slice(0, 15).map((a, i) => (
                <Link key={`${a.kind}-${i}`} href={a.href} className="flex items-center gap-3 px-5 py-3 hover:bg-white/[0.02] transition-colors">
                  <span className="text-base shrink-0" aria-hidden>{ACTION_ICON[a.kind]}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white/85 text-sm font-medium truncate">{a.title}</p>
                    {a.detail && <p className={`text-xs truncate ${a.late ? "text-[#E63B2E]" : "text-white/35"}`}>{a.detail}</p>}
                  </div>
                  <span className="text-white/20 text-xs shrink-0">→</span>
                </Link>
              ))}
            </div>
          )}
        </div>
        <div className="bg-[#141414] border border-white/[0.06] rounded-xl p-5 flex flex-col gap-4">
          <h2 className="text-white font-semibold text-sm">Social AI</h2>
          <Link href="/crm/social/inbox" className={`rounded-lg px-4 py-3 border transition-colors ${needsHuman ? "bg-[#E63B2E]/10 border-[#E63B2E]/25 hover:bg-[#E63B2E]/15" : "bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.05]"}`}>
            <p className={`text-2xl font-bold ${needsHuman ? "text-[#E63B2E]" : "text-white/80"}`}>{needsHuman}</p>
            <p className="text-white/40 text-xs">conversazioni aspettano una persona</p>
          </Link>
          <Link href="/crm/leads?channel=social" className="rounded-lg px-4 py-3 border bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.05] transition-colors">
            <p className="text-2xl font-bold text-white/80">{socialLeadsWeek}</p>
            <p className="text-white/40 text-xs">nuovi contatti dai social negli ultimi 7 giorni</p>
          </Link>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6 lg:mb-8">
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
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
                    timeZone: "Europe/Rome",
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
