/*data relating to identification
    birdName - name of the identified bird (eg: "Mockingbird") - should be dbpedia page label (unless offline)
    birdURI - URI of the bird's DBPedia knowledge graph resource page
        null if sighting made offline, since DBPedia won't be accessible (also default)
        must be set when user is online, either during creation or editing
    confirmation - confidence/status of the particular sighting - unknown, unconfirmed, confirmed
        unknown = bird identification is unknown, no supplementary URI
        unconfirmed = identification is not confirmed, may have supplementary URI if the sighting was created online
        confirmed = identification has been confirmed (either set when creating sighting when online, or editing later)
*/

//get selection of bird species from DBPedia similar to search term
const searchIdentifications = () =>{
    let birdName = document.getElementById("identificationSearch").value;

    // The DBpedia SPARQL endpoint URL being queried
    const endpointUrl = "https://dbpedia.org/sparql";

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
        } LIMIT 15`;

    // Encode the query as a URL parameter
    const encodedQuery = encodeURIComponent(sparqlQuery);
    // Build the URL for the SPARQL query
    const url = `${endpointUrl}?query=${encodedQuery}&format=json`;

    // Use fetch to retrieve the data
    fetch(url)
        .then(response => response.json())
        .then(data => {
            // The results are in the 'data' object
            let bindings = data.results.bindings;
            let result = JSON.stringify(bindings);
            //add each returned value to dropdown


            let dropdown = document.getElementById("identification");
            let identificationWrapper = document.getElementById("identificationInputs");
            for (i in bindings){
                //create option per result from query
                let opt = document.createElement("option");
                let bird = bindings[i];
                opt.value = bird.bird.value;
                opt.innerHTML = bird.label.value;
                dropdown.appendChild(opt);
            }
            //make inputs visible as they are now populated
            identificationWrapper.style.visibility= "visible";
        });
}

const searchButton = document.getElementById("findIdentifications");
searchButton.addEventListener("click", searchIdentifications);

//get confirmation status of sighting
//returns "unknown", "unconfirmed" and "confirmed" (lowercase)
function getConfirmation() {
    console.log("getting confirmation");
    //if user has checked the "unknown" checkbox
    if(document.getElementById("unknownIdentification").checked){
        return "unknown";
    }
    //if no options are present, but user has not checked the "unknown" checkbox (user is offline)
    else if(!optionsPopulated()){
        return "unconfirmed";
    }
    //if user has selected the "identification confirmed" checkbox
    else if(document.getElementById("confirmIdentification").value){
        return "confirmed"
    }
    //otherwise, identification is unconfirmed
    else{
        return "unconfirmed"
    }
}

//check if identification options section is populated
//returns true if there are options in the dropdown
function optionsPopulated(){
    console.log("checking if options populated");
    console.log(document.getElementById("identification").options.length)
    if (document.getElementById("identification").options.length < 1){return false}
    else{return true}
}

//get identifications (DBPedia URI and label) from frontend
//handles different input selections
function getIdentificationDetails(){
    let details = ["",""];
    console.log(getConfirmation());
    //if user has selected "unknown", ignore other inputs
    if (getConfirmation() === "unknown"){
        return details;
    }
    //if no options are provided (user offline or naming is incorrect)
    else if (!optionsPopulated()){
        //no options provided, so don't try to get value from dropdown
        //use entered search term instead in lieu of a verified identification
        details[1] = document.getElementById("identificationSearch").value;
    }
    //otherwise, there should be options to select from
    else{
        let identification = document.getElementById("identification");
        //get identification DBPedia URI (value of dropdown selection)
        details[0] = identification.value;
        //get name of bird (label attribute of DBPedia resource)
        details[1] = identification.options[identification.selectedIndex].text;
    }
    console.log(details);
    return details;
}

//set values of hidden fields to be sent in form
//occurs whenever fields are edited
function setHiddenFields(){
    let identificationDetails = getIdentificationDetails();
    console.log(identificationDetails);
    document.getElementById("identificationURI").value = identificationDetails[0];
    document.getElementById("identificationName").value = identificationDetails[1];
    document.getElementById("confirmation").value = getConfirmation();
}

const form = document.getElementById("xForm");
form.addEventListener("change", setHiddenFields);
