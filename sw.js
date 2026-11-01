/* Hamos 的烟草生活 — 离线缓存。改了代码就把 VERSION 加一。 */
const VERSION = 'hamos-1.3.0-20261102g';
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

  // 页面本身：先问网络，拿不到才用缓存。这样改完发一版，刷新就是新的。
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((res) => {
          if (res && res.ok && res.type === 'basic') {
            const copy = res.clone();
            caches.open(VERSION).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => caches.match(req, { ignoreSearch: true })
          .then((hit) => hit || caches.match('index.html')))
    );
    return;
  }

  // 其余静态文件：先用缓存，同时在后台换成新的（下次打开就是新版本）
  e.respondWith(
    caches.open(VERSION).then((cache) =>
      cache.match(req, { ignoreSearch: true }).then((hit) => {
        const net = fetch(req)
          .then((res) => {
            if (res && res.ok && res.type === 'basic') cache.put(req, res.clone());
            return res;
          })
          .catch(() => hit || new Response('', { status: 504, statusText: 'offline' }));
        return hit || net;
      })
    )
  );
});
