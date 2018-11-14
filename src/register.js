/***
 * Registers serviceworker if option is present
 */

(() => {
    if (navigator.serviceWorker){
        navigator
            .serviceWorker
            .register('/sw.js')
            .then(registration => console.log(`Registration successful`, registration))
            .catch(err => console.log(`Registratation failed ${err}`))
    }
})()