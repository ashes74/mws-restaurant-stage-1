const staticCacheName = "mws-rest-reviews-v2"
const urlsToCache = [
    '/',
    '/js/main.js',
    '/js/restaurant.js',
    '/css/styles.css',
    '/404.html',
    '/offline.html',
    '/restaurant.html',
    '/img/notfound.jpg',
    '/img/favicon.png',
    '/img/offline.jpg'
]

self.addEventListener('install', event => {
    // Precache files on install of the service worker
    event.waitUntil(caches.open(staticCacheName).then(cache => cache.addAll(urlsToCache)).catch(err => {
        console.error(`Cache open failure: ${err}`)
    }))
})

self.addEventListener('activate', event => {
    // On activation, remove redundant caches to conserve on space
    event.waitUntil(caches.keys().then(cacheNames => {
        return Promise.all(cacheNames.filter(cacheName => {
            return cacheName.startsWith('mws-rest-reviews-') && cacheName !== staticCacheName;
        }).map(cacheName => caches.delete(cacheName)))
    }).catch(err => console.error(`Error removing redundant caches while activating service worker ${err}`)))
})

self.addEventListener('fetch', event => {

    const requestUrl = new URL(event.request.url);
    console.log(`Fetching ${requestUrl}`);

    event.respondWith(caches.open(staticCacheName).then(async cache => {
        if (requestUrl.pathname.match(/^\/restaurant.html*/)) {
            return cache.match('/restaurant.html')
        }
        try {
            const cachedResponse = await cache.match(event.request.url);
            return cachedResponse || await fetchFromNetwork(event.request);
        } catch (error) {
            console.error(`Cache miss:`, error);
            return fetchFromNetwork(event.request);
        }
    }, err => {
        console.error(`Cache open failure:`, err)
        new Response(`Cache open failure: `, err)
    }))
})

// No match found in cache => fetch page via network request
async function fetchFromNetwork(request) {
    console.log(`SW: Fetching from network ${request.url}`);

    try {
        const networkResponse = await fetch(request);
        // No match found on network => page does not exist return 404
        const cache = await caches.open(staticCacheName)
        if (networkResponse.status === 404) {
            return cache.match('/404.html');
        }
        if (request.method === 'GET' && networkResponse.ok) 
            cache.put(request, networkResponse.clone());
        return networkResponse || cache.match('/offline.html');
    } catch (err) {
        console.error(`Error fetching from network,`, request, err);
        // return new Response(`Error fetching from network, `, err);
        const cache = await caches.open(staticCacheName)
        return cache.match('/offline.html')
    }
}