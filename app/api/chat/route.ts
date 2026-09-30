/**
 * Chat del sito → Social AI del CRM.
 *
 *   POST { visitorId, message }  → il messaggio passa dal motore AI del CRM (knowledge base,
 *                                  lezioni del team, lead magnet, scoring, handoff, notifiche)
 *                                  e la conversazione compare nell'Inbox come "Chat sito".
 *   GET  ?v=<visitorId>[&after=ISO] → cronologia / nuove risposte (anche quelle scritte dal
 *                                  team dal CRM quando prende in mano la chat).
 *
 * Il visitorId è un identificativo casuale salvato nel browser del visitatore.
 */
import { NextResponse, type NextRequest } from "next/server";
import { createEngineDeps } from "@/lib/social-ai/runtime";
import { getWebChat, handleWebMessage, VISITOR_RE } from "@/lib/social-ai/web-chat";
import { clientIp, rateLimit } from "@/lib/social-ai/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const FALLBACK =
  "Ciao! In questo momento l'assistente non è disponibile. Lasciaci il contatto e Lorenzo o Tommaso ti rispondono entro 24 ore lavorative. [SHOW_FORM:CONTACT]";

export async function POST(req: NextRequest) {
  let body: { visitorId?: string; message?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const visitorId = String(body.visitorId ?? "");
  const message = String(body.message ?? "").trim();
  if (!VISITOR_RE.test(visitorId) || !message) return NextResponse.json({ error: "visitorId e message obbligatori" }, { status: 422 });
  if (message.length > 1000) return NextResponse.json({ error: "Messaggio troppo lungo" }, { status: 422 });

  const ip = clientIp(req.headers);
  if (!rateLimit(`chat:ip:${ip}`, 30, 60_000) || !rateLimit(`chat:v:${visitorId}`, 60, 3600_000)) {
    return NextResponse.json({ messages: [{ id: "rl", role: "assistant", content: "Stai scrivendo molto velocemente 🙂 Riprova tra un minuto.", at: new Date().toISOString() }], waiting: false });
  }

  try {
    const r = await handleWebMessage(createEngineDeps(), visitorId, message);
    if (!r.messages.length && !r.waiting) {
      // AI spenta o non configurata: il messaggio è comunque nel CRM, il team risponde
      return NextResponse.json({ messages: [{ id: "fb", role: "assistant", content: FALLBACK, at: new Date().toISOString() }], waiting: true });
    }
    return NextResponse.json({ messages: r.messages, waiting: r.waiting });
  } catch (e) {
    console.error("[chat] errore:", (e as Error).message);
    return NextResponse.json({ messages: [{ id: "err", role: "assistant", content: FALLBACK, at: new Date().toISOString() }], waiting: false });
  }
}

export async function GET(req: NextRequest) {
  const v = req.nextUrl.searchParams.get("v") ?? "";
  const after = req.nextUrl.searchParams.get("after");
  if (!VISITOR_RE.test(v)) return NextResponse.json({ error: "visitorId non valido" }, { status: 422 });
  if (after && Number.isNaN(Date.parse(after))) return NextResponse.json({ error: "after non valido" }, { status: 422 });
  if (!rateLimit(`chat:poll:${clientIp(req.headers)}`, 120, 60_000)) return NextResponse.json({ messages: [], waiting: false });
  const { createAdminClient } = await import("@/lib/supabase/admin");
  const state = await getWebChat(createAdminClient(), v, after);
  return NextResponse.json(state, { headers: { "Cache-Control": "no-store" } });
}
