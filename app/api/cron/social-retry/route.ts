/**
 * Retry controllati: eventi webhook falliti (backoff esponenziale, max 5
 * tentativi) e invii falliti per errori temporanei (max 3 retry automatici,
 * poi solo retry manuale dall'inbox). Legge commenti/DM via API (sync) e
 * invia l'email del mattino del CRM.
 * Protetto da CRON_SECRET (Vercel Cron).
 */
import { NextResponse, type NextRequest } from "next/server";
import { createEngineDeps } from "@/lib/social-ai/runtime";
import { retryDueEvents } from "@/lib/social-ai/engine";
import { retryCommentReply, retryMessage } from "@/lib/social-ai/outbound";
import { safeEqual } from "@/lib/social-ai/crypto";
import { sendDigest } from "@/lib/crm/digest";
import { processSyncedEvents, syncMetaAccounts } from "@/lib/social-ai/sync";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Errori permanenti: inutile ritentare automaticamente. */
const PERMANENT = /(24h|7 giorni|non collegato|non disponibile|non consentit|#10\b|#200\b|#190\b)/i;

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization") ?? "";
  if (!secret || !safeEqual(auth, `Bearer ${secret}`)) return new NextResponse("Unauthorized", { status: 401 });

  const deps = createEngineDeps();
  // Lettura di commenti e DM via API (funziona anche senza webhook)
  const sync = await syncMetaAccounts(deps)
    .then(async (r) => ({ queued: r.eventIds.length, processed: (await processSyncedEvents(deps, r.eventIds, 25_000)).processed, errors: r.accounts.flatMap((a) => a.errors) }))
    .catch((e: Error) => ({ error: e.message }));
  const events = await retryDueEvents(deps, 25);

  const since = new Date(Date.now() - 6 * 3600_000).toISOString();
  const [{ data: msgs }, { data: comments }] = await Promise.all([
    deps.db.from("social_messages").select("id, error").eq("direction", "outbound").eq("delivery_status", "failed").lt("retry_count", 3).gte("created_at", since).limit(20),
    deps.db.from("social_comments").select("id, error").eq("direction", "outbound").eq("delivery_status", "failed").lt("retry_count", 3).gte("created_at", since).limit(20),
  ]);
  let sends = 0;
  for (const m of (msgs ?? []) as { id: string; error: string | null }[]) {
    if (m.error && PERMANENT.test(m.error)) continue;
    await retryMessage(deps, m.id);
    sends++;
  }
  for (const c of (comments ?? []) as { id: string; error: string | null }[]) {
    if (c.error && PERMANENT.test(c.error)) continue;
    await retryCommentReply(deps, c.id);
    sends++;
  }
  // Email del mattino al team (promemoria, nuovi contatti, chat da seguire)
  const digest = await sendDigest(deps.db).catch((e: Error) => ({ sent: false, reason: e.message }));
  return NextResponse.json({ sync, events, sends, digest });
}
