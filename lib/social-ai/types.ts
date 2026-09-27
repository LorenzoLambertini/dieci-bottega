/**
 * Social AI — tipi di dominio.
 * Le righe DB delle nuove tabelle non sono nel tipo `Database` generato
 * (lib/supabase/types.ts), quindi sono descritte qui.
 */

export type Platform = "instagram" | "facebook" | "linkedin" | "tiktok";
export const PLATFORMS: Platform[] = ["instagram", "facebook", "linkedin", "tiktok"];

export type Temperature = "cold" | "warm" | "hot";
export type ConversationStatus = "open" | "needs_human" | "human" | "closed";
export type DeliveryStatus = "received" | "pending" | "sent" | "failed";

export const INTENTS = [
  "general_question",
  "pricing",
  "website",
  "ecommerce",
  "branding",
  "social_media",
  "automation",
  "seo",
  "consultation",
  "case_study",
  "guide_request",
  "support",
  "complaint",
  "spam",
  "other",
] as const;
export type Intent = (typeof INTENTS)[number];

/** Evento normalizzato, indipendente dalla piattaforma. */
export interface InboundEvent {
  platform: Platform;
  kind: "message" | "comment";
  /** Chiave di idempotenza univoca (es. "instagram:message:<mid>"). */
  eventKey: string;
  /** ID account/pagina che ha ricevuto l'evento (IG user id, Page id, org URN…). */
  accountExternalId: string;
  /** ID dell'utente social che ha scritto. */
  senderId: string;
  senderUsername?: string | null;
  senderName?: string | null;
  text: string;
  externalId: string; // mid o comment id
  postId?: string | null;
  parentCommentId?: string | null;
  timestamp: string; // ISO
  raw?: unknown;
}

export interface SocialAiSettings {
  ai_enabled: boolean;
  auto_reply_enabled: boolean;
  auto_reply_comments: boolean;
  auto_reply_dms: boolean;
  auto_send_guides: boolean;
  lead_scoring_enabled: boolean;
  human_handoff_enabled: boolean;
  model: string | null;
  max_response_chars: number;
  brand_tone: string | null;
  confidence_threshold: number;
  history_limit: number;
  summarize_after: number;
  max_ai_calls_per_hour: number;
  system_prompt: string | null;
  handoff_message: string;
  comment_guide_reply: string;
  scoring_config: Record<string, unknown>;
}

export interface SocialAccountRow {
  id: string;
  platform: Platform;
  account_id: string;
  account_name: string | null;
  username: string | null;
  page_id: string | null;
  status: string;
  scopes: string[];
  token_expires_at: string | null;
  webhook_status: string;
  last_sync_at: string | null;
  last_error: string | null;
}

export interface ConversationRow {
  id: string;
  contact_id: string | null;
  identity_id: string | null;
  account_id: string | null;
  platform: Platform;
  external_conversation_id: string;
  status: ConversationStatus;
  ai_enabled: boolean;
  human_takeover: boolean;
  handoff_reason: string | null;
  lead_score: number;
  temperature: Temperature;
  intent: string | null;
  signals: string[];
  unread_count: number;
  last_message_at: string | null;
  last_inbound_at: string | null;
  summary: string | null;
  summarized_count: number;
}

export interface GuideRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  url: string;
  active: boolean;
  trigger_keywords: string[];
  platforms: string[];
}

export type RuleTrigger =
  | "comment_keyword"
  | "dm_keyword"
  | "any_keyword"
  | "intent"
  | "lead_score_above";
export type RuleAction =
  | "send_guide"
  | "ai_qualification"
  | "notify_admin"
  | "human_takeover"
  | "add_tag"
  | "reply_text";

export interface AutomationRuleRow {
  id: string;
  name: string;
  platform: string; // "all" | Platform
  trigger_type: RuleTrigger;
  trigger_value: string;
  action_type: RuleAction;
  guide_id: string | null;
  enabled: boolean;
  priority: number;
  configuration: Record<string, unknown>;
}

/** Decisione strutturata prodotta dall'AI Response Engine. */
export interface AiDecision {
  intent: Intent;
  interest: string | null;
  signals: string[];
  lead_score: number;
  temperature: Temperature;
  needs_human: boolean;
  handoff_reason: string | null;
  confidence: number;
  response: string;
  actions: { tool: string; status: "success" | "error"; summary: string }[];
}
