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
    <th>Description</th>
    <th>Time</th>
    <th>Identification</th>
    <th>Location</th>
    <th>Image</th>
    <th></th>
  </tr>`

  // Write each record to a row
  for (const record of records) {
    output += `
      <tr>
        <td>${record.userId}</td>
        <td>${record.description}</td>
        <td>${record.dateTime}</td>
        <td>${record.identificationId}</td>
        <td>${record.location}</td>
        <td>${record.image}</td>
      </tr>`

  }

  table.innerHTML = output
}

// when indexedDB opens populate page
requestIDB.onsuccess = (event) => {
  getAllRecords(requestIDB)
}
