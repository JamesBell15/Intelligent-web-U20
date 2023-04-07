const addNewRecord = (requestIDB) => {
  // create transaction and setup handlers
  const transaction = requestIDB.result.transaction(["sightings"], "readwrite");

  transaction.oncomplete = (event) => {
    // TODO redirect to show?
    console.log("It worked!");
  };

  transaction.onerror = (event) => {
    console.log(`TRANS ERROR: ${event.target.errorCode}`)
  };

  let identification = document.getElementById("identification").value
  let description = document.getElementById("description").value
  let dateTime = document.getElementById("dateTime").value
  let location = document.getElementById("location").value
  let sightingImage = document.getElementById("sightingImage").value

  let sighting = {
    userId: "TODO_user",
    description: description,
    dateTime: new Date(dateTime),
    identificationId: identification,
    location: location,
    image: sightingImage
  }

  const objectStore = transaction.objectStore("sightings");

  const request = objectStore.add(sighting);

  request.onsuccess = (event) => {
    setSightingId(event.target.result)
  }
}