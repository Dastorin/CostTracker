const CACHE_NAME = 'cost-tracker-v1';
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './js/main.js',
  './js/firebase.js',
  './js/ui.js',
  './js/state.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});