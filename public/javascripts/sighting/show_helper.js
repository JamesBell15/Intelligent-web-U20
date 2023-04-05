const getRecord = () => {
  return new Promise(function(resolve) {
      const db = requestIDB.result
      const currentSightingObjStr = db.transaction(["currentSighting"], "readwrite").objectStore("currentSighting")

      currentSightingObjStr.get('current').onsuccess = (event) => {
        const sightingObjStr = db.transaction(["sightings"], "readwrite").objectStore("sightings")

        sightingObjStr.get(parseInt(event.target.result.sightingId)).onsuccess = (event) => {
          return resolve(event.target.result)
        }
      }
    }
  )
}

const showRecord = (record) => {
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
  let record = await getRecord()
  showRecord(record)
}