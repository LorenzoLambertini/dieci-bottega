"use server";

import { requireCrmUser } from "@/lib/social-ai/auth";
import { createSocialClient } from "@/lib/social-ai/db";
import { notifyTeamDetailed, pushConfigured } from "@/lib/crm/notify";

export async function savePushSubscription(sub: { endpoint: string; keys: { p256dh: string; auth: string } }, userAgent: string): Promise<{ ok: boolean; error?: string }> {
  const user = await requireCrmUser();
  if (!sub?.endpoint?.startsWith("https://") || !sub.keys?.p256dh || !sub.keys?.auth) return { ok: false, error: "Iscrizione non valida" };
  const db = await createSocialClient();
  const { error } = await db.from("push_subscriptions").upsert(
    { user_id: user.id, endpoint: sub.endpoint, p256dh: sub.keys.p256dh, auth: sub.keys.auth, user_agent: userAgent.slice(0, 200) },
    { onConflict: "endpoint" }
  );
  return error ? { ok: false, error: error.message } : { ok: true };
}

export async function removePushSubscription(endpoint: string): Promise<{ ok: boolean }> {
  await requireCrmUser();
  const db = await createSocialClient();
  await db.from("push_subscriptions").delete().eq("endpoint", endpoint);
  return { ok: true };
}

export async function sendTestPush(): Promise<{ ok: boolean; error?: string; sent?: number; total?: number; errors?: string[] }> {
  await requireCrmUser();
  if (!pushConfigured()) return { ok: false, error: "Chiavi VAPID non configurate su Vercel" };
  const r = await notifyTeamDetailed({ title: "🔔 Notifiche attive", body: "Da ora ti avviso qui per nuovi messaggi, contatti, chat da seguire e preventivi accettati.", url: "/crm/dashboard", tag: "test" });
  return { ok: true, sent: r.sent, total: r.total, errors: r.errors };
}
