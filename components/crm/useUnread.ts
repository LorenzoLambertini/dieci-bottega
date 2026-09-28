"use client";

/**
 * Conversazioni non lette, condivise da tutti i componenti (una sola interrogazione).
 * Aggiorna anche il pallino sull'icona dell'app installata e il titolo della scheda.
 */
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getUnreadCount } from "@/app/crm/(app)/unread-actions";

const POLL_MS = 30_000;
let count = 0;
let inflight: Promise<void> | null = null;
let timer: ReturnType<typeof setInterval> | null = null;
const listeners = new Set<(n: number) => void>();

function apply(n: number) {
  count = n;
  listeners.forEach((l) => l(n));
  const nav = navigator as Navigator & { setAppBadge?: (n?: number) => Promise<void>; clearAppBadge?: () => Promise<void> };
  if (n > 0) nav.setAppBadge?.(n).catch(() => {});
  else nav.clearAppBadge?.().catch(() => {});
  const base = document.title.replace(/^\(\d+\)\s*/, "");
  document.title = n > 0 ? `(${n}) ${base}` : base;
}

export function refreshUnread() {
  if (inflight) return inflight;
  inflight = getUnreadCount()
    .then(apply)
    .catch(() => {})
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

export function useUnreadCount(): number {
  const [n, setN] = useState(count);
  const pathname = usePathname();

  useEffect(() => {
    listeners.add(setN);
    if (!timer) {
      timer = setInterval(() => document.visibilityState === "visible" && refreshUnread(), POLL_MS);
      const onVisible = () => document.visibilityState === "visible" && refreshUnread();
      document.addEventListener("visibilitychange", onVisible);
      window.addEventListener("crm:unread", () => void refreshUnread());
      // Notifica push ricevuta mentre il CRM è aperto → aggiorna subito
      navigator.serviceWorker?.addEventListener("message", (e) => {
        if ((e.data as { type?: string } | null)?.type === "crm:push") void refreshUnread();
      });
    }
    return () => {
      listeners.delete(setN);
    };
  }, []);

  useEffect(() => {
    void refreshUnread();
  }, [pathname]);

  return n;
}

/** Pallino rosso con il numero, come WhatsApp. */
export function badgeText(n: number): string {
  return n > 99 ? "99+" : String(n);
}
