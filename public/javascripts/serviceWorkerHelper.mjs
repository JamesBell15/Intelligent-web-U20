const syncIDB = () => {
    const requestIDB = indexedDB.open("db", 4)

    requestIDB.onsuccess = (event) => {
        const userTransaction = requestIDB.result.transaction(["userInfo"], "readwrite")
        const userStore = userTransaction.objectStore("userInfo")

        userStore.get('user').onsuccess = (event) => {
            // Use epoc to uniquely identify sync when not logged in
            let requestId = Date.now()

            if (typeof event.target.result !== 'undefined') {
                requestId = event.target.result.username
            }

            fetch(`/db/get/${requestId}`).then(
                (response) => response.json()
            ).then((body) => {
                // use this to store data from db
                const syncTransaction = requestIDB.result.transaction(["sightings", "messages"], "readwrite")
                syncTransaction.onerror = (event) => {
                    console.log("Sync transaction error: " + event.target.error)
                }
                syncTransaction.oncomplete = (event) => {
                    console.log("Sync transaction success")
                }

                const sightingStore = syncTransaction.objectStore("sightings")
                const messageStore = syncTransaction.objectStore("messages")

                const clearRequest = sightingStore.clear()

                clearRequest.onsuccess = (event) => {
                    for (let key in body.data['sightings']){
                        sighting = body.data['sightings'][key]

                        let tempSighting = {
                            userId: sighting.userId.username,
                            description: sighting.description,
                            dateTime: sighting.dateTime,
                            identificationURI: sighting.identificationURI,
                            identificationName: sighting.identificationName,
                            confirmation: sighting.confirmation,
                            location: sighting.location,
                            image: sighting.image
                        }

                        const sightingAddRequest = sightingStore.add(tempSighting, key)
                    }
                }

                const messageClearRequest = messageStore.clear()

                messageClearRequest.onsuccess = (event) => {
                    for (let message of body.data['messages']){
                        let tempMessage = {
                            senderId: message.sender.username,
                            postId: message.post,
                            msg: message.msg,
                            createdAt: message.createdAt
                        }

                        const messageAddRequest = messageStore.add(tempMessage, message._id)
                    }
                }
            })
        }
    }
}

// Add new sighting with new messages made during offline period
const newSighting = async (id) => {
    const requestIDB = indexedDB.open("db", 4)

    requestIDB.onsuccess = async (event) => {
        const transaction = requestIDB.result.transaction(["sightings"], "readwrite")
        const sightingStore = transaction.objectStore("sightings")

        sightingStore.get(Number(id)).onsuccess = async (event) => {
            let sighting = event.target.result

            fetch("/db/sighting/update",
            {
                method: "POST",
                headers: {
                  "Content-Type": "application/json"
                },
                body: JSON.stringify(sighting)
            }).then(
                (response) => response.json()
            ).then(
                (body) => {
                    const messagesTransaction = requestIDB.result.transaction(["messages"], "readwrite")
                    const messageStore = messagesTransaction.objectStore("messages")

                    let request = messageStore.openCursor()

                    request.onerror = function(event) {
                       console.err("error fetching data")
                    }

                    request.onsuccess = function(event) {
                        let cursor = event.target.result

                        if (cursor) {
                            let key = cursor.primaryKey
                            let value = cursor.value

                            if(value.postId == Number(id)) {
                                let message = value

                                message.postId = body.postId

                                fetch("/db/message/update",
                                {
                                    method: "POST",
                                    headers: {
                                      "Content-Type": "application/json"
                                    },
                                    body: JSON.stringify(message)
                                })
                            }

                            cursor.continue()
                        } else {
                            console.log('done')
                        }
                    }
                }
            )

        }
    }
}

// For messages on existing sightings
const newMessage = (id) => {
    const requestIDB = indexedDB.open("db", 4)

    requestIDB.onsuccess = (event) => {
        const transaction = requestIDB.result.transaction(["messages"], "readwrite")
        const messagesStore = transaction.objectStore("messages")

        messagesStore.get(Number(id)).onsuccess = (event) => {
            let message = event.target.result

            fetch("/db/message/update",
            {
                method: "POST",
                headers: {
                  "Content-Type": "application/json"
                },
                body: JSON.stringify(message)
            })
        }
    }
}

const addResourcesToCache = async (resources) => {
    const cache = await caches.open("v1")
    await cache.addAll(resources)
}

const addResourceToCahce = async (request, response) => {
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

// Checks network first
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

// Redirects server requests to server not cache
const syncNetwork = async (pathname) => {
    try {
        const responseFromNetwork = await fetch(pathname)

        return responseFromNetwork
    } catch (error) {
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