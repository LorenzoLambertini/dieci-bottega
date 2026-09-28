/** Feed .ics del CRM (abbonamento da Google Calendar / iPhone). Protetto da token segreto. */
import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { safeEqual } from "@/lib/social-ai/crypto";
import { calendarToken, loadEvents, toIcs } from "@/lib/crm/calendar";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token") ?? "";
  if (!token || !safeEqual(token, calendarToken())) return new NextResponse("Not found", { status: 404 });
  const from = new Date(Date.now() - 30 * 86_400_000).toISOString();
  const to = new Date(Date.now() + 180 * 86_400_000).toISOString();
  const events = await loadEvents(createAdminClient(), from, to);
  const site = (process.env.NEXT_PUBLIC_SITE_URL || "https://diecibottega.it").replace(/\/$/, "");
  return new NextResponse(toIcs(events, site), {
    headers: { "Content-Type": "text/calendar; charset=utf-8", "Cache-Control": "no-store", "Content-Disposition": 'inline; filename="dieci-bottega-crm.ics"' },
  });
}
