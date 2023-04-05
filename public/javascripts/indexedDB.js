const handleSuccess = (event) => {
  console.log(`indexedDB success ${event.target.result}`)
}

const upgradeStores = (event) => {
  console.log("Upgrading...")

  const db = event.target.result
  const sightingStore = db.createObjectStore("sightings", { autoIncrement: true })

  // SCHEMA
  sightingStore.createIndex("userId", "userId", { unique: false });
  sightingStore.createIndex("description", "description", { unique: false });
  sightingStore.createIndex("dateTime", "dateTime", { unique: false });
  sightingStore.createIndex("identificationId", "identificationId", { unique: false });
  sightingStore.createIndex("location", "location", { unique: false });
  sightingStore.createIndex("image", "image", { unique: false });

  const currentSightingStore = db.createObjectStore("currentSighting", { keyPath: "key" })

  // SCHEMA
  currentSightingStore.createIndex("sightingId", "sightingId", { unique: false });

  // Add record to manipulate
  const request = currentSightingStore.add({key: 'current', sightingId: null});
  request.onsuccess = (event) => {
    console.log(`added currentSighting`)
  }

  console.log("Upgraded!")
}

const requestIDB = indexedDB.open("sightings", 2)

requestIDB.onupgradeneeded = (event) => {
  upgradeStores(event)
}

requestIDB.onsuccess = (event) => {
  handleSuccess(event)
}

requestIDB.onerror = (event) => {
  console.log(`DB ERROR: ${event.target.errorCode}`)
}

// Make avaliable in other helpers
const setSightingId = (recordId) => {
  console.log(recordId)
  const objectStore = requestIDB.result
  .transaction(["currentSighting"], "readwrite")
  .objectStore("currentSighting")

  objectStore.get('current').onsuccess = (event) => {
    // Get the old value that we want to update
    const data = event.target.result

    // update the value(s) in the object that you want to change
    data.sightingId = recordId

    // Put this updated object back into the database.
    const requestUpdate = objectStore.put(data);
    requestUpdate.onerror = (event) => {
      console.log("failed")
    }
    requestUpdate.onsuccess = (event) => {
      console.log("keyset")
      window.location.replace("/html/sighting/show.html")
    }
  }
}