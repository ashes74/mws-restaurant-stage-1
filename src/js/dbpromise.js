import idb from 'idb';

//create DB
const dbInit = idb.open('restaurant-reviews', 4, upgradeDb => {
    //check that it's supported
    if (!window.indexedDB)
        return console.log(`IndexedDB not supported in this browser`)
    // if supported create store
    switch (upgradeDb.oldVersion) {
        case 0:
            upgradeDb.createObjectStore('restaurants', {
                keyPath: 'id'
            });
        case 1:
            upgradeDb.createObjectStore('reviews', {
                keyPath: 'id'
            }).createIndex('restaurant_id', 'restaurant_id');
        case 2:
            // Each favorite is for a single restaurant that is unique from other restaurants by id
            upgradeDb.createObjectStore('offline-favorites', {
                keyPath: 'restaurant_id'
            })
        case 3:
            const offlineReviewStore = upgradeDb.createObjectStore('offline-reviews', {
                autoIncrement: true
            })
            offlineReviewStore.createIndex('restaurant_id', 'restaurant_id', {
                unique: false
            })
    }
})

//// RESTAURANTS ///
const fetchRestaurantsFromDb = async(id) => {
    try {
        let db = await dbInit
        if (!db)
            return console.log('no db exists');

        let tx = db.transaction('restaurants');
        let restaurantStore = tx.objectStore('restaurants');
        return await id
            ? restaurantStore.get(Number(id))
            : restaurantStore.getAll();

    } catch (error) {
        console.error(error);

    }
}

const putRestaurant = async(networkRestaurant, forceUpdate = false) => {
    try {
        let db = await dbInit;
        let tx = db.transaction('restaurants', 'readwrite');
        let restaurantStore = tx.objectStore('restaurants')
        const idbRestaurant = await restaurantStore.get(Number(networkRestaurant.id))
        // if forced update or restaurante doesnt yet exist in db or it's newer put in db
        if (forceUpdate || !idbRestaurant || new Date(networkRestaurant.updatedAt) > new Date(idbRestaurant.updatedAt)) {
            // console.log(`Putting ${networkRestaurant} in db. Forced:${forceUpdate}`)
            restaurantStore.put(networkRestaurant)
        }
        await tx.complete;
    } catch (error) {
        console.error('Error adding restaurant to store', error);
    }
}

const putRestaurants = async restaurants => {
    return Promise.all(restaurants.map(putRestaurant))
}

//// REVIEWS ////

const fetchReviewsByRestaurantId = async restaurant_id => {
    try {
        let db = await dbInit
        if (!db)
            return console.log('no db exists');

        let tx = db.transaction('reviews');
        let reviewStore = tx.objectStore('reviews');
        let restaurantIndex = reviewStore.index('restaurant_id')
        return await restaurantIndex.getAll(Number(restaurant_id));

    } catch (error) {
        console.error(error);

    }
}

/**
 * Save review or array of reviews to database
 * @param {object} reviews to be cached locally
 */
const putReviews = async (reviews) => {
    console.log('Caching reviews', reviews)
    if (!reviews.push)
        reviews = [reviews]; //if not array, make array
    const db = await dbInit;
    const reviewStore = db.transaction('reviews', 'readwrite').objectStore('reviews');
    Promise.all(reviews.map(async networkReview => {
        const idbReview = await reviewStore.get(Number(networkReview.id))
        if (!idbReview || new Date(networkReview.updatedAt) > new Date(idbReview.updatedAt)) {
            reviewStore.add(networkReview)
        }
        await reviewStore.complete;
    }))
        .catch(err => console.error('error!', err))
}

/**
 * Get all reviews from offline store
 */
const getReviewsFromOutbox = async(restaurant_id) => {
    console.log('Getting reviews from outbox')
    try {
        const db = await dbInit;
        const offlineReviewStore = db.transaction('offline-reviews').objectStore('offline-reviews')
        return await offlineReviewStore.index('restaurant_id').getAll(Number(restaurant_id));
    } catch (err) {
        console.error(err)
    }
}

/**
 * Add offline review to cache
 */
const addReviewsToOutbox = async(review) => {
    try {
        const db = await dbInit;
        const offlineReviewStore = db.transaction('offline-reviews', 'readwrite').objectStore('offline-reviews');
        // right now, a user can only insert on review at a time and cannot edit, so always additive 
        await offlineReviewStore.add(review)
        console.log('Queuing complete');
        return await offlineReviewStore.complete;

    } catch (error) {
        console.error(error);

    }
}

/**
 * Remove offline review 
 * @param review to remove
 */
const removeReviewsFromOutbox = async(review) => {
    try {
        console.log('Removing reviews from outbox', review)
        const db = await dbInit;
        const offlineReviewStore = db.transaction('offline-reviews', 'readwrite').objectStore('offline-reviews')
        await offlineReviewStore.delete(review.id);
        return await offlineReviewStore;

    } catch (error) {
        console.error(error);

    }
}


//// FAVORITES ////
/**
 * Adds favoriting action to queue for background syncing 
 * @param {object} favoriteObj 
 * @param {Number} favoriteObj.restaurant_id id of restaurant
 * @param {boolean} favoriteObj.is_favorite 
 */
const addFavoritesToOutbox = async(favoriteObj) => {
    try {
        console.log('Queuing up favorites for background sync');

        const db = await dbInit;
        const offlineFavStore = db.transaction('offline-favorites', 'readwrite').objectStore('offline-favorites');
        await offlineFavStore.put(favoriteObj);
        console.log('Queuing complete')
        return await offlineFavStore.complete;

    } catch (error) {
        console.error(error);

    }
}

const getFavoritesFromOutbox = async(restaurant_id) => {
    try {
        console.log(`Retrieving favorites from outbox`)
        const db = await dbInit;
        const offlineFavStore = db.transaction('offline-favorites').objectStore('offline-favorites');
        if (restaurant_id) return offlineFavStore.get(Number(restaurant_id))
        return offlineFavStore.getAll();

    } catch (error) {
        console.error(error);

    }
}

const removeFavoritesFromOutbox = async(restaurant_id) => {
    try {
        const db = await dbInit;
        const offlineFavStore = db.transaction('offline-favorites', 'readwrite').objectStore('offline-favorites');
        await offlineFavStore.delete(restaurant_id);
        return await offlineFavStore.complete;

    } catch (error) {
        console.error(error);

    }
}

const dbPromise = {
    /*restaurants*/
    fetchRestaurantsFromDb,
    putRestaurants,
    putRestaurant,
    /* reviews */
    fetchReviewsByRestaurantId,
    putReviews,
    getReviewsFromOutbox,
    addReviewsToOutbox,
    removeReviewsFromOutbox,
    /* favorites */
    addFavoritesToOutbox,
    getFavoritesFromOutbox,
    removeFavoritesFromOutbox
}

export default dbPromise;