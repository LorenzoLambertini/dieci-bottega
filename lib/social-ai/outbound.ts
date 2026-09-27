/**
 * Invio verso le piattaforme social, con tracciamento dello stato:
 * ogni messaggio/risposta viene PRIMA salvato come "pending", poi inviato,
 * poi marcato "sent" o "failed" (con errore e retry_count). Nulla si perde.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import type { ConversationRow, Platform, SocialAccountRow } from "./types";
import type { ProviderAccount, SendResult, SocialProvider } from "./providers/types";

export const MAX_SEND_RETRIES = 5;
export const DM_WINDOW_MS = 24 * 60 * 60 * 1000;
export const PRIVATE_REPLY_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

export interface OutboundDeps {
  db: SupabaseClient;
  providers: Record<Platform, SocialProvider>;
  decrypt: (enc: string) => string;
  now?: () => Date;
  /** Simulatore CRM: nessuna chiamata alle piattaforme, invii registrati come riusciti. */
  sandbox?: boolean;
}

export async function loadAccount(deps: OutboundDeps, accountId: string | null): Promise<ProviderAccount | null> {
  if (!accountId) return null;
  const { data: row } = await deps.db.from("social_accounts").select("*").eq("id", accountId).maybeSingle();
  if (!row || row.status !== "connected") return null;
  const { data: secret } = await deps.db.from("social_account_secrets").select("access_token_enc").eq("account_id", accountId).maybeSingle();
  if (!secret?.access_token_enc) return null;
  try {
    return { row: row as SocialAccountRow, accessToken: deps.decrypt(secret.access_token_enc) };
  } catch (e) {
    console.error("[social-ai] token decrypt failed for account", accountId, (e as Error).message);
    return null;
  }
}

export async function findAccountByExternalId(db: SupabaseClient, platform: Platform, externalId: string): Promise<SocialAccountRow | null> {
  const { data } = await db.from("social_accounts").select("*").eq("platform", platform).eq("account_id", externalId).maybeSingle();
  if (data) return data as SocialAccountRow;
  // Messenger/Instagram possono indicare la Pagina come recipient
  const { data: byPage } = await db.from("social_accounts").select("*").eq("platform", platform).eq("page_id", externalId).maybeSingle();
  return (byPage as SocialAccountRow | null) ?? null;
}

async function attempt(
  deps: OutboundDeps,
  accountId: string | null,
  fn: (p: SocialProvider, a: ProviderAccount) => Promise<SendResult>,
  platform: Platform
): Promise<SendResult> {
  if (deps.sandbox) return { ok: true, externalId: `sandbox-${Date.now()}-${Math.random().toString(36).slice(2, 8)}` };
  const acct = await loadAccount(deps, accountId);
  if (!acct) return { ok: false, retryable: false, error: "Account social non collegato o token mancante" };
  return fn(deps.providers[platform], acct);
}

export interface DmOptions {
  aiGenerated?: boolean;
  aiActionId?: string | null;
  sentBy?: string | null;
  /** Invia come private reply al commento indicato (non richiede finestra 24h). */
  privateReplyToCommentId?: string | null;
  commentCreatedAt?: string | null;
}

export async function sendDirectMessage(
  deps: OutboundDeps,
  conv: ConversationRow,
  recipientId: string,
  text: string,
  opts: DmOptions = {}
): Promise<{ ok: boolean; messageId: string | null; error?: string }> {
  const now = deps.now?.() ?? new Date();

  // Rispetto dei limiti di piattaforma — nessun workaround
  if (opts.privateReplyToCommentId) {
    const created = opts.commentCreatedAt ? new Date(opts.commentCreatedAt).getTime() : now.getTime();
    if (now.getTime() - created > PRIVATE_REPLY_WINDOW_MS) {
      return { ok: false, messageId: null, error: "Private reply oltre i 7 giorni dal commento: non consentita" };
    }
  } else {
    const last = conv.last_inbound_at ? new Date(conv.last_inbound_at).getTime() : 0;
    if (now.getTime() - last > DM_WINDOW_MS) {
      return { ok: false, messageId: null, error: "Fuori dalla finestra di 24h: la piattaforma non consente l'invio automatico" };
    }
  }

  const { data: row, error } = await deps.db
    .from("social_messages")
    .insert({
      conversation_id: conv.id,
      contact_id: conv.contact_id,
      platform: conv.platform,
      direction: "outbound",
      message_type: "text",
      content: text,
      ai_generated: !!opts.aiGenerated,
      ai_action_id: opts.aiActionId ?? null,
      sent_by: opts.sentBy ?? null,
      delivery_status: "pending",
      reply_to_comment_id: opts.privateReplyToCommentId ?? null,
    })
    .select("id")
    .single();
  if (error || !row) return { ok: false, messageId: null, error: `DB: ${error?.message}` };

  const result = await attempt(
    deps,
    conv.account_id,
    (p, a) => (opts.privateReplyToCommentId ? p.sendPrivateReply(a, opts.privateReplyToCommentId, text) : p.sendMessage(a, recipientId, text)),
    conv.platform
  );
  await deps.db
    .from("social_messages")
    .update(
      result.ok
        ? { delivery_status: "sent", external_message_id: result.externalId ?? null, error: null }
        : { delivery_status: "failed", error: result.error ?? "errore" }
    )
    .eq("id", row.id);

  await deps.db
    .from("social_conversations")
    .update({ last_message_at: now.toISOString(), last_message_preview: text.slice(0, 140), updated_at: now.toISOString() })
    .eq("id", conv.id);

  return { ok: result.ok, messageId: row.id, error: result.error };
}

export async function replyToComment(
  deps: OutboundDeps,
  args: {
    platform: Platform;
    accountId: string | null;
    conversationId: string | null;
    contactId: string | null;
    commentExternalId: string;
    postId: string | null;
    text: string;
  }
): Promise<{ ok: boolean; rowId: string | null; error?: string }> {
  const { data: row, error } = await deps.db
    .from("social_comments")
    .insert({
      platform: args.platform,
      account_id: args.accountId,
      conversation_id: args.conversationId,
      contact_id: args.contactId,
      post_id: args.postId,
      parent_comment_id: args.commentExternalId,
      content: args.text,
      direction: "outbound",
      ai_processed: true,
      delivery_status: "pending",
    })
    .select("id")
    .single();
  if (error || !row) return { ok: false, rowId: null, error: `DB: ${error?.message}` };

  const result = await attempt(deps, args.accountId, (p, a) => p.replyToComment(a, args.commentExternalId, args.text, { postId: args.postId }), args.platform);

  await deps.db
    .from("social_comments")
    .update(
      result.ok
        ? { delivery_status: "sent", external_comment_id: result.externalId ?? null, error: null }
        : { delivery_status: "failed", error: result.error ?? "errore" }
    )
    .eq("id", row.id);
  if (result.ok) {
    await deps.db
      .from("social_comments")
      .update({ response_sent: true })
      .eq("platform", args.platform)
      .eq("external_comment_id", args.commentExternalId);
  }
  return { ok: result.ok, rowId: row.id, error: result.error };
}

/** Retry manuale/automatico di un DM fallito. Limite MAX_SEND_RETRIES, nessun loop. */
export async function retryMessage(deps: OutboundDeps, messageId: string): Promise<{ ok: boolean; error?: string }> {
  const { data: msg } = await deps.db.from("social_messages").select("*").eq("id", messageId).maybeSingle();
  if (!msg || msg.direction !== "outbound") return { ok: false, error: "Messaggio non trovato" };
  if (msg.delivery_status === "sent") return { ok: true };
  if (msg.retry_count >= MAX_SEND_RETRIES) return { ok: false, error: "Numero massimo di tentativi raggiunto" };
  const { data: conv } = await deps.db.from("social_conversations").select("*").eq("id", msg.conversation_id).maybeSingle();
  if (!conv) return { ok: false, error: "Conversazione non trovata" };
  const { data: ident } = await deps.db.from("social_identities").select("platform_user_id").eq("id", conv.identity_id).maybeSingle();
  if (!ident) return { ok: false, error: "Destinatario non trovato" };

  const result = await attempt(
    deps,
    conv.account_id,
    (p, a) => (msg.reply_to_comment_id ? p.sendPrivateReply(a, msg.reply_to_comment_id, msg.content ?? "") : p.sendMessage(a, ident.platform_user_id, msg.content ?? "")),
    conv.platform
  );
  await deps.db
    .from("social_messages")
    .update(
      result.ok
        ? { delivery_status: "sent", external_message_id: result.externalId ?? null, error: null, retry_count: msg.retry_count + 1 }
        : { delivery_status: "failed", error: result.error ?? "errore", retry_count: msg.retry_count + 1 }
    )
    .eq("id", messageId);
  return { ok: result.ok, error: result.error };
}

export async function retryCommentReply(deps: OutboundDeps, commentRowId: string): Promise<{ ok: boolean; error?: string }> {
  const { data: c } = await deps.db.from("social_comments").select("*").eq("id", commentRowId).maybeSingle();
  if (!c || c.direction !== "outbound") return { ok: false, error: "Risposta non trovata" };
  if (c.delivery_status === "sent") return { ok: true };
  if (c.retry_count >= MAX_SEND_RETRIES) return { ok: false, error: "Numero massimo di tentativi raggiunto" };
  const result = await attempt(deps, c.account_id, (p, a) => p.replyToComment(a, c.parent_comment_id, c.content ?? "", { postId: c.post_id }), c.platform);
  await deps.db
    .from("social_comments")
    .update(
      result.ok
        ? { delivery_status: "sent", external_comment_id: result.externalId ?? null, error: null, retry_count: c.retry_count + 1 }
        : { delivery_status: "failed", error: result.error ?? "errore", retry_count: c.retry_count + 1 }
    )
    .eq("id", commentRowId);
  return { ok: result.ok, error: result.error };
}
