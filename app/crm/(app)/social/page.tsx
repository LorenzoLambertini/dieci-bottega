import Link from "next/link";
import { createSocialClient } from "@/lib/social-ai/db";
import { KPICard } from "@/components/crm/KPICard";
import { Card, CAPABILITY_STATUS, fmtDate, isMissingTable, MigrationNotice, PageHeader, Pill, PlatformBadge, SocialTabs } from "@/components/crm/social/ui";
import { Simulator } from "@/components/crm/social/Simulator";
import { NotificationsMarkRead } from "@/components/crm/social/NotificationsMarkRead";
import { PROVIDERS, platformConfigured } from "@/lib/social-ai/providers";
import { PLATFORMS } from "@/lib/social-ai/types";
import { anthropicConfigured } from "@/lib/social-ai/claude";

export const dynamic = "force-dynamic";

const SOCIAL_SOURCES = ["instagram", "facebook", "linkedin", "tiktok"];

export default async function SocialDashboardPage() {
  const supabase = await createSocialClient();
  const since7 = new Date(Date.now() - 7 * 86400_000).toISOString();
  const since30 = new Date(Date.now() - 30 * 86400_000).toISOString();
  const since24 = new Date(Date.now() - 86400_000).toISOString();

  const [
    accountsRes, unreadRes, commentsCountRes, aiConvRes, humanConvRes, leadsRes, guidesRes, rulesRes,
    failedMsgRes, failedCommentRes, failedEventsRes, actionsRes, recentCommentsRes, notificationsRes, settingsRes, runsRes,
  ] = await Promise.all([
    supabase.from("social_accounts").select("id, platform, account_name, username, status, webhook_status, last_sync_at"),
    supabase.from("social_conversations").select("unread_count").gt("unread_count", 0),
    supabase.from("social_comments").select("id", { count: "exact", head: true }).eq("direction", "inbound").gte("created_at", since24),
    supabase.from("social_conversations").select("id", { count: "exact", head: true }).eq("ai_enabled", true).eq("human_takeover", false).neq("status", "closed"),
    supabase.from("social_conversations").select("id", { count: "exact", head: true }).eq("status", "needs_human"),
    supabase.from("leads").select("id", { count: "exact", head: true }).in("source", SOCIAL_SOURCES).gte("created_at", since30),
    supabase.from("guide_deliveries").select("id", { count: "exact", head: true }).eq("status", "sent").gte("sent_at", since30),
    supabase.from("social_automation_rules").select("id", { count: "exact", head: true }).eq("enabled", true),
    supabase.from("social_messages").select("id", { count: "exact", head: true }).eq("delivery_status", "failed").gte("created_at", since7),
    supabase.from("social_comments").select("id", { count: "exact", head: true }).eq("delivery_status", "failed").gte("created_at", since7),
    supabase.from("social_accounts").select("id", { count: "exact", head: true }).eq("status", "error"),
    supabase.from("ai_actions").select("id, created_at, platform, action_type, actor, summary, status, conversation_id").order("created_at", { ascending: false }).limit(10),
    supabase.from("social_comments").select("id, platform, username, content, created_at, conversation_id, response_sent").eq("direction", "inbound").order("created_at", { ascending: false }).limit(6),
    supabase.from("notifications").select("id, title, body, link, created_at, read_at").is("read_at", null).order("created_at", { ascending: false }).limit(6),
    supabase.from("social_ai_settings").select("ai_enabled, auto_reply_enabled").eq("id", 1).maybeSingle(),
    supabase.from("ai_runs").select("input_tokens, output_tokens, cache_read_tokens").gte("created_at", since30),
  ]);

  const missing = isMissingTable(accountsRes.error) ? accountsRes.error!.message : null;
  const accounts = (accountsRes.data ?? []) as { id: string; platform: string; account_name: string | null; username: string | null; status: string; webhook_status: string; last_sync_at: string | null }[];
  const unread = ((unreadRes.data ?? []) as { unread_count: number }[]).reduce((a, r) => a + r.unread_count, 0);
  const apiErrors = (failedMsgRes.count ?? 0) + (failedCommentRes.count ?? 0) + (failedEventsRes.count ?? 0);
  const runs = (runsRes.data ?? []) as { input_tokens: number; output_tokens: number; cache_read_tokens: number }[];
  const tokens = runs.reduce((a, r) => ({ in: a.in + r.input_tokens, out: a.out + r.output_tokens, cache: a.cache + r.cache_read_tokens }), { in: 0, out: 0, cache: 0 });
  const settings = settingsRes.data as { ai_enabled: boolean; auto_reply_enabled: boolean } | null;
  const actions = (actionsRes.data ?? []) as { id: string; created_at: string; platform: string | null; action_type: string; actor: string; summary: string | null; status: string; conversation_id: string | null }[];
  const comments = (recentCommentsRes.data ?? []) as { id: string; platform: string; username: string | null; content: string | null; created_at: string; conversation_id: string | null; response_sent: boolean }[];
  const notifications = (notificationsRes.data ?? []) as { id: string; title: string; body: string | null; link: string | null; created_at: string }[];

  return (
    <div>
      <PageHeader
        title="Social AI"
        subtitle="Commenti e messaggi social gestiti dal CRM, con Claude come assistente commerciale."
        action={
          <div className="flex items-center gap-2">
            <Pill tone={settings?.ai_enabled && anthropicConfigured() ? "green" : "gray"}>
              AI {settings?.ai_enabled && anthropicConfigured() ? "attiva" : "spenta"}
            </Pill>
            <Pill tone={settings?.auto_reply_enabled ? "green" : "gray"}>Auto-reply {settings?.auto_reply_enabled ? "on" : "off"}</Pill>
          </div>
        }
      />
      <SocialTabs active="/crm/social" />
      {missing && <MigrationNotice error={missing} />}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">
        <KPICard label="Messaggi non letti" value={unread} sub={`${commentsCountRes.count ?? 0} commenti nelle ultime 24h`} accent={unread > 0} />
        <KPICard label="Richiedono umano" value={humanConvRes.count ?? 0} sub={`${aiConvRes.count ?? 0} conversazioni gestite dall'AI`} accent={(humanConvRes.count ?? 0) > 0} />
        <KPICard label="Lead generati" value={leadsRes.count ?? 0} sub={`${guidesRes.count ?? 0} guide inviate · 30 giorni`} />
        <KPICard label="Errori API" value={apiErrors} sub={`${rulesRes.count ?? 0} automazioni attive`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mb-6">
        {/* Account collegati */}
        <Card title="Account collegati" action={<Link href="/crm/settings/social-ai" className="text-white/30 hover:text-white/60 text-xs">Gestisci →</Link>}>
          <div className="divide-y divide-white/[0.04]">
            {PLATFORMS.map((p) => {
              const acc = accounts.filter((a) => a.platform === p);
              const connected = acc.filter((a) => a.status === "connected");
              const dmCap = PROVIDERS[p].capabilities.send_dm.status;
              const status = connected.length ? "supported" : acc.some((a) => a.status === "requires_approval") ? "requires_approval" : "not_connected";
              return (
                <div key={p} className="px-5 py-3 flex items-center gap-3">
                  <PlatformBadge platform={p} />
                  <div className="flex-1 min-w-0">
                    <p className="text-white/70 text-sm truncate">
                      {connected.map((a) => a.username ? `@${a.username}` : a.account_name).join(", ") || (platformConfigured(p) ? "Non collegato" : "Credenziali app mancanti")}
                    </p>
                    <p className="text-white/25 text-xs">DM: {CAPABILITY_STATUS[dmCap].label}</p>
                  </div>
                  <Pill tone={CAPABILITY_STATUS[status].tone}>{status === "supported" ? "Connected" : CAPABILITY_STATUS[status].label}</Pill>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Notifiche */}
        <Card title={`Notifiche (${notifications.length})`} action={notifications.length ? <NotificationsMarkRead /> : undefined}>
          <div className="divide-y divide-white/[0.04]">
            {notifications.length === 0 && <p className="px-5 py-8 text-white/20 text-sm text-center">Nessuna notifica.</p>}
            {notifications.map((n) => (
              <Link key={n.id} href={n.link ?? "/crm/social/inbox"} className="block px-5 py-3 hover:bg-white/[0.02]">
                <p className="text-white/80 text-sm truncate">{n.title}</p>
                <p className="text-white/30 text-xs truncate">{n.body}</p>
                <p className="text-white/20 text-[11px] mt-0.5">{fmtDate(n.created_at)}</p>
              </Link>
            ))}
          </div>
        </Card>

        {/* Commenti recenti */}
        <Card title="Commenti recenti" action={<Link href="/crm/social/inbox" className="text-white/30 hover:text-white/60 text-xs">Inbox →</Link>}>
          <div className="divide-y divide-white/[0.04]">
            {comments.length === 0 && <p className="px-5 py-8 text-white/20 text-sm text-center">Nessun commento ancora.</p>}
            {comments.map((c) => (
              <Link key={c.id} href={c.conversation_id ? `/crm/social/inbox?c=${c.conversation_id}` : "/crm/social/inbox"} className="flex items-start gap-3 px-5 py-3 hover:bg-white/[0.02]">
                <PlatformBadge platform={c.platform} />
                <div className="flex-1 min-w-0">
                  <p className="text-white/70 text-sm truncate">{c.content}</p>
                  <p className="text-white/25 text-xs">{c.username ? `@${c.username} · ` : ""}{fmtDate(c.created_at)}</p>
                </div>
                {c.response_sent && <Pill tone="green">Risposto</Pill>}
              </Link>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        <Card title="Ultime attività AI" className="lg:col-span-2" action={<Link href="/crm/social/logs" className="text-white/30 hover:text-white/60 text-xs">AI Logs →</Link>}>
          <div className="divide-y divide-white/[0.04]">
            {actions.length === 0 && <p className="px-5 py-8 text-white/20 text-sm text-center">Nessuna attività ancora.</p>}
            {actions.map((a) => (
              <div key={a.id} className="flex items-start gap-3 px-5 py-3">
                {a.platform ? <PlatformBadge platform={a.platform} /> : <Pill>sys</Pill>}
                <div className="flex-1 min-w-0">
                  <p className="text-white/70 text-sm">{a.summary ?? a.action_type}</p>
                  <p className="text-white/25 text-xs">
                    {a.action_type} · {a.actor} · {fmtDate(a.created_at)}
                    {a.conversation_id && (
                      <> · <Link href={`/crm/social/inbox?c=${a.conversation_id}`} className="hover:text-white/60">apri</Link></>
                    )}
                  </p>
                </div>
                <Pill tone={a.status === "success" ? "green" : a.status === "error" ? "red" : "gray"}>{a.status}</Pill>
              </div>
            ))}
          </div>
          <div className="px-5 py-3 border-t border-white/[0.06] text-white/25 text-xs">
            Token Claude ultimi 30 giorni: {tokens.in.toLocaleString("it-IT")} input · {tokens.out.toLocaleString("it-IT")} output · {tokens.cache.toLocaleString("it-IT")} da cache · {runs.length} chiamate
          </div>
        </Card>

        <Simulator />
      </div>
    </div>
  );
}
