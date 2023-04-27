export const subscribe = async () => {
    let subscription

    let registration


    registration = await navigator.serviceWorker.ready
    // pushManager.subscribe will ask for notification permission automatically
    subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: "BLbjzsibeJ_ETEMWPGY6gS5Mvu-tDYwurLa0GIk05Q5-0MEZMRG2swTsI-mW_UgXOaCBuAph_BFKNVOZiM85X_0"
    })

    const db = requestIDB.result

    const userStore = db.transaction('userInfo', 'readonly').objectStore('userInfo')
    const userStoreRequest = userStore.get('user')

    userStoreRequest.onsuccess = async (event) => {
        const user = userStoreRequest.result
        // Send a post request if the user is logged in which will create a subscription entry in DB
        if (user !== undefined) {

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
                const response = await fetch('/subscribe', options)
                const json = await response.json()

            } catch (err) {
                console.error(err)
            }
        }
    }


}