import DBHelper from "../dbhelper";
import dbPromise from "../dbpromise";

export default function reviewForm(restaurantId) {

    const form = document.querySelector('#review-form');
    form.setAttribute('data-restaurant-id', restaurantId);
    form.addEventListener('submit', handleSubmit)
    return
}

const handleSubmit = async (e) => {
    console.log('Submitting form', e);
    e.preventDefault();
    //validate data
    const validReview = getValidFormData();
    if (!validReview) return;

    console.log(validReview);

    //if valid send to outbox and trigger sync 
    if (window.SyncManager && navigator.serviceWorker) {
        console.log('Starting outbox protocol of review', validReview)
        try {
            //add review to outbox 
            await dbPromise.addReviewsToOutbox(validReview)
            //check for ready service worker 
            console.log('Checking for service worker');
            const reg = await navigator.serviceWorker.ready
            //register sync tag 
            console.log('Service worker found, registering sync-review tag', reg)
            await reg.sync.register('sync-review')
            console.log('Sync registered')
            //if sync tag is successful update ui
            addReviewToPage(validReview)
        } catch (error) {
            //if error, update user on status 
            console.error('Error caching offline reviews', error)
        }
    } else {
        //else send  Database and cache 
        const storedReview = await DBHelper.postReview(validReview)
        console.log(storedReview)
        //Add to page
        if (!storedReview.error) {
            addReviewToPage(storedReview)
        }
        else
            document.querySelector('#error').innerText = storedReview.msg
    }
}

function addReviewToPage(review) {
    const reviewItemHtml = createReviewHTML(review);
    document.querySelector('#reviews-list').appendChild(reviewItemHtml);
    //clear form 
    clearForm()
}

/**
 * Clear form 
 */
function clearForm() {
    console.log('Clearing form');
    const form = document.querySelector('#review-form');
    form.reset();
    form.elements.rating.value = '--'; //because select does not automatically get reset
}


/**
 * Validates form and 
 * @returns {object} valid review object
 */
function getValidFormData() {
    console.log('Validating form');
    const form = document.querySelector('#review-form');
    const error = document.querySelector('#error');
    //get form elements 
    const {name, rating, comments} = form.elements;
    //reject empty rating, other invalid entries handled by browser
    if (!Number(rating.value)) {
        rating.invalid = true;
        rating.focus();
        error.innerText = "Please add a rating"
        return
    }

    error.innerText = ''
    // create valid data object
    const validData = {
        name: name.value,
        rating: Number(rating.value),
        comments: comments.value,
        restaurant_id: Number(form.dataset.restaurantId),
        createdAt: new Date().toISOString()
    }

    return validData
}

/** From the original restaurant_info code 
 * Create review HTML and add it to the webpage.
 */
const createReviewHTML = (review) => {
    const li = document.createElement('li');
    const name = document.createElement('p');
    name.innerHTML = review.name;
    li.appendChild(name);

    const dateOptions = {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    };
    const date = document.createElement('p');
    date.innerHTML = new Date(review.createdAt).toLocaleDateString('en-US', dateOptions);
    li.appendChild(date);

    const rating = document.createElement('p');
    rating.innerHTML = `Rating: ${review.rating}`;
    li.appendChild(rating);

    const comments = document.createElement('p');
    comments.innerHTML = review.comments;
    li.appendChild(comments);

    return li;
}