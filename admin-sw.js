const CACHE = 'gch-admin-pwa-v1';
const BASE = '/GuichiHan/';

const APP_SHELL = [
  `${BASE}admin.html`,
  `${BASE}admin-manifest.webmanifest`,
  `${BASE}icons/admin-192.png`,
  `${BASE}icons/admin-512.png`
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(async cache => {
        for (const url of APP_SHELL) {
          try {
            await cache.add(url);
          } catch (e) {
            console.warn('GCH Admin PWA cache:', url, e);
          }
        }
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(k => k !== CACHE)
          .map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const copy = response.clone();

          caches.open(CACHE)
            .then(cache => cache.put(`${BASE}admin.html`, copy))
            .catch(() => {});

          return response;
        })
        .catch(() => caches.match(`${BASE}admin.html`))
    );
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response.ok) {
          const copy = response.clone();

          caches.open(CACHE)
            .then(cache => cache.put(event.request, copy))
            .catch(() => {});
        }

        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
