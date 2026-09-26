import { createAdminClient } from "@/lib/supabase/admin";
import { anthropicConfigured, defaultLlm } from "./claude";
import { decryptToken } from "./crypto";
import { PROVIDERS } from "./providers";
import type { EngineDeps } from "./engine";

/** Email al team tramite Resend (stessa configurazione di /api/lead). */
async function emailTeam(subject: string, text: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;
  const to = (process.env.TEAM_EMAILS ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  if (!to.length) return;
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: "Dieci Bottega CRM <crm@diecibottega.it>",
      to,
      subject: `[Social AI] ${subject}`,
      text,
    }),
  });
}

export function createEngineDeps(): EngineDeps {
  return {
    db: createAdminClient(),
    llm: anthropicConfigured() ? defaultLlm() : null,
    providers: PROVIDERS,
    decrypt: decryptToken,
    emailTeam,
  };
}
