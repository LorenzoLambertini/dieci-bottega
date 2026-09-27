import Link from "next/link";
import { notFound } from "next/navigation";
import { createSocialClient } from "@/lib/social-ai/db";
import { Card, fmtDate, Pill, PlatformBadge, TemperaturePill } from "@/components/crm/social/ui";
import { ConversationActions, Composer, MarkReadOnOpen, RetryButton } from "@/components/crm/social/ConversationControls";
import { StatusBadge } from "@/components/crm/Badge";
import { SIGNAL_LABELS } from "@/lib/social-ai/scoring";
import { PROVIDERS } from "@/lib/social-ai/providers";
import type { LeadStatus } from "@/lib/supabase/types";
import type { Platform } from "@/lib/social-ai/types";

interface TimelineItem {
  id: string;
  kind: "message" | "comment";
  direction: "inbound" | "outbound";
  content: string | null;
  created_at: string;
  ai_generated?: boolean;
  delivery_status: string;
  error: string | null;
  private_reply?: boolean;
  sent_by?: string | null;
}

export async function ConversationView({ id }: { id: string }) {
  const supabase = await createSocialClient();
  const { data: conv } = await supabase.from("social_conversations").select("*").eq("id", id).maybeSingle();
  if (!conv) notFound();

  const [identityRes, leadRes, msgsRes, commentsRes, actionsRes] = await Promise.all([
    supabase.from("social_identities").select("*").eq("id", conv.identity_id).maybeSingle(),
    conv.contact_id ? supabase.from("leads").select("*").eq("id", conv.contact_id).maybeSingle() : Promise.resolve({ data: null }),
    supabase.from("social_messages").select("*").eq("conversation_id", id).order("created_at", { ascending: true }).limit(200),
    supabase.from("social_comments").select("*").eq("conversation_id", id).order("created_at", { ascending: true }).limit(100),
    supabase.from("ai_actions").select("id, created_at, action_type, actor, summary, status, error").eq("conversation_id", id).order("created_at", { ascending: false }).limit(12),
  ]);
  const identity = identityRes.data as { username: string | null; display_name: string | null; avatar_url: string | null; platform_user_id: string } | null;
  const lead = leadRes.data as
    | { id: string; name: string; email: string | null; phone: string | null; company: string | null; source: string | null; status: LeadStatus; score: number; temperature: string | null; interests: string[] | null; notes: string | null }
    | null;

  const [tagsRes, deliveriesRes, activitiesRes, oppsRes] = lead
    ? await Promise.all([
        supabase.from("lead_tags").select("tags(name)").eq("lead_id", lead.id),
        supabase.from("guide_deliveries").select("id, sent_at, status, channel, guides(name)").eq("contact_id", lead.id).order("sent_at", { ascending: false }),
        supabase.from("activities").select("id, type, subject, created_at").eq("lead_id", lead.id).order("created_at", { ascending: false }).limit(6),
        supabase.from("opportunities").select("id, title, value, probability").eq("lead_id", lead.id),
      ])
    : [{ data: [] }, { data: [] }, { data: [] }, { data: [] }];

  const tags = ((tagsRes.data ?? []) as unknown as { tags: { name: string } | null }[]).map((t) => t.tags?.name).filter(Boolean) as string[];
  const deliveries = (deliveriesRes.data ?? []) as unknown as { id: string; sent_at: string; status: string; channel: string; guides: { name: string } | null }[];
  const activities = (activitiesRes.data ?? []) as { id: string; type: string; subject: string | null; created_at: string }[];
  const opps = (oppsRes.data ?? []) as { id: string; title: string; value: number | null; probability: number }[];
  const actions = (actionsRes.data ?? []) as { id: string; created_at: string; action_type: string; actor: string; summary: string | null; status: string; error: string | null }[];

  const timeline: TimelineItem[] = [
    ...((msgsRes.data ?? []) as TimelineItem[]).map((m) => ({ ...m, kind: "message" as const, private_reply: !!(m as unknown as { reply_to_comment_id?: string }).reply_to_comment_id })),
    ...((commentsRes.data ?? []) as TimelineItem[]).map((c) => ({ ...c, kind: "comment" as const })),
  ].sort((a, b) => a.created_at.localeCompare(b.created_at));

  const name = lead?.name ?? identity?.display_name ?? (identity?.username ? `@${identity.username}` : "Utente");
  const [firstName, ...rest] = name.replace(/^@/, "").split(" ");
  const platform = conv.platform as Platform;
  const caps = PROVIDERS[platform].capabilities;
  const hasComment = timeline.some((t) => t.kind === "comment" && t.direction === "inbound");
  const windowOpen = !!conv.last_inbound_at && Date.now() - new Date(conv.last_inbound_at).getTime() < 24 * 3600_000;

  return (
    <div>
      <MarkReadOnOpen id={id} unread={conv.unread_count} />
      <div className="flex items-center gap-2 text-sm text-white/30 mb-4">
        <Link href="/crm/social/inbox" className="hover:text-white/60">← Inbox</Link>
        <span>/</span>
        <span className="text-white/60 truncate">{name}</span>
      </div>

      {conv.status === "needs_human" && (
        <div className="bg-[#E63B2E]/10 border border-[#E63B2E]/30 rounded-xl px-5 py-3 mb-4 flex items-center gap-3 flex-wrap">
          <span className="text-[#E63B2E] font-semibold text-sm">Richiede intervento umano</span>
          <span className="text-white/50 text-sm flex-1">{conv.handoff_reason}</span>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[260px_minmax(0,1fr)_300px] gap-4">
        {/* SINISTRA — contesto conversazione */}
        <div className="space-y-4 order-2 xl:order-1">
          <Card title="Conversazione">
            <div className="p-5 space-y-3 text-sm">
              <div className="flex items-center justify-between"><span className="text-white/30 text-xs uppercase tracking-wider">Piattaforma</span><PlatformBadge platform={platform} full /></div>
              <div className="flex items-center justify-between"><span className="text-white/30 text-xs uppercase tracking-wider">Stato</span>
                <Pill tone={conv.status === "needs_human" ? "red" : conv.status === "human" ? "purple" : conv.status === "closed" ? "gray" : "green"}>{conv.status}</Pill></div>
              <div className="flex items-center justify-between"><span className="text-white/30 text-xs uppercase tracking-wider">AI</span><Pill tone={conv.ai_enabled ? "green" : "gray"}>{conv.ai_enabled ? "Attiva" : "Sospesa"}</Pill></div>
              <div className="flex items-center justify-between"><span className="text-white/30 text-xs uppercase tracking-wider">Lead score</span><TemperaturePill temperature={conv.temperature} score={conv.lead_score} /></div>
              {conv.intent && <div className="flex items-center justify-between"><span className="text-white/30 text-xs uppercase tracking-wider">Intent</span><span className="text-white/70">{conv.intent}</span></div>}
              <div className="flex items-center justify-between"><span className="text-white/30 text-xs uppercase tracking-wider">Finestra DM</span><span className={windowOpen ? "text-green-400 text-xs" : "text-white/40 text-xs"}>{windowOpen ? "Aperta (24h)" : "Chiusa"}</span></div>
              {(conv.signals as string[]).length > 0 && (
                <div>
                  <p className="text-white/30 text-xs uppercase tracking-wider mb-1.5">Segnali</p>
                  <div className="flex flex-wrap gap-1">{(conv.signals as string[]).map((s) => <span key={s} className="text-[10px] bg-white/[0.05] text-white/50 px-1.5 py-0.5 rounded">{SIGNAL_LABELS[s] ?? s}</span>)}</div>
                </div>
              )}
              {conv.summary && (
                <div>
                  <p className="text-white/30 text-xs uppercase tracking-wider mb-1.5">Riassunto AI</p>
                  <p className="text-white/50 text-xs whitespace-pre-wrap">{conv.summary}</p>
                </div>
              )}
            </div>
            <div className="px-5 pb-5">
              <ConversationActions id={id} aiEnabled={conv.ai_enabled} humanTakeover={conv.human_takeover} status={conv.status} />
            </div>
          </Card>

          <Card title="Azioni AI">
            <div className="divide-y divide-white/[0.04]">
              {actions.length === 0 && <p className="px-5 py-6 text-white/20 text-xs text-center">Nessuna azione.</p>}
              {actions.map((a) => (
                <div key={a.id} className="px-5 py-2.5">
                  <p className="text-white/60 text-xs">{a.summary ?? a.action_type}</p>
                  <p className="text-white/25 text-[11px]">{a.actor} · {fmtDate(a.created_at)} {a.status !== "success" && <span className={a.status === "error" ? "text-[#E63B2E]" : ""}>· {a.status}</span>}</p>
                  {a.error && <p className="text-[#E63B2E]/70 text-[11px] truncate" title={a.error}>{a.error}</p>}
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* CENTRO — messaggi */}
        <div className="order-1 xl:order-2 bg-[#141414] border border-white/[0.06] rounded-xl flex flex-col min-h-[60vh]">
          <div className="px-5 py-4 border-b border-white/[0.06] flex items-center gap-3">
            <PlatformBadge platform={platform} />
            <p className="text-white font-semibold text-sm truncate">{name}</p>
            {identity?.username && <span className="text-white/30 text-xs">@{identity.username}</span>}
          </div>
          <div className="flex-1 p-4 lg:p-5 space-y-3 overflow-y-auto max-h-[65vh]">
            {timeline.length === 0 && <p className="text-white/20 text-sm text-center py-10">Nessun messaggio.</p>}
            {timeline.map((t) => {
              const out = t.direction === "outbound";
              return (
                <div key={`${t.kind}-${t.id}`} className={`flex ${out ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-xl px-3.5 py-2.5 ${out ? "bg-[#E63B2E]/15 border border-[#E63B2E]/20" : "bg-white/[0.05] border border-white/[0.06]"}`}>
                    <p className="text-[10px] uppercase tracking-wider mb-1 text-white/30">
                      {t.kind === "comment" ? (out ? "Risposta al commento" : "Commento pubblico") : t.private_reply ? "DM · private reply" : "DM"}
                      {out && (t.ai_generated ? " · AI" : t.sent_by ? " · Team" : " · Automazione")}
                    </p>
                    <p className="text-white/85 text-sm whitespace-pre-wrap break-words">{t.content}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-white/25 text-[11px]">{fmtDate(t.created_at)}</span>
                      {out && t.delivery_status === "pending" && <span className="text-yellow-400 text-[11px]">In invio…</span>}
                      {out && t.delivery_status === "failed" && (
                        <>
                          <span className="text-[#E63B2E] text-[11px] font-semibold" title={t.error ?? ""}>Invio non riuscito</span>
                          <RetryButton kind={t.kind} id={t.id} />
                        </>
                      )}
                    </div>
                    {out && t.delivery_status === "failed" && t.error && <p className="text-[#E63B2E]/60 text-[11px] mt-0.5">{t.error}</p>}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="border-t border-white/[0.06] p-4">
            <Composer
              id={id}
              canDm={caps.send_dm.status === "supported"}
              canComment={hasComment && caps.reply_comments.status !== "not_available"}
              windowOpen={windowOpen}
            />
          </div>
        </div>

        {/* DESTRA — scheda CRM */}
        <div className="space-y-4 order-3">
          <Card title="Scheda contatto" action={lead ? <Link href={`/crm/leads/${lead.id}`} className="text-white/30 hover:text-white/60 text-xs">Apri lead →</Link> : undefined}>
            {!lead ? (
              <p className="px-5 py-6 text-white/20 text-sm">Nessun contatto collegato.</p>
            ) : (
              <div className="p-5 space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  {identity?.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={identity.avatar_url} alt="" className="w-11 h-11 rounded-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-[#E63B2E]/10 flex items-center justify-center text-[#E63B2E] font-bold">{(firstName[0] ?? "?").toUpperCase()}</div>
                  )}
                  <div className="min-w-0">
                    <p className="text-white font-semibold truncate">{lead.name}</p>
                    <StatusBadge status={lead.status} />
                  </div>
                </div>
                <dl className="grid grid-cols-[90px_1fr] gap-y-1.5 text-xs">
                  <dt className="text-white/30">Nome</dt><dd className="text-white/70">{firstName || "—"}</dd>
                  <dt className="text-white/30">Cognome</dt><dd className="text-white/70">{rest.join(" ") || "—"}</dd>
                  <dt className="text-white/30">Email</dt><dd className="text-white/70 truncate">{lead.email ?? "—"}</dd>
                  <dt className="text-white/30">Telefono</dt><dd className="text-white/70">{lead.phone ?? "—"}</dd>
                  <dt className="text-white/30">Social</dt><dd className="text-white/70 truncate">{identity?.username ? `@${identity.username}` : identity?.platform_user_id ?? "—"}</dd>
                  <dt className="text-white/30">Source</dt><dd className="text-white/70">{lead.source ?? "—"}</dd>
                  <dt className="text-white/30">Lead score</dt><dd className="text-white/70">{lead.score}/100</dd>
                  <dt className="text-white/30">Temperatura</dt><dd><TemperaturePill temperature={lead.temperature} /></dd>
                  {lead.company && (<><dt className="text-white/30">Azienda</dt><dd className="text-white/70">{lead.company}</dd></>)}
                </dl>
                {(lead.interests ?? []).length > 0 && (
                  <div><p className="text-white/30 text-xs uppercase tracking-wider mb-1">Interessi</p><p className="text-white/60 text-xs">{lead.interests!.join(", ")}</p></div>
                )}
                <div>
                  <p className="text-white/30 text-xs uppercase tracking-wider mb-1">Tag</p>
                  <div className="flex flex-wrap gap-1">{tags.length ? tags.map((t) => <span key={t} className="text-[10px] bg-white/[0.05] text-white/50 px-1.5 py-0.5 rounded">{t}</span>) : <span className="text-white/20 text-xs">—</span>}</div>
                </div>
                <div>
                  <p className="text-white/30 text-xs uppercase tracking-wider mb-1">Guide ricevute</p>
                  {deliveries.length ? deliveries.map((d) => (
                    <p key={d.id} className="text-white/60 text-xs">{d.guides?.name ?? "Guida"} · {d.channel} · <span className={d.status === "sent" ? "text-green-400" : "text-[#E63B2E]"}>{d.status}</span> · {fmtDate(d.sent_at)}</p>
                  )) : <p className="text-white/20 text-xs">—</p>}
                </div>
                {opps.length > 0 && (
                  <div>
                    <p className="text-white/30 text-xs uppercase tracking-wider mb-1">Opportunità</p>
                    {opps.map((o) => <p key={o.id} className="text-white/60 text-xs">{o.title}{o.value != null ? ` · €${o.value}` : ""} · {o.probability}%</p>)}
                  </div>
                )}
                {lead.notes && (
                  <div><p className="text-white/30 text-xs uppercase tracking-wider mb-1">Note</p><p className="text-white/50 text-xs whitespace-pre-wrap line-clamp-6">{lead.notes}</p></div>
                )}
              </div>
            )}
          </Card>

          {activities.length > 0 && (
            <Card title="Ultime attività">
              <div className="divide-y divide-white/[0.04]">
                {activities.map((a) => (
                  <div key={a.id} className="px-5 py-2.5">
                    <p className="text-white/60 text-xs">{a.subject ?? a.type}</p>
                    <p className="text-white/25 text-[11px]">{fmtDate(a.created_at)}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
