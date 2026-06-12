const CACHE_NAME = 'kharcha-cache-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
  '/icon-192.png',
  '/icon-512.png'
];

// Install Event
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('SW: Pre-caching static assets');
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate Event
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('SW: Removing old cache', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event (Network-first fallback to cache)
self.addEventListener('fetch', (e) => {
  // Only intercept HTTP/HTTPS (bypass chrome-extension://, etc.)
  if (!e.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        // Cache new successful requests
        const clone = res.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(e.request, clone);
        });
        return res;
      })
      .catch(() => {
        // Fallback to cache if network is down
        return caches.match(e.request);
      })
  );
});
