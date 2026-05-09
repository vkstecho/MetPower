/**
 * MetPower — Service Worker
 *
 * Strategy:
 *   • App shell (index.html, manifest, icons) → cache-first
 *   • Iframe content (Met Train PRO, MetCost, MRM, Time Study, SupSkill) → cache-first with revalidation
 *   • Firebase API → never cache
 *   • External CDN → stale-while-revalidate
 */

const SW_VERSION    = 'metpower-v0.1.0';
const STATIC_CACHE  = `${SW_VERSION}-static`;
const RUNTIME_CACHE = `${SW_VERSION}-runtime`;

const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

const NEVER_CACHE_DOMAINS = [
  'firebaseio.com',
  'firebasedatabase.app',
  'googleapis.com',
  'identitytoolkit.googleapis.com',
  'securetoken.googleapis.com',
  'google.com/recaptcha'
];

const RUNTIME_DOMAINS = [
  'gstatic.com',
  'cdnjs.cloudflare.com',
  'fonts.googleapis.com',
  'fonts.gstatic.com'
];

// ─────────────────────────────────────────────
// INSTALL
// ─────────────────────────────────────────────
self.addEventListener('install', event => {
  console.log('[SW] Installing', SW_VERSION);
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(APP_SHELL).catch(err => {
        console.warn('[SW] Some shell files not cached:', err.message);
      }))
      .then(() => self.skipWaiting())
  );
});

// ─────────────────────────────────────────────
// ACTIVATE
// ─────────────────────────────────────────────
self.addEventListener('activate', event => {
  console.log('[SW] Activating', SW_VERSION);
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => !key.startsWith(SW_VERSION))
            .map(key => {
              console.log('[SW] Deleting old cache:', key);
              return caches.delete(key);
            })
      )
    ).then(() => self.clients.claim())
  );
});

// ─────────────────────────────────────────────
// FETCH
// ─────────────────────────────────────────────
self.addEventListener('fetch', event => {
  const req = event.request;
  if(req.method !== 'GET') return;

  const url = new URL(req.url);

  // 1. NEVER cache Firebase
  if(NEVER_CACHE_DOMAINS.some(d => url.hostname.includes(d))) return;

  // 2. App shell + iframe content (same origin) → cache-first
  if(url.origin === self.location.origin){
    event.respondWith(
      caches.match(req).then(cached => {
        if(cached){
          // Background revalidate iframe content (so updates are picked up)
          if(url.pathname.endsWith('.html') && url.pathname !== '/index.html'){
            fetch(req).then(res => {
              if(res.ok) caches.open(STATIC_CACHE).then(c => c.put(req, res));
            }).catch(()=>{});
          }
          return cached;
        }
        return fetch(req).then(res => {
          if(res.ok && res.status === 200){
            const copy = res.clone();
            caches.open(STATIC_CACHE).then(c => c.put(req, copy));
          }
          return res;
        }).catch(() => {
          if(req.mode === 'navigate'){
            return caches.match('./index.html');
          }
          return new Response('Offline', { status: 503 });
        });
      })
    );
    return;
  }

  // 3. CDN → stale-while-revalidate
  if(RUNTIME_DOMAINS.some(d => url.hostname.includes(d))){
    event.respondWith(
      caches.open(RUNTIME_CACHE).then(cache =>
        cache.match(req).then(cached => {
          const fetchPromise = fetch(req).then(res => {
            if(res.ok) cache.put(req, res.clone());
            return res;
          }).catch(() => cached);
          return cached || fetchPromise;
        })
      )
    );
    return;
  }
});

self.addEventListener('message', event => {
  if(event.data === 'SKIP_WAITING') self.skipWaiting();
  if(event.data === 'CLEAR_CACHE'){
    caches.keys().then(keys => keys.forEach(k => caches.delete(k)));
  }
});
