import { NextResponse, type NextRequest } from "next/server";
import { getCrmUser } from "@/lib/social-ai/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { OAUTH_PLATFORMS, siteUrl, startOAuth, type OAuthPlatform } from "@/lib/social-ai/oauth";
import { clientIp, rateLimit } from "@/lib/social-ai/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Avvia l'OAuth: /api/social/oauth/meta | linkedin | tiktok (solo admin). */
export async function GET(req: NextRequest, { params }: { params: Promise<{ platform: string }> }) {
  const { platform } = await params;
  if (!(OAUTH_PLATFORMS as readonly string[]).includes(platform)) return new NextResponse("Not found", { status: 404 });
  if (!rateLimit(`oauth:${clientIp(req.headers)}`, 20, 60_000)) return new NextResponse("Too Many Requests", { status: 429 });

  const user = await getCrmUser();
  if (!user) return NextResponse.redirect(`${siteUrl()}/crm/login?redirect=/crm/settings/social-ai`);
  if (user.role !== "admin") return NextResponse.redirect(`${siteUrl()}/crm/settings/social-ai?error=permessi`);

  try {
    const url = await startOAuth(createAdminClient(), platform as OAuthPlatform, user.id);
    return NextResponse.redirect(url);
  } catch (e) {
    console.error("[oauth start]", (e as Error).message);
    return NextResponse.redirect(`${siteUrl()}/crm/settings/social-ai?error=config`);
  }
}
