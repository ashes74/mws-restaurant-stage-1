/***
 * Registers serviceworker if option is present
 */

(() => {
    if (!navigator.serviceWorker) 
        return;
    navigator
        .serviceWorker
        .register('sw.js', {scope: "/"})
        .then(registration => console.log(`Registration successful`, registration))
        .catch(err => console.log(`Registratation failed ${err}`))
})()