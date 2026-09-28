/** Esporta tutti i dati di un contatto (diritto di accesso/portabilità GDPR). Solo admin. */
import { NextResponse, type NextRequest } from "next/server";
import { getCrmUser } from "@/lib/social-ai/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCrmUser();
  if (!user) return new NextResponse("Non autenticato", { status: 401 });
  if (user.role !== "admin") return new NextResponse("Solo admin", { status: 403 });
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return new NextResponse("Not found", { status: 404 });

  const db = createAdminClient();
  const { data: lead } = await db.from("leads").select("*").eq("id", id).maybeSingle();
  if (!lead) return new NextResponse("Not found", { status: 404 });
  const { data: convs } = await db.from("social_conversations").select("id, platform, status, created_at").eq("contact_id", id);
  const convIds = ((convs ?? []) as { id: string }[]).map((c) => c.id);
  const [activities, opportunities, quotes, projects, tags, identities, messages, comments, emails] = await Promise.all([
    db.from("activities").select("type, subject, body, created_at").eq("lead_id", id).order("created_at"),
    db.from("opportunities").select("title, value, probability, expected_close, created_at").eq("lead_id", id),
    db.from("quotes").select("number, title, items, total, status, sent_at, accepted_at, accepted_name, created_at").eq("lead_id", id),
    db.from("projects").select("name, phase, value, start_date, due_date, care_plan, created_at").eq("lead_id", id),
    db.from("lead_tags").select("tag:tags(name)").eq("lead_id", id),
    db.from("social_identities").select("platform, username, display_name, created_at").eq("lead_id", id),
    convIds.length ? db.from("social_messages").select("direction, content, created_at").in("conversation_id", convIds).order("created_at") : Promise.resolve({ data: [] }),
    db.from("social_comments").select("direction, content, created_at").eq("contact_id", id).order("created_at"),
    db.from("email_logs").select("to_email, subject, status, sent_at").eq("lead_id", id),
  ]);
  const out = {
    esportato_il: new Date().toISOString(),
    titolare: "Dieci Bottega",
    contatto: lead,
    tag: ((tags.data ?? []) as unknown as { tag: { name: string } | null }[]).map((t) => t.tag?.name).filter(Boolean),
    attivita: activities.data ?? [],
    opportunita: opportunities.data ?? [],
    preventivi: quotes.data ?? [],
    progetti: projects.data ?? [],
    email_inviate: emails.data ?? [],
    social: { profili: identities.data ?? [], conversazioni: convs ?? [], messaggi: messages.data ?? [], commenti: comments.data ?? [] },
  };
  const name = String((lead as { name: string }).name).toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40);
  return new NextResponse(JSON.stringify(out, null, 2), {
    headers: { "Content-Type": "application/json; charset=utf-8", "Content-Disposition": `attachment; filename="dati-${name || "contatto"}.json"`, "Cache-Control": "no-store" },
  });
}
