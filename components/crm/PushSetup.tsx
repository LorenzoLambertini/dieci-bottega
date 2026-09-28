"use client";

import { useEffect, useState } from "react";
import { removePushSubscription, savePushSubscription, sendTestPush } from "@/app/crm/(app)/settings/push-actions";

const KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";

function b64ToUint8(b64: string): Uint8Array {
  const pad = "=".repeat((4 - (b64.length % 4)) % 4);
  const raw = atob((b64 + pad).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

type State = "loading" | "unsupported" | "ios-browser" | "off" | "on" | "denied" | "nokey";

export function PushSetup() {
  const [state, setState] = useState<State>("loading");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      if (!KEY) return setState("nokey");
      const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
      const standalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as unknown as { standalone?: boolean }).standalone;
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) return setState(ios && !standalone ? "ios-browser" : "unsupported");
      if (Notification.permission === "denied") return setState("denied");
      const reg = await navigator.serviceWorker.register("/crm-sw.js", { scope: "/crm/" });
      const sub = await reg.pushManager.getSubscription();
      setState(sub ? "on" : "off");
    })().catch(() => setState("unsupported"));
  }, []);

  async function enable() {
    setBusy(true);
    setMsg(null);
    try {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") { setState(perm === "denied" ? "denied" : "off"); return; }
      const reg = await navigator.serviceWorker.register("/crm-sw.js", { scope: "/crm/" });
      await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64ToUint8(KEY) as BufferSource });
      const r = await savePushSubscription(JSON.parse(JSON.stringify(sub)), navigator.userAgent);
      if (!r.ok) throw new Error(r.error);
      setState("on");
      const t = await sendTestPush();
      setMsg(t.ok ? "Fatto! Dovrebbe arrivarti una notifica di prova." : t.error ?? null);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Errore");
    } finally {
      setBusy(false);
    }
  }

  async function disable() {
    setBusy(true);
    const reg = await navigator.serviceWorker.getRegistration("/crm/");
    const sub = await reg?.pushManager.getSubscription();
    if (sub) {
      await removePushSubscription(sub.endpoint);
      await sub.unsubscribe();
    }
    setState("off");
    setBusy(false);
  }

  const btn = "bg-white/[0.08] hover:bg-white/[0.14] text-white/80 text-xs font-semibold rounded-lg px-3 py-2 transition-colors disabled:opacity-40";
  return (
    <div className="space-y-2">
      {state === "loading" && <p className="text-white/30 text-xs">Controllo…</p>}
      {state === "nokey" && <p className="text-white/40 text-xs">Manca la configurazione su Vercel (chiavi VAPID): chiedile a Claude.</p>}
      {state === "ios-browser" && <p className="text-white/50 text-xs">Su iPhone le notifiche funzionano solo dall&apos;app installata: aggiungi prima il CRM alla schermata Home (istruzioni qui sopra), poi aprilo dall&apos;icona e torna qui.</p>}
      {state === "unsupported" && <p className="text-white/40 text-xs">Questo browser non supporta le notifiche push.</p>}
      {state === "denied" && <p className="text-white/40 text-xs">Hai bloccato le notifiche: riattivale dalle impostazioni del browser/telefono per diecibottega.it.</p>}
      {state === "off" && <button type="button" disabled={busy} onClick={enable} className={btn}>{busy ? "Attivo…" : "🔔 Attiva le notifiche su questo dispositivo"}</button>}
      {state === "on" && (
        <div className="flex gap-2 flex-wrap">
          <span className="text-green-400 text-xs py-2">✓ Notifiche attive su questo dispositivo</span>
          <button type="button" disabled={busy} onClick={async () => { const t = await sendTestPush(); setMsg(t.ok ? `Inviata a ${t.sent} dispositiv${t.sent === 1 ? "o" : "i"}` : t.error ?? null); }} className={btn}>Prova</button>
          <button type="button" disabled={busy} onClick={disable} className="text-white/35 hover:text-white text-xs px-2">Disattiva</button>
        </div>
      )}
      {msg && <p className="text-white/50 text-xs">{msg}</p>}
    </div>
  );
}
