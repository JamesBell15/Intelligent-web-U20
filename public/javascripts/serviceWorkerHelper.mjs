const syncIDB = () => {
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
                console.log("Sync transaction error: " + event.target.error)
            }
            transaction.oncomplete = (event) => {
                console.log("Sync transaction success")
            }

            const clearRequest = sightingStore.clear()

            clearRequest.onsuccess = (event) => {
                for (let sighting of body.data['sightings']){
                    let tempSighting = {
                        userId: sighting.userId.username,
                        description: sighting.description,
                        dateTime: sighting.dateTime,
                        identificationId: sighting.identificationId,
                        location: sighting.location,
                        image: sighting.image
                    }

                    const sightingAddRequest = sightingStore.add(tempSighting, sighting._id)
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
                    console.log(body.postId)
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