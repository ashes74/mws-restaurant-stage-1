import dbPromise from './dbpromise.js';

/**
 * Common database helper functions.
 */
export default class DBHelper {

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get API_URL() {
    const port = 1337 // Change this to your server port
    return `http://localhost:${port}/restaurants`;
  }

  /**
   * Return cached messages
   */
  static async getCachedRestaurants(id) {
    try {
      return await dbPromise.fetchRestaurantsFromDb(id);
    } catch (err) {
      return new Error(`Error getting restaurant from database ${err}`)
    }
  }

  // /**
  //  * Caches array of restaurants from network
  //  * @param {array} restaurant  */ static async cacheRestaurants(restaurant) {
  // dbPromise.putRestaurants(restaurant) }

  /**
   * Fetch all restaurants.
   */
  static async fetchRestaurants() {
    try {
      if (navigator.onLine) {
        const response = await fetch(DBHelper.API_URL, {
          method: 'GET',
          mode: 'cors'
        })
        // if everything is ok, cache new data, then return network response
        if (response.ok) {
          console.log('Network response from dbhelper')
          dbPromise.putRestaurants(await response.clone().json())
          return response.json();
        }
      }
      console.log('Cached response from dbhelper')

      // if network response is not ok, return cached data
      const cachedRestaurants = await this.getCachedRestaurants();
      return cachedRestaurants;
    } catch (err) {
      console.error(`DB Request failed. Returned status of ${err.status}. ${err}`);
      //If error fetching from network return offline stored option
      return this.getCachedRestaurants() || fetch('/offline.html');
    }
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static async fetchRestaurantById(id, callback) {
    try {
      if (navigator.onLine) {
        const response = await fetch(`${DBHelper.API_URL}/${id}`, {
          method: 'GET',
          mode: 'cors'
        })
        if (response.ok) {
          dbPromise.putRestaurant(await response.clone().json())
          console.log('Network response from dbhelper')
          return callback(null, await response.json());
        }
      }
      console.log('Cached response from dbhelper')

      const cachedRestaurant = await this.getCachedRestaurants(id);
      return callback(null, cachedRestaurant);
    } catch (err) {
      console.error(`DB Caught: Restaurant with ${id} does not exist. ${err}`);
      //If error fetching from network return offline stored option
      const response = this.getCachedRestaurants(id) || fetch('/offline.html');
      return callback(null, await response);
    }
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static async fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    try {
      const restaurants = await DBHelper.fetchRestaurants()
      // Filter restaurants to have only given cuisine type
      const results = restaurants.filter(r => r.cuisine_type == cuisine);
      callback(null, results);
    } catch (err) {
      console.error(`Error fetching restaurants with ${cuisine}. ${err}`);
    }
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static async fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    try {
      const restaurants = await DBHelper.fetchRestaurants()
      // Filter restaurants to have only given neighborhood
      const results = restaurants.filter(r => r.neighborhood == neighborhood);
      callback(null, results);
    } catch (err) {
      console.error(`Error fetching restaurants with ${neighborhood}. ${err}`);
    }
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static async fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    try {
      const restaurants = await DBHelper.fetchRestaurants()
      let results = restaurants
      if (cuisine != 'all') { // filter by cuisine
        results = results.filter(r => r.cuisine_type == cuisine);
      }
      if (neighborhood != 'all') { // filter by neighborhood
        results = results.filter(r => r.neighborhood == neighborhood);
      }
      callback(null, results);
    } catch (err) {
      console.error(`Error fetching restaurants with ${cuisine} and ${neighborhood}. ${err}`);
    }
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static async fetchNeighborhoods(callback) {
    // Fetch all restaurants
    try {
      const restaurants = await DBHelper.fetchRestaurants()
      // Get all neighborhoods from all restaurants
      const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
      // Remove duplicates from neighborhoods
      // TODO: convert to Set
      const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
      callback(null, uniqueNeighborhoods);
    } catch (err) {
      console.error(`Error fetching neighborhoods. ${err}`);
    }
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static async fetchCuisines(callback) {
    // Fetch all restaurants
    try {
      const restaurants = await DBHelper.fetchRestaurants()
      // Get all cuisines from all restaurants
      const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
      // Remove duplicates from cuisines
      //TODO: convert to Set
      const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
      callback(null, uniqueCuisines);
    } catch (err) {
      console.error(`Error fetching cuisines. ${err}`);
    }
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant({
    photograph = 'notfound'
  }) {
    return (`/img/${photograph}.jpg`);
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    // https://leafletjs.com/reference-1.3.0.html#marker
    const marker = new L.marker([
      restaurant.latlng.lat, restaurant.latlng.lng
    ], {
      title: restaurant.name,
      alt: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant)
    })
    marker.addTo(map);
    return marker;
  }
}