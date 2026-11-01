/* Hamos 的烟草生活 — 离线缓存。改了代码就把 VERSION 加一。 */
const VERSION = 'hamos-1.3.0-20261102e';
const PRECACHE = [
  './',
  'index.html',
  'manifest.webmanifest',
  'css/app.css',
  'css/pwa.css',
  'js/data.js',
  'js/wiki.js',
  'js/pipe-data.js',
  'js/pipe-catalog.js',
  'js/core.js',
  'js/views.js',
  'js/views2.js',
  'js/cabinet.js',
  'js/enrich.js',
  'js/app.js',
  'js/pwa.js',
  'data/seed.js',
  'assets/logo.svg',
  'icons/icon-180.png',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/icon-maskable-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(VERSION).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // 外部请求不拦（比如补全接口）

  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then((hit) => {
      if (hit) return hit;
      return fetch(req)
        .then((res) => {
          if (res && res.ok && res.type === 'basic') {
            const copy = res.clone();
            caches.open(VERSION).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => {
          // 离线且没缓存：导航请求退回首页，数据本来就在本机 localStorage 里
          if (req.mode === 'navigate') return caches.match('index.html');
          throw new Error('offline');
        });
    })
  );
});
