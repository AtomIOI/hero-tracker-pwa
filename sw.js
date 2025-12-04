// Service Worker for PWA offline support
/**
 * The name of the cache for the application resources.
 * @type {string}
 */
const CACHE_NAME = 'hero-tracker-v1';

/**
 * List of URLs to cache for offline access.
 * @type {string[]}
 */
const urlsToCache = [
    '/',
    '/index.html',
    '/css/variables.css',
    '/css/base.css',
    '/css/comic-theme.css',
    '/css/hero-banner.css',
    '/css/mobile.css',
    '/css/desktop.css',
    '/js/app.js',
    '/js/storage.js',
    '/js/pwa.js',
    '/manifest.json',
    '/assets/icons/Hero_Tracker_Icon.png',
    'https://unpkg.com/vue@3/dist/vue.global.js',
    'https://fonts.googleapis.com/css2?family=Bangers&family=Comic+Neue:wght@400;700&display=swap'
];

/**
 * Event listener for the 'install' event.
 * Caches the specified resources.
 * @param {ExtendableEvent} event - The install event.
 */
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

/**
 * Event listener for the 'fetch' event.
 * Serves resources from cache if available, otherwise fetches from network.
 * Also caches new requests.
 * @param {FetchEvent} event - The fetch event.
 */
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Cache hit - return response
                if (response) {
                    return response;
                }

                // Clone the request
                const fetchRequest = event.request.clone();

                return fetch(fetchRequest).then((response) => {
                    // Check if valid response
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }

                    // Clone the response
                    const responseToCache = response.clone();

                    caches.open(CACHE_NAME)
                        .then((cache) => {
                            cache.put(event.request, responseToCache);
                        });

                    return response;
                });
            })
    );
});

/**
 * Event listener for the 'activate' event.
 * Cleans up old caches that are not in the whitelist.
 * @param {ExtendableEvent} event - The activate event.
 */
self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];

    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (!cacheWhitelist.includes(cacheName)) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
