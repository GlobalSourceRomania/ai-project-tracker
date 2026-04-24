/**
 * Service Worker for AI Project Tracker PWA
 * Handles push notifications, app-icon badge, and asset caching.
 */

const CACHE_NAME = 'ai-tracker-v2';
const ASSETS_TO_CACHE = ['/', '/logo.svg', '/favicon-32x32.png'];

// ─── Install ────────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(ASSETS_TO_CACHE).catch(() => {})
    )
  );
});

// ─── Activate ───────────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  self.clients.claim();
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    )
  );
});

// ─── Fetch (network-first for API, cache-first for assets) ──────────────────
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (url.pathname.startsWith('/api/')) {
    // Network-first for API
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }
  // Cache-first for static assets
  event.respondWith(
    caches.match(event.request).then(
      (cached) => cached || fetch(event.request)
    )
  );
});

// ─── Push received ──────────────────────────────────────────────────────────
self.addEventListener('push', (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = { title: 'AI Tracker', body: event.data ? event.data.text() : 'New update' };
  }

  const {
    title = 'AI Tracker',
    body = 'New update',
    icon = '/logo-512x512.png',
    badge = '/favicon-32x32.png',
    badgeCount,          // optional number sent in payload
  } = payload;

  const options = {
    body,
    icon,
    badge,
    tag: 'ai-tracker',
    renotify: true,      // vibrate even if same tag
    requireInteraction: false,
    data: payload,
    actions: [
      { action: 'open',    title: 'Open' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
  };

  event.waitUntil(
    Promise.all([
      // Show the OS notification
      self.registration.showNotification(title, options),

      // Update app-icon badge number (iOS 16.4+ / Android Chrome)
      'setAppBadge' in self.navigator
        ? self.navigator.setAppBadge(badgeCount ?? 1).catch(() => {})
        : Promise.resolve(),
    ]).then(() => {
      // Tell all open tabs so they can refresh the badge count immediately
      self.clients.matchAll({ includeUncontrolled: true, type: 'window' }).then((clients) => {
        clients.forEach((client) => client.postMessage({ type: 'PUSH_RECEIVED', payload }));
      });
    })
  );
});

// ─── Notification clicked ────────────────────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const { projectId } = event.notification.data || {};
  const targetUrl = projectId ? `/projects?open=${projectId}` : '/inbox';

  event.waitUntil(
    // Clear badge when user interacts with the notification
    ('clearAppBadge' in self.navigator
      ? self.navigator.clearAppBadge().catch(() => {})
      : Promise.resolve()
    ).then(() =>
      self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        for (const client of clientList) {
          if ('focus' in client) {
            client.navigate(targetUrl);
            return client.focus();
          }
        }
        if (self.clients.openWindow) return self.clients.openWindow(targetUrl);
      })
    )
  );
});
