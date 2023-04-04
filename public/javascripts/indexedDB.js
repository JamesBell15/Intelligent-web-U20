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
