const CACHE = 'my-keep-v9';

self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const url = e.request.url;
  
  // Не перехватываем Firebase и внешние запросы
  if (
    url.includes('firestore.googleapis.com') ||
    url.includes('firebase') ||
    url.includes('googleapis.com') ||
    !url.startsWith(self.location.origin)
  ) {
    return;
  }

  // Только свои файлы кешируем
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});
