import {subscribe} from "./subscription_helper.mjs";

const registerServiceWorker = async () => {
    if ("serviceWorker" in navigator) {
        try {
            const registration = await navigator.serviceWorker.register("/app_sw.js", {
                scope: "/",
            })

            // Make a call to subscribe() if notifications are already allowed so that subscription object
            // is kept up to date - maybe not necessary but in the case that all the site data is cleared out
            // the subscription object will now be updated, so it won't be out of date
            if (Notification.permission === 'granted') {
                await subscribe()
            }

            if (registration.installing) {
                console.log("Service worker installing")
            } else if (registration.waiting) {
                console.log("Service worker installed")
            } else if (registration.active) {
                console.log("Service worker active")
            }
        } catch (error) {
            console.error(`Registration failed with ${error}`)
        }
    }
}

// Registers background sync for syncing idb
const registerDataSync = async () => {
    const registration = await navigator.serviceWorker.ready
    try {
        await registration.sync.register("sighting-data-sync")
        console.log("Background Sync registered!")
    } catch {
        console.log("Background Sync could not be registered!")
    }
}

registerServiceWorker()
registerDataSync()
