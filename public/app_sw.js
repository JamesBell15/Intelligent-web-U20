const addResourcesToCache = async (resources) => {
    const cache = await caches.open("v1")
    await cache.addAll(resources)
}

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
        "/app_sw.js",
        "/jquery-3.6.4.js",
        "/javascripts/sighting/new_helper.js",
        "/javascripts/sighting/index_helper.js",
        "/javascripts/sighting/show_helper.js",
        "/javascripts/indexedDB.js"
        ])
    )
})

const putInCache = async (request, response) => {
    const cache = await caches.open("v1")
    await cache.put(request, response)
}

// PWA Architecture cache first
const cacheFirst = async (request, fallbackUrl) => {
    const responseFromCache = await caches.match(request)

    if (responseFromCache) {
        return responseFromCache
    }
    try {
        const responseFromNetwork = await fetch(request)

        return responseFromNetwork
    } catch (error) {
        const fallbackResponse = await caches.match(fallbackUrl)

        if (fallbackResponse) {
            return fallbackResponse
        }
        // when even the fallback response is not available,
        // there is nothing we can do, but we must always
        // return a Response object
        return new Response(
            "Network error happened",
            {
                status: 408,
                headers: { "Content-Type": "text/plain"
            },
            }
        )
    }
}

const networkFirst = async (pathname, fallbackUrl) => {
    try {
        const responseFromNetwork = await fetch(pathname)

        return responseFromNetwork
    } catch (error) {
        const responseFromCache = await caches.match(pathname + ".html")

        if (responseFromCache) {
            return responseFromCache
        } else {
            const fallbackResponse = await caches.match(fallbackUrl)
            if (fallbackResponse) {
                return fallbackResponse
            }
            // when even the fallback response is not available,
            // there is nothing we can do, but we must always
            // return a Response object
            return new Response(
                "Network error happened",
                {
                status: 408,
                headers: { "Content-Type": "text/plain" },
                }
            )
        }
    }
}

const updateIDB = () => {
    const requestIDB = indexedDB.open("db", 4)

    requestIDB.onsuccess = (event) => {
        fetch('/db/get').then(
            (response) => response.json()
        ).then((body) => {

            // use this to store data from db
            const transaction = requestIDB.result.transaction(["sightings", "messages"], "readwrite")
            const sightingStore = transaction.objectStore("sightings")
            const messageStore = transaction.objectStore("messages")
            transaction.onerror = (event) => {
                console.log("trans wrongs: " + event.target.error)
            }
            transaction.oncomplete = (event) => {
                console.log("trans rights")
            }

            const clearRequest = sightingStore.clear()

            clearRequest.onsuccess = (event) => {
                // add all data into db
                console.log("sighting clear")
                console.log(body.data)


                for (let sighting of body.data['sightings']){
                    console.log(sighting)
                    let tempSighting = {
                        userId: sighting.userId.username,
                        description: sighting.description,
                        dateTime: sighting.dateTime,
                        identificationId: sighting.identificationId,
                        location: sighting.location,
                        image: sighting.image
                    }

                    const sightingAddRequest = sightingStore.add(tempSighting, sighting._id)

                    sightingAddRequest.onsuccess = (event) => {
                        console.log("sighting added")
                    }
                }
            }

            const messageClearRequest = messageStore.clear()

            messageClearRequest.onsuccess = (event) => {
                for (let message of body.data['messages']){
                    console.log(message)
                    let tempMessage = {
                        senderId: message.sender.username,
                        postId: message.post,
                        msg: message.msg,
                        createdAt: message.createdAt
                    }

                    const messageAddRequest = messageStore.add(tempMessage, message._id)

                    messageAddRequest.onsuccess = (event) => {
                        console.log("sighting added")
                    }
                }
            }

        })
    }
}

self.addEventListener('sync', async event => {
    if (event.tag === 'sighting-data-sync') {
        event.waitUntil(updateIDB())
    }
})


self.addEventListener("fetch", (event) => {
    let pathname = new URL(event.request.url).pathname

    if (event.request.method == "GET"){
        if(
            pathname == '/sighting/index.html' ||
            pathname == '/sighting/new.html'   ||
            pathname == '/sighting/show.html'  ||
            pathname == '/sighting/index'      ||
            pathname == '/sighting/show'       ||
            pathname == '/sighting/new'
        ) {
            // try to get online
            event.respondWith(networkFirst(pathname.replace('.html',''), "/html/offline.html"))
        } else {
            event.respondWith(cacheFirst(event.request, "/html/offline.html"))
        }
    }
})
