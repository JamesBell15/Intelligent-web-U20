//check if user is logged in, and if they're the author
let author = document.getElementById("showAuthor").innerHTML
const requestUser = indexedDB.open('db', 4)
requestUser.onerror = (event) => {
    console.error('IDB: '+requestUser.error)
}
requestUser.onsuccess = (event) => {
    const db = requestUser.result
    const storeRequest = db.transaction('userInfo', 'readonly').objectStore('userInfo').get('user')
    storeRequest.onsuccess = (event) => {
        const user = event.target.result
        if (user) {
            if (user.username === author){
                const editButton = document.getElementById('editModalBtn')
                editButton.classList.remove('hidden')
            }

        }
    }
}

//set input field initial values using hidden fields
let identificationURI = document.getElementById("identificationURI").value
let identificationName = document.getElementById("identificationName").value
let confirmation = document.getElementById("confirmation").value

let unknownCheckbox = document.getElementById("unknownIdentification")
let confirmedCheckbox = document.getElementById("confirmIdentification")
let identificationSearch = document.getElementById("identificationSearch")
let identificationSelection = document.getElementById("identification")

let identificationWrapper = document.getElementById("identificationInputs")

if (confirmation==="unknown"){
    //select "unknown" identification checkbox
    unknownCheckbox.checked = true
    //remaining fields will not have a value

}
else{
    //if no URI present, input is in the search box, no dropdown option selected
    if (identificationURI === "unknown"){
        identificationSearch.value = identificationName
    }

    //otherwise, dropdown must've been selected, populate dropdown and make relevant area visible
    else{
        let opt = document.createElement("option")
        opt.value = identificationURI
        opt.innerHTML = identificationName
        identificationSelection.appendChild(opt)
        identificationWrapper.style.visibility = "visible"
        identificationSearch.value = identificationName
    }

    //if confirmation confirmed, tick checkbox
    if (confirmation === "confirmed"){
        confirmedCheckbox.checked = true
    }
}
disableFields()
