
// Creates the schema for indexedDB
const upgradeStores = (event) => {
    console.log("Upgrading...")

    const db = event.target.result

    db.createObjectStore('userInfo', {autoIncrement: false})

    // auto incement to allow for offline sightings
    const sightingStore = db.createObjectStore("sightings", { autoIncrement: true })

    // SCHEMA
    sightingStore.createIndex("userId", "userId", { unique: false })
    sightingStore.createIndex("description", "description", { unique: false })
    sightingStore.createIndex("dateTime", "dateTime", { unique: false })
    sightingStore.createIndex("identificationURI", "identificationURI", { unique: false })
    sightingStore.createIndex("identificationName", "identificationURI", { unique: false })
    sightingStore.createIndex("confirmation","confirmation", {unique: false })
    sightingStore.createIndex("location", "location", { unique: false })
    // Image JSON object { data, contentType, url }
    sightingStore.createIndex("image", "image", { unique: false })

    // Used to store the current sighting for the show page
    const currentSightingStore = db.createObjectStore("currentSighting", { keyPath: "key" })

    // SCHEMA
    currentSightingStore.createIndex("sightingId", "sightingId", { unique: false })

    // Add record to manipulate
    const request = currentSightingStore.add({key: 'current', sightingId: null})
    request.onsuccess = (event) => {
        console.log(`added currentSighting`)
    }

    // auto incement to allow for offline messages
    const messagesStore = db.createObjectStore("messages", { autoIncrement: true })

    // SCHEMA
    messagesStore.createIndex("senderId", "senderId", { unique: false })
    messagesStore.createIndex("postId", "postId", { unique: false })
    messagesStore.createIndex("msg", "msg", { unique: false })
    messagesStore.createIndex("createdAt", "createdAt", { unique: false })

    console.log("Upgraded!")
}

const requestIDB = indexedDB.open("db", 4)

requestIDB.onupgradeneeded = (event) => {
    upgradeStores(event)
}

requestIDB.onsuccess = (event) => {
    console.log(`indexedDB opened`)
}

requestIDB.onerror = (event) => {
    console.log(`DB ERROR: ${event.target.errorCode}`)
}

// Make avaliable in other helpers
const setCurrentSighting = (recordId) => {
    const currentSightingStore = requestIDB.result
        .transaction(["currentSighting"], "readwrite")
        .objectStore("currentSighting")

    currentSightingStore.get('current').onsuccess = (event) => {
        const data = event.target.result

        data.sightingId = recordId

        const requestUpdate = currentSightingStore.put(data)

        requestUpdate.onerror = (event) => {
            console.log("failed")
        }

        requestUpdate.onsuccess = (event) => {
            console.log("keyset")
            window.location.replace("/sighting/show")
        }
    }
}
