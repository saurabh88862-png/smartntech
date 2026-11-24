// SmartNTech service worker: makes the site installable and usable offline.
// - Core files are cached on install, so the home page, tools and all article text work offline.
// - Pages: network first (always fresh when online), cached copy when offline.
// - Other files: cached copy first, refreshed in the background.
// Bump VERSION whenever core files change so old caches are cleared.
const VERSION = 'snt-v12';
const CORE = [
  './', './index.html', './manifest.webmanifest', './blog/index.html', './blog/manifest.js',
  './assets/logo.svg', './assets/icon-192.png', './assets/icon-512.png',
  './assets/tailwind.css', './assets/fx.css', './assets/fx.js', './assets/app.js', './assets/render.js', './assets/tools-extra.js',
  './articles/early.js', './articles/java.js', './articles/javascript.js', './articles/react.js', './articles/sql.js', './articles/backend.js',
  './articles/seo.js', './articles/devops.js', './articles/career.js', './articles/python.js', './articles/ai.js', './articles/automation.js',
  './image-compressor/', './pdf-compressor/', './color-picker/',
  './assets/apps/image-compressor.js', './assets/apps/pdf-compressor.js', './assets/apps/color-picker.js',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => Promise.all(CORE.map((u) => c.add(u).catch(() => {})))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Never cache the like counter or comment widget: they must always be live.
  if (/abacus\.jasoncameron\.dev|utteranc\.es|api\.github\.com|googleapis\.com\/identitytoolkit|firestore/.test(url.host + url.pathname)) return;

  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((res) => { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); return res; })
        .catch(() => caches.match(req, { ignoreSearch: true }).then((r) => r || caches.match('./index.html')))
    );
    return;
  }

  // Exact match (query included): a new ?v= number always fetches the new file instead of an old cached copy.
  e.respondWith(
    caches.match(req).then((cached) => {
      const net = fetch(req).then((res) => {
        if (res && (res.ok || res.type === 'opaque')) { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); }
        return res;
      }).catch(() => cached);
      return cached || net;
    })
  );
});
