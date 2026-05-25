import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { StatusBadge } from "@/components/crm/Badge";
import { LeadActions } from "@/components/crm/LeadActions";
import type { Lead, Activity, PipelineStage, Profile, Opportunity } from "@/lib/supabase/types";

const ACTIVITY_ICON: Record<string, string> = {
  note: "📝",
  call: "📞",
  email: "✉️",
  meeting: "🗓",
  stage_change: "🔄",
  assignment: "👤",
  system: "⚙️",
};

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: lead } = await supabase
    .from("leads")
    .select(`
      *,
      stage:pipeline_stages(id, name, color, position),
      assigned_profile:profiles!leads_assigned_to_fkey(id, full_name, email, avatar_url)
    `)
    .eq("id", id)
    .single<
      Lead & {
        stage: PipelineStage | null;
        assigned_profile: Profile | null;
      }
    >();

  if (!lead) notFound();

  const [activitiesRes, opportunitiesRes, stagesRes, profilesRes] =
    await Promise.all([
      supabase
        .from("activities")
        .select("*")
        .eq("lead_id", id)
        .order("created_at", { ascending: false }),
      supabase
        .from("opportunities")
        .select("*")
        .eq("lead_id", id)
        .order("created_at", { ascending: false }),
      supabase.from("pipeline_stages").select("*").order("position"),
      supabase.from("profiles").select("id, full_name, email").order("full_name"),
    ]);

  const activities = (activitiesRes.data ?? []) as Activity[];
  const opportunities = (opportunitiesRes.data ?? []) as Opportunity[];
  const stages = (stagesRes.data ?? []) as PipelineStage[];
  const profiles = (profilesRes.data ?? []) as Pick<Profile, "id" | "full_name" | "email">[];

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-white/30 mb-6">
        <Link href="/crm/leads" className="hover:text-white/60 transition-colors">
          Lead
        </Link>
        <span>/</span>
        <span className="text-white/60">{lead.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main — left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Lead header card */}
          <div className="bg-[#141414] border border-white/[0.06] rounded-xl p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#E63B2E]/10 flex items-center justify-center text-[#E63B2E] text-lg font-bold shrink-0">
                  {(lead.name?.[0] ?? "?").toUpperCase()}
                </div>
                <div>
                  <h1 className="text-white text-xl font-bold">{lead.name}</h1>
                  <p className="text-white/40 text-sm">{lead.email}</p>
                  {lead.company && (
                    <p className="text-white/30 text-sm">{lead.company}</p>
                  )}
                </div>
              </div>
              <StatusBadge status={lead.status} />
            </div>

            {/* Info grid */}
            <div className="mt-5 pt-5 border-t border-white/[0.06] grid grid-cols-2 sm:grid-cols-3 gap-4">
              {lead.phone && (
                <div>
                  <p className="text-white/30 text-xs uppercase tracking-wider mb-1">Telefono</p>
                  <a href={`tel:${lead.phone}`} className="text-white/70 text-sm hover:text-white transition-colors">
                    {lead.phone}
                  </a>
                </div>
              )}
              {lead.website && (
                <div>
                  <p className="text-white/30 text-xs uppercase tracking-wider mb-1">Sito</p>
                  <a
                    href={lead.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/70 text-sm hover:text-[#E63B2E] transition-colors truncate block"
                  >
                    {lead.website.replace(/^https?:\/\//, "")}
                  </a>
                </div>
              )}
              {lead.source && (
                <div>
                  <p className="text-white/30 text-xs uppercase tracking-wider mb-1">Sorgente</p>
                  <p className="text-white/70 text-sm capitalize">{lead.source}</p>
                </div>
              )}
              {lead.stage && (
                <div>
                  <p className="text-white/30 text-xs uppercase tracking-wider mb-1">Stage</p>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium inline-block"
                    style={{
                      background: lead.stage.color + "22",
                      color: lead.stage.color,
                    }}
                  >
                    {lead.stage.name}
                  </span>
                </div>
              )}
              <div>
                <p className="text-white/30 text-xs uppercase tracking-wider mb-1">Score</p>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 rounded-full bg-white/10 w-20 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#E63B2E]"
                      style={{ width: `${lead.score ?? 0}%` }}
                    />
                  </div>
                  <span className="text-white/60 text-sm tabular-nums">{lead.score}</span>
                </div>
              </div>
              <div>
                <p className="text-white/30 text-xs uppercase tracking-wider mb-1">Creato</p>
                <p className="text-white/70 text-sm">
                  {new Date(lead.created_at).toLocaleDateString("it-IT", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>

            {/* UTM if present */}
            {(lead.utm_source || lead.utm_medium || lead.utm_campaign) && (
              <div className="mt-4 pt-4 border-t border-white/[0.06]">
                <p className="text-white/30 text-xs uppercase tracking-wider mb-2">UTM</p>
                <div className="flex flex-wrap gap-2">
                  {lead.utm_source && (
                    <span className="text-xs bg-white/[0.05] text-white/40 px-2 py-0.5 rounded">
                      source: {lead.utm_source}
                    </span>
                  )}
                  {lead.utm_medium && (
                    <span className="text-xs bg-white/[0.05] text-white/40 px-2 py-0.5 rounded">
                      medium: {lead.utm_medium}
                    </span>
                  )}
                  {lead.utm_campaign && (
                    <span className="text-xs bg-white/[0.05] text-white/40 px-2 py-0.5 rounded">
                      campaign: {lead.utm_campaign}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Notes */}
            {lead.notes && (
              <div className="mt-4 pt-4 border-t border-white/[0.06]">
                <p className="text-white/30 text-xs uppercase tracking-wider mb-2">Note</p>
                <p className="text-white/60 text-sm leading-relaxed whitespace-pre-wrap">
                  {lead.notes}
                </p>
              </div>
            )}
          </div>

          {/* Opportunities */}
          {opportunities.length > 0 && (
            <div className="bg-[#141414] border border-white/[0.06] rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-white/[0.06]">
                <h2 className="text-white font-semibold text-sm">
                  Opportunità ({opportunities.length})
                </h2>
              </div>
              <div className="divide-y divide-white/[0.04]">
                {opportunities.map((opp) => (
                  <div key={opp.id} className="px-5 py-3.5 flex items-center justify-between">
                    <div>
                      <p className="text-white/80 text-sm font-medium">{opp.title}</p>
                      {opp.expected_close && (
                        <p className="text-white/30 text-xs mt-0.5">
                          Chiusura:{" "}
                          {new Date(opp.expected_close).toLocaleDateString("it-IT")}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      {opp.value != null && (
                        <p className="text-white/80 text-sm font-semibold">
                          {new Intl.NumberFormat("it-IT", {
                            style: "currency",
                            currency: opp.currency ?? "EUR",
                            maximumFractionDigits: 0,
                          }).format(opp.value)}
                        </p>
                      )}
                      <p className="text-white/30 text-xs">{opp.probability}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Activity feed */}
          <div className="bg-[#141414] border border-white/[0.06] rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-white/[0.06]">
              <h2 className="text-white font-semibold text-sm">
                Attività ({activities.length})
              </h2>
            </div>
            {activities.length === 0 && (
              <p className="px-5 py-8 text-center text-white/20 text-sm">
                Nessuna attività ancora.
              </p>
            )}
            <div className="divide-y divide-white/[0.04]">
              {activities.map((act) => (
                <div key={act.id} className="flex items-start gap-3 px-5 py-3.5">
                  <span className="text-base mt-0.5 shrink-0">
                    {ACTIVITY_ICON[act.type] ?? "•"}
                  </span>
                  <div className="flex-1 min-w-0">
                    {act.subject && (
                      <p className="text-white/70 text-sm font-medium">
                        {act.subject}
                      </p>
                    )}
                    {act.body && (
                      <p className="text-white/40 text-sm mt-0.5 whitespace-pre-wrap">
                        {act.body}
                      </p>
                    )}
                    <p className="text-white/25 text-xs mt-1">
                      {new Date(act.created_at).toLocaleString("it-IT", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
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

        {/* Sidebar — right column */}
        <div className="space-y-4">
          <LeadActions
            lead={lead}
            stages={stages}
            profiles={profiles}
          />
        </div>
      </div>
    </div>
  );
}
