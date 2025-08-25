const cacheName = 'aquaculture-monitor-cache-v1';
const assetsToCache = [
  '/',
  '/index.html',
  '/homepage.css',
  '/homepage.js',
  '/daily.html',
  '/daily.css',
  '/daily.js',
  '/signup.html',
  '/signup.js',
  '/monthly.html',
  '/monthly.css',
  '/monthly.js',
  '/dashboard.html',
  '/dashboard.css',
  '/dashboard.js',
  '/alarm.mp3'
];

// Install service worker and cache files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(cacheName).then(cache => cache.addAll(assetsToCache))
  );
});

// Fetch from cache first
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(res => res || fetch(event.request))
  );
});
