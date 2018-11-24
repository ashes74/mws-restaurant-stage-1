const staticCacheName = "mws-rest-reviews-v2"
const urlsToCache = [
    '/',
    '/js/main.js',
    '/js/restaurant.js',
    '/css/styles.css',
    '/404.html',
    '/offline.html',
    '/img/notfound.jpg',
    'https://fonts.gstatic.com/s/roboto/v18/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2',
    'https://fonts.gstatic.com/s/roboto/v18/KFOlCnqEu92Fr1MmEU9fBBc4AMP6lQ.woff2',
    '/img/favicon.png',
    '/img/offline.jpg'
]

self.addEventListener('install', event => {
    console.log('Service worker installing...');
    // console.log('Attempting to install service worker and cache static assets ');
    event.waitUntil(
        caches.open(staticCacheName)
        .then(cache => cache.addAll(urlsToCache))
        .catch(err => {console.error(`Cache open failure: ${err}`)})
    )
})

self.addEventListener('activate', event => {  
    console.log('Service worker activating...');
    event.waitUntil(
        caches.keys()
        .then(cacheNames => {
            console.log('Removing all redundant caches');          
        return Promise.all(
            cacheNames
            .filter(cacheName => {
                return cacheName.startsWith('mws-rest-reviews-') && cacheName !== staticCacheName;
            })
            .map(cacheName => caches.delete(cacheName))
        )       
    }).catch(err => console.error(`Error activating service worker ${err}`)))
})

self.addEventListener('fetch', event => {
    // console.log('Fetch event for ', event.request.url);
    event.respondWith(
        caches.open(staticCacheName)
        .then(async cache=>{
            // console.log(`Looking for a cached match for`, event.request);           
            try {
                const cachedResponse = await cache.match(event.request.url);
                // cachedResponse&& console.log(`cached response:`, cachedResponse);
                
                return cachedResponse || fetchFromNetwork(event.request);
            }
            catch (error) {
                // Fetch from network didn 't work, unable to access network send offline page
                console.error(`Fetch failed`, error);
                return caches.match('/offline.html');
            }
    }, err =>{
        console.error(`Cache open failure:`, err)
        new Response(`Cache open failure: `, err)
    }))
})

 // No match found in cache => fetch page via network request
async function fetchFromNetwork(request){
    // console.log('Fetching from the network');
    
    try{
        const networkResponse = await fetch(request);
        // console.log('Network response is:' , {response: networkResponse.clone()})
        // No match found on network => page does not exist return 404
        const cache = await caches.open(staticCacheName)
        if (networkResponse.status === 404) {
            return cache.match('/404.html');
        }
        if(request.method==='GET') cache.put(request, networkResponse.clone());
        return networkResponse;
    }catch(err){
        console.error(`Error fetching from network,`, request, err);
        // return new Response(`Error fetching from network, `, err);
        const cache = await caches.open(staticCacheName)
        return cache.match('/offline.html')
    }
}