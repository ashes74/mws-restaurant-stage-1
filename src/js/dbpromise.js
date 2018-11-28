import idb from 'idb';

//create DB
const dbInit = idb.open('restaurant-reviews', 1, upgradeDb => {
    //check that it's supported
    if (!window.indexedDB) 
        return console.log(`IndexedDB not supported in this browser`)
        // if supported create store
    upgradeDb.createObjectStore('restaurants', {keyPath: 'id'});
})

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
        const idbRestaurant = await restaurantStore.get(restaurantFromNetwork.id)
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
const dbPromise = {
    fetchRestaurantsFromDb,
    putRestaurants,
    putRestaurant

}

export default dbPromise;