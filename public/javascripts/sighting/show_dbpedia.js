/*
    getting details of bird species by querying DBPedia
    uses a supplied URI to obtain data about the bird species
    display details alongside the additional information for a sighting
 */

let uri = document.getElementById("DBPediaURI").href
// The DBpedia SPARQL endpoint URL being queried
const endpointUrl = "https://dbpedia.org/sparql"

// SPARQL query to return details from the resource of the specified bird (using supplied URI)
//DBPedia entry may not have all desired fields populated, so some are optional
const sparqlQuery = `
    PREFIX dbo: <http://dbpedia.org/ontology/>
    PREFIX dbprop: <http://dbpedia.org/property/>
    PREFIX dbr: <http://dbpedia.org/resource/>
    
    select distinct ?label ?abstract ?species ?genus ?thumbnail ?caption
    where {
        <`+uri+`> rdf:type dbo:Bird;
            rdfs:label ?label;
            dbo:abstract ?abstract.
        OPTIONAL{
        <`+uri+`> dbp:genus ?genus.}
        OPTIONAL{
        <`+uri+`> dbp:species ?species.}
        OPTIONAL{
        <`+uri+`> dbo:thumbnail ?thumbnail.}
        OPTIONAL{
        <`+uri+`> dbprop:imageCaption ?caption.}
        FILTER(langMatches(lang(?label), "en" ))
        FILTER(langMatches(lang(?abstract), "en" ))
        FILTER(langMatches(lang(?caption), "en" ))
    } LIMIT 15`


// Encode the query as a URL parameter
const encodedQuery = encodeURIComponent(sparqlQuery)
// Build the URL for the SPARQL query
const url = `${endpointUrl}?query=${encodedQuery}&format=json`


//if sighting has not got an identification linked to DBPedia, don't display the section
if(document.getElementById("identificationURI").value === "unknown") {
    let dataBox = document.getElementById("DBPediaData")
    dataBox.style.display = "none"
}
else{
    // Use fetch to retrieve the data
    fetch(url)
        .then(response => response.json())
        .then(data => {
            // results contained in the data object
            let bindings = data.results.bindings
            let result = JSON.stringify(bindings)

            //create and populate div with the info received from DBPedia:

            let dataBox = document.getElementById("DBPediaData")
            let bird = bindings[0]

            //name of bird
            let name = document.getElementById("DBPName")
            name.innerHTML = bird.label.value + " "


            //move DBPedia link element into name element (to display it next to it)
            let link = document.getElementById("DBPediaURI")
            name.appendChild(link)


            //latin binomial nomenclature (append genus and species)
            let latinName = ""
            //values may not have been present in dbpedia entry
            if("genus" in bird){
                latinName += bird.genus.value + " "
            }
            if("species" in bird){
                latinName += bird.species.value
            }
            let latin = document.getElementById("DBPLatinName")
            latin.innerHTML = latinName

            //get dbpedia entry's image (if present)
            let birdImg = document.getElementById("DBPthumbnail")
            if("thumbnail" in bird){
                birdImg.src = bird.thumbnail.value
            }

            //add image caption as alt & hover text
            if("caption" in bird) {
                birdImg.title= bird.caption.value
                birdImg.alt = "image of: " + bird.caption.value
            }


            //add description ("abstract" attribute of DBPedia entry)
            let description = document.getElementById("DBPDescription")
            description.innerHTML = bird.abstract.value
        }).catch(err => {console.log(err)})
}

