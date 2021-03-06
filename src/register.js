/***
 * Registers serviceworker if option is present
 */
export function registerServiceWorker() {
    if (navigator.serviceWorker) {
        console.log('registering serviceworker')
        navigator
            .serviceWorker
            .register('/sw.js')
            .then(registration => console.log(`Registration successful`, registration))
            .catch(err => console.log(`Registratation failed ${err}`));
    }
}

// // From https://www.npmjs.com/package/serviceworker-webpack-plugin import
// runtime from 'serviceworker-webpack-plugin/lib/runtime'; if ('serviceWorker'
// in navigator) {   const registration = runtime.register(); }