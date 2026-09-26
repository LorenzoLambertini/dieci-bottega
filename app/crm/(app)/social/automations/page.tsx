import Link from "next/link";
import { createSocialClient } from "@/lib/social-ai/db";
import { Card, isMissingTable, MigrationNotice, PageHeader, PlatformBadge, SocialTabs } from "@/components/crm/social/ui";
import { ACTION_LABEL, RuleForm, RuleRowControls, TRIGGER_LABEL } from "@/components/crm/social/Forms";

export const dynamic = "force-dynamic";

export default async function SocialAutomationsPage() {
  const supabase = await createSocialClient();
  const [{ data, error }, { data: guides }] = await Promise.all([
    supabase.from("social_automation_rules").select("*").order("priority").order("created_at"),
    supabase.from("guides").select("id, name").order("name"),
  ]);
  const rules = (data ?? []) as { id: string; name: string; platform: string; trigger_type: string; trigger_value: string; action_type: string; guide_id: string | null; enabled: boolean; priority: number; run_count: number; configuration: Record<string, unknown> }[];
  const guideName = new Map(((guides ?? []) as { id: string; name: string }[]).map((g) => [g.id, g.name]));

  return (
    <div>
      <PageHeader title="Automazioni social" subtitle="Regole semplici: TRIGGER → AZIONE. Valutate prima di chiamare Claude." />
      <SocialTabs active="/crm/social/automations" />
      {isMissingTable(error) && <MigrationNotice error={error!.message} />}
      <p className="text-white/30 text-xs mb-4">
        I workflow del CRM (lead creato, stage cambiato) restano in <Link href="/crm/automations" className="underline hover:text-white/60">Automazioni CRM</Link>.
      </p>
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_440px] gap-6 items-start">
        <Card title={`Regole (${rules.length})`}>
          <div className="divide-y divide-white/[0.04]">
            {rules.length === 0 && <p className="px-5 py-10 text-center text-white/20 text-sm">Nessuna regola. Esempio: commento contiene &quot;GUIDA&quot; → invia guida.</p>}
            {rules.map((r) => (
              <div key={r.id} className="px-5 py-4 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${r.enabled ? "bg-green-400" : "bg-white/20"}`} />
                  <div className="min-w-0">
                    <p className="text-white/80 text-sm font-medium truncate">{r.name}</p>
                    <p className="text-white/40 text-xs mt-0.5">
                      <span className="text-white/25">SE</span> {TRIGGER_LABEL[r.trigger_type] ?? r.trigger_type} <span className="text-white/70">&quot;{r.trigger_value}&quot;</span>{" "}
                      <span className="text-white/25">→</span> {ACTION_LABEL[r.action_type] ?? r.action_type}
                      {r.guide_id && <span className="text-white/70"> &quot;{guideName.get(r.guide_id) ?? "?"}&quot;</span>}
                      {typeof r.configuration.tag === "string" && <span className="text-white/70"> #{r.configuration.tag}</span>}
                      {r.configuration.takeover === true && <span className="text-white/70"> + takeover</span>}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      {r.platform === "all" ? <span className="text-white/25 text-[11px]">Tutte le piattaforme</span> : <PlatformBadge platform={r.platform} />}
                      <span className="text-white/25 text-[11px]">priorità {r.priority} · {r.run_count}x eseguita</span>
                    </div>
                  </div>
                </div>
                <RuleRowControls id={r.id} enabled={r.enabled} name={r.name} />
              </div>
            ))}
          </div>
        </Card>
        <Card title="Nuova automazione">
          <div className="p-5"><RuleForm guides={(guides ?? []) as { id: string; name: string }[]} /></div>
        </Card>
      </div>
    </div>
  );
}
