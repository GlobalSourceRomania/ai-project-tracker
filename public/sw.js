/**
 * Service Worker for AI Project Tracker PWA
 * Handles push notifications and offline assets
 */

const CACHE_NAME = 'ai-tracker-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/logo.svg',
  '/logo-dark.svg',
  '/favicon-32x32.png',
];

// Install event - cache assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching assets...');
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn('[SW] Asset caching failed (non-critical):', err);
      });
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  self.clients.claim();

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    })
  );
});

// Fetch event - network first for API, cache fallback for assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Network first for API calls
  if (url.pathname.startsWith('/api/')) {
    return event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const cache = caches.open(CACHE_NAME);
            cache.then((c) => c.put(request, response.clone()));
          }
          return response;
        })
        .catch(() => caches.match(request))
    );
  }

  // Cache first for assets
  event.respondWith(
    caches.match(request).then((response) => {
      if (response) return response;
      return fetch(request).then((response) => {
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseToCache);
        });
        return response;
      });
    })
  );
});

// Push event - receive and show notifications
self.addEventListener('push', (event) => {
  console.log('[SW] Push received:', event);

  if (!event.data) {
    console.warn('[SW] Push event with no data');
    return;
  }

  let payload = {};
  try {
    payload = event.data.json();
  } catch {
    payload = { title: 'AI Tracker', body: event.data.text() };
  }

  const {
    title = 'AI Tracker',
    body = 'New update',
    icon = '/logo-512x512.png',
    badge = '/favicon-32x32.png',
    tag = 'ai-tracker-notification',
  } = payload;

  const options = {
    body,
    icon,
    badge,
    tag,
    requireInteraction: false,
    actions: [
      { action: 'open', title: 'View' },
      { action: 'close', title: 'Dismiss' },
    ],
    data: payload,
  };

  event.waitUntil(
    self.registration.showNotification(title, options).then(() => {
      // Notify all clients about the push
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: 'PUSH_RECEIVED',
            payload,
          });
        });
      });
    })
  );
});

// Notification click event - navigate to project or close
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);

  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const { projectId, action } = event.notification.data;

  let targetUrl = '/projects';
  if (projectId) {
    targetUrl = `/projects?id=${projectId}`;
  }

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Check if a window is already open
      for (const client of clientList) {
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus();
        }
      }

      // Open new window if none found
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
