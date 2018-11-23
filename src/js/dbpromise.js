import idb from 'idb';

//create DB
const dbInit = idb.open('mws-rest-reviews', 1, upgradeDb => {
    //check that it's supported
    if (!window.indexedDB) return console.log(`IndexedDB not supported in this browser`)
    // if supported create store 
    let restaurantStore = upgradeDb.createObjectStore('restaurants', { keyPath: 'id' });
})

const fetchAllRestaurantsFromDb =  async () => {
    let db = await dbInit
    let tx = db.transaction('restaurants');
    let restaurantStore = tx.objectStore('restaurants');
    return restaurantStore.getAll();
}


export default dbPromise = {
    fetchAllRestaurantsFromDb
}