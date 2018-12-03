import dbPromise from './js/dbpromise';
import DBHelper from './js/dbhelper';

const version = 'v4'
const staticCacheName = `mws-rest-reviews-${version}`
// const contentImagesCache = `mws-rest-reviews-images-${version}`

const urlsToCache = [
    '/',
    '/main.js',
    '/restaurant.js',
    '/css/styles.css',
    '/404.html',
    '/offline.html',
    '/restaurant.html',
    '/css/favoriteButtonStyles.css',
    '/css/reviewForm.css'
]

self.addEventListener('install', event => {
    console.log('Installing serviceworker')
    // Precache files on install of the service worker
    event.waitUntil(caches.open(staticCacheName).then(cache => cache.addAll(urlsToCache)).catch(err => {
        console.error(`Cache open failure: ${err}`)
    }))
})

self.addEventListener('activate', event => {
    console.log('Activating serviceworker')
    // On activation, remove redundant caches to conserve on space
    event.waitUntil(caches.keys().then(cacheNames => {
        return Promise.all(cacheNames.filter(cacheName => {
            return cacheName.startsWith('mws-rest-reviews-') &&
                cacheName !== staticCacheName
        }).map(cacheName => caches.delete(cacheName)))
    }).catch(err => console.error(`Error removing redundant caches while activating service worker ${err}`)))
})

self.addEventListener('fetch', async event => {
    const requestUrl = new URL(event.request.url);
    // console.log(`Fetching ${requestUrl}`);
    //if accessing API, default to DB Helper functions
    if (requestUrl.port === '1337' && requestUrl.hostname === 'localhost')
        return //console.log("Leave it to DBHelper");

    if (requestUrl.pathname.startsWith('/restaurant.html?id')) {
        //for restaurant pages return restaurant skeleton
        event.respondWith(caches.match('/restaurant.html'));
        return;
    }
    // //handle responsive images 
    if (requestUrl.pathname.startsWith('/img/')) {
        return event.respondWith(serveImages(event.request));
    }

    // for all other requests return cached value or fetch from network
    event.respondWith(caches.match(event.request).then(cachedResponse => {
        return cachedResponse || fetchFromNetwork(event.request);
    }));
});

// No match found in cache => fetch page via network request
async function fetchFromNetwork(request) {
    // console.log(`SW: Fetching from network ${request.url}`);
    try {
        const networkResponse = await fetch(request);
        // No match found on network => page does not exist return 404
        if (networkResponse.status === 404) {
            return caches.match('/404.html');
        }
        if (new URL(request.url).origin === location.origin) {
            if (request.method === 'GET' && networkResponse.ok) {

                console.log('Caching request for', request.url)
                const cache = await caches.open(staticCacheName)
                cache.put(request, networkResponse.clone());
            }
        }
        return networkResponse || caches.match('/offline.html');
    } catch (err) {
        if (new URL(request.url).pathname.startsWith('/browser-sync/'))
            return new Response() //silence polling errors while offline 
        console.error(`Error fetching from network,`, request, err);
        // return new Response(`Error fetching from network, `, err);
        return caches.match('/offline.html')
    }
}

//from Alexandro Perez
async function serveImages(request) {
    try {
        let imageCacheUrl = request.url;

        // Make a new URL with a stripped suffix and extension from the request url
        // i.e. /img/1-medium.jpg  will become  /img/1
        // we'll use this as the KEY for storing image into cache
        imageCacheUrl = imageCacheUrl.replace(/-small\.\w{3}|-medium\.\w{3}|-large\.\w{3}/i, '');

        const cache = await caches.open(staticCacheName)
        const response = await cache.match(imageCacheUrl)
        // if image is in cache, return it, else fetch from network, cache a clone, then return network response
        return response || fetch(request).then(function(networkResponse) {
                cache.put(imageCacheUrl, networkResponse.clone());
                return networkResponse;
            });
    } catch (error) {
        console.error(error)
    }
}


self.addEventListener('sync', async event => {
    console.log('Sync event triggered for ', event.tag)
    if (event.tag == 'sync-favorite') {
        event.waitUntil(
            dbPromise.getFavoritesFromOutbox()
                .then(async favorites => {
                    try {
                        // send all favorites over the network 
                        console.log('Syncing network with idb', favorites)
                        return Promise.all(favorites.map(fav => {
                            return DBHelper.putFavorite(fav.restaurant_id, fav.is_favorite).then(async({response, error}) => {
                                //if get succesful response, remove favorite from outbox
                                if (response) {
                                    console.log(`Syncing ${fav} was successful, removing from idb`)
                                    // remove fav from outbox 
                                    return await dbPromise.removeFavoritesFromOutbox(fav.restaurant_id)
                                }
                                //else leave it in outbox 
                                else console.log('unsuccessful sync', error)
                            })
                        }))
                    } catch (error) {
                        console.log(error)
                    }
                }))
    }

    if (event.tag == 'sync-review') {
        event.waitUntil(
            dbPromise.getReviewsFromOutbox()
                .then(async reviews => {
                    try {
                        if (!reviews.push)
                            reviews = [reviews]
                        console.log('Syncing network with reviews from idb', reviews)
                        //Send over network
                        return await Promise.all(reviews.map(
                                DBHelper.postReview(review)
                                    //Remove from offline store 
                                    .then(dbPromise.removeReviewsFromOutbox)))

                    } catch (error) {
                        console.error('Error syncing reviews', error)
                    }
                })
        )
    }
})