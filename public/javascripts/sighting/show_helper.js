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

    table.appendChild(div)
}

const renderSightingHTML = (record) => {
    let table = document.getElementById("sightingData")

    // Set up headers
    let output = `
    <div class="showGroup">
        <div class="showTitle">Author</div>
            <div id="showAuthor" class="showField">${ record.userId }</div>
        </div>

        <div class="showGroup">
            <div class="showTitle">Identification</div>
            <div id="showName" class="showField">${ record.identificationName }</div>
        </div>

        <div class="showGroup">
            <div class="showTitle">Confirmation Status</div>
            <div id="showConfirmation" class="showField"> ${record.confirmation}</div>
        </div>
        <div class="showGroup">
            <div class="showTitle">Description</div>
            <div id="showDescription" class="showField"> ${record.description}</div>
        </div>
        <div class="showGroup">
            <div class="showTitle">Date Sighted</div>
            <div id="showDate" class="showField">${ record.dateTime }</div>
        </div>
        <div class="showGroup">
            <div class="showTitle">Location</div>
            <div id="showCoordinates"class="showField">${ record.location.coordinates }</div>
        </div>
        <div class="showGroup showImageGroup">
            <div class="showTitle">Attached Image</div>`

    if (record.image.contentType != null) {
        output += `<div id="showImage" class="showField"><img src="data:${record.image.contentType};base64,${record.image.data}" height=200px></div>`
    } else if (record.image.url != null) {
        output += `<div id="showImage" class="showField"><img src="${record.image.url}" height=200px></div><br>`
    }

    table.innerHTML = output + `</div>`
}

const addChatMessage = () => {
    let msg = document.getElementById("msgIn")

    if (msg.value != '') {
        const db = requestIDB.result
        const transaction = db.transaction(["currentSighting", "userInfo", "messages"], "readwrite")
        const messageObjStr = transaction.objectStore("messages")
        const userInfoObjStr = transaction.objectStore("userInfo")
        const currentSightingObjStr = transaction.objectStore("currentSighting")

        let message = {
            msg: msg.value,
            createdAt: new Date()
        }

        transaction.onerror = (event) => {
            console.log(`trans wrong: ${event.target.error}`)
        }

        userInfoObjStr.get('user').onsuccess = (event) => {
            message["senderId"] = event.target.result.username

            currentSightingObjStr.get('current').onsuccess = (event) => {
                message["postId"] = event.target.result.sightingId

                messageObjStr.add(message).onsuccess = async(event) => {
                    newMessageId = await event.target.result

                    renderChatHTML(message)

                    if (isNaN(+message.postId)) {
                        registerNewMessageSync(newMessageId)
                    }
                }
            }
        }
    }
}

// Registers background sync for new message
const registerNewMessageSync = async (id) => {
    const registration = await navigator.serviceWorker.ready
    try {
        await registration.sync.register("new-message-" + String(id))
        console.log("New message Background Sync registered!")
    } catch {
        console.log("New message Background Sync could not be registered!")
    }
}

requestIDB.onsuccess = async (event) => {
    showRecord()
    let btn = document.getElementById('sendMsgBtn')

    btn.addEventListener('click', (event) => {addChatMessage()})

    document.getElementById("chatForm").onkeypress = function(e) {
        var key = e.charCode || e.keyCode || 0

        // enter key for sending chat messages offline
        if (key == 13) {
            addChatMessage()
            e.preventDefault()
        }
    }

}