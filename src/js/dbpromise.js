import store from './store';

//// RESTAURANTS ///
const fetchRestaurantsFromDb = async(id) => {
    try {
        const restaurants = await store.restaurants('readonly')
        console.log({
            restaurants
        });

        return await id
            ? restaurants.get(Number(id))
            : restaurants.getAll();
    } catch (error) {
        console.error(error);
    }
}

const putRestaurant = async(networkRestaurant, forceUpdate = false) => {
    try {
        const restaurants = await store.restaurants('readwrite');
        const idbRestaurant = await restaurants.get(Number(networkRestaurant.id))

        if (forceUpdate || !idbRestaurant || new Date(networkRestaurant.updatedAt) > new Date(idbRestaurant.updatedAt)) {
            restaurants.put(networkRestaurant)
        }
        await restaurants.complete;
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
        const reviews = await store.reviews()
        let restaurantIndex = reviews.index('restaurant_id')
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
    const reviewStore = await store.reviews('readwrite')
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
        const offlineReviewStore = await store.offlineReviews()
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
        const offlineReviewStore = await store.offlineReviews('readwrite');
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
        const offlineReviewStore = await store.offlineReviews('readwrite')
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

        const offlineFavStore = await store.offlineFavorites('readwrite')
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
        const offlineFavStore = await store.offlineFavorites()
        if (restaurant_id) return offlineFavStore.get(Number(restaurant_id))
        return offlineFavStore.getAll();

    } catch (error) {
        console.error(error);

    }
}

const removeFavoritesFromOutbox = async(restaurant_id) => {
    try {
        const offlineFavStore = await store.offlineFavorites('readwrite')
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