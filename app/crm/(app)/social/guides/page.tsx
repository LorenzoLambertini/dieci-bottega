import { createSocialClient } from "@/lib/social-ai/db";
import { Card, isMissingTable, MigrationNotice, PageHeader, Pill, PlatformBadge, SocialTabs } from "@/components/crm/social/ui";
import { EditableGuide, GuideForm } from "@/components/crm/social/Forms";

export const dynamic = "force-dynamic";

export default async function GuidesPage() {
  const supabase = await createSocialClient();
  const [{ data, error }, { data: deliveries }] = await Promise.all([
    supabase.from("guides").select("*").order("created_at", { ascending: false }),
    supabase.from("guide_deliveries").select("guide_id, status"),
  ]);
  const guides = (data ?? []) as { id: string; name: string; slug: string; description: string | null; url: string; active: boolean; trigger_keywords: string[]; platforms: string[] }[];
  const sent = new Map<string, number>();
  for (const d of (deliveries ?? []) as { guide_id: string; status: string }[]) if (d.status === "sent") sent.set(d.guide_id, (sent.get(d.guide_id) ?? 0) + 1);

  return (
    <div>
      <PageHeader title="Guide / Lead magnet" subtitle={`${guides.length} guide · inviate automaticamente su richiesta`} />
      <SocialTabs active="/crm/social/guides" />
      {isMissingTable(error) && <MigrationNotice error={error!.message} />}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_420px] gap-6 items-start">
        <Card title="Guide">
          <div className="divide-y divide-white/[0.04]">
            {guides.length === 0 && <p className="px-5 py-10 text-center text-white/20 text-sm">Nessuna guida.</p>}
            {guides.map((g) => (
              <EditableGuide key={g.id} guide={g}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-white/85 text-sm font-medium">{g.name}</p>
                    <a href={g.url} target="_blank" rel="noopener noreferrer" className="text-white/30 text-xs hover:text-[#E63B2E] truncate block">{g.url}</a>
                    {g.description && <p className="text-white/40 text-xs mt-1">{g.description}</p>}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {g.trigger_keywords.map((k) => <span key={k} className="text-[10px] bg-white/[0.05] text-white/50 px-1.5 py-0.5 rounded">{k}</span>)}
                    </div>
                    <div className="flex gap-1 mt-2">{g.platforms.map((p) => <PlatformBadge key={p} platform={p} />)}</div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <Pill tone={g.active ? "green" : "gray"}>{g.active ? "Attiva" : "Off"}</Pill>
                    <span className="text-white/25 text-xs">{sent.get(g.id) ?? 0} invii</span>
                  </div>
                </div>
              </EditableGuide>
            ))}
          </div>
        </Card>
        <Card title="Nuova guida">
          <div className="p-5"><GuideForm /></div>
        </Card>
      </div>
    </div>
  );
}
