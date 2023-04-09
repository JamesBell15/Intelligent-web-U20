const getAllRecords = (requestIDB) => {

  const objectStore = requestIDB.result.transaction("sightings").objectStore("sightings");

  objectStore.getAll().onsuccess = (event) => {
    showAllRecords(event.target.result)
  };
}

const showAllRecords = (records) => {
  let table = document.getElementById("sightingTable")

  // Set up headers
  let output = ``
  // remove old data
  table.innerHTML = output

  // Write each record to a row
  for (const [key, _] in records) {
    let record = records[key]

    // Key is relative to array hence out of phase with IDB
    let indexKey = parseInt(key) + 1

    table.innerHTML += `
    <section sighting-post-id="${indexKey}" id="sightingBody" class="container p-2">
    <div class="row row-cols-5 border-bottom border-light-dark">
        <h4 class="col fs-6"> ${record.identificationId} </h4>
        <div class="col fs-6"> ${record.userId} </div>
        <div class="col fs-6"> ${record.location} </div>
        <div class="col fs-6"> ${record.dateTime} </div>
        <div class="col fs-6"><button class="showButton" id="${indexKey}" type="button"><i class="fa-solid fa-binoculars"></i></button></div>
    </div>
    </section>`
  }

  let btns = document.getElementsByClassName('showButton')

  for (let btn of btns) {
    btn.addEventListener("click", (event) => {setSightingId(btn.id)})
  }
}

// when indexedDB opens populate page
requestIDB.onsuccess = (event) => {
  getAllRecords(requestIDB)
}
