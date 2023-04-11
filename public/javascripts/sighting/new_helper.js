const addNewRecord = (requestIDB) => {
    // create transaction and setup handlers
    const transaction = requestIDB.result.transaction(["sightings", 'userInfo'], "readwrite");

    transaction.onerror = (event) => {
        console.log(`TRANS ERROR: ${event.target.errorCode}`)
    };

    let identification = document.getElementById("identification").value
    let description = document.getElementById("description").value
    let dateTime = document.getElementById("dateTime").value
    let location = document.getElementById("location").value
    let sightingImage = document.getElementById("sightingImage").value

    const userStore = transaction.objectStore("userInfo");

    userStore.get('user').onsuccess = (event) => {
        const user = event.target.result
        if (user) {
            let sighting = {
                userId: user.username,
                description: description,
                dateTime: new Date(dateTime),
                identificationId: identification,
                location: location,
                image: sightingImage
            }

            const sightingStore = transaction.objectStore("sightings");

            const request = sightingStore.add(sighting);

            request.onsuccess = (event) => {
                let newSightingId = event.target.result

                registerNewSightingSync(newSightingId)
                setCurrentSighting(newSightingId)
            }
        } else {
            console.log('user not logged in.')
        }
    }
}

// Registers background sync for new sighting
const registerNewSightingSync = async (id) => {
    const registration = await navigator.serviceWorker.ready
    try {
        await registration.sync.register("new-sighting-" + String(id))
        console.log("New sighting Background Sync registered!")
    } catch {
        console.log("New sighting Background Sync could not be registered!")
    }
}
