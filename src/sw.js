import dbPromise from './js/dbpromise';
import DBHelper from './js/dbhelper';

const staticCacheName = "mws-rest-reviews-v3"
const urlsToCache = [
    '/',
    '/main.js',
    '/restaurant.js',
    '/css/styles.css',
    '/404.html',
    '/offline.html',
    '/restaurant.html',
    '/img/notfound.jpg',
    '/img/favicon.png',
    '/img/offline.jpg',
    'img/icons/icon-192x192.png',
    'img/icons/icon-512x512.png'
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
            return cacheName.startsWith('mws-rest-reviews-') && cacheName !== staticCacheName;
        }).map(cacheName => caches.delete(cacheName)))
    }).catch(err => console.error(`Error removing redundant caches while activating service worker ${err}`)))
})

self.addEventListener('fetch', async event => {
    const requestUrl = new URL(event.request.url);
    // console.log(`Fetching ${requestUrl}`);
    //if accessing API, default to DB Helper functions
    if (requestUrl.port === '1337' && requestUrl.hostname === 'localhost')
        return //console.log("Leave it to DBHelper");

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
                if (requestUrl.pathname.match(/^\/restaurant*.html\/*/)) {
                    //for restaurant pages return restaurant skeleton
                    return caches.match('/restaurant.html')
                }
                const cache = await caches.open(staticCacheName)
                cache.put(request, networkResponse.clone());
            }
        }
        return networkResponse || caches.match('/offline.html');
    } catch (err) {
        // console.error(`Error fetching from network,`, request, err);
        return new Response(`Error fetching from network, `, err);
    // return caches.match('/offline.html')
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