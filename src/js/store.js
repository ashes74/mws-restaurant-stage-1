// based on Twilio's organization of concerns here: https://www.twilio.com/blog/2017/02/send-messages-when-youre-back-online-with-service-workers-and-background-sync.html

import idb from 'idb';

const store = {
    db: null,

    init: function() {
        if (store.db) return Promise.resolve(store.db);
        //check that it's supported
        if (!window.indexedDB)
            return console.log(`IndexedDB not supported in this browser`);

        return idb.open('restaurant-reviews', 4, upgradeDb => {
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
    },

    /**
     * Object store for restaurants from network 'restaurants'
     * @param {string} mode for idb transaction: 'readonly' or 'readwrite'
     */
    restaurants: function(mode) {
        return store.init().then(db => {
            return db.transaction('restaurants', mode)
                .objectStore('restaurants');
        })
    },

    /**
     *  Object store for reviews from network 'reviews'
     * @param {string} mode for idb transaction: 'readonly' or 'readwrite'
     */
    reviews: function(mode) {
        return store.init().then(db => {
            return db.transaction('reviews', mode)
                .objectStore('reviews');
        })
    },

    /**
     * Object store for favorites from network 'favorites'
     * @param {string} mode for idb transaction: 'readonly' or 'readwrite'
     */
    favorites: function(mode) {
        return store.init().then(db => {
            return db.transaction('favorites', mode)
                .objectStore('favorites');
        })
    },

    /**
      * Object store for reviews from offline 'offline-reviews'
      * @param {string} mode for idb transaction: 'readonly' or 'readwrite'
      */
    offlineReviews: function(mode) {
        return store.init().then(db => {
            return db.transaction('offline-reviews', mode)
                .objectStore('offline-reviews');
        })
    },

    /**
      * Object store for favorites from offline 'offline-favorites'
      * @param {string} mode for idb transaction: 'readonly' or 'readwrite'
      */
    offlineFavorites: function(mode) {
        return store.init().then(db => {
            return db.transaction('offline-favorites', mode)
                .objectStore('offline-favorites');
        })
    },
}

export default store;