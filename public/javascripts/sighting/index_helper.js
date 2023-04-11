const showAllRecords = (requestIDB) => {

    const objectStore = requestIDB.result.transaction("sightings").objectStore("sightings")

    request = objectStore.openCursor()

    request.onerror = function(event) {
        console.err("error fetching data")
    }

    let table = document.getElementById("sightingsDiv")

    request.onsuccess = function(event) {
        let cursor = event.target.result

        if (cursor) {
            let key = cursor.primaryKey
            let value = cursor.value

            table.innerHTML += `
            <section sighting-post-id="${key}" id="sightingBody" class="container p-2">
                <div class="row row-cols-5 border-bottom border-light-dark">
                <h4 class="col fs-6"> ${value.identificationId} </h4>
                <div class="col fs-6"> ${value.userId} </div>
                <div class="col fs-6"> ${value.location} </div>
                <div class="col fs-6"> ${value.dateTime} </div>
                <div class="col fs-6"><button class="showButton" id="${key}" type="button"><i class="fa-solid fa-binoculars"></i></button></div>
                </div>
            </section>`

            cursor.continue()
        }
        else {
            let btns = document.getElementsByClassName('showButton')

            for (let btn of btns){
                btn.addEventListener("click", (event) => {setCurrentSighting(btn.id)})
            }

            console.log("done displaying records")
        }
    }
}

// when indexedDB opens populate page
requestIDB.onsuccess = (event) => {
    showAllRecords(requestIDB)
}
