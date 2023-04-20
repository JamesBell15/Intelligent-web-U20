import {subscribe} from "./subscription_helper.mjs";

const Subscription = require("../../models/subscription");

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
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: "BLbjzsibeJ_ETEMWPGY6gS5Mvu-tDYwurLa0GIk05Q5-0MEZMRG2swTsI-mW_UgXOaCBuAph_BFKNVOZiM85X_0"
            })
            console.log(subscription)

            const requestIDB = indexedDB.open('db', 4)



            requestIDB.onsuccess = (event) => {
                console.log('success IDB')
                const db = requestIDB.result

                const userStore = db.transaction('userInfo', 'readonly').objectStore('userInfo')
                const userStoreRequest = userStore.get('user')

                userStoreRequest.onsuccess = async (event) => {
                    const user = userStoreRequest.result
                    console.log(user)

                    const data = {
                        user: user,
                        subscription: subscription
                    }
                    const options = {
                        method: 'POST',
                        body: JSON.stringify(data),
                        headers: {
                            'Content-type': 'application/json'
                        }
                    }
                    try {
                        const response = await fetch('/notify', options)
                        const json = await response.json()

                    } catch (err) {
                        console.error(err)
                    }



                }





            }
            /*
            await fetch("/subscribe", {
                method: "POST",
                body: JSON.stringify(subscription),
                headers: {
                    "Content-Type": "application/json"
                }
            })
             */

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
