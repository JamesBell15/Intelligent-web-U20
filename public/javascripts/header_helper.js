const registerServiceWorker = async () => {
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.register("/app_sw.js", {
        scope: "/",
      })
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

registerServiceWorker()

// fetch up todate records and store them in indexedDB
const updateIDB = async () => {
  navigator.serviceWorker.ready.then(async (swReg) => {
    // fetch 10 most recent records for user
    const bgFetch = await swReg.backgroundFetch.fetch(
      "my-fetch",
      "http://localhost:3000/sighting/refresh"
    )

    console.log(bgFetch)
  })
}
