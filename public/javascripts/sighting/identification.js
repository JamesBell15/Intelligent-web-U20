/*data relating to identification

    birdName - name of the identified bird (eg: "Mockingbird") - should be dbpedia page label (unless offline)
        "unknown" if none provided (unknown checkbox is ticked)

    birdURI - URI of the bird's DBPedia knowledge graph resource page
        "unknown" if sighting made offline, since DBPedia won't be accessible (also default)
        must be set when user is online, either during creation or editing

    confirmation - confidence/status of the particular sighting - unknown, unconfirmed, confirmed
        unknown = bird identification is unknown, no supplementary URI
        unconfirmed = identification is not confirmed, may have supplementary URI if the sighting was created online
        confirmed = identification has been confirmed (either set when creating sighting when online, or editing later)

*/

/*
Functions related to the handling of identifying a bird

searchIdentifications - query the DBPedia knowledge graph to find bird species with matching names to a user query
    Populates a dropdown with options for the user to pick from

getConfirmation - gets the confirmation status of the sighting based off of the combination of user inputs

disableFields - disables the identification-related fields when the user selects the "unknown identification" option

optionsPopulated - is the identification selection dropdown populated
    - it will have options if the user has successfully found a species from DBPedia

getIdentificationDetails - handles the logic surrounding the identification inputs and outputs values to be used
    - if identification is unknown, the other input fields are ignored
    - sometimes there may not be an associated DBPedia URI for a sighting

setHiddenFields - sets the values of the hidden fields for sighting identification
    - these are sanitised before form submission so the server only receives correct data

 */


//get selection of bird species from DBPedia similar to search term
const searchIdentifications = () =>{
    let birdName = document.getElementById("identificationSearch").value.toLowerCase()

    // The DBpedia SPARQL endpoint URL being queried
    const endpointUrl = "https://dbpedia.org/sparql"

    // SPARQL query to return a list of birds with names similar to the entered query
    // TODO: get names that are "similar" / "LIKE" the query in case of misspellings
    // TODO: get some way of prioritising "more relevant" entities
    const sparqlQuery = `
        PREFIX dbo: <http://dbpedia.org/ontology/>
        PREFIX dbprop: <http://dbpedia.org/property/>
        PREFIX dbr: <http://dbpedia.org/resource>
        
        select distinct ?bird ?label
        where {
            ?bird a dbo:Bird;
                rdfs:label ?label.
            FILTER(langMatches(lang(?label), "en" ))
            FILTER(contains(lcase(?label), "`+ birdName +`"))
        } LIMIT 15`

    // Encode the query as a URL parameter
    const encodedQuery = encodeURIComponent(sparqlQuery)
    // Build the URL for the SPARQL query
    const url = `${endpointUrl}?query=${encodedQuery}&format=json`

    // Use fetch to retrieve the data
    fetch(url)
        .then(response => response.json())
        .then(data => {
            // The results are in the 'data' object
            let bindings = data.results.bindings
            let result = JSON.stringify(bindings)
            //add each returned value to dropdown


            let dropdown = document.getElementById("identification")
            while (dropdown.options.length >0){dropdown.options.remove(0)}

            let identificationWrapper = document.getElementById("identificationInputs")
            for (i in bindings){

                //create option per result from query
                let opt = document.createElement("option")
                let bird = bindings[i]
                opt.value = bird.bird.value
                opt.innerHTML = bird.label.value
                dropdown.appendChild(opt)
            }
            //make inputs visible as they are now populated
            identificationWrapper.style.visibility= "visible"
        })
}

//get confirmation status of sighting
//returns "unknown", "unconfirmed" and "confirmed" (lowercase)
function getConfirmation() {
    //if user has checked the "unknown" checkbox
    if(document.getElementById("unknownIdentification").checked){
        return "unknown"
    }
    else if(!optionsPopulated()){
            return "unconfirmed"
        }
    //if user has selected the "identification confirmed" checkbox
    else if(document.getElementById("confirmIdentification").checked){
        return "confirmed"
    }
    //otherwise, identification is unconfirmed
    else{
        return "unconfirmed"
    }
}

//disables/enables identification inputs when unknown checkbox is checked/unchecked
function disableFields(){

    let inputs = [
        document.getElementById("identificationSearch"),
        document.getElementById("findIdentifications"),
        document.getElementById("identification"),
        document.getElementById("confirmIdentification")
    ]
    if (document.getElementById("unknownIdentification").checked){
        for (let input of inputs){input.setAttribute("disabled","disabled")}
    }
    else{
        for (let input of inputs){input.removeAttribute("disabled")}
    }
}

//check if identification options section is populated
//returns true if there are options in the dropdown
function optionsPopulated(){
    if (document.getElementById("identification").options.length < 1){return false}
    else{return true}
}

//get identifications (DBPedia URI and label) from frontend
//handles different input selections
function getIdentificationDetails(){
    let details = ["unknown","unknown"]
    //if user has selected "unknown", ignore other inputs
    //or if user hasn't entered anything in the search field
    if (getConfirmation() === "unknown"){
        return details
    }
    //if no options are provided (user offline or naming is incorrect)
    else if (!optionsPopulated()){
        //no options provided, so don't try to get value from dropdown
        //use entered search term instead in lieu of a verified identification
        details[1] = document.getElementById("identificationSearch").value
    }
    //otherwise, there should be options to select from
    else{
        let identification = document.getElementById("identification")
        //get identification DBPedia URI (value of dropdown selection)
        details[0] = identification.value
        //get name of bird (label attribute of DBPedia resource)
        details[1] = identification.options[identification.selectedIndex].text
    }
    return details
}

//set values of hidden fields to be sent in form
//occurs whenever fields are edited
function setHiddenFields(){
    let identificationDetails = getIdentificationDetails()

    //don't overwrite identificationName with empty string
    if(identificationDetails[1] !== ''){
        document.getElementById("identificationURI").value = identificationDetails[0]
        document.getElementById("identificationName").value = identificationDetails[1]
    }

    document.getElementById("confirmation").value = getConfirmation()

}


const searchButton = document.getElementById("findIdentifications")
searchButton.addEventListener("click", searchIdentifications)

const form = document.getElementById("xForm")
form.addEventListener("change", setHiddenFields)

const unknownIdentification = document.getElementById("unknownIdentification")
unknownIdentification.addEventListener("change", disableFields)

