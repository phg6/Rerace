/* Rerace service worker — offline shell + push notifications. */

const CACHE = "rerace-v1";

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then((cache) => cache.add("/").catch(() => {})));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
      // Make sure the offline fallback shell is cached.
      const cache = await caches.open(CACHE);
      await cache.add("/").catch(() => {});
      await self.clients.claim();
    })()
  );
});

// Network-first for page navigations, falling back to the cached shell when offline.
self.addEventListener("fetch", (event) => {
  if (event.request.mode !== "navigate") return;
  event.respondWith(
    (async () => {
      try {
        const fresh = await fetch(event.request);
        if (new URL(event.request.url).pathname === "/") {
          const cache = await caches.open(CACHE);
          cache.put("/", fresh.clone());
        }
        return fresh;
      } catch {
        const cached = await caches.match("/");
        return (
          cached ||
          new Response("<h1>Offline</h1><p>Rerace needs a connection.</p>", {
            status: 503,
            headers: { "Content-Type": "text/html" },
          })
        );
      }
    })()
  );
});

// Web push — session reminders & go-live alerts.
self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: "Rerace", body: event.data ? event.data.text() : "" };
  }
  const title = data.title || "Rerace";
  event.waitUntil(
    self.registration.showNotification(title, {
      body: data.body || "",
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      data: { url: data.url || "/" },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/";
  event.waitUntil(
    (async () => {
      const clientList = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const client of clientList) {
        if (client.url.endsWith(url) && "focus" in client) return client.focus();
      }
      return self.clients.openWindow(url);
    })()
  );
});
