// MetPower — Optimized Service Worker
// Strategy: Stale-While-Revalidate for Assets, Network-First for HTML

const SW_VERSION = 'metpower-v2';
const STATIC_CACHE = 'metpower-static-v2';
const INTEGRITY_CACHE = 'metpower-integrity';

// Assets to precache for instant loading
const ASSETS_TO_PRECACHE = [
  './',
  './index.html',
  'https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;500;600;700;800;900&family=Barlow+Condensed:wght@700;800;900&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'
];

self.addEventListener('install', e => {
  e.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then(cache => cache.addAll(ASSETS_TO_PRECACHE)),
      caches.open(INTEGRITY_CACHE).then(cache => cache.put(
        '/integrity-token',
        new Response(SW_VERSION, { headers: { 'Content-Type': 'text/plain' } })
      ))
    ]).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== INTEGRITY_CACHE && k !== STATIC_CACHE && k !== SW_VERSION)
          .map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = e.request.url;

  // Bypass for APIs and non-GET
  if (
    e.request.method !== 'GET' ||
    url.includes('firebaseio.com') ||
    url.includes('googleapis.com') ||
    url.includes('anthropic.com') ||
    url.startsWith('chrome-extension')
  ) return;

  // HTML: Network-First (ensure fresh content)
  if (e.request.mode === 'navigate' || url.endsWith('.html')) {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          const clone = res.clone();
          caches.open(SW_VERSION).then(c => c.put(e.request, clone));
          return res;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // Assets: Stale-While-Revalidate (fastest load, updates in background)
  e.respondWith(
    caches.match(e.request).then(cached => {
      const networked = fetch(e.request).then(res => {
        const clone = res.clone();
        caches.open(STATIC_CACHE).then(c => c.put(e.request, clone));
        return res;
      }).catch(() => null);

      return cached || networked;
    })
  );
});

self.addEventListener('message', e => {
  if (e.data === 'SKIP_WAITING') self.skipWaiting();
});
