/**
 * LinkedIn — solo API ufficiali (Community Management API).
 *
 * REQUISITO: l'app LinkedIn deve essere approvata per il prodotto
 * "Community Management API" (permessi w_organization_social,
 * r_organization_social, rw_organization_admin). Senza approvazione
 * l'integrazione resta in stato "Richiede autorizzazione LinkedIn".
 *
 * Supportato (con approvazione):
 *   - commenti sui post della Pagina aziendale (webhook ORGANIZATION_SOCIAL_ACTION_NOTIFICATIONS)
 *   - risposta ai commenti come organizzazione: POST /rest/socialActions/{postUrn}/comments
 * NON disponibile:
 *   - DM / messaggi privati: LinkedIn non offre API di messaggistica per questo caso d'uso.
 *     Nessuna automazione DM viene implementata.
 */
import type { InboundEvent } from "../types";
import type { Capability, CapabilityInfo, SocialProvider, SendResult } from "./types";
import { notAvailable } from "./types";

export const LINKEDIN_VERSION = () => process.env.LINKEDIN_API_VERSION || "202606";
export const LINKEDIN_SCOPES = ["r_organization_social", "w_organization_social", "rw_organization_admin"];

const CAPS: Record<Capability, CapabilityInfo> = {
  oauth: { status: "supported", note: "OAuth 2.0 (3-legged)" },
  webhook: { status: "requires_approval", note: "Richiede Community Management API approvata" },
  receive_dm: { status: "not_available", note: "LinkedIn non espone API DM per questo caso d'uso" },
  send_dm: { status: "not_available", note: "LinkedIn non espone API DM per questo caso d'uso" },
  receive_comments: { status: "requires_approval", note: "Commenti sui post della Pagina aziendale" },
  reply_comments: { status: "requires_approval", note: "Risposta come organizzazione" },
  private_reply: { status: "not_available", note: "Non prevista dalle API LinkedIn" },
  lead_sync: { status: "requires_approval", note: "Lead Sync API: prodotto separato con approvazione" },
};

async function liPost(path: string, token: string, body: unknown): Promise<SendResult> {
  try {
    const res = await fetch(`https://api.linkedin.com/rest/${path}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "LinkedIn-Version": LINKEDIN_VERSION(),
        "X-Restli-Protocol-Version": "2.0.0",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    if (!res.ok) {
      const t = await res.text().catch(() => "");
      return { ok: false, retryable: res.status >= 500 || res.status === 429, error: `LinkedIn ${res.status}: ${t.slice(0, 300)}` };
    }
    const json = (await res.json().catch(() => ({}))) as { id?: string; commentUrn?: string };
    return { ok: true, externalId: json.commentUrn ?? json.id ?? res.headers.get("x-restli-id") ?? undefined };
  } catch (e) {
    return { ok: false, retryable: true, error: `Rete: ${(e as Error).message}` };
  }
}

export const linkedinProvider: SocialProvider = {
  platform: "linkedin",
  capabilities: CAPS,
  sendMessage: () => notAvailable("LinkedIn: invio DM non disponibile tramite API ufficiali"),
  sendPrivateReply: () => notAvailable("LinkedIn: private reply non disponibile"),
  replyToComment(acct, commentUrn, text, ctx) {
    if (!ctx.postId) return notAvailable("LinkedIn: post di riferimento mancante");
    return liPost(`socialActions/${encodeURIComponent(ctx.postId)}/comments`, acct.accessToken, {
      actor: acct.row.account_id, // urn:li:organization:<id>
      object: ctx.postId,
      parentComment: commentUrn,
      message: { text },
    });
  },
};

/**
 * Parsing difensivo delle notifiche ORGANIZATION_SOCIAL_ACTION_NOTIFICATIONS
 * (solo action = COMMENT). Verificare i nomi dei campi sul payload reale
 * al momento dell'approvazione: il parser ignora ciò che non riconosce.
 */
export function parseLinkedInWebhook(body: unknown): InboundEvent[] {
  const b = (body ?? {}) as { notifications?: Record<string, unknown>[] } & Record<string, unknown>;
  const list = Array.isArray(b.notifications) ? b.notifications : [b];
  const out: InboundEvent[] = [];
  for (const n of list) {
    if (n.action !== "COMMENT") continue;
    const decorated = (n.decoratedGeneratedActivity ?? {}) as { comment?: { entity?: string; text?: string; actor?: string; object?: string } };
    const commentUrn = String(decorated.comment?.entity ?? n.generatedActivity ?? "");
    const actor = String(decorated.comment?.actor ?? n.actor ?? "");
    const org = String(n.organizationalEntity ?? "");
    if (!commentUrn || !actor || actor === org) continue;
    out.push({
      platform: "linkedin",
      kind: "comment",
      eventKey: `linkedin:comment:${commentUrn}`,
      accountExternalId: org,
      senderId: actor,
      text: String(decorated.comment?.text ?? ""),
      externalId: commentUrn,
      postId: String(n.sourcePost ?? decorated.comment?.object ?? "") || null,
      timestamp: new Date(Number(n.lastModifiedAt) || Date.now()).toISOString(),
      raw: n,
    });
  }
  return out;
}

export function linkedinAuthorizeUrl(state: string, redirectUri: string): string {
  const u = new URL("https://www.linkedin.com/oauth/v2/authorization");
  u.searchParams.set("response_type", "code");
  u.searchParams.set("client_id", process.env.LINKEDIN_CLIENT_ID ?? "");
  u.searchParams.set("redirect_uri", redirectUri);
  u.searchParams.set("state", state);
  u.searchParams.set("scope", LINKEDIN_SCOPES.join(" "));
  return u.toString();
}

export async function linkedinExchangeCode(code: string, redirectUri: string) {
  const res = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      client_id: process.env.LINKEDIN_CLIENT_ID ?? "",
      client_secret: process.env.LINKEDIN_CLIENT_SECRET ?? "",
    }),
    cache: "no-store",
  });
  const json = (await res.json()) as { access_token?: string; expires_in?: number; refresh_token?: string; scope?: string; error_description?: string };
  if (!json.access_token) throw new Error(`OAuth LinkedIn fallito: ${json.error_description ?? res.status}`);

  // Organizzazioni amministrate (richiede rw_organization_admin approvato)
  const orgs: string[] = [];
  const aclRes = await fetch("https://api.linkedin.com/rest/organizationAcls?q=roleAssignee&role=ADMINISTRATOR&state=APPROVED", {
    headers: {
      Authorization: `Bearer ${json.access_token}`,
      "LinkedIn-Version": LINKEDIN_VERSION(),
      "X-Restli-Protocol-Version": "2.0.0",
    },
    cache: "no-store",
  });
  if (aclRes.ok) {
    const acl = (await aclRes.json()) as { elements?: { organization?: string }[] };
    for (const e of acl.elements ?? []) if (e.organization) orgs.push(e.organization);
  }
  return {
    accessToken: json.access_token,
    refreshToken: json.refresh_token ?? null,
    expiresAt: json.expires_in ? new Date(Date.now() + json.expires_in * 1000).toISOString() : null,
    scopes: (json.scope ?? "").split(/[ ,]/).filter(Boolean),
    organizations: orgs,
  };
}
