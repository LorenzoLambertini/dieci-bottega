/**
 * OAuth per collegare gli account social. Solo admin CRM.
 * - `state` casuale salvato su DB (CSRF), valido 10 minuti, monouso.
 * - Token cifrati AES-256-GCM in social_account_secrets (mai esposti al frontend).
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Platform } from "./types";
import { encryptToken, randomState } from "./crypto";
import { META_SCOPES, metaAuthorizeUrl, metaExchangeCode, metaSubscribePage } from "./providers/meta";
import { LINKEDIN_SCOPES, linkedinAuthorizeUrl, linkedinExchangeCode } from "./providers/linkedin";
import { TIKTOK_SCOPES, tiktokAuthorizeUrl, tiktokExchangeCode } from "./providers/tiktok";

export const OAUTH_PLATFORMS = ["meta", "linkedin", "tiktok"] as const;
export type OAuthPlatform = (typeof OAUTH_PLATFORMS)[number];

export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || "https://diecibottega.it").replace(/\/$/, "");
}

export function redirectUri(p: OAuthPlatform): string {
  return `${siteUrl()}/api/social/oauth/${p}/callback`;
}

export async function startOAuth(db: SupabaseClient, p: OAuthPlatform, userId: string): Promise<string> {
  const state = randomState();
  await db.from("social_oauth_states").insert({ state, platform: p, user_id: userId });
  // pulizia stati scaduti
  await db.from("social_oauth_states").delete().lt("created_at", new Date(Date.now() - 3600_000).toISOString());
  if (p === "meta") return metaAuthorizeUrl(state, redirectUri(p));
  if (p === "linkedin") return linkedinAuthorizeUrl(state, redirectUri(p));
  return tiktokAuthorizeUrl(state, redirectUri(p));
}

export async function consumeState(db: SupabaseClient, p: OAuthPlatform, state: string): Promise<string | null> {
  const { data } = await db.from("social_oauth_states").select("*").eq("state", state).eq("platform", p).maybeSingle();
  if (!data) return null;
  await db.from("social_oauth_states").delete().eq("state", state);
  if (Date.now() - new Date(data.created_at).getTime() > 10 * 60_000) return null;
  return data.user_id as string;
}

async function saveAccount(
  db: SupabaseClient,
  a: {
    platform: Platform;
    accountId: string;
    name: string | null;
    username: string | null;
    pageId?: string | null;
    scopes: string[];
    token: string;
    refreshToken?: string | null;
    expiresAt?: string | null;
    webhookStatus: string;
    status?: string;
  }
) {
  const { data: row, error } = await db
    .from("social_accounts")
    .upsert(
      {
        platform: a.platform,
        account_id: a.accountId,
        account_name: a.name,
        username: a.username,
        page_id: a.pageId ?? null,
        status: a.status ?? "connected",
        scopes: a.scopes,
        token_expires_at: a.expiresAt ?? null,
        webhook_status: a.webhookStatus,
        last_sync_at: new Date().toISOString(),
        last_error: null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "platform,account_id" }
    )
    .select("id")
    .single();
  if (error || !row) throw new Error(`social_accounts: ${error?.message}`);
  await db.from("social_account_secrets").upsert(
    {
      account_id: row.id,
      access_token_enc: encryptToken(a.token),
      refresh_token_enc: a.refreshToken ? encryptToken(a.refreshToken) : null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "account_id" }
  );
  return row.id as string;
}

/** Completa l'OAuth e salva gli account. Ritorna il numero di account collegati. */
export async function completeOAuth(db: SupabaseClient, p: OAuthPlatform, code: string): Promise<number> {
  if (p === "meta") {
    const assets = await metaExchangeCode(code, redirectUri(p));
    const subscribed = new Map<string, boolean>();
    for (const a of assets) {
      if (!subscribed.has(a.pageId)) subscribed.set(a.pageId, await metaSubscribePage(a.pageId, a.pageToken));
      await saveAccount(db, {
        platform: a.platform,
        accountId: a.accountId,
        name: a.name,
        username: a.username,
        pageId: a.pageId,
        scopes: META_SCOPES,
        token: a.pageToken,
        webhookStatus: subscribed.get(a.pageId) ? "subscribed" : "failed",
      });
    }
    return assets.length;
  }
  if (p === "linkedin") {
    const r = await linkedinExchangeCode(code, redirectUri(p));
    if (!r.organizations.length) {
      // token valido ma nessuna Pagina amministrabile (o permessi non approvati)
      await saveAccount(db, {
        platform: "linkedin", accountId: "pending-approval", name: "LinkedIn (in attesa di approvazione)", username: null,
        scopes: r.scopes, token: r.accessToken, refreshToken: r.refreshToken, expiresAt: r.expiresAt, webhookStatus: "not_available", status: "requires_approval",
      });
      return 0;
    }
    for (const org of r.organizations) {
      await saveAccount(db, {
        platform: "linkedin", accountId: org, name: org, username: null, scopes: r.scopes.length ? r.scopes : LINKEDIN_SCOPES,
        token: r.accessToken, refreshToken: r.refreshToken, expiresAt: r.expiresAt, webhookStatus: "unknown",
      });
    }
    return r.organizations.length;
  }
  const r = await tiktokExchangeCode(code, redirectUri(p));
  await saveAccount(db, {
    platform: "tiktok", accountId: r.openId, name: r.displayName, username: r.displayName, scopes: r.scopes.length ? r.scopes : TIKTOK_SCOPES,
    token: r.accessToken, refreshToken: r.refreshToken, expiresAt: r.expiresAt, webhookStatus: "not_available",
  });
  return 1;
}
