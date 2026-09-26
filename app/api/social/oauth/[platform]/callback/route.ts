import { NextResponse, type NextRequest } from "next/server";
import { getCrmUser } from "@/lib/social-ai/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { completeOAuth, consumeState, OAUTH_PLATFORMS, siteUrl, type OAuthPlatform } from "@/lib/social-ai/oauth";
import { logAction } from "@/lib/social-ai/crm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET(req: NextRequest, { params }: { params: Promise<{ platform: string }> }) {
  const { platform } = await params;
  const back = (q: string) => NextResponse.redirect(`${siteUrl()}/crm/settings/social-ai?${q}`);
  if (!(OAUTH_PLATFORMS as readonly string[]).includes(platform)) return new NextResponse("Not found", { status: 404 });

  const sp = req.nextUrl.searchParams;
  if (sp.get("error")) return back(`error=${encodeURIComponent(sp.get("error_description") ?? sp.get("error") ?? "oauth")}`);
  const code = sp.get("code");
  const state = sp.get("state");
  if (!code || !state) return back("error=parametri");

  const user = await getCrmUser();
  if (!user || user.role !== "admin") return back("error=permessi");

  const db = createAdminClient();
  const stateUser = await consumeState(db, platform as OAuthPlatform, state);
  if (!stateUser || stateUser !== user.id) return back("error=state");

  try {
    const n = await completeOAuth(db, platform as OAuthPlatform, code);
    await logAction(db, { action_type: "connect_account", actor: "human", actor_user_id: user.id, platform, summary: `Collegati ${n} account ${platform}` });
    return back(`connected=${platform}&n=${n}`);
  } catch (e) {
    const msg = (e as Error).message;
    console.error("[oauth callback]", platform, msg);
    await logAction(db, { action_type: "connect_account", actor: "human", actor_user_id: user.id, platform, status: "error", summary: `Collegamento ${platform} fallito`, error: msg });
    return back(`error=${encodeURIComponent("Collegamento non riuscito")}`);
  }
}
