const staticCacheName = "mws-rest-reviews-v2"
const urlsToCache = [
    '/',
    '/js/main.js',
    '/js/restaurant_info.js',
    '/js/dbhelper.js',
    '/css/styles.css',
    '/css/mobile.css',
    '/css/under800.css',
    '/404.html',
    '/offline.html',
    '/img/notfound.jpg',
    'https://fonts.gstatic.com/s/roboto/v18/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2',
    'https://fonts.gstatic.com/s/roboto/v18/KFOlCnqEu92Fr1MmEU9fBBc4AMP6lQ.woff2',
    '/favicon.png'
]

self.addEventListener('install', event => {
    // console.log('Attempting to install service worker and cache static assets ');
    event.waitUntil(caches.open(staticCacheName).then(async cache => {
        try {
            return cache.addAll(urlsToCache);
        } catch (err) {
            console.error("Cache open failure", err);
        }
    }))
})

self.addEventListener('activate', event => {
    // console.log(`Activating service worker`);
    event.waitUntil(caches.keys().then(cacheNames => {
        return Promise.all(cacheNames.filter(cacheName => {
            return cacheName.startsWith('mws-rest-reviews-') && cacheName != staticCacheName;
        }).map(cacheName => caches.delete(cacheName)))
    }).catch(err => console.error("Error activating service worker", err)))
})

self.addEventListener('fetch', event => {
    // console.log('Fetch event for ', event.request.url);
    event.respondWith(caches.match(event.request).then(cachedResponse => {
        // Find and return cached version of the page
        if (cachedResponse) {
            return cachedResponse;
        }
        // No match found in cache => fetch page via network request
        return fetch(event.request, {
            method: 'GET',
            mode: 'cors'
        }).then(async response => {
            // No match found on network => page does not exist return 404
            if (response.status === 404) {
                return caches.match('/404.html');
            }
            const cache = await caches.open(staticCacheName);
            cache.put(event.request.url, response.clone());
            return response;
        }).catch(error => {
            // Fetch from network didn 't work, unable to access network send offline page
            return caches.match('/offline.html');
        })
    }))
})
