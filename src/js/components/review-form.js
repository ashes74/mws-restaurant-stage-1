import DBHelper from "../dbhelper";
import dbPromise from "../dbpromise";

export default function reviewForm(restaurantId) {

    const form = document.createElement('form');
    form.id = "review-form";
    form.dataset.restaurantId = restaurantId;

    const error = document.createElement('p');
    error.id = 'error';
    form.appendChild(error)
    let p = document.createElement('p');
    const name = document.createElement('input');
    name.id = "name"
    name.setAttribute('type', 'text');
    name.setAttribute('aria-label', 'Name');
    name.setAttribute('placeholder', 'Enter Your Name');
    name.setAttribute('required', true)
    p.appendChild(name);
    form.appendChild(p);

    p = document.createElement('p');
    const selectLabel = document.createElement('label');
    selectLabel.setAttribute('for', 'rating');
    selectLabel.innerText = "Rate this restaurant: ";
    p.appendChild(selectLabel);
    const select = document.createElement('select');
    select.id = "rating";
    select.name = "rating";
    select.classList.add('rating');
    ["--", 1, 2, 3, 4, 5].forEach(number => {
        const option = document.createElement('option');
        option.value = number;
        option.innerHTML = number;
        if (number === "--") {
            option.selected = true;
            option.disabled = true;
            option.hidden = true;
        }
        select.appendChild(option);
    });
    select.setAttribute('required', true)
    p.appendChild(select);
    form.appendChild(p);

    p = document.createElement('p');
    const textarea = document.createElement('textarea');
    textarea.id = "comments";
    textarea.setAttribute('aria-label', 'comments');
    textarea.setAttribute('placeholder', 'Enter your truth here');
    textarea.setAttribute('rows', '10');
    textarea.setAttribute('required', true)
    p.appendChild(textarea);
    form.appendChild(p);

    p = document.createElement('p');
    const addButton = document.createElement('button');
    addButton.setAttribute('type', 'submit');
    addButton.setAttribute('aria-label', 'Add Review');
    addButton.classList.add('add-review');
    addButton.innerHTML = "<span>Leave Your Impressions</span>";
    p.appendChild(addButton);
    form.appendChild(p);

    form.onsubmit = handleSubmit;

    return form
}

const handleSubmit = (e) => {
    console.log('Submitting form', e);



    e.preventDefault();
    //validate data
    const validReview = getValidFormData();
    if (!validReview) return;

    console.log(validReview);

    //if valid send to Database and cache 
    sendFormAndCache(validReview)

    //Add to page

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
 * Caches valid form data
 */
async function cacheForm(reviewToCache) {
    console.log({
        reviewToCache
    })
}

/**
 * Sends form to network and caches good responses
 * @param {object} reviewToSend 
 */
async function sendFormAndCache(reviewToSend) {
    const url = DBHelper.REVIEWS_API_URL;
    const requestHeaders = {
        method: 'POST',
        body: JSON.stringify(reviewToSend)
    }

    const dbResponse = await fetch(url, requestHeaders);
    if (!dbResponse.ok) return 'Unable to post review to server'
    console.log({
        dbResponse
    })
    cacheForm(await dbResponse.json())
}

/**
 * Validates form and 
 * @returns {object} valid review object
 */
function getValidFormData() {
    console.log('Validating form');
    const form = document.querySelector('#review-form');
    const error = document.getElementById('error');
    console.log(form.elements)
    //get form elements 
    const {name, rating, comments} = form.elements;
    //reject empty rating, other invalid entries handled by browser
    if (!Number(rating.value)) {
        console.log('invalid rating', rating.value)
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
        restaurantId: Number(form.dataset.restaurantId),
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