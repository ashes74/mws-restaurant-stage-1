import idb from 'idb';

//create DB
const dbInit = idb.open('mws-rest-reviews', 1, upgradeDb => {
    //check that it's supported
    if (!window.indexedDB) 
        return console.log(`IndexedDB not supported in this browser`)
        // if supported create store
    upgradeDb.createObjectStore('restaurants', {keyPath: 'id'});
})

const fetchAllRestaurantsFromDb = async() => {
    let db = await dbInit
    let tx = db.transaction('restaurants');
    let restaurantStore = tx.objectStore('restaurants');
    return restaurantStore.getAll();
}

const putRestaurant = async(restaurantFromNetwork) => {
    try {
        let db = await dbInit;
        let tx = db.transaction('restaurants', 'readwrite');
        let restaurantStore = tx.objectStore('restaurants')
        const idbRestaurant = await restaurantStore.get(restaurantFromNetwork.id)
        //TODO: check restaurantFromNetwork.updatedAt to see if newer that idbRestaurant
        if (!idbRestaurant) {
            restaurantStore.add(restaurantFromNetwork)
        }
        await tx.complete;
        console.log('successful addition to store', restaurantFromNetwork);

    } catch (error) {
        console.error('Error adding restaurant to store');
    }
}

const putRestaurants = async restaurants => {
    return Promise.all(restaurants.map(putRestaurant))

}
const dbPromise = {
    fetchAllRestaurantsFromDb,
    putRestaurants

}

export default dbPromise;