import { createSocialClient } from "@/lib/social-ai/db";
import { Card, isMissingTable, MigrationNotice, PageHeader, Pill, PlatformBadge, SocialTabs } from "@/components/crm/social/ui";
import { EditableGuide, GuideForm, type GuideFormValue } from "@/components/crm/social/Forms";
import Link from "next/link";
import { computeFunnel, type DeliveryRow } from "@/lib/social-ai/lead-magnet";

export const dynamic = "force-dynamic";

export default async function GuidesPage() {
  const supabase = await createSocialClient();
  const [{ data, error }, { data: deliveries }] = await Promise.all([
    supabase.from("guides").select("*").order("created_at", { ascending: false }),
    supabase.from("guide_deliveries").select("guide_id, platform, status, opened_at, downloaded_at, attachment_sent").limit(5000),
  ]);
  const guides = (data ?? []) as { id: string; name: string; slug: string; description: string | null; url: string; active: boolean; trigger_keywords: string[]; platforms: string[]; file_url: string | null; match_mode: string }[];
  const byGuide = new Map<string, DeliveryRow[]>();
  for (const d of (deliveries ?? []) as (DeliveryRow & { guide_id: string })[]) byGuide.set(d.guide_id, [...(byGuide.get(d.guide_id) ?? []), d]);

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
              <EditableGuide key={g.id} guide={g as GuideFormValue}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-white/85 text-sm font-medium">{g.file_url ? "🎁 " : ""}{g.name}</p>
                    <a href={g.url} target="_blank" rel="noopener noreferrer" className="text-white/30 text-xs hover:text-[#E63B2E] truncate block">{g.url}</a>
                    {g.description && <p className="text-white/40 text-xs mt-1">{g.description}</p>}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {g.trigger_keywords.map((k) => <span key={k} className="text-[10px] bg-white/[0.05] text-white/50 px-1.5 py-0.5 rounded">{k}</span>)}
                    </div>
                    <div className="flex gap-1 mt-2">{g.platforms.map((p) => <PlatformBadge key={p} platform={p} />)}</div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <Pill tone={g.active ? "green" : "gray"}>{g.active ? "Attiva" : "Off"}</Pill>
                    {(() => {
                      const f = computeFunnel(byGuide.get(g.id) ?? []);
                      return (
                        <Link href={`/crm/social/guides/${g.id}`} className="text-right text-white/40 hover:text-white text-[11px] leading-relaxed">
                          {f.requests} richieste · {f.sent} inviati<br />
                          {f.opened} aperti{g.file_url ? ` · ${f.downloaded} download` : ""}<br />
                          <span className="text-[#E63B2E]">Statistiche →</span>
                        </Link>
                      );
                    })()}
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
