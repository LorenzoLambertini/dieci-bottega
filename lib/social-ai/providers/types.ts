import type { Platform, SocialAccountRow } from "../types";

export type CapabilityStatus = "supported" | "requires_approval" | "not_available";

export type Capability =
  | "oauth"
  | "webhook"
  | "receive_dm"
  | "send_dm"
  | "receive_comments"
  | "reply_comments"
  | "private_reply"
  | "lead_sync";

export interface CapabilityInfo {
  status: CapabilityStatus;
  note: string;
}

export interface SendResult {
  ok: boolean;
  externalId?: string;
  error?: string;
  /** Errore temporaneo (5xx, rate limit, rete): si può ritentare. */
  retryable?: boolean;
}

export interface ProviderAccount {
  row: SocialAccountRow;
  accessToken: string;
}

export interface ProfileInfo {
  name?: string | null;
  username?: string | null;
  avatarUrl?: string | null;
}

export interface SocialProvider {
  platform: Platform;
  capabilities: Record<Capability, CapabilityInfo>;
  sendMessage(acct: ProviderAccount, recipientId: string, text: string): Promise<SendResult>;
  replyToComment(
    acct: ProviderAccount,
    commentId: string,
    text: string,
    ctx: { postId?: string | null }
  ): Promise<SendResult>;
  sendPrivateReply(acct: ProviderAccount, commentId: string, text: string): Promise<SendResult>;
  fetchProfile?(acct: ProviderAccount, userId: string): Promise<ProfileInfo | null>;
}

export function notAvailable(reason: string): Promise<SendResult> {
  return Promise.resolve({ ok: false, error: reason, retryable: false });
}
