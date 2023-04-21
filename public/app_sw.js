self.importScripts("/javascripts/serviceWorkerHelper.mjs")

self.addEventListener("install", (event) => {
    event.waitUntil(
        addResourcesToCache([
        // maifest
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
        // scrtipts
        //"/app_sw.js",
        "/jquery-3.6.4.js",
        "/javascripts/sighting/new_helper.js",
        "/javascripts/sighting/index_helper.js",
        "/javascripts/sighting/show_helper.js",
        "/javascripts/indexedDB.js"
        ])
    )
})

self.addEventListener('sync', async event => {
    if (event.tag === 'sighting-data-sync') {
        event.waitUntil(syncIDB())
    }

    if (event.tag.startsWith('new-sighting-')) {
        console.log('new sighing ' + event.tag)
        event.waitUntil(newSighting(event.tag.replace("new-sighting-", '')))
    }
})


self.addEventListener("fetch", (event) => {
    let requestURL = new URL(event.request.url)
    requestURL.pathname = requestURL.pathname.replace('.html','')
    let pathname = requestURL.pathname

    if (event.request.method == "GET"){
        if(
            pathname == '/sighting/index'      ||
            pathname == '/sighting/show'       ||
            pathname == '/sighting/new'
        ) {
            // try to get online
            event.respondWith(networkFirst(requestURL, "/html/offline.html"))
        } else {
            event.respondWith(cacheFirst(event.request, "/html/offline.html"))
        }
    }
})


self.addEventListener("push", (event) => {
    const data = event.data.json()
    self.registration.showNotification(
        data.title, { body: data.body,
            data: { url: data.url } },
    )
})

self.addEventListener("notificationclick", function (event) {
    const data = event.notification.data
    console.log(data)
    event.notification.close()
    clients.openWindow(data.url)
})




