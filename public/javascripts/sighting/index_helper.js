const getAllRecords = (requestIDB) => {

  const objectStore = requestIDB.result.transaction("sightings").objectStore("sightings");

  objectStore.getAll().onsuccess = (event) => {
    showAllRecords(event.target.result)
  };
}

const showAllRecords = (records) => {
  let table = document.getElementById("sightingTable")

  // Set up headers
  let output = `<tr>
    <th>User</th>
    <th>Identification</th>
    <th>Time</th>
    <th></th>
  </tr>`
  // remove old data
  table.innerHTML = output

  // Write each record to a row
  for (const [key, _] in records) {
    let record = records[key]

    // Key is relative to array hence out of phase with IDB
    let indexKey = parseInt(key) + 1

    table.innerHTML += `
      <tr>
        <td>${record.userId}</td>
        <td>${record.identificationId}</td>
        <td>${record.dateTime}</td>
        <td>
        <button id="${indexKey}" type="button">More details</button>
        </td>
      </tr>`
  }

  let btns = document.getElementsByTagName('button')

  for (let btn of btns) {
    btn.addEventListener("click", (event) => {setSightingId(btn.id)})
  }
}



// when indexedDB opens populate page
requestIDB.onsuccess = (event) => {
  getAllRecords(requestIDB)
}
