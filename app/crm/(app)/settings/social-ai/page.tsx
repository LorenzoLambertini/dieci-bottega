import { createSocialClient } from "@/lib/social-ai/db";
import { Card, CAPABILITY_STATUS, fmtDate, isMissingTable, MigrationNotice, PageHeader, Pill, PlatformBadge, SocialTabs } from "@/components/crm/social/ui";
import { DisconnectButton, SettingsForm, type SettingsValue } from "@/components/crm/social/Forms";
import { DEFAULT_SETTINGS } from "@/lib/social-ai/settings";
import { DEFAULT_SYSTEM_PROMPT } from "@/lib/social-ai/prompt";
import { DEFAULT_SCORING } from "@/lib/social-ai/scoring";
import { PROVIDERS, platformConfigured } from "@/lib/social-ai/providers";
import { PLATFORMS } from "@/lib/social-ai/types";
import type { Capability } from "@/lib/social-ai/providers/types";
import { anthropicConfigured } from "@/lib/social-ai/claude";
import { siteUrl } from "@/lib/social-ai/oauth";

export const dynamic = "force-dynamic";

const CAP_LABEL: Record<Capability, string> = {
  oauth: "Collegamento account",
  webhook: "Webhook",
  receive_dm: "Ricezione DM",
  send_dm: "Invio DM",
  receive_comments: "Ricezione commenti",
  reply_comments: "Risposta commenti",
  private_reply: "DM da commento",
  lead_sync: "Lead / CRM",
};

const OAUTH_PATH: Record<string, string> = { instagram: "meta", facebook: "meta", linkedin: "linkedin", tiktok: "tiktok" };
const WEBHOOK_PATH: Record<string, string> = { instagram: "instagram", facebook: "facebook", linkedin: "linkedin", tiktok: "tiktok" };

export default async function SocialAiSettingsPage({ searchParams }: { searchParams: Promise<{ connected?: string; error?: string; n?: string }> }) {
  const sp = await searchParams;
  const supabase = await createSocialClient();
  const { data: { user } } = await supabase.auth.getUser();
  const [{ data: profile }, settingsRes, accountsRes] = await Promise.all([
    supabase.from("profiles").select("role").eq("id", user?.id ?? "").maybeSingle(),
    supabase.from("social_ai_settings").select("*").eq("id", 1).maybeSingle(),
    supabase.from("social_accounts").select("*").order("platform"),
  ]);
  const isAdmin = (profile as { role?: string } | null)?.role === "admin";
  const value = { ...DEFAULT_SETTINGS, ...((settingsRes.data as Partial<SettingsValue> | null) ?? {}) } as SettingsValue;
  const accounts = (accountsRes.data ?? []) as { id: string; platform: string; account_name: string | null; username: string | null; status: string; scopes: string[]; webhook_status: string; last_sync_at: string | null; last_error: string | null; token_expires_at: string | null }[];
  const envModel = process.env.ANTHROPIC_MODEL || "claude-opus-5";
  const base = siteUrl();

  return (
    <div>
      <PageHeader title="Impostazioni Social AI" subtitle="Comportamento dell'AI e collegamento dei social." />
      <SocialTabs active="/crm/settings/social-ai" />
      {isMissingTable(settingsRes.error) && <MigrationNotice error={settingsRes.error!.message} />}
      {sp.connected && <div className="bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl px-5 py-3 mb-4 text-sm">Collegamento {sp.connected} completato ({sp.n ?? 0} account).</div>}
      {sp.error && <div className="bg-[#E63B2E]/10 border border-[#E63B2E]/20 text-[#E63B2E] rounded-xl px-5 py-3 mb-4 text-sm">Errore: {sp.error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Card title="Configurazione server">
          <div className="p-5 space-y-2 text-sm">
            {[
              ["ANTHROPIC_API_KEY", anthropicConfigured()],
              ["SUPABASE_SERVICE_ROLE_KEY", !!process.env.SUPABASE_SERVICE_ROLE_KEY],
              ["SOCIAL_TOKEN_ENCRYPTION_KEY", !!process.env.SOCIAL_TOKEN_ENCRYPTION_KEY],
              ["Meta (IG/FB)", platformConfigured("instagram")],
              ["LinkedIn", platformConfigured("linkedin")],
              ["TikTok", platformConfigured("tiktok")],
              ["CRON_SECRET", !!process.env.CRON_SECRET],
            ].map(([k, v]) => (
              <div key={String(k)} className="flex items-center justify-between">
                <span className="text-white/50 font-mono text-xs">{k}</span>
                <Pill tone={v ? "green" : "orange"}>{v ? "OK" : "Mancante"}</Pill>
              </div>
            ))}
            <p className="text-white/25 text-[11px] pt-2">Le chiavi non vengono mai mostrate: si verifica solo che siano presenti.</p>
          </div>
        </Card>
        <Card title="URL webhook" className="lg:col-span-2">
          <div className="p-5 space-y-2 text-xs font-mono text-white/60 break-all">
            <p>Instagram: {base}/api/webhooks/instagram</p>
            <p>Facebook: {base}/api/webhooks/facebook</p>
            <p>LinkedIn: {base}/api/webhooks/linkedin</p>
            <p>TikTok (lead): {base}/api/webhooks/tiktok</p>
            <p className="text-white/30 font-sans pt-2">Redirect OAuth: {base}/api/social/oauth/&#123;meta|linkedin|tiktok&#125;/callback · Istruzioni complete in SOCIAL_AI_SETUP.md</p>
          </div>
        </Card>
      </div>

      <h2 className="text-white font-semibold text-sm mb-3">Social</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {PLATFORMS.map((p) => {
          const accs = accounts.filter((a) => a.platform === p);
          const connected = accs.filter((a) => a.status === "connected");
          const caps = PROVIDERS[p].capabilities;
          return (
            <Card key={p} title={<span className="flex items-center gap-2"><PlatformBadge platform={p} full /> {connected.length ? "Connected" : accs.some((a) => a.status === "requires_approval") ? "Requires approval" : "Disconnected"}</span>}
              action={isAdmin && platformConfigured(p) ? (
                <a href={`/api/social/oauth/${OAUTH_PATH[p]}`} className="text-xs bg-[#E63B2E] hover:bg-[#C44A38] text-white font-semibold px-3 py-1.5 rounded-lg">{accs.length ? "Reconnect" : "Collega"}</a>
              ) : !platformConfigured(p) ? <span className="text-white/30 text-xs">Credenziali app mancanti</span> : undefined}>
              <div className="divide-y divide-white/[0.04]">
                {accs.map((a) => (
                  <div key={a.id} className="px-5 py-3 text-xs space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-white/80 text-sm truncate">{a.username ? `@${a.username}` : a.account_name ?? a.id}</p>
                      <div className="flex items-center gap-2">
                        <Pill tone={a.status === "connected" ? "green" : a.status === "requires_approval" ? "yellow" : a.status === "error" ? "red" : "gray"}>{a.status}</Pill>
                        {isAdmin && a.status !== "disconnected" && <DisconnectButton id={a.id} name={a.account_name ?? p} />}
                      </div>
                    </div>
                    <p className="text-white/35">Webhook: {a.webhook_status} · Last sync: {fmtDate(a.last_sync_at)}{a.token_expires_at ? ` · Token scade: ${fmtDate(a.token_expires_at, false)}` : ""}</p>
                    <p className="text-white/25 break-words">Permissions: {a.scopes.join(", ") || "—"}</p>
                    {a.last_error && <p className="text-[#E63B2E]/70">{a.last_error}</p>}
                  </div>
                ))}
                <div className="px-5 py-3 grid grid-cols-2 gap-x-4 gap-y-1.5">
                  {(Object.keys(CAP_LABEL) as Capability[]).map((c) => {
                    const st = caps[c].status === "supported" && !connected.length ? "not_connected" : caps[c].status;
                    return (
                      <div key={c} className="flex items-center justify-between gap-2" title={caps[c].note}>
                        <span className="text-white/40 text-xs truncate">{CAP_LABEL[c]}</span>
                        <Pill tone={CAPABILITY_STATUS[st].tone}>{CAPABILITY_STATUS[st].label}</Pill>
                      </div>
                    );
                  })}
                </div>
                <p className="px-5 py-2 text-white/25 text-[11px]">Webhook: {base}/api/webhooks/{WEBHOOK_PATH[p]}</p>
              </div>
            </Card>
          );
        })}
      </div>

      <Card title="Comportamento AI">
        <div className="p-5">
          <SettingsForm
            value={value}
            envModel={envModel}
            defaultPrompt={DEFAULT_SYSTEM_PROMPT}
            defaultScoring={JSON.stringify(DEFAULT_SCORING, null, 2)}
            isAdmin={isAdmin}
          />
        </div>
      </Card>
    </div>
  );
}
