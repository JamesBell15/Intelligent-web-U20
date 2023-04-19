const showRecord = () => {
    const db = requestIDB.result
    const transaction = db.transaction(["currentSighting", "sightings", "messages"], "readwrite")

    const currentSightingObjStr = transaction.objectStore("currentSighting")
    const sightingObjStr = transaction.objectStore("sightings")
    const messageObjStr = transaction.objectStore("messages")

    currentSightingObjStr.get('current').onsuccess = (event) => {
        let sightingId = setSightingId(event.target.result.sightingId)

        const getSighting = sightingObjStr.get(sightingId)

        getSighting.onsuccess = (event) => {
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
    div.innerHTML = `<p><strong>${record.senderId}:</strong>${record.msg}</p>`

    table.appendChild(div);
}

const renderSightingHTML = (record) => {
    let table = document.getElementById("sightingTable")

    // Set up headers
    let output = `
    <div>
        <span>${record.userId}</span><br>
        <span>${record.description}</span><br>
        <span>${record.dateTime}</span><br>
        <span>${record.identificationId}</span><br>
        <span>${record.location.coordinates}</span><br>`

    if (record.image.contentType != null) {
        output += `<span><img src="data:${record.image.contentType};base64,${record.image.data}" height=200px></span><br>`
    } else if (record.image.url != null) {
        output += `<span><img src="${record.image.url}" height=200px></span><br>`
    }


    table.innerHTML = output + `</div>`
}

requestIDB.onsuccess = async (event) => {
    showRecord()
}