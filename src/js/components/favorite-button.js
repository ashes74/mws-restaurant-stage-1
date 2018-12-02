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

// `
// <button class='fav' 
// data-id=${restaurant.id} 
// aria-label="Mark ${restaurant.name} as favorite" 
// aria-pressed=${restaurant.is_favorite}
// onclick = ${toggleFavorite}
// >★</button>
// `
}

// Not quite working yet 
async function getOfflineFavorite(button, restaurant) {
    try {
        const offlineFave = await dbPromise.getFavoritesFromOutbox(restaurant.id)
        if (offlineFave) button.setAttribute('aria-pressed', offlineFave.is_favorite);
    } catch (error) {
        console.log(error)
        throw Error(error)
    }
}

async function toggleFavorite() {
    console.log(this)
    const restaurant_id = this.dataset.id;
    const curr_is_favorite = (this.getAttribute('aria-pressed') == 'true'); //coerce string bool to real bool
    const new_is_favorite = !curr_is_favorite

    if (window.SyncManager && navigator.serviceWorker) {
        try {
            // add favoriting to outbox
            await dbPromise.addFavoritesToOutbox({
                restaurant_id,
                is_favorite: new_is_favorite,
                updatedAt: new Date().toISOString()
            })
            console.log('Checking for serviceworker')
            // Wait for the scoped service worker registration to get a
            // service worker with an active state
            const reg = await navigator.serviceWorker.ready;

            console.log('registering sync tag', reg)
            await reg.sync.register('sync-favorite')
            // if outboxing successful, update UI 
            console.log('Sync registered!');
            this.setAttribute('aria-pressed', new_is_favorite);
        } catch (error) {
            console.log('Sync registration failed :(');
            console.log(error);
        }
    } else {
        // if service worker and background sync not supported just fetch, PUT and update as normal
        const {error} = await DBHelper.putFavorite(restaurant_id, new_is_favorite);
        //update button state if no error 
        return error ? console.log(error) : this.setAttribute('aria-pressed', new_is_favorite);
    }
}