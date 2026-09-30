/**
 * Chat del sito (widget su diecibottega.it) come canale del Social AI.
 * Nessuna API esterna: i messaggi in uscita restano nel CRM (social_messages)
 * e il widget li legge da /api/chat. Nessuna finestra di 24h.
 */
import type { Capability, CapabilityInfo, ProviderAccount, SendResult, SocialProvider } from "./types";
import type { SocialAccountRow } from "../types";

const CAPS: Record<Capability, CapabilityInfo> = {
  oauth: { status: "not_available", note: "Non serve: è il sito stesso" },
  webhook: { status: "not_available", note: "Non serve: i messaggi arrivano da /api/chat" },
  receive_dm: { status: "supported", note: "Messaggi dal widget del sito" },
  send_dm: { status: "supported", note: "Risposte mostrate nel widget (anche quelle del team dal CRM)" },
  receive_comments: { status: "not_available", note: "Nessun commento sul sito" },
  reply_comments: { status: "not_available", note: "Nessun commento sul sito" },
  private_reply: { status: "not_available", note: "Nessun commento sul sito" },
  lead_sync: { status: "supported", note: "Contatto CRM creato dalla chat e completato dal form" },
};

const ok = (): Promise<SendResult> => Promise.resolve({ ok: true, externalId: `web-${crypto.randomUUID()}` });
const no = (): Promise<SendResult> => Promise.resolve({ ok: false, retryable: false, error: "Non disponibile nella chat del sito" });

export const webProvider: SocialProvider = {
  platform: "web",
  capabilities: CAPS,
  sendMessage: () => ok(),
  replyToComment: () => no(),
  sendPrivateReply: () => no(),
};

/** Account fittizio: la chat del sito non ha token né account esterno. */
export const WEB_ACCOUNT: ProviderAccount = {
  accessToken: "",
  row: {
    id: "web", platform: "web", account_id: "site", account_name: "Sito diecibottega.it", username: null, page_id: null,
    status: "connected", scopes: [], token_expires_at: null, webhook_status: "not_available", last_sync_at: null, last_error: null,
  } as SocialAccountRow,
};
