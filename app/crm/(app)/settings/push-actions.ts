"use server";

import { requireCrmUser } from "@/lib/social-ai/auth";
import { createSocialClient } from "@/lib/social-ai/db";
import { notifyTeam, pushConfigured } from "@/lib/crm/notify";

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

export async function sendTestPush(): Promise<{ ok: boolean; error?: string; sent?: number }> {
  await requireCrmUser();
  if (!pushConfigured()) return { ok: false, error: "Chiavi VAPID non configurate su Vercel" };
  const sent = await notifyTeam({ title: "🔔 Notifiche attive", body: "Da ora ti avviso qui per nuovi contatti, chat da seguire e preventivi accettati.", url: "/crm/dashboard" });
  return { ok: true, sent };
}
