import DBHelper from "../dbhelper";
import dbPromise from "../dbpromise";

export default function favButton(restaurant) {
    //create button 
    const button = document.createElement('button');
    //give it data 
    button.className = "fav";
    button.dataset.id = restaurant.id; //store restaurant id in dataset for identification in grid
    button.innerHTML = '&#x2605'
    // handle accesibility 
    button.setAttribute('aria-label', `Mark ${restaurant.name} as favorite`);
    button.setAttribute('aria-pressed', restaurant.is_favorite);
    //handle interaction
    button.onclick = toggleFavorite;
    return button;
}

async function toggleFavorite() {
    console.log(this)
    const restaurantId = this.dataset.id;
    const fav = this.getAttribute('aria-pressed') == 'true'; //coerce string bool to real bool
    const url = `${DBHelper.RESTAURANT_API_URL}/${restaurantId}/?is_favorite=${!fav}`
    try {
        const response = await fetch(url, {
            method: 'PUT'
        });
        if (response.ok) {
            // update restaurant on idb
            dbPromise.putRestaurant(await response.json())
            //update button state
            this.setAttribute('aria-pressed', !fav);
        }
    } catch (error) {
        console.error(`Couldn't mark favorite ${error}`);

    }
}