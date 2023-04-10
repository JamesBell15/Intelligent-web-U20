const showRecord = () => {
    const db = requestIDB.result
    const transaction = db.transaction(["currentSighting", "sightings", "messages"], "readwrite")

    const currentSightingObjStr = transaction.objectStore("currentSighting")
    const sightingObjStr = transaction.objectStore("sightings")
    const messageObjStr = transaction.objectStore("messages")

    currentSightingObjStr.get('current').onsuccess = (event) => {
        let sightingId = setSightingId(event.target.result.sightingId)

        console.log(sightingId)

        sightingObjStr.get(sightingId).onsuccess = (event) => {
            renderSightingHTML(event.target.result)
        }


        let cursorRequest = messageObjStr.openCursor()

        cursorRequest.onsuccess = function(event) {
            let cursor = event.target.result

            if (cursor) {
                let key = cursor.primaryKey
                let value = cursor.value

                if (sightingId == value.postId){
                    renderChatHTML(value)
                }

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


}

const setSightingId = (sightingId) => {
    if (Number(sightingId)) {
        return Number(sightingId)
    }

    return sightingId
}

const renderChatHTML = (record) => {
    let table = document.getElementById("chatHistory")

    const div = document.createElement('div')
    div.innerHTML = `<p><strong>${record.sender}:</strong>${record.msg}</p>`

    table.appendChild(div);
}

const renderSightingHTML = (record) => {
    let table = document.getElementById("sightingTable")

    // Set up headers
    let output = `
    <div>
        <span>${record.userId}</span>
        <span>${record.description}</span>
        <span>${record.dateTime}</span>
        <span>${record.identificationId}</span>
        <span>${record.location}</span>
        <span><img src="${record.image}" height=200px></span>
    </div>`

    table.innerHTML = output
}

requestIDB.onsuccess = async (event) => {
    showRecord()
}