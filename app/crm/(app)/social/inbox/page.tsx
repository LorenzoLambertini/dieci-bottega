import Link from "next/link";
import { createSocialClient } from "@/lib/social-ai/db";
import { fmtDate, isMissingTable, MigrationNotice, PageHeader, Pill, PlatformBadge, SocialTabs, TemperaturePill } from "@/components/crm/social/ui";
import { ConversationView } from "./ConversationView";

export const dynamic = "force-dynamic";

const FILTERS = [
  { key: "all", label: "Tutti" },
  { key: "instagram", label: "Instagram" },
  { key: "facebook", label: "Facebook" },
  { key: "linkedin", label: "LinkedIn" },
  { key: "tiktok", label: "TikTok" },
  { key: "unread", label: "Non letti" },
  { key: "ai", label: "AI" },
  { key: "human", label: "Richiede umano" },
  { key: "lead", label: "Lead" },
  { key: "hot", label: "Hot lead" },
];

interface ConvListRow {
  id: string;
  platform: string;
  status: string;
  ai_enabled: boolean;
  human_takeover: boolean;
  lead_score: number;
  temperature: string;
  unread_count: number;
  last_message_at: string | null;
  last_message_preview: string | null;
  contact_id: string | null;
  identity: { username: string | null; display_name: string | null; avatar_url: string | null } | null;
  contact: { name: string } | null;
}

export default async function InboxPage({ searchParams }: { searchParams: Promise<{ f?: string; c?: string; page?: string }> }) {
  const sp = await searchParams;
  if (sp.c) return <ConversationView id={sp.c} />;

  const supabase = await createSocialClient();
  const f = FILTERS.some((x) => x.key === sp.f) ? sp.f! : "all";
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const PAGE = 30;

  let q = supabase
    .from("social_conversations")
    .select(
      "id, platform, status, ai_enabled, human_takeover, lead_score, temperature, unread_count, last_message_at, last_message_preview, contact_id, identity:social_identities(username, display_name, avatar_url), contact:leads(name)",
      { count: "exact" }
    )
    .order("last_message_at", { ascending: false, nullsFirst: false })
    .range((page - 1) * PAGE, page * PAGE - 1);
  if (["instagram", "facebook", "linkedin", "tiktok"].includes(f)) q = q.eq("platform", f);
  if (f === "unread") q = q.gt("unread_count", 0);
  if (f === "ai") q = q.eq("ai_enabled", true).eq("human_takeover", false);
  if (f === "human") q = q.eq("status", "needs_human");
  if (f === "lead") q = q.gte("lead_score", 30);
  if (f === "hot") q = q.eq("temperature", "hot");

  const { data, count, error } = await q;
  const rows = (data ?? []) as unknown as ConvListRow[];

  // Tag dei contatti (tabelle esistenti lead_tags/tags)
  const contactIds = [...new Set(rows.map((r) => r.contact_id).filter(Boolean))] as string[];
  const tagsByLead = new Map<string, string[]>();
  if (contactIds.length) {
    const { data: links } = await supabase.from("lead_tags").select("lead_id, tags(name)").in("lead_id", contactIds);
    for (const l of (links ?? []) as unknown as { lead_id: string; tags: { name: string } | null }[]) {
      if (!l.tags) continue;
      tagsByLead.set(l.lead_id, [...(tagsByLead.get(l.lead_id) ?? []), l.tags.name]);
    }
  }
  const totalPages = Math.ceil((count ?? 0) / PAGE);

  return (
    <div>
      <PageHeader title="Social Inbox" subtitle={`${count ?? 0} conversazioni`} />
      <SocialTabs active="/crm/social/inbox" />
      {isMissingTable(error) && <MigrationNotice error={error!.message} />}

      <div className="flex gap-1.5 flex-wrap mb-4">
        {FILTERS.map((x) => (
          <Link
            key={x.key}
            href={x.key === "all" ? "/crm/social/inbox" : `/crm/social/inbox?f=${x.key}`}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              f === x.key ? "bg-[#E63B2E] border-[#E63B2E] text-white" : "border-white/[0.08] text-white/40 hover:text-white/70"
            }`}
          >
            {x.label}
          </Link>
        ))}
      </div>

      <div className="bg-[#141414] border border-white/[0.06] rounded-xl overflow-hidden divide-y divide-white/[0.04]">
        {rows.length === 0 && <p className="px-5 py-12 text-center text-white/20 text-sm">Nessuna conversazione.</p>}
        {rows.map((r) => {
          const name = r.contact?.name ?? r.identity?.display_name ?? (r.identity?.username ? `@${r.identity.username}` : "Utente");
          const tags = r.contact_id ? tagsByLead.get(r.contact_id) ?? [] : [];
          return (
            <Link key={r.id} href={`/crm/social/inbox?c=${r.id}`} className="flex items-center gap-3 px-4 lg:px-5 py-3.5 hover:bg-white/[0.02] transition-colors">
              <div className="relative shrink-0">
                {r.identity?.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={r.identity.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover bg-white/[0.06]" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#E63B2E]/10 flex items-center justify-center text-[#E63B2E] text-sm font-bold">
                    {(name.replace("@", "")[0] ?? "?").toUpperCase()}
                  </div>
                )}
                <span className="absolute -bottom-1 -right-1"><PlatformBadge platform={r.platform} /></span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className={`text-sm truncate ${r.unread_count ? "text-white font-semibold" : "text-white/80 font-medium"}`}>{name}</p>
                  {r.identity?.username && <span className="text-white/25 text-xs truncate hidden sm:inline">@{r.identity.username}</span>}
                </div>
                <p className="text-white/40 text-xs truncate mt-0.5">{r.last_message_preview ?? "—"}</p>
                {tags.length > 0 && (
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {tags.slice(0, 4).map((t) => (
                      <span key={t} className="text-[10px] bg-white/[0.05] text-white/40 px-1.5 py-0.5 rounded">{t}</span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className="text-white/25 text-[11px]">{fmtDate(r.last_message_at)}</span>
                <div className="flex items-center gap-1">
                  {r.unread_count > 0 && <span className="min-w-5 h-5 px-1.5 rounded-full bg-[#E63B2E] text-white text-[10px] font-bold flex items-center justify-center">{r.unread_count}</span>}
                  {r.status === "needs_human" ? (
                    <Pill tone="red">Richiede umano</Pill>
                  ) : r.human_takeover ? (
                    <Pill tone="purple">Umano</Pill>
                  ) : (
                    <Pill tone={r.ai_enabled ? "green" : "gray"}>AI {r.ai_enabled ? "on" : "off"}</Pill>
                  )}
                </div>
                <TemperaturePill temperature={r.temperature} score={r.lead_score} />
              </div>
            </Link>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-end gap-2 mt-4">
          {page > 1 && <Link href={`/crm/social/inbox?f=${f}&page=${page - 1}`} className="text-white/40 hover:text-white/70 text-sm px-3 py-1.5 bg-white/[0.04] rounded-lg">← Precedente</Link>}
          {page < totalPages && <Link href={`/crm/social/inbox?f=${f}&page=${page + 1}`} className="text-white/40 hover:text-white/70 text-sm px-3 py-1.5 bg-white/[0.04] rounded-lg">Successiva →</Link>}
        </div>
      )}
    </div>
  );
}
