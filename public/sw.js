// Minimal service worker for PWA installability (online-only)
self.addEventListener('fetch', function (event) {
    event.respondWith(fetch(event.request));
});
