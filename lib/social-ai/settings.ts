import type { SupabaseClient } from "@supabase/supabase-js";
import type { SocialAiSettings } from "./types";

export const DEFAULT_SETTINGS: SocialAiSettings = {
  ai_enabled: false,
  auto_reply_enabled: true,
  auto_reply_comments: true,
  auto_reply_dms: true,
  auto_send_guides: true,
  lead_scoring_enabled: true,
  human_handoff_enabled: true,
  model: null,
  max_response_chars: 600,
  brand_tone: null,
  confidence_threshold: 0.6,
  history_limit: 12,
  summarize_after: 30,
  max_ai_calls_per_hour: 20,
  system_prompt: null,
  handoff_message: "Grazie! Ti passo a Lorenzo o Tommaso del team, ti rispondono a breve.",
  comment_guide_reply: "Ti ho appena scritto in DM 📩",
  scoring_config: {},
};

/** Modello: impostazione CRM → ANTHROPIC_MODEL → default. */
export function resolveModel(settings: Pick<SocialAiSettings, "model">): string {
  return settings.model?.trim() || process.env.ANTHROPIC_MODEL?.trim() || "claude-opus-5";
}

export async function loadSettings(db: SupabaseClient): Promise<SocialAiSettings> {
  const { data } = await db.from("social_ai_settings").select("*").eq("id", 1).maybeSingle();
  if (!data) return { ...DEFAULT_SETTINGS };
  const merged = { ...DEFAULT_SETTINGS } as Record<string, unknown>;
  for (const k of Object.keys(DEFAULT_SETTINGS)) {
    const v = (data as Record<string, unknown>)[k];
    if (v !== undefined && v !== null) merged[k] = k === "confidence_threshold" ? Number(v) : v;
  }
  return merged as unknown as SocialAiSettings;
}
