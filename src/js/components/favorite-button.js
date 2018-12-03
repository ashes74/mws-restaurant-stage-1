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
    //TODO: persist offline favorite
    button.setAttribute('aria-pressed', restaurant.is_favorite);
    //handle interaction
    button.onclick = toggleFavorite;
    return button;
}

async function toggleFavorite() {
    console.log(this)
    const restaurant_id = this.dataset.id;
    const new_is_favorite = !(this.getAttribute('aria-pressed') == 'true'); //coerce string bool to real bool
    if (window.SyncManager && navigator.serviceWorker) {
        try {
            // add favoriting to outbox
            await dbPromise.addFavoritesToOutbox({
                restaurant_id,
                is_favorite: new_is_favorite,
                updatedAt: new Date().toISOString()
            })
            const reg = await navigator.serviceWorker.ready;
            await reg.sync.register('sync-favorite')
            // if outboxing successful, update UI 
            console.log('Sync registered!');
            this.setAttribute('aria-pressed', new_is_favorite);
        } catch (error) {
            console.log(error);
        }
    } else {
        // if service worker and background sync not supported just fetch, PUT and update as normal
        const {error} = await DBHelper.putFavorite(restaurant_id, new_is_favorite);
        //update button state if no error 
        return error ? console.log(error) : this.setAttribute('aria-pressed', new_is_favorite);
    }
}