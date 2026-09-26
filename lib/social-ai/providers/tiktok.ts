/**
 * TikTok — solo API ufficiali.
 *
 * Stato verificato (settembre 2026):
 *   - DM (Business Messaging API): in beta e NON disponibile per account
 *     registrati in SEE/UK/Svizzera/USA → per un account italiano "Not available".
 *     Nessun workaround.
 *   - Commenti: TikTok API for Business espone risposta ai commenti per
 *     account Business/ads con approvazione dell'app → "Requires approval".
 *   - Lead generation (Instant Form): lead recuperabili via TikTok API for
 *     Business (webhook/Leads API) con approvazione → "Requires approval".
 *
 * Implementato: OAuth Login Kit (collegamento account), webhook firmato
 * (TikTok-Signature) che importa i lead nel CRM. Invio messaggi/commenti
 * volutamente non implementato finché non c'è accesso approvato.
 */
import type { Capability, CapabilityInfo, SocialProvider } from "./types";
import { notAvailable } from "./types";

const CAPS: Record<Capability, CapabilityInfo> = {
  oauth: { status: "supported", note: "TikTok Login Kit" },
  webhook: { status: "requires_approval", note: "Webhook lead: TikTok API for Business approvata" },
  receive_dm: { status: "not_available", note: "Business Messaging API non disponibile in SEE/UK" },
  send_dm: { status: "not_available", note: "Business Messaging API non disponibile in SEE/UK" },
  receive_comments: { status: "requires_approval", note: "TikTok API for Business (account Business)" },
  reply_comments: { status: "requires_approval", note: "TikTok API for Business (account Business)" },
  private_reply: { status: "not_available", note: "Non prevista" },
  lead_sync: { status: "requires_approval", note: "Lead Generation via TikTok API for Business" },
};

export const tiktokProvider: SocialProvider = {
  platform: "tiktok",
  capabilities: CAPS,
  sendMessage: () => notAvailable("TikTok: DM non disponibili per account SEE/UK tramite API ufficiali"),
  sendPrivateReply: () => notAvailable("TikTok: private reply non disponibile"),
  replyToComment: () => notAvailable("TikTok: risposta ai commenti richiede TikTok API for Business approvata"),
};

export const TIKTOK_SCOPES = ["user.info.basic"];

export function tiktokAuthorizeUrl(state: string, redirectUri: string): string {
  const u = new URL("https://www.tiktok.com/v2/auth/authorize/");
  u.searchParams.set("client_key", process.env.TIKTOK_CLIENT_KEY ?? "");
  u.searchParams.set("scope", TIKTOK_SCOPES.join(","));
  u.searchParams.set("response_type", "code");
  u.searchParams.set("redirect_uri", redirectUri);
  u.searchParams.set("state", state);
  return u.toString();
}

export async function tiktokExchangeCode(code: string, redirectUri: string) {
  const res = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_key: process.env.TIKTOK_CLIENT_KEY ?? "",
      client_secret: process.env.TIKTOK_CLIENT_SECRET ?? "",
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
    }),
    cache: "no-store",
  });
  const json = (await res.json()) as {
    access_token?: string; refresh_token?: string; expires_in?: number; open_id?: string; scope?: string; error_description?: string;
  };
  if (!json.access_token || !json.open_id) throw new Error(`OAuth TikTok fallito: ${json.error_description ?? res.status}`);

  let displayName: string | null = null;
  const info = await fetch("https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name", {
    headers: { Authorization: `Bearer ${json.access_token}` },
    cache: "no-store",
  });
  if (info.ok) {
    const j = (await info.json()) as { data?: { user?: { display_name?: string } } };
    displayName = j.data?.user?.display_name ?? null;
  }
  return {
    accessToken: json.access_token,
    refreshToken: json.refresh_token ?? null,
    expiresAt: json.expires_in ? new Date(Date.now() + json.expires_in * 1000).toISOString() : null,
    openId: json.open_id,
    displayName,
    scopes: (json.scope ?? "").split(",").filter(Boolean),
  };
}

export interface TikTokLead {
  leadId: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  fields: Record<string, string>;
}

/**
 * Estrae i lead da un payload webhook lead-gen. Il formato esatto dipende
 * dalla sottoscrizione approvata: il parser accetta sia `field_data`
 * ([{name, value}]) sia oggetti chiave/valore, e ignora il resto.
 */
export function parseTikTokLeads(body: unknown): TikTokLead[] {
  const b = (body ?? {}) as Record<string, unknown>;
  const candidates = (Array.isArray(b.leads) ? b.leads : Array.isArray(b.data) ? b.data : b.lead ? [b.lead] : [b]) as Record<string, unknown>[];
  const out: TikTokLead[] = [];
  for (const l of candidates) {
    const id = String(l.lead_id ?? l.id ?? "");
    if (!id) continue;
    const fields: Record<string, string> = {};
    const fd = l.field_data ?? l.fields ?? l.answers;
    if (Array.isArray(fd)) {
      for (const f of fd as { name?: string; field_name?: string; value?: unknown; values?: unknown[] }[]) {
        const k = String(f.name ?? f.field_name ?? "").toLowerCase();
        const v = f.value ?? f.values?.[0];
        if (k && v != null) fields[k] = String(v);
      }
    } else if (fd && typeof fd === "object") {
      for (const [k, v] of Object.entries(fd as Record<string, unknown>)) if (v != null) fields[k.toLowerCase()] = String(v);
    }
    const pick = (...keys: string[]) => keys.map((k) => fields[k]).find(Boolean) ?? null;
    out.push({
      leadId: id,
      name: pick("name", "full_name", "nome"),
      email: pick("email", "email_address"),
      phone: pick("phone", "phone_number", "telefono"),
      fields,
    });
  }
  return out;
}
