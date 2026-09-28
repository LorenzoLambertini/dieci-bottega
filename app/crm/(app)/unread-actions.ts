"use server";

/** Numero di conversazioni social con messaggi non letti (pallino sull'Inbox). */
import { getCrmUser } from "@/lib/social-ai/auth";
import { createSocialClient } from "@/lib/social-ai/db";

export async function getUnreadCount(): Promise<number> {
  try {
    if (!(await getCrmUser())) return 0;
    const db = await createSocialClient();
    const { count } = await db.from("social_conversations").select("id", { count: "exact", head: true }).gt("unread_count", 0);
    return count ?? 0;
  } catch {
    return 0;
  }
}
