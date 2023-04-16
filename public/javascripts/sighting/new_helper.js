const addNewRecord = (requestIDB) => {
    let identification = document.getElementById("identification").value
    let description = document.getElementById("description").value
    let dateTime = document.getElementById("dateTime").value

    const temp = document.getElementById("location").value.split(','),
        longitude = Number(temp[0]), latitude = Number(temp[1])
    let location = {
        type: 'Point',
        coordinates: [longitude, latitude]
    }

    let data = null, contentType = null, url = null

    let file = document.getElementById("sightingImage").files[0]

    if (typeof file != "undefined"){
        let contentType = file.type
        let reader = new FileReader()
        reader.readAsBinaryString(file)

        reader.onload = async (event) => {
            data = event.target.result

            let sightingImage = { data: btoa(data), contentType: contentType, url: url  }

            insertIntoIDB(description, dateTime, identification, location, sightingImage)
        }

    }
}

const getImageFromInputHTML = async () => {
    let data = null, contentType = null, url = null

    url = document.getElementById("sightingImageURL").value

    if (url != '') {
        return { data: data, contentType: contentType, url: url  }
    }
}

const insertIntoIDB = async (description, dateTime, identification, location, image) => {
    const transaction = requestIDB.result.transaction(["sightings", 'userInfo'], "readwrite")

    transaction.onerror = (event) => {
        console.log(`TRANS ERROR: ${event.target.errorCode}`)
    }

    const userStore = transaction.objectStore("userInfo")
    let newSightingId

    userStore.get('user').onsuccess = async (event) => {
        const user = event.target.result

        if (user) {
            let sighting = {
                userId: user.username,
                description: description,
                dateTime: new Date(dateTime),
                identificationId: identification,
                location: location,
                image: image
            }

            const sightingStore = transaction.objectStore("sightings")

            const request = await sightingStore.add(sighting)

            request.onsuccess = async (event) => {
                newSightingId = await event.target.result

                registerNewSightingSync(newSightingId)
            }
        } else {
            console.log('user not logged in.')
        }
    }

    transaction.oncomplete = () => {
        if (typeof newSightingId != 'undefined'){
           setCurrentSighting(newSightingId)
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
