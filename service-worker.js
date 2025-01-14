// service-worker.js

// The files to cache for offline use
const CACHE_NAME = 'ym-invoice-cache-v2'; // Update cache name to force clients to fetch new files
const CACHE_FILES = [
    'index.html',
    'YM_Invoice.css',
    'YM_Invoice.js',
    'icons/icon-192.png',
    'icons/icon-512.png'
    // Add more files as needed
];

// Install event: cache all files and take control immediately
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(CACHE_FILES);
        }).then(() => self.skipWaiting()) // Force this service worker to activate immediately
    );
});

// Activate event: delete old caches and take control of clients
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName); // Remove old cache
                    }
                })
            );
        }).then(() => self.clients.claim()) // Take control of uncontrolled clients
    );
});

// Fetch event: serve cached content when offline, fetch from network otherwise
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});
