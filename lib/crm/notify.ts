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
  return (await notifyTeamDetailed(payload, db)).sent;
}

/** Come notifyTeam, ma riporta anche gli errori (per il pulsante "Prova"). */
export async function notifyTeamDetailed(payload: PushPayload, db?: SupabaseClient): Promise<{ sent: number; total: number; errors: string[] }> {
  const errors: string[] = [];
  try {
    if (!setup()) return { sent: 0, total: 0, errors: ["Chiavi VAPID non configurate su Vercel"] };
    const admin = db ?? createAdminClient();
    const { data } = await admin.from("push_subscriptions").select("id, endpoint, p256dh, auth");
    const subs = (data ?? []) as { id: string; endpoint: string; p256dh: string; auth: string }[];
    let sent = 0;
    await Promise.all(
      subs.map(async (s) => {
        try {
          await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, JSON.stringify(payload), { TTL: 3600, urgency: "high" });
          sent++;
        } catch (e) {
          const err = e as { statusCode?: number; body?: string; message?: string };
          const host = (() => { try { return new URL(s.endpoint).host; } catch { return "?"; } })();
          errors.push(`${host}: ${err.statusCode ?? ""} ${(err.body || err.message || "errore").toString().slice(0, 160)}`.trim());
          if (err.statusCode === 404 || err.statusCode === 410) await admin.from("push_subscriptions").delete().eq("id", s.id);
        }
      })
    );
    return { sent, total: subs.length, errors };
  } catch (e) {
    console.error("[notify] push:", (e as Error).message);
    return { sent: 0, total: 0, errors: [(e as Error).message] };
  }
}
