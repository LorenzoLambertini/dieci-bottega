/**
 * Webhook LinkedIn (Community Management API — richiede approvazione LinkedIn).
 * GET: challenge di validazione · POST: notifiche firmate X-LI-Signature.
 */
import type { NextRequest } from "next/server";
import { linkedinReceive, linkedinVerify } from "@/lib/social-ai/webhooks";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export function GET(req: NextRequest) {
  return linkedinVerify(req);
}

export function POST(req: NextRequest) {
  return linkedinReceive(req);
}
