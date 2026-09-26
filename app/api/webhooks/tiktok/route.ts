/**
 * Webhook TikTok — import lead (Lead Generation, richiede TikTok API for Business
 * approvata). Firma TikTok-Signature verificata sul body grezzo.
 */
import type { NextRequest } from "next/server";
import { tiktokReceive } from "@/lib/social-ai/webhooks";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

export function POST(req: NextRequest) {
  return tiktokReceive(req);
}
