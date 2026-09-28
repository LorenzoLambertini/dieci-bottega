import Link from "next/link";
import { createSocialClient } from "@/lib/social-ai/db";
import { Card, fmtDate, isMissingTable, MigrationNotice, PageHeader, PlatformBadge, SocialTabs } from "@/components/crm/social/ui";
import { ReplyFeedback, type FeedbackValue } from "@/components/crm/social/ReplyFeedback";
import { LessonRow } from "@/components/crm/social/LessonRow";

export const dynamic = "force-dynamic";

interface ReplyRow {
  id: string;
  kind: "message" | "comment";
  conversation_id: string | null;
  platform: string;
  content: string | null;
  created_at: string;
  delivery_status: string;
  error: string | null;
}
interface InboundRow {
  conversation_id: string | null;
  content: string | null;
  created_at: string;
}
interface FeedbackRow extends FeedbackValue {
  id: string;
  message_id: string | null;
  comment_id: string | null;
  customer_text: string | null;
  updated_at: string;
}

const FILTERS = [
  { key: "todo", label: "Da valutare" },
  { key: "rated", label: "Valutate" },
  { key: "bad", label: "Voto basso (1-2)" },
  { key: "all", label: "Tutte" },
];

export default async function AiRepliesPage({ searchParams }: { searchParams: Promise<{ f?: string }> }) {
  const sp = await searchParams;
  const f = FILTERS.some((x) => x.key === sp.f) ? sp.f! : "todo";
  const supabase = await createSocialClient();

  const [msgs, comments, fb] = await Promise.all([
    supabase.from("social_messages").select("id, conversation_id, platform, content, created_at, delivery_status, error").eq("direction", "outbound").eq("ai_generated", true).order("created_at", { ascending: false }).limit(100),
    supabase.from("social_comments").select("id, conversation_id, platform, content, created_at, delivery_status, error").eq("direction", "outbound").order("created_at", { ascending: false }).limit(50),
    supabase.from("ai_reply_feedback").select("id, message_id, comment_id, rating, better_reply, lesson, use_for_training, customer_text, updated_at").order("updated_at", { ascending: false }).limit(300),
  ]);
  const feedbackRows = (fb.data ?? []) as FeedbackRow[];
  const byKey = new Map<string, FeedbackRow>();
  for (const r of feedbackRows) {
    if (r.message_id) byKey.set(`message-${r.message_id}`, r);
    if (r.comment_id) byKey.set(`comment-${r.comment_id}`, r);
  }

  let replies: ReplyRow[] = [
    ...((msgs.data ?? []) as Omit<ReplyRow, "kind">[]).map((r) => ({ ...r, kind: "message" as const })),
    ...((comments.data ?? []) as Omit<ReplyRow, "kind">[]).map((r) => ({ ...r, kind: "comment" as const })),
  ].sort((a, b) => b.created_at.localeCompare(a.created_at));
  const total = replies.length;
  const ratedCount = replies.filter((r) => byKey.has(`${r.kind}-${r.id}`)).length;
  if (f === "todo") replies = replies.filter((r) => !byKey.has(`${r.kind}-${r.id}`));
  if (f === "rated") replies = replies.filter((r) => byKey.has(`${r.kind}-${r.id}`));
  if (f === "bad") replies = replies.filter((r) => (byKey.get(`${r.kind}-${r.id}`)?.rating ?? 5) <= 2);
  replies = replies.slice(0, 40);

  // Cosa aveva scritto il cliente prima di ogni risposta
  const convIds = [...new Set(replies.map((r) => r.conversation_id).filter(Boolean))] as string[];
  const inbound: InboundRow[] = [];
  if (convIds.length) {
    const [im, ic] = await Promise.all([
      supabase.from("social_messages").select("conversation_id, content, created_at").in("conversation_id", convIds).eq("direction", "inbound").order("created_at", { ascending: false }).limit(500),
      supabase.from("social_comments").select("conversation_id, content, created_at").in("conversation_id", convIds).eq("direction", "inbound").order("created_at", { ascending: false }).limit(300),
    ]);
    inbound.push(...((im.data ?? []) as InboundRow[]), ...((ic.data ?? []) as InboundRow[]));
  }
  const questionFor = (r: ReplyRow) =>
    inbound
      .filter((i) => i.conversation_id === r.conversation_id && i.created_at <= r.created_at)
      .sort((a, b) => b.created_at.localeCompare(a.created_at))[0]?.content ?? null;

  const ratings = feedbackRows.map((r) => r.rating);
  const avg = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null;
  const lessons = feedbackRows.filter((r) => r.lesson || r.better_reply);
  const activeLessons = lessons.filter((r) => r.use_for_training).length;

  return (
    <div>
      <PageHeader title="Risposte AI" subtitle="Leggi cosa ha scritto l'AI, dai un voto e correggila: impara dalle tue correzioni." />
      <SocialTabs active="/crm/social/replies" />
      {isMissingTable(fb.error) && <MigrationNotice error={fb.error!.message} />}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <Stat label="Risposte AI" value={String(total)} />
        <Stat label="Valutate" value={`${ratedCount}/${total}`} />
        <Stat label="Voto medio" value={avg ? `${avg.toFixed(1)} ★` : "—"} />
        <Stat label="Lezioni attive" value={String(activeLessons)} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-4 items-start">
        <div>
          <div className="flex gap-1.5 flex-wrap mb-4">
            {FILTERS.map((x) => (
              <Link
                key={x.key}
                href={`/crm/social/replies?f=${x.key}`}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${f === x.key ? "bg-[#E63B2E] border-[#E63B2E] text-white" : "border-white/[0.08] text-white/40 hover:text-white/70"}`}
              >
                {x.label}
              </Link>
            ))}
          </div>
          <div className="space-y-3">
            {replies.length === 0 && (
              <p className="bg-[#141414] border border-white/[0.06] rounded-xl px-5 py-12 text-center text-white/25 text-sm">
                {f === "todo" ? "Nessuna risposta da valutare. 👌" : "Nessuna risposta."}
              </p>
            )}
            {replies.map((r) => {
              const q = questionFor(r);
              return (
                <div key={`${r.kind}-${r.id}`} className="bg-[#141414] border border-white/[0.06] rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2 text-[11px] text-white/35">
                    <PlatformBadge platform={r.platform} />
                    <span>{r.kind === "comment" ? "Risposta a commento" : "DM"}</span>
                    <span>· {fmtDate(r.created_at)}</span>
                    {r.delivery_status === "failed" && <span className="text-[#E63B2E]">· non inviata</span>}
                    {r.conversation_id && (
                      <Link href={`/crm/social/inbox?c=${r.conversation_id}`} className="ml-auto text-white/40 hover:text-white">Apri chat →</Link>
                    )}
                  </div>
                  {q && (
                    <div className="bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-2">
                      <p className="text-white/30 text-[10px] uppercase tracking-wider mb-0.5">Cliente</p>
                      <p className="text-white/75 text-sm whitespace-pre-wrap">{q}</p>
                    </div>
                  )}
                  <div className="bg-[#E63B2E]/10 border border-[#E63B2E]/20 rounded-lg px-3 py-2">
                    <p className="text-white/30 text-[10px] uppercase tracking-wider mb-0.5">AI</p>
                    <p className="text-white/85 text-sm whitespace-pre-wrap">{r.content}</p>
                    {r.content && <ReplyFeedback kind={r.kind} id={r.id} aiText={r.content} initial={byKey.get(`${r.kind}-${r.id}`)} />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <Card title="Cosa ha imparato l'AI">
          <div className="divide-y divide-white/[0.04]">
            {lessons.length === 0 && (
              <p className="px-5 py-6 text-white/25 text-xs">
                Ancora niente. Quando correggi una risposta o scrivi una regola, compare qui e l&apos;AI la usa da subito nelle risposte successive.
              </p>
            )}
            {lessons.map((l) => (
              <LessonRow key={l.id} id={l.id} lesson={l.lesson} betterReply={l.better_reply} customerText={l.customer_text} rating={l.rating} active={l.use_for_training} />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#141414] border border-white/[0.06] rounded-xl px-4 py-3">
      <p className="text-white/35 text-[11px] uppercase tracking-wider">{label}</p>
      <p className="text-white text-xl font-bold mt-0.5">{value}</p>
    </div>
  );
}
