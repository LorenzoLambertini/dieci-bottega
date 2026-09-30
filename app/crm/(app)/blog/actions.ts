"use server";

/** Moderazione dei commenti del blog dal CRM. */
import { revalidatePath } from "next/cache";
import { requireCrmUser } from "@/lib/social-ai/auth";
import { createAdminClient } from "@/lib/supabase/admin";

type Result = { ok: boolean; error?: string };

async function slugOf(id: string): Promise<string | null> {
  const { data } = await createAdminClient().from("blog_comments").select("post_slug").eq("id", id).maybeSingle();
  return (data as { post_slug: string } | null)?.post_slug ?? null;
}

export async function setCommentStatus(id: string, status: "approved" | "spam" | "pending"): Promise<Result> {
  try {
    await requireCrmUser(["admin", "marketing"]);
    const db = createAdminClient();
    const { error } = await db.from("blog_comments").update({ status, approved_at: status === "approved" ? new Date().toISOString() : null }).eq("id", id);
    if (error) return { ok: false, error: error.message };
    const slug = await slugOf(id);
    if (slug) revalidatePath(`/blog/${slug}`);
    revalidatePath("/crm/blog");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function deleteComment(id: string): Promise<Result> {
  try {
    await requireCrmUser(["admin"]);
    const slug = await slugOf(id);
    const { error } = await createAdminClient().from("blog_comments").delete().eq("id", id);
    if (error) return { ok: false, error: error.message };
    if (slug) revalidatePath(`/blog/${slug}`);
    revalidatePath("/crm/blog");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

async function teamName(userId: string): Promise<string> {
  const { data } = await createAdminClient().from("profiles").select("full_name").eq("id", userId).maybeSingle();
  const first = (data as { full_name: string | null } | null)?.full_name?.trim().split(/\s+/)[0];
  return first ? `${first} · Dieci Bottega` : "Dieci Bottega";
}

/** Risposta del team: pubblicata subito, sotto il commento. Approva anche il commento a cui risponde. */
export async function replyToComment(id: string, body: string): Promise<Result> {
  try {
    const user = await requireCrmUser(["admin", "marketing"]);
    const text = body.trim().slice(0, 2000);
    if (text.length < 2) return { ok: false, error: "Scrivi la risposta" };
    const db = createAdminClient();
    const { data } = await db.from("blog_comments").select("post_slug, parent_id").eq("id", id).maybeSingle();
    const parent = data as { post_slug: string; parent_id: string | null } | null;
    if (!parent) return { ok: false, error: "Commento non trovato" };
    const now = new Date().toISOString();
    await db.from("blog_comments").update({ status: "approved", approved_at: now }).eq("id", id).neq("status", "approved");
    const { error } = await db.from("blog_comments").insert({
      post_slug: parent.post_slug,
      parent_id: parent.parent_id ?? id,
      author_name: await teamName(user.id),
      body: text,
      status: "approved",
      is_team: true,
      approved_at: now,
    });
    if (error) return { ok: false, error: error.message };
    revalidatePath(`/blog/${parent.post_slug}`);
    revalidatePath("/crm/blog");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
