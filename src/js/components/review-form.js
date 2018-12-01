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

// String literal format is cool and easy to parse. But bundles weird.
// TO DO: Look into bundling better
// const form = `
//     <form id="review-form" data-restaurantId=${restaurantId} onsubmit ="${handleSubmit}">
//         <p> <input id ="name" type="text" aria-label="Name" placeholder="Enter Your Name" required/></p>
//         <p>
//             <label for="rating" >Your rating: </label>
//             <select id="rating" name="rating" class="rating" required>
//                 <option value="--">--</option>
//                 <option value="1">1</option>
//                 option value="2">2</option>
//                 <option value="3">3</option>
//                 <option value="4">4</option>
//                 <option value="5">5</option>
//             </select>
//         </p>
//         <p>
//             <textarea id="comments" 
//             aria-label="comments" 
//             placeholder="Enter any comments here" rows="10" required>
//             </textarea>
//         </p>
//         <p>
//             <button type="submit" aria-label="Add Review" class="add-review">
//             <span>Leave your impressions</span>
//             </button>
//         </p>

//     </form>
// `

const handleSubmit = (e) => {
    console.log('Submitting form', e);



    e.preventDefault();
    //validate data

    //if valid cache 

    //Send to Database 

    //Add to page

    //clear form 
}

/**
 * Clear form 
 */
function clearForm(){

}

/**
 * Validate form
 */
function validateForm(){

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