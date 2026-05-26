import { createClient } from "@/lib/supabase/server";
import { KanbanBoard } from "@/components/crm/KanbanBoard";
import type { Lead, PipelineStage, Profile } from "@/lib/supabase/types";

export default async function PipelinePage() {
  const supabase = await createClient();

  const [stagesRes, leadsRes] = await Promise.all([
    supabase.from("pipeline_stages").select("*").order("position"),
    supabase
      .from("leads")
      .select(`
        id, name, email, company, status, score, stage_id, created_at,
        assigned_profile:profiles!leads_assigned_to_fkey(id, full_name, avatar_url)
      `)
      .not("stage_id", "is", null)
      .in("status", ["new", "contacted", "qualified", "proposal"])
      .order("created_at", { ascending: false }),
  ]);

  const stages = (stagesRes.data ?? []) as PipelineStage[];
  const leads = (leadsRes.data ?? []) as (Lead & {
    assigned_profile: Pick<Profile, "id" | "full_name" | "avatar_url"> | null;
  })[];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-white text-2xl font-bold">Pipeline</h1>
        <p className="text-white/40 text-sm mt-0.5">
          {leads.length} lead attivi nel funnel
        </p>
      </div>

      <KanbanBoard stages={stages} leads={leads} />
    </div>
  );
}
