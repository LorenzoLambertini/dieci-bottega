/** Nuovo commento dal blog: validazione anti-spam, salvataggio "in attesa", notifica al team. */
import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPost } from "@/lib/blog";
import { hashIp, validateComment } from "@/lib/blog/comments";
import { clientIp, rateLimit } from "@/lib/social-ai/rate-limit";
import { createNotification } from "@/lib/social-ai/crm";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let raw: Record<string, unknown>;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Richiesta non valida" }, { status: 400 });
  }
  const post = getPost(String(raw.slug ?? ""));
  if (!post) return NextResponse.json({ error: "Articolo non trovato" }, { status: 404 });

  const ip = clientIp(req.headers);
  if (!rateLimit(`blog-comment:${ip}`, 3, 10 * 60_000)) {
    return NextResponse.json({ error: "Hai già inviato diversi commenti: riprova tra qualche minuto" }, { status: 429 });
  }
  const v = validateComment(raw);
  // ai bot si risponde "ok" senza salvare nulla
  if (!v.ok) return v.spam ? NextResponse.json({ ok: true, pending: true }) : NextResponse.json({ error: v.error }, { status: 422 });

  const db = createAdminClient();
  const { error } = await db.from("blog_comments").insert({
    post_slug: post.slug,
    author_name: v.data.name,
    author_email: v.data.email,
    body: v.data.body,
    ip_hash: hashIp(ip),
  });
  if (error) {
    console.error("[blog comments]", error.message);
    return NextResponse.json({ error: "Non siamo riusciti a salvare il commento, riprova" }, { status: 500 });
  }
  await createNotification(db, {
    type: "blog_comment",
    title: `💬 Nuovo commento sul blog · ${v.data.name}`,
    body: `${post.title}: «${v.data.body.slice(0, 140)}»`,
    link: "/crm/blog",
    tag: `blog-${post.slug}`,
  }).catch(() => undefined);
  return NextResponse.json({ ok: true, pending: true });
}
