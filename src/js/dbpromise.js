import idb from 'idb';

let dbPromise = idb.open('mws-rest-reviews', 1, upgradeDb =>{
    if(!window.indexedDB) return console.log(`IndexedDB not supported in this browser`)
    let restaurantStore = upgradeDb.createObjectStore('restaurants',{keyPath: 'id'});
    restaurantStore.createIndex('id', 'id')
})

export  const fetchAllRestaurantsFromDb = async ()=>{
    let db = await dbPromise
    let tx =db.transaction('restaurants');
    let restaurantStore = tx.objectStore('restaurants');
    let idIdx = restaurantStore.index('id');
    return idIdx.getAll();
}
