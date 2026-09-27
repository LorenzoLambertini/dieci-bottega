import { createSocialClient } from "@/lib/social-ai/db";
import { Card, isMissingTable, MigrationNotice, PageHeader, Pill, SocialTabs } from "@/components/crm/social/ui";
import { EditableKnowledge, KNOWLEDGE_CATEGORIES, KnowledgeForm } from "@/components/crm/social/Forms";
import { FALLBACK_KNOWLEDGE } from "@/lib/social-ai/prompt";

export const dynamic = "force-dynamic";

export default async function KnowledgePage() {
  const supabase = await createSocialClient();
  const { data, error } = await supabase.from("ai_knowledge").select("*").order("category").order("position").order("title");
  const items = (data ?? []) as { id: string; category: string; title: string; content: string; active: boolean; position: number }[];
  const activeCount = items.filter((i) => i.active).length;

  return (
    <div>
      <PageHeader title="Knowledge base AI" subtitle="Le uniche informazioni che Claude può usare per rispondere: azienda, servizi, prezzi, FAQ, casi studio, tono." />
      <SocialTabs active="/crm/ai/knowledge" />
      {isMissingTable(error) && <MigrationNotice error={error!.message} />}

      <div className="bg-[#141414] border border-white/[0.06] rounded-xl px-5 py-4 mb-6 text-sm text-white/50">
        Claude <strong className="text-white/80">non inventa</strong> prezzi, servizi, tempi, risultati, clienti o casi studio: se un&apos;informazione non è qui, passa la conversazione al team o dice che deve verificare.
        {activeCount === 0 && (
          <details className="mt-3">
            <summary className="cursor-pointer text-yellow-400/80">Nessuna voce attiva: viene usata la knowledge di base derivata dal chatbot del sito (clicca per vederla)</summary>
            <pre className="mt-2 text-xs text-white/40 whitespace-pre-wrap">{FALLBACK_KNOWLEDGE}</pre>
          </details>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_460px] gap-6 items-start">
        <div className="space-y-4">
          {Object.entries(KNOWLEDGE_CATEGORIES).map(([cat, label]) => {
            const list = items.filter((i) => i.category === cat);
            if (!list.length) return null;
            return (
              <Card key={cat} title={`${label} (${list.length})`}>
                <div className="divide-y divide-white/[0.04]">
                  {list.map((i) => (
                    <EditableKnowledge key={i.id} item={i}>
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-white/85 text-sm font-medium">{i.title}</p>
                        <Pill tone={i.active ? "green" : "gray"}>{i.active ? "Attiva" : "Off"}</Pill>
                      </div>
                      <p className="text-white/45 text-xs mt-1 whitespace-pre-wrap line-clamp-6">{i.content}</p>
                    </EditableKnowledge>
                  ))}
                </div>
              </Card>
            );
          })}
          {items.length === 0 && !error && <p className="text-white/20 text-sm text-center py-10">Nessuna voce ancora.</p>}
        </div>
        <Card title="Nuova voce">
          <div className="p-5"><KnowledgeForm /></div>
        </Card>
      </div>
    </div>
  );
}
