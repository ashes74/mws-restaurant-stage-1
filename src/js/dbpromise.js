import idb from 'idb';

//create DB
const dbInit = idb.open('restaurant-reviews', 2, upgradeDb => {
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
    }
})

//// RESTAURANTS ///
const fetchRestaurantsFromDb = async(id) => {
    let db = await dbInit
    if (!db)
        return console.log('no db exists');

    let tx = db.transaction('restaurants');
    let restaurantStore = tx.objectStore('restaurants');
    return await id
        ? restaurantStore.get(Number(id))
        : restaurantStore.getAll();
}

const putRestaurant = async(restaurantFromNetwork) => {
    try {
        let db = await dbInit;
        let tx = db.transaction('restaurants', 'readwrite');
        let restaurantStore = tx.objectStore('restaurants')
        const idbRestaurant = await restaurantStore.get(Number(restaurantFromNetwork.id))
        //TODO: check restaurantFromNetwork.updatedAt to see if newer that idbRestaurant
        if (!idbRestaurant) {
            restaurantStore.add(restaurantFromNetwork)
        }
        await tx.complete;
    } catch (error) {
        console.error('Error adding restaurant to store');
    }
}

const putRestaurants = async restaurants => {
    return Promise.all(restaurants.map(putRestaurant))
}

//// REVIEWS ////

const fetchReviewsByRestaurantId = async restaurant_id => {
    let db = await dbInit
    if (!db)
        return console.log('no db exists');

    let tx = db.transaction('reviews');
    let reviewStore = tx.objectStore('reviews');
    let restaurantIndex = reviewStore.index('restaurant_id')
    return await restaurant_id
        ? restaurantIndex.get(Number(restaurant_id))
        : restaurantIndex.getAll();
}

/**
 * Save review or array of reviews to database
 */
const putReviews = async (reviews) => {
    if (!reviews.push)
        reviews = [reviews]; //if not array, make array
    const db = await dbInit;
    const reviewStore = db.transaction('reviews', 'readwrite').objectStore('reviews');
    Promise.all(reviews.map(async networkReview => {
        const idbReview = await reviewStore.get(Number(networkReview.id))
        if (!idbReview || networkReview.updatedAt > idbReview.updatedAt) {
            reviewStore.add(networkReview)
        }
        await reviewStore.complete;
    }))
}

const dbPromise = {
    /*restaurants*/
    fetchRestaurantsFromDb,
    putRestaurants,
    putRestaurant,
    /* reviews */
    fetchReviewsByRestaurantId,
    putReviews,
}

export default dbPromise;