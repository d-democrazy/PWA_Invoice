// service-worker.js

// The files to cache for offline use
const CACHE_NAME = 'ym-invoice-cache-v1';
const CACHE_FILES = [
    'index.html',
    'YM_Invoice.css',
    'YM_Invoice.js',
    'icons/icon-192.png',
    'icons/icon-512.png'
    // Add more files as needed (fonts, images, etc.)
];

// Install event: cache everything on first load
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(CACHE_FILES);
        })
    );
});

// Activate event: cleanup old caches if needed
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(name => {
                    if (name !== CACHE_NAME) {
                        return caches.delete(name);
                    }
                })
            );
        })
    );
});

// Fetch event: serve cached content when offline
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            // Return response from cache if found, else fetch from network
            return response || fetch(event.request);
        })
    );
});
