/**
 * Download del PDF del lead magnet: registra "PDF scaricato" (richiesta del file da parte
 * di una persona, non di un bot) e reindirizza al file.
 */
import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { recordDownload } from "@/lib/social-ai/lead-magnet";
import { clientIp, rateLimit } from "@/lib/social-ai/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!/^[a-f0-9]{32}$/.test(token) || !rateLimit(`gpdf:${clientIp(req.headers)}`, 60, 60_000)) {
    return new NextResponse("Not found", { status: 404 });
  }
  const r = await recordDownload(createAdminClient(), token, req.headers.get("user-agent"));
  if (!r) return new NextResponse("Not found", { status: 404 });
  return NextResponse.redirect(r.file, { status: 302, headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" } });
}
