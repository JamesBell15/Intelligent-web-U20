//get details of bird from related DBPedia page

let uri = document.getElementById("DBPediaURI").href
// The DBpedia SPARQL endpoint URL being queried
const endpointUrl = "https://dbpedia.org/sparql"

// SPARQL query to return a list of birds with names similar to the entered query
// TODO: get names that are "similar" / "LIKE" the query in case of misspellings
// TODO: get some way of prioritising "more relevant" entities
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

// Use fetch to retrieve the data
if(uri === "unknown") {
    let dataBox = document.getElementById("DBPediaData")
    dataBox.style.display = "hidden"
}
else{
    fetch(url)
        .then(response => response.json())
        .then(data => {
            // The results are in the 'data' object
            let bindings = data.results.bindings
            let result = JSON.stringify(bindings)
            //create and populate div with the info received from DBPedia
            let dataBox = document.getElementById("DBPediaData")
            let bird = bindings[0];
            console.log(bindings[0])

            //get and display name of bird from DBPedia entry
            let name = document.getElementById("DBPName")
            name.innerHTML = bird.label.value + " "

            //move link into name element now it's populated (would otherwise be overwritten)
            let link = document.getElementById("DBPediaURI")
            name.appendChild(link);

            //get latin binomial nomenclature (append genus and species)
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

            let birdImg = document.getElementById("DBPthumbnail")
            //get dbpedia entry's image (if present)
            if("thumbnail" in bird){
                birdImg.src = bird.thumbnail.value
            }
            //add image caption as alt & hover text
            if("caption" in bird) {
                console.log(bird.caption)
                birdImg.title= bird.caption.value
                birdImg.alt = "image of: " + bird.caption.value
            }
            console.log(birdImg)
            //add description ("abstract" attribute of DBPedia entry, which is always present)
            let description = document.getElementById("DBPDescription")
            description.innerHTML = bird.abstract.value
        }).catch(err => {console.log(err)});
}

