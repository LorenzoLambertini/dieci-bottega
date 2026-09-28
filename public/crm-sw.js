/* Service worker del CRM Dieci Bottega: notifiche push. */
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

self.addEventListener("push", (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch { data = { title: "Dieci Bottega CRM", body: event.data && event.data.text() }; }
  const title = data.title || "Dieci Bottega CRM";
  const tasks = [
    self.registration.showNotification(title, {
      body: data.body || "",
      icon: "/crm-icon-192.png",
      badge: "/crm-icon-192.png",
      tag: data.tag || undefined,
      renotify: !!data.tag,
      data: { url: data.url || "/crm/dashboard" },
    }),
    // CRM aperto: aggiorna subito il pallino dell'Inbox
    self.clients.matchAll({ type: "window" }).then((list) => list.forEach((c) => c.postMessage({ type: "crm:push" }))),
  ];
  // Pallino con il numero sull'icona dell'app (come WhatsApp)
  if (typeof data.unread === "number" && self.navigator.setAppBadge) {
    tasks.push((data.unread > 0 ? self.navigator.setAppBadge(data.unread) : self.navigator.clearAppBadge()).catch(() => {}));
  }
  event.waitUntil(Promise.all(tasks));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = new URL((event.notification.data && event.notification.data.url) || "/crm/dashboard", self.location.origin).href;
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const c of list) {
        if (c.url.startsWith(self.location.origin + "/crm") && "focus" in c) { c.navigate(url); return c.focus(); }
      }
      return self.clients.openWindow(url);
    })
  );
});
