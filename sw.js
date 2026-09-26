/* MET Power — service worker (installability + offline shell)
   Fixed: no infinite update/reload loop */
const CACHE = 'metpower-v3';
const PRECACHE = [
  './',
  './index.html',
  './css/app.css',
  './js/app.js',
  './js/firebase-init.js',
  './js/polyfill.js',
  './manifest.json',
  './vkslogo512.png'
];

self.addEventListener('install', (event) => {
  // Do NOT call skipWaiting() here automatically — wait for client message
  // so the page can control when to activate and avoid reload loops.
  event.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(PRECACHE).catch(() => {}))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Client can request immediate activation (one-time)
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING' || (event.data && event.data.type === 'SKIP_WAITING')) {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Don't cache Firebase / API
  if (url.hostname.includes('firebase') || url.hostname.includes('googleapis') || url.hostname.includes('gstatic')) {
    return;
  }
  event.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req).then((res) => {
        if (res && res.ok && url.origin === self.location.origin) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        }
        return res;
      }).catch(() => cached);
      return cached || network;
    })
  );
});
