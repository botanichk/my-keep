const CACHE = 'my-keep-v4';

const ASSETS = [
  '/my-keep/',
  '/my-keep/index.html',
  '/my-keep/manifest.json',
  '/my-keep/icon-192.png',
  '/my-keep/icon-512.png',
  '/my-keep/apple-touch-icon.png',
];

// Установка — кешируем основные файлы
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Активация — удаляем старый кеш
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — сначала сеть, потом кеш
self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});
