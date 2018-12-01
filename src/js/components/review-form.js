import DBHelper from "../dbhelper";
import dbPromise from "../dbpromise";

export default function reviewForm(restaurantId){
    const form = `
        <form id="review-form" data-restaurantId=${restaurantId} onSubmit =${handleSubmit}>
            <p> <input id ="name" type="text" aria-label="Name" placeholder="Enter Your Name"/></p>
            <p>
                <label for="rating">Your rating: </label>
                <select id="rating" name="rating" class="rating">
                    <option value="--">--</option>
                    <option value="1">1</option>
                    option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                </select>
            </p>
            <p>
                <textarea id="comments" 
                aria-label="comments" 
                placeholder="Enter any comments here" rows="10">
                </textarea>
            </p>
            <p>
                <button type="submit" aria-label="Add Review" class="add-review">
                <span>Leave your impressions</span>
                </button>
            </p>
  
        </form>
    `
    return form
}

function handleSubmit(){
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