const showRecord = () => {
    const db = requestIDB.result
    const currentSightingObjStr = db.transaction(["currentSighting"], "readwrite").objectStore("currentSighting")

    currentSightingObjStr.get('current').onsuccess = (event) => {
        const sightingObjStr = db.transaction(["sightings"], "readwrite").objectStore("sightings")

        let sightingId = setSightingId(event.target.result.sightingId)

        console.log(sightingId)

        sightingObjStr.get(sightingId).onsuccess = (event) => {
            renderHTML(event.target.result)
        }
    }
}

const setSightingId = (sightingId) => {
    if (Number(sightingId)) {
        return Number(sightingId)
    }

    return sightingId
}

const renderHTML = (record) => {
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

  output += `
    <tr>
      <td>${record.userId}</td>
      <td>${record.description}</td>
      <td>${record.dateTime}</td>
      <td>${record.identificationId}</td>
      <td>${record.location}</td>
      <td>${record.image}</td>
    </tr>`

  table.innerHTML = output
}

requestIDB.onsuccess = async (event) => {
  showRecord()
}