/**
 * Simulatore (solo admin): fa passare un messaggio/commento finto attraverso
 * l'intera pipeline reale (CRM, regole, Claude, tool, scoring, handoff) senza
 * chiamare le piattaforme social. Gli invii vengono registrati come "sandbox".
 */
import { NextResponse, type NextRequest } from "next/server";
import { randomUUID } from "node:crypto";
import { getCrmUser } from "@/lib/social-ai/auth";
import { createEngineDeps } from "@/lib/social-ai/runtime";
import { processInbound } from "@/lib/social-ai/engine";
import { PLATFORMS, type InboundEvent, type Platform } from "@/lib/social-ai/types";
import { rateLimit } from "@/lib/social-ai/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const user = await getCrmUser();
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Solo admin" }, { status: 403 });
  if (!rateLimit(`simulate:${user.id}`, 30, 60_000)) return NextResponse.json({ error: "Troppe richieste" }, { status: 429 });

  let body: { platform?: string; kind?: string; text?: string; sender?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON non valido" }, { status: 400 });
  }
  const platform = (PLATFORMS as string[]).includes(body.platform ?? "") ? (body.platform as Platform) : "instagram";
  const kind = body.kind === "comment" ? "comment" : "message";
  const text = (body.text ?? "").trim().slice(0, 2000);
  const sender = (body.sender ?? "tester").trim().replace(/[^\w.-]/g, "").slice(0, 40) || "tester";
  if (!text) return NextResponse.json({ error: "Testo obbligatorio" }, { status: 422 });

  const id = randomUUID();
  const ev: InboundEvent = {
    platform,
    kind,
    eventKey: `sandbox:${platform}:${kind}:${id}`,
    accountExternalId: "sandbox",
    senderId: `sandbox-${sender}`,
    senderUsername: sender,
    senderName: `${sender} (test)`,
    text,
    externalId: `sandbox-${id}`,
    postId: kind === "comment" ? "sandbox-post" : null,
    timestamp: new Date().toISOString(),
  };

  try {
    const outcome = await processInbound({ ...createEngineDeps(), sandbox: true }, ev);
    return NextResponse.json({ outcome });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
