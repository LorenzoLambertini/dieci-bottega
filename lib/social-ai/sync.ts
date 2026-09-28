/**
 * Sincronizzazione "a lettura" via Graph API ufficiale (Instagram + Facebook).
 *
 * Alternativa ai webhook finché l'app Meta non è pubblicata: il CRM legge
 * periodicamente commenti e conversazioni DM degli account collegati e li fa
 * passare nella stessa pipeline dei webhook (recordWebhookEvent →
 * processRecordedEvent). Le chiavi evento sono identiche a quelle dei webhook,
 * quindi webhook e sync non creano mai doppioni.
 *
 * Endpoint (Page Access Token):
 *   Commenti IG   GET /{ig-user-id}/media?fields=comments{…,replies{…}}
 *   Commenti FB   GET /{page-id}/posts?fields=comments.filter(stream){…}
 *   DM IG / FB    GET /{page-id}/conversations?platform=instagram|messenger&fields=messages{…}
 *
 * Elementi vecchi (DM oltre 24h, commenti oltre 48h) vengono solo importati:
 * nessuna risposta automatica fuori tempo.
 */
import type { InboundEvent } from "./types";
import type { ProviderAccount } from "./providers/types";
import { graphRequest } from "./providers/meta";
import { loadAccount } from "./outbound";
import { processRecordedEvent, recordWebhookEvent, type EngineDeps } from "./engine";

type Graph = typeof graphRequest;

export interface SyncDeps extends EngineDeps {
  graph?: Graph;
}

export interface AccountSyncResult {
  accountId: string;
  platform: "instagram" | "facebook";
  name: string;
  found: number;
  queued: number;
  errors: string[];
}

export interface SyncResult {
  skipped?: string;
  accounts: AccountSyncResult[];
  /** Eventi nuovi registrati, in ordine cronologico, da processare. */
  eventIds: string[];
}

/** Prima sincronizzazione: quanto andare indietro. */
export const FIRST_SYNC_LOOKBACK_MS = 14 * 86_400_000;
/** Sovrapposizione tra una sync e la successiva (la dedup elimina i doppioni). */
const OVERLAP_MS = 15 * 60_000;
/** Oltre questi limiti l'elemento viene importato senza risposta automatica. */
export const LIVE_DM_MS = 24 * 3600_000;
export const LIVE_COMMENT_MS = 48 * 3600_000;

/** "2026-09-28T10:00:00+0000" → ISO standard. */
function isoOf(t: string | undefined): string | null {
  if (!t) return null;
  const d = new Date(t.replace(/([+-]\d{2})(\d{2})$/, "$1:$2"));
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

interface IgComment {
  id: string;
  text?: string;
  timestamp?: string;
  username?: string;
  from?: { id?: string; username?: string };
  parent_id?: string;
  replies?: { data?: IgComment[] };
}
interface FbComment {
  id: string;
  message?: string;
  created_time?: string;
  from?: { id?: string; name?: string };
  parent?: { id?: string };
}
interface GraphMessage {
  id: string;
  message?: string;
  created_time?: string;
  from?: { id?: string; username?: string; name?: string };
}

/** Legge commenti e DM di un account e li converte in eventi normalizzati. */
export async function collectMetaEvents(
  acct: ProviderAccount,
  since: Date,
  now: Date,
  graph: Graph = graphRequest
): Promise<{ events: InboundEvent[]; errors: string[] }> {
  const row = acct.row;
  const platform = row.platform as "instagram" | "facebook";
  const token = acct.accessToken;
  const pageId = row.page_id ?? row.account_id;
  const self = new Set([row.account_id, pageId].filter(Boolean));
  const selfName = row.username?.toLowerCase() ?? null;
  const events: InboundEvent[] = [];
  const errors: string[] = [];

  const push = (ev: Omit<InboundEvent, "platform" | "accountExternalId">, liveMs: number) => {
    if (new Date(ev.timestamp) < since) return;
    const importOnly = now.getTime() - new Date(ev.timestamp).getTime() > liveMs;
    events.push({ platform, accountExternalId: row.account_id, ...ev, ...(importOnly ? { importOnly: true } : {}), raw: { source: "sync" } });
  };

  /* Commenti */
  if (platform === "instagram") {
    const fields = "id,text,timestamp,username,from,parent_id";
    const r = await graph<{ data?: { id: string; comments?: { data?: IgComment[] } }[] }>(`${row.account_id}/media`, token, {
      query: { fields: `id,timestamp,comments.limit(50){${fields},replies.limit(50){${fields}}}`, limit: "15" },
    });
    if (!r.ok) errors.push(`Commenti Instagram → ${r.error}`);
    else {
      for (const media of r.data.data ?? []) {
        const all = (media.comments?.data ?? []).flatMap((c) => [c, ...(c.replies?.data ?? []).map((x) => ({ ...x, parent_id: x.parent_id ?? c.id }))]);
        for (const c of all) {
          const fromId = c.from?.id;
          const username = c.from?.username ?? c.username ?? null;
          const ts = isoOf(c.timestamp);
          if (!fromId || !ts || self.has(fromId) || (selfName && username?.toLowerCase() === selfName)) continue;
          push(
            { kind: "comment", eventKey: `instagram:comment:${c.id}`, senderId: fromId, senderUsername: username, text: c.text ?? "", externalId: c.id, postId: media.id, parentCommentId: c.parent_id ?? null, timestamp: ts },
            LIVE_COMMENT_MS
          );
        }
      }
    }
  } else {
    const r = await graph<{ data?: { id: string; comments?: { data?: FbComment[] } }[] }>(`${pageId}/posts`, token, {
      query: { fields: "id,comments.filter(stream).order(reverse_chronological).limit(50){id,message,created_time,from,parent{id}}", limit: "15" },
    });
    if (!r.ok) errors.push(`Commenti Facebook → ${r.error}`);
    else {
      for (const post of r.data.data ?? []) {
        for (const c of post.comments?.data ?? []) {
          const fromId = c.from?.id;
          const ts = isoOf(c.created_time);
          if (!fromId || !ts || self.has(fromId)) continue;
          push(
            { kind: "comment", eventKey: `facebook:comment:${c.id}`, senderId: fromId, senderName: c.from?.name ?? null, text: c.message ?? "", externalId: c.id, postId: post.id, parentCommentId: c.parent?.id ?? null, timestamp: ts },
            LIVE_COMMENT_MS
          );
        }
      }
    }
  }

  /* DM */
  const r = await graph<{ data?: { id: string; updated_time?: string; messages?: { data?: GraphMessage[] } }[] }>(`${pageId}/conversations`, token, {
    query: { platform: platform === "instagram" ? "instagram" : "messenger", fields: "id,updated_time,messages.limit(10){id,message,created_time,from}", limit: "25" },
  });
  if (!r.ok) errors.push(`DM ${platform === "instagram" ? "Instagram" : "Messenger"} → ${r.error}`);
  else {
    for (const conv of r.data.data ?? []) {
      const updated = isoOf(conv.updated_time);
      if (updated && new Date(updated) < since) continue;
      for (const m of conv.messages?.data ?? []) {
        const fromId = m.from?.id;
        const ts = isoOf(m.created_time);
        if (!fromId || !ts || self.has(fromId) || (selfName && m.from?.username?.toLowerCase() === selfName)) continue;
        push(
          { kind: "message", eventKey: `${platform}:message:${m.id}`, senderId: fromId, senderUsername: m.from?.username ?? null, senderName: m.from?.name ?? null, text: m.message || "[allegato]", externalId: m.id, timestamp: ts },
          LIVE_DM_MS
        );
      }
    }
  }
  return { events, errors };
}

/**
 * Sincronizza tutti gli account Instagram/Facebook collegati.
 * `minIntervalMs`: se tutti gli account sono stati sincronizzati da meno di così, non fa nulla.
 */
export async function syncMetaAccounts(deps: SyncDeps, opts: { minIntervalMs?: number } = {}): Promise<SyncResult> {
  const now = deps.now?.() ?? new Date();
  const { data } = await deps.db.from("social_accounts").select("id, platform, account_name, username, last_sync_at").in("platform", ["instagram", "facebook"]).eq("status", "connected");
  const rows = (data ?? []) as { id: string; platform: "instagram" | "facebook"; account_name: string | null; username: string | null; last_sync_at: string | null }[];
  if (!rows.length) return { skipped: "Nessun account Instagram o Facebook collegato", accounts: [], eventIds: [] };
  const fresh = (r: (typeof rows)[number]) => r.last_sync_at && now.getTime() - new Date(r.last_sync_at).getTime() < (opts.minIntervalMs ?? 0);
  if (opts.minIntervalMs && rows.every(fresh)) return { skipped: "Sincronizzato da poco", accounts: [], eventIds: [] };

  const accounts: AccountSyncResult[] = [];
  const collected: { ev: InboundEvent; res: AccountSyncResult }[] = [];
  for (const row of rows) {
    const res: AccountSyncResult = { accountId: row.id, platform: row.platform, name: row.username ? `@${row.username}` : row.account_name ?? row.platform, found: 0, queued: 0, errors: [] };
    accounts.push(res);
    const acct = await loadAccount(deps, row.id);
    if (!acct) {
      res.errors.push("Token mancante o non decifrabile: premi Ricollega");
      continue;
    }
    const since = row.last_sync_at ? new Date(new Date(row.last_sync_at).getTime() - OVERLAP_MS) : new Date(now.getTime() - FIRST_SYNC_LOOKBACK_MS);
    const { events, errors } = await collectMetaEvents(acct, since, now, deps.graph);
    res.found = events.length;
    res.errors.push(...errors);
    collected.push(...events.map((ev) => ({ ev, res })));
    // Avanza il punto di partenza solo se almeno una lettura è riuscita
    if (errors.length < 2) await deps.db.from("social_accounts").update({ last_sync_at: now.toISOString() }).eq("id", row.id);
  }

  // In ordine cronologico, così le conversazioni si costruiscono nella sequenza giusta
  collected.sort((a, b) => a.ev.timestamp.localeCompare(b.ev.timestamp));
  const eventIds: string[] = [];
  for (const { ev, res } of collected) {
    const id = await recordWebhookEvent(deps.db, ev);
    if (id) {
      eventIds.push(id);
      res.queued++;
    }
  }
  return { accounts, eventIds };
}

/** Processa gli eventi registrati entro un budget di tempo; ritorna quelli rimasti. */
export async function processSyncedEvents(deps: EngineDeps, ids: string[], budgetMs = 40_000): Promise<{ processed: number; rest: string[] }> {
  const start = Date.now();
  let processed = 0;
  for (let i = 0; i < ids.length; i++) {
    if (Date.now() - start > budgetMs) return { processed, rest: ids.slice(i) };
    await processRecordedEvent(deps, ids[i]);
    processed++;
  }
  return { processed, rest: [] };
}
