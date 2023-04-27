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
