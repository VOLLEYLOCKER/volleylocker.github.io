var CACHE = 'volleylocker-v3';
var FILES = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "privacy.html",
  "vendor/three.min.js",
  "vendor/GLTFLoader.js",
  "xbot_glb.txt",
  "fonts/fonts.css",
  "fonts/onest-cyrillic-400-normal.woff2",
  "fonts/onest-cyrillic-500-normal.woff2",
  "fonts/onest-cyrillic-600-normal.woff2",
  "fonts/onest-latin-400-normal.woff2",
  "fonts/onest-latin-500-normal.woff2",
  "fonts/onest-latin-600-normal.woff2",
  "fonts/oswald-cyrillic-500-normal.woff2",
  "fonts/oswald-cyrillic-600-normal.woff2",
  "fonts/oswald-latin-500-normal.woff2",
  "fonts/oswald-latin-600-normal.woff2",
  "icons/apple-touch-icon.png",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/icon-maskable-512.png"
];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  var nav = e.request.mode === 'navigate' || /\/(index\.html)?$/.test(new URL(e.request.url).pathname);
  if (nav) {
    // Сторінку беремо з мережі (щоб оновлення доходили одразу), без інтернету — з кешу
    e.respondWith(fetch(e.request).then(function (net) {
      var copy = net.clone(); caches.open(CACHE).then(function (c) { c.put(e.request, copy); }); return net;
    }).catch(function () { return caches.match(e.request).then(function (r) { return r || caches.match('index.html'); }); }));
    return;
  }
  e.respondWith(caches.match(e.request).then(function (r) {
    return r || fetch(e.request).then(function (net) {
      var copy = net.clone();
      caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
      return net;
    });
  }));
});
