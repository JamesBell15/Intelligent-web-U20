/*
    install - Handles the service worker is created and installed on the clients browser
    it caches the required files

    sync - Handles the background sync events for when
        sighting-data-sync - syncing offline IDB with the most up-to-date
        new-sighting - send a new sighting to the server with any messages made during that session
        new-message - sends new messages on pre existing sightings

    fetch - Handles the requests to the server, and reroutes them to the cache when offline or
    sends the request to the server if online

    push - Chris

    notificationclick - Chris
*/

self.importScripts("/javascripts/serviceWorkerHelper.mjs")

self.addEventListener("install", (event) => {
    event.waitUntil(
        addResourcesToCache([
            // manifest
            "/manifest.json",
            // css
            "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha2/dist/css/bootstrap.min.css",
            "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css",
            "/stylesheets/style.css",
            // html
            "/html/offline.html",
            "/partials/navbar.html",
            "/sighting/new.html",
            "/sighting/index.html",
            "/sighting/show.html",
            // scripts
            "/app_sw.js",
            "/jquery-3.6.4.js",
            "/javascripts/subscription_helper.mjs",
            "/javascripts/sighting/new_helper.js",
            "/javascripts/sighting/index_helper.js",
            "/javascripts/sighting/show_helper.js",
            "/javascripts/sighting/identification.js",
            "/javascripts/indexedDB.js",
            "/javascripts/header_helper.js",
            "/javascripts/form.js",
            // icons
            "/icons/icon-48x48.png",
            "/icons/icon-72x72.png",
            "/icons/icon-96x96.png",
            "/icons/icon-128x128.png",
            "/icons/icon-144x144.png",
            "/icons/icon-152x152.png",
            "/icons/icon-192x192.png",
            "/icons/icon-384x384.png",
            "/icons/icon-512x512.png"
        ])
    )
})

self.addEventListener('sync', async event => {
    if (event.tag === 'sighting-data-sync') {
        event.waitUntil(syncIDB())
    }

    if (event.tag.startsWith('new-sighting-')) {
        console.log('new sighting ' + event.tag)
        event.waitUntil(newSighting(event.tag.replace("new-sighting-", '')))
    }

    if (event.tag.startsWith('new-message-')) {
        console.log('new message ' + event.tag)
        event.waitUntil(newMessage(event.tag.replace("new-message-", '')))
    }
})


self.addEventListener("fetch", (event) => {
    let requestURL = new URL(event.request.url)
    requestURL.pathname = requestURL.pathname.replace('.html','')
    let pathname = requestURL.pathname

    if (event.request.method == "GET"){
        // critial routes for the application
        if(
            pathname == '/sighting/index'      ||
            pathname == '/sighting/show'       ||
            pathname == '/sighting/new'
        ) {
            // Try online routes first
            event.respondWith(networkFirst(requestURL, "/sighting/index.html"))
        // for syncing related taskes
        } else if (pathname.startsWith("/db/")) {
            event.respondWith(syncNetwork(requestURL))
        // for non critial routes return to the index while offline
        } else {
            event.respondWith(cacheFirst(event.request, "/sighting/index.html"))
        }
    }
})


// Adds an event listener for the 'push' event. This occurs when a notification
// needs to be sent and then showNotification is actually called to display
// the notification to the user
self.addEventListener("push", (event) => {
    const data = event.data.json()
    self.registration.showNotification(
        data.title, { body: data.body,
            data: { url: data.url } },
    )
})


// Adds an event listener for when the user clicks on a notification.
// On click, it opens the page in a browser
self.addEventListener("notificationclick", function (event) {
    const data = event.notification.data
    event.notification.close()
    clients.openWindow(data.url)
})
