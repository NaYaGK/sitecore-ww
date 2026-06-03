// Service Worker for Offline caching and push notifications
const CACHE_NAME = 'devops90-v4';
const OFFLINE_ASSETS = ['/', '/index.html'];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(OFFLINE_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE_NAME; }).map(function(k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  // Let the browser handle standard requests; fallback to cache for HTML
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      return cached || fetch(e.request).catch(function() {
        return caches.match('/index.html');
      });
    })
  );
});

self.addEventListener('push', function(e) {
  let data = { title: 'DevOps Review Due', body: 'You have spaced repetition tasks due today!' };
  try {
    if (e.data) {
      data = e.data.json();
    }
  } catch (_) {}

  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icon.png',
      badge: '/icon.png',
      tag: 'devops-review',
      requireInteraction: false,
      actions: [{ action: 'open', title: 'Review Now' }]
    })
  );
});

self.addEventListener('notificationclick', function(e) {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window' }).then(function(cls) {
      if (cls.length) {
        return cls[0].focus();
      }
      return clients.openWindow('/');
    })
  );
});
