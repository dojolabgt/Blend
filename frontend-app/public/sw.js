const CACHE_NAME = 'hikrew-v1';

const PRECACHE_ASSETS = [
    '/HiKrewLogo.png',
];

// Install: precache static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_ASSETS))
    );
    self.skipWaiting();
});

// Activate: remove old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
            )
        )
    );
    self.clients.claim();
});

// Fetch: network-first, fall back to cache
self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;

    const url = new URL(event.request.url);

    // Skip cross-origin requests and API calls
    if (url.origin !== location.origin) return;
    if (url.pathname.startsWith('/api/')) return;

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Cache successful navigation responses and static assets
                if (
                    response.ok &&
                    (event.request.mode === 'navigate' ||
                        url.pathname.match(/\.(png|jpg|jpeg|svg|ico|woff2|woff)$/))
                ) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
                }
                return response;
            })
            .catch(() => {
                // Offline fallback
                return caches.match(event.request).then((cached) => {
                    if (cached) return cached;
                    // For navigation, return cached dashboard
                    if (event.request.mode === 'navigate') {
                        return caches.match('/dashboard');
                    }
                });
            })
    );
});
