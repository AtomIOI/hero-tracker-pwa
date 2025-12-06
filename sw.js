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
    // CSS files
    '/css/variables.css',
    '/css/base.css',
    '/css/comic-theme.css',
    '/css/home.css',
    '/css/hero-banner.css',
    '/css/abilities.css',
    '/css/scene-tracker.css',
    '/css/settings.css',
    '/css/dice-select.css',
    '/css/dice.css',
    '/css/powers-qualities.css',
    '/css/mobile.css',
    '/css/desktop.css',
    // Core JS files
    '/js/app.js',
    '/js/ability-icons.js',
    '/js/storage.js',
    '/js/pwa.js',
    // Vue Components
    '/js/components/AbilityCard.js',
    '/js/components/AddEditAbilityModal.js',
    '/js/components/IssueModal.js',
    '/js/components/HeroPointsModal.js',
    '/js/components/SceneTrackerModal.js',
    '/js/components/AddEditTraitModal.js',
    '/js/components/PowersQualitiesPage.js',
    '/js/components/DicePage.js',
    '/js/components/DiceSelect.js',
    // Assets
    '/manifest.json',
    '/assets/icons/Hero_Tracker_Icon.png',
    '/assets/default-profile.jpg',
    '/assets/locked-stamp.png',
    '/assets/dice/D4.png',
    '/assets/dice/D6.png',
    '/assets/dice/D8.png',
    '/assets/dice/D10.png',
    '/assets/dice/D12.png',
    '/assets/dice/unknown.svg',
    // External dependencies
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
