/**
 * Webhook Meta (instagram). Instagram e Facebook condividono lo stesso handler:
 * il campo `object` del payload ("instagram" | "page") indica la piattaforma.
 * Configura in Meta App → Webhooks l'URL /api/webhooks/instagram.
 */
import type { NextRequest } from "next/server";
import { metaReceive, metaVerify } from "@/lib/social-ai/webhooks";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export function GET(req: NextRequest) {
  return metaVerify(req);
}

export function POST(req: NextRequest) {
  return metaReceive(req);
}
