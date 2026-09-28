/**
 * Notifiche al team: push sul telefono (PWA installata) per gli eventi importanti.
 * Richiede VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY (NEXT_PUBLIC_VAPID_PUBLIC_KEY per il browser).
 * Senza chiavi non fa nulla. Non deve mai far fallire il flusso che la chiama.
 */
import webpush from "web-push";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
  /** Chat non lette: numero sul pallino dell'icona dell'app. */
  unread?: number;
}

export function pushConfigured(): boolean {
  return !!(process.env.VAPID_PRIVATE_KEY && (process.env.VAPID_PUBLIC_KEY || process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY));
}

let configured = false;
function setup(): boolean {
  if (!pushConfigured()) return false;
  if (!configured) {
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT || "mailto:crm@diecibottega.it",
      (process.env.VAPID_PUBLIC_KEY || process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY)!,
      process.env.VAPID_PRIVATE_KEY!
    );
    configured = true;
  }
  return true;
}

/** Invia a tutti i dispositivi iscritti del team; rimuove le iscrizioni scadute. */
export async function notifyTeam(payload: PushPayload, db?: SupabaseClient): Promise<number> {
  try {
    if (!setup()) return 0;
    const admin = db ?? createAdminClient();
    const { data } = await admin.from("push_subscriptions").select("id, endpoint, p256dh, auth");
    const subs = (data ?? []) as { id: string; endpoint: string; p256dh: string; auth: string }[];
    let sent = 0;
    await Promise.all(
      subs.map(async (s) => {
        try {
          await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, JSON.stringify(payload), { TTL: 3600 });
          sent++;
        } catch (e) {
          const code = (e as { statusCode?: number }).statusCode;
          if (code === 404 || code === 410) await admin.from("push_subscriptions").delete().eq("id", s.id);
        }
      })
    );
    return sent;
  } catch (e) {
    console.error("[notify] push:", (e as Error).message);
    return 0;
  }
}
