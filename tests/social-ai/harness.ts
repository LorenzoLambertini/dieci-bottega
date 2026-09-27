import type Anthropic from "@anthropic-ai/sdk";
import { FakeDb } from "./fake-db";
import type { EngineDeps } from "@/lib/social-ai/engine";
import type { InboundEvent, Platform } from "@/lib/social-ai/types";
import type { SendResult, SocialProvider } from "@/lib/social-ai/providers/types";
import { PROVIDERS } from "@/lib/social-ai/providers";
import type { LlmClient } from "@/lib/social-ai/claude";

/* ─── Claude finto: risposte scriptate ─────────────────────── */

export type Script = (params: Anthropic.MessageCreateParamsNonStreaming, callIndex: number) => Partial<Anthropic.Message>;

export class FakeLlm implements LlmClient {
  calls: Anthropic.MessageCreateParamsNonStreaming[] = [];
  queue: (Script | Error)[] = [];
  push(...s: (Script | Error)[]) {
    this.queue.push(...s);
    return this;
  }
  async createMessage(params: Anthropic.MessageCreateParamsNonStreaming): Promise<Anthropic.Message> {
    this.calls.push(structuredClone(params));
    const next = this.queue.shift();
    if (!next) throw new Error("FakeLlm: nessuna risposta scriptata");
    if (next instanceof Error) throw next;
    const partial = next(params, this.calls.length - 1);
    return {
      id: `msg_${this.calls.length}`,
      type: "message",
      role: "assistant",
      model: params.model,
      stop_reason: "tool_use",
      stop_sequence: null,
      content: [],
      usage: { input_tokens: 1000, output_tokens: 100, cache_read_input_tokens: 800, cache_creation_input_tokens: 0 },
      ...partial,
    } as unknown as Anthropic.Message;
  }
}

let seq = 0;
export function toolUse(name: string, input: unknown): Anthropic.ToolUseBlock {
  return { type: "tool_use", id: `toolu_${++seq}`, name, input } as Anthropic.ToolUseBlock;
}

export function decision(d: Partial<{ intent: string; interest: string | null; signals: string[]; needs_human: boolean; handoff_reason: string | null; confidence: number; response: string }>): Script {
  return () => ({
    content: [
      toolUse("submit_decision", {
        intent: "general_question",
        interest: null,
        signals: [],
        needs_human: false,
        handoff_reason: null,
        confidence: 0.9,
        response: "Ciao!",
        ...d,
      }),
    ],
  });
}

/* ─── Provider social finti ────────────────────────────────── */

export interface SentCall {
  platform: Platform;
  op: "dm" | "private_reply" | "comment_reply";
  target: string;
  text: string;
  token: string;
}

export function fakeProviders(sent: SentCall[], opts: { fail?: () => SendResult | null } = {}): Record<Platform, SocialProvider> {
  const make = (p: Platform): SocialProvider => ({
    ...PROVIDERS[p],
    fetchProfile: async () => ({ name: "Marco Rossi", username: "marco.rossi", avatarUrl: null }),
    async sendMessage(a, to, text) {
      const f = opts.fail?.();
      if (f) return f;
      sent.push({ platform: p, op: "dm", target: to, text, token: a.accessToken });
      return { ok: true, externalId: `out_${sent.length}` };
    },
    async sendPrivateReply(a, commentId, text) {
      const f = opts.fail?.();
      if (f) return f;
      sent.push({ platform: p, op: "private_reply", target: commentId, text, token: a.accessToken });
      return { ok: true, externalId: `out_${sent.length}` };
    },
    async replyToComment(a, commentId, text) {
      const f = opts.fail?.();
      if (f) return f;
      sent.push({ platform: p, op: "comment_reply", target: commentId, text, token: a.accessToken });
      return { ok: true, externalId: `c_${sent.length}` };
    },
  });
  return { instagram: make("instagram"), facebook: make("facebook"), linkedin: make("linkedin"), tiktok: make("tiktok") };
}

/* ─── Setup ────────────────────────────────────────────────── */

export const IG_ACCOUNT = "17841400000000000";

export function setup(o: { aiEnabled?: boolean; settings?: Record<string, unknown>; fail?: () => SendResult | null } = {}) {
  const db = new FakeDb();
  let now = new Date("2026-09-26T12:32:00Z");
  db.clock = () => now;
  db.seed("social_ai_settings", { id: 1, ai_enabled: o.aiEnabled ?? true, ...(o.settings ?? {}) });
  const account = db.seed("social_accounts", { platform: "instagram", account_id: IG_ACCOUNT, account_name: "Dieci Bottega", username: "diecibottega", page_id: "PAGE1", status: "connected" });
  db.seed("social_account_secrets", { account_id: account.id, access_token_enc: "enc:PAGE_TOKEN" });
  const guide = db.seed("guides", {
    name: "Checklist sito web PMI",
    slug: "checklist-sito",
    url: "https://diecibottega.it/guide/checklist-sito",
    active: true,
    trigger_keywords: ["guida", "guida sito", "checklist"],
  });
  const sent: SentCall[] = [];
  const llm = new FakeLlm();
  const emails: { subject: string; text: string }[] = [];
  const deps: EngineDeps = {
    db: db.client(),
    llm,
    providers: fakeProviders(sent, { fail: o.fail }),
    decrypt: (s) => s.replace(/^enc:/, ""),
    emailTeam: async (subject, text) => void emails.push({ subject, text }),
    now: () => now,
  };
  return {
    db, deps, llm, sent, emails, guide, account,
    advance(ms: number) {
      now = new Date(now.getTime() + ms);
    },
  };
}

let evSeq = 0;
export function igEvent(kind: "message" | "comment", text: string, sender = "IGSID_MARCO", at?: string): InboundEvent {
  const id = `${kind}_${++evSeq}`;
  return {
    platform: "instagram",
    kind,
    eventKey: `instagram:${kind}:${id}`,
    accountExternalId: IG_ACCOUNT,
    senderId: sender,
    senderUsername: "marco.rossi",
    text,
    externalId: id,
    postId: kind === "comment" ? "MEDIA_1" : null,
    timestamp: at ?? new Date("2026-09-26T12:32:00Z").toISOString(),
  };
}
