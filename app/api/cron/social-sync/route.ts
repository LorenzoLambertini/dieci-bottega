/**
 * Sincronizzazione frequente di commenti e DM (ogni ~2 minuti), anche a CRM chiuso:
 * chiamata da Supabase (pg_cron + pg_net) perché il piano Vercel Hobby ha solo cron giornalieri.
 * Protetta da CRON_SECRET. Ogni nuovo messaggio genera la notifica push al team.
 */
import { NextResponse, type NextRequest } from "next/server";
import { createEngineDeps } from "@/lib/social-ai/runtime";
import { processSyncedEvents, syncMetaAccounts } from "@/lib/social-ai/sync";
import { retryDueEvents } from "@/lib/social-ai/engine";
import { safeEqual } from "@/lib/social-ai/crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

async function handle(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization") ?? "";
  if (!secret || !safeEqual(auth, `Bearer ${secret}`)) return new NextResponse("Unauthorized", { status: 401 });

  const deps = createEngineDeps();
  const r = await syncMetaAccounts(deps, { minIntervalMs: 60_000 });
  const { processed, rest } = await processSyncedEvents(deps, r.eventIds, 40_000);
  // eventi rimasti indietro (o interrotti) verranno ripresi qui al giro successivo
  const retried = rest.length ? 0 : await retryDueEvents(deps, 5).catch(() => 0);
  return NextResponse.json({
    skipped: r.skipped ?? null,
    queued: r.eventIds.length,
    processed,
    pending: rest.length,
    retried,
    errors: r.accounts.flatMap((a) => a.errors.map((e) => `${a.name}: ${e}`)),
  });
}

export const GET = handle;
export const POST = handle;
