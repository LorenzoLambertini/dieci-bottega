/**
 * Meta (Instagram + Facebook) — API ufficiali Graph API.
 *
 * Connessione tramite "Facebook Login for Business": un solo OAuth collega
 * le Pagine Facebook e gli account Instagram professionali ad esse collegati.
 * Si usa il Page Access Token per entrambe le piattaforme.
 *
 * Endpoint usati (Graph API, versione in META_GRAPH_VERSION):
 *   DM (Messenger / Instagram Messaging) POST /{page-id}/messages  recipient.id
 *   Private reply a un commento          POST /{page-id}/messages  recipient.comment_id
 *   Risposta pubblica commento IG        POST /{ig-comment-id}/replies
 *   Risposta pubblica commento FB        POST /{comment-id}/comments
 *   Profilo utente IG                    GET  /{igsid}?fields=name,username,profile_pic
 *   Profilo utente FB                    GET  /{psid}?fields=first_name,last_name,profile_pic
 *
 * Limiti della piattaforma (NON aggirati):
 *   - DM solo entro 24h dall'ultimo messaggio dell'utente (standard messaging window).
 *   - Private reply: una sola per commento, entro 7 giorni dal commento.
 */
import type { InboundEvent, Platform } from "../types";
import type { CapabilityInfo, Capability, ProviderAccount, SendResult, SocialProvider, ProfileInfo } from "./types";

export const META_GRAPH_VERSION = process.env.META_GRAPH_VERSION || "v25.0";
const GRAPH = () => `https://graph.facebook.com/${process.env.META_GRAPH_VERSION || META_GRAPH_VERSION}`;

/** Codici errore Graph API temporanei (rate limit / servizio). */
const RETRYABLE_CODES = new Set([1, 2, 4, 17, 32, 341, 368, 613]);

export async function graphRequest<T = Record<string, unknown>>(
  path: string,
  token: string,
  init: { method?: "GET" | "POST" | "DELETE"; body?: Record<string, unknown>; query?: Record<string, string> } = {}
): Promise<{ ok: true; data: T } | { ok: false; error: string; retryable: boolean; status: number }> {
  const url = new URL(`${GRAPH()}/${path.replace(/^\//, "")}`);
  for (const [k, v] of Object.entries(init.query ?? {})) url.searchParams.set(k, v);
  try {
    const res = await fetch(url, {
      method: init.method ?? "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        ...(init.body ? { "Content-Type": "application/json" } : {}),
      },
      body: init.body ? JSON.stringify(init.body) : undefined,
      cache: "no-store",
    });
    const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    if (!res.ok || json.error) {
      const err = (json.error ?? {}) as { message?: string; code?: number; error_subcode?: number };
      const retryable = res.status >= 500 || res.status === 429 || RETRYABLE_CODES.has(err.code ?? -1);
      // Mai includere il token nel messaggio d'errore
      return {
        ok: false,
        status: res.status,
        retryable,
        error: `Meta ${res.status}${err.code ? ` #${err.code}` : ""}${err.error_subcode ? `/${err.error_subcode}` : ""}: ${err.message ?? "errore sconosciuto"}`,
      };
    }
    return { ok: true, data: json as T };
  } catch (e) {
    return { ok: false, status: 0, retryable: true, error: `Rete: ${(e as Error).message}` };
  }
}

function toSend(r: Awaited<ReturnType<typeof graphRequest>>): SendResult {
  if (!r.ok) return { ok: false, error: r.error, retryable: r.retryable };
  const d = r.data as { id?: string; message_id?: string };
  return { ok: true, externalId: d.message_id ?? d.id };
}

function pageIdOf(acct: ProviderAccount): string {
  return acct.row.platform === "instagram" ? acct.row.page_id ?? acct.row.account_id : acct.row.account_id;
}

const COMMON_CAPS: Record<Capability, CapabilityInfo> = {
  oauth: { status: "supported", note: "Facebook Login for Business" },
  webhook: { status: "supported", note: "Webhook firmati X-Hub-Signature-256" },
  receive_dm: { status: "supported", note: "Richiede Advanced Access al permesso di messaggistica (App Review)" },
  send_dm: { status: "supported", note: "Solo entro 24h dall'ultimo messaggio dell'utente" },
  receive_comments: { status: "supported", note: "Commenti su post/reel dell'account collegato" },
  reply_comments: { status: "supported", note: "Risposta pubblica al commento" },
  private_reply: { status: "supported", note: "1 DM per commento, entro 7 giorni" },
  lead_sync: { status: "supported", note: "Contatto CRM creato da DM e commenti" },
};

function makeProvider(platform: "instagram" | "facebook"): SocialProvider {
  return {
    platform,
    capabilities: COMMON_CAPS,

    sendMessage(acct, recipientId, text) {
      return graphRequest(`${pageIdOf(acct)}/messages`, acct.accessToken, {
        method: "POST",
        body: { recipient: { id: recipientId }, messaging_type: "RESPONSE", message: { text } },
      }).then(toSend);
    },

    replyToComment(acct, commentId, text) {
      const edge = platform === "instagram" ? "replies" : "comments";
      return graphRequest(`${commentId}/${edge}`, acct.accessToken, {
        method: "POST",
        body: { message: text },
      }).then(toSend);
    },

    sendPrivateReply(acct, commentId, text) {
      return graphRequest(`${pageIdOf(acct)}/messages`, acct.accessToken, {
        method: "POST",
        body: { recipient: { comment_id: commentId }, message: { text } },
      }).then(toSend);
    },

    async fetchProfile(acct, userId): Promise<ProfileInfo | null> {
      if (platform === "instagram") {
        const r = await graphRequest<{ name?: string; username?: string; profile_pic?: string }>(userId, acct.accessToken, {
          query: { fields: "name,username,profile_pic" },
        });
        return r.ok ? { name: r.data.name, username: r.data.username, avatarUrl: r.data.profile_pic } : null;
      }
      const r = await graphRequest<{ first_name?: string; last_name?: string; profile_pic?: string }>(userId, acct.accessToken, {
        query: { fields: "first_name,last_name,profile_pic" },
      });
      return r.ok
        ? { name: [r.data.first_name, r.data.last_name].filter(Boolean).join(" ") || null, avatarUrl: r.data.profile_pic }
        : null;
    },
  };
}

export const instagramProvider = makeProvider("instagram");
export const facebookProvider = makeProvider("facebook");

/* ─── Parsing webhook ──────────────────────────────────────── */

interface MetaMessaging {
  sender?: { id?: string };
  recipient?: { id?: string };
  timestamp?: number;
  message?: { mid?: string; text?: string; is_echo?: boolean; is_deleted?: boolean; attachments?: { type?: string; payload?: { url?: string } }[] };
}
interface MetaChange {
  field?: string;
  value?: Record<string, unknown>;
}
interface MetaEntry {
  id?: string;
  time?: number;
  messaging?: MetaMessaging[];
  changes?: MetaChange[];
}

function iso(ts: number | undefined): string {
  if (!ts) return new Date().toISOString();
  // Meta usa secondi negli entry.time e millisecondi nei messaging.timestamp
  return new Date(ts < 1e12 ? ts * 1000 : ts).toISOString();
}

/**
 * Converte il payload webhook Meta in eventi normalizzati.
 * Ignora: echo dei nostri messaggi, commenti scritti dall'account stesso,
 * messaggi cancellati, eventi non supportati.
 */
export function parseMetaWebhook(body: unknown): InboundEvent[] {
  const b = (body ?? {}) as { object?: string; entry?: MetaEntry[] };
  const platform: Platform | null = b.object === "instagram" ? "instagram" : b.object === "page" ? "facebook" : null;
  if (!platform || !Array.isArray(b.entry)) return [];
  const out: InboundEvent[] = [];

  for (const entry of b.entry) {
    const accountId = String(entry.id ?? "");

    for (const m of entry.messaging ?? []) {
      const msg = m.message;
      if (!msg?.mid || msg.is_echo || msg.is_deleted) continue;
      const senderId = m.sender?.id;
      if (!senderId || senderId === accountId) continue;
      const attachment = msg.attachments?.[0];
      const text = msg.text ?? (attachment ? `[${attachment.type ?? "allegato"}]` : "");
      out.push({
        platform,
        kind: "message",
        eventKey: `${platform}:message:${msg.mid}`,
        accountExternalId: m.recipient?.id ?? accountId,
        senderId,
        text,
        externalId: msg.mid,
        timestamp: iso(m.timestamp),
        raw: m,
      });
    }

    for (const c of entry.changes ?? []) {
      const v = c.value ?? {};
      if (platform === "instagram" && c.field === "comments") {
        const from = (v.from ?? {}) as { id?: string; username?: string };
        const id = v.id as string | undefined;
        if (!id || !from.id || from.id === accountId) continue;
        out.push({
          platform,
          kind: "comment",
          eventKey: `instagram:comment:${id}`,
          accountExternalId: accountId,
          senderId: from.id,
          senderUsername: from.username ?? null,
          text: String(v.text ?? ""),
          externalId: id,
          postId: ((v.media ?? {}) as { id?: string }).id ?? null,
          parentCommentId: (v.parent_id as string | undefined) ?? null,
          timestamp: iso(entry.time),
          raw: c,
        });
      }
      if (platform === "facebook" && c.field === "feed" && v.item === "comment" && v.verb === "add") {
        const from = (v.from ?? {}) as { id?: string; name?: string };
        const id = v.comment_id as string | undefined;
        if (!id || !from.id || from.id === accountId) continue;
        out.push({
          platform,
          kind: "comment",
          eventKey: `facebook:comment:${id}`,
          accountExternalId: accountId,
          senderId: from.id,
          senderName: from.name ?? null,
          text: String(v.message ?? ""),
          externalId: id,
          postId: (v.post_id as string | undefined) ?? null,
          parentCommentId: v.parent_id && v.parent_id !== v.post_id ? String(v.parent_id) : null,
          timestamp: iso((v.created_time as number | undefined) ?? entry.time),
          raw: c,
        });
      }
    }
  }
  return out;
}

/* ─── OAuth (Facebook Login for Business) ─────────────────── */

export const META_SCOPES = [
  "pages_show_list",
  "pages_manage_metadata",
  "pages_read_engagement",
  "pages_manage_engagement",
  "pages_messaging",
  "instagram_basic",
  "instagram_manage_comments",
  "instagram_manage_messages",
  "business_management",
];

export function metaAuthorizeUrl(state: string, redirectUri: string): string {
  const u = new URL(`https://www.facebook.com/${process.env.META_GRAPH_VERSION || META_GRAPH_VERSION}/dialog/oauth`);
  u.searchParams.set("client_id", process.env.META_APP_ID ?? "");
  u.searchParams.set("redirect_uri", redirectUri);
  u.searchParams.set("state", state);
  u.searchParams.set("response_type", "code");
  u.searchParams.set("scope", META_SCOPES.join(","));
  return u.toString();
}

export interface MetaConnectedAsset {
  platform: "facebook" | "instagram";
  accountId: string;
  name: string | null;
  username: string | null;
  pageId: string;
  pageToken: string;
}

/** Scambia il code, ottiene token long-lived e le Pagine/IG collegate. */
export async function metaExchangeCode(code: string, redirectUri: string): Promise<MetaConnectedAsset[]> {
  const appId = process.env.META_APP_ID ?? "";
  const secret = process.env.META_APP_SECRET ?? "";
  const tokenUrl = new URL(`${GRAPH()}/oauth/access_token`);
  tokenUrl.searchParams.set("client_id", appId);
  tokenUrl.searchParams.set("client_secret", secret);
  tokenUrl.searchParams.set("redirect_uri", redirectUri);
  tokenUrl.searchParams.set("code", code);
  const short = (await (await fetch(tokenUrl, { cache: "no-store" })).json()) as { access_token?: string; error?: { message?: string } };
  if (!short.access_token) throw new Error(`OAuth Meta fallito: ${short.error?.message ?? "nessun token"}`);

  const llUrl = new URL(`${GRAPH()}/oauth/access_token`);
  llUrl.searchParams.set("grant_type", "fb_exchange_token");
  llUrl.searchParams.set("client_id", appId);
  llUrl.searchParams.set("client_secret", secret);
  llUrl.searchParams.set("fb_exchange_token", short.access_token);
  const long = (await (await fetch(llUrl, { cache: "no-store" })).json()) as { access_token?: string };
  const userToken = long.access_token ?? short.access_token;

  // Con un user token long-lived i Page token restituiti non scadono.
  const pages = await graphRequest<{
    data?: { id: string; name?: string; access_token?: string; instagram_business_account?: { id: string; username?: string; name?: string } }[];
  }>("me/accounts", userToken, { query: { fields: "id,name,access_token,instagram_business_account{id,username,name}" } });
  if (!pages.ok) throw new Error(pages.error);

  const assets: MetaConnectedAsset[] = [];
  for (const p of pages.data.data ?? []) {
    if (!p.access_token) continue;
    assets.push({ platform: "facebook", accountId: p.id, name: p.name ?? null, username: null, pageId: p.id, pageToken: p.access_token });
    const ig = p.instagram_business_account;
    if (ig?.id) {
      assets.push({ platform: "instagram", accountId: ig.id, name: ig.name ?? p.name ?? null, username: ig.username ?? null, pageId: p.id, pageToken: p.access_token });
    }
  }
  return assets;
}

/** Iscrive la Pagina ai webhook dell'app (feed + messaggi). */
export async function metaSubscribePage(pageId: string, pageToken: string): Promise<boolean> {
  const r = await graphRequest(`${pageId}/subscribed_apps`, pageToken, {
    method: "POST",
    query: { subscribed_fields: "feed,messages,messaging_postbacks" },
  });
  return r.ok;
}
