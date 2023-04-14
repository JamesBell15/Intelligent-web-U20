const searchIdentifications = () =>{
    console.log("searching for birds matching name entered");
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
            let dropdownLabel = document.getElementById("identificationLabel");
            for (i in bindings){
                //create option per result from query
                let opt = document.createElement("option");
                let bird = bindings[i];
                opt.value = bird.bird.value;
                opt.innerHTML = bird.label.value;
                dropdown.appendChild(opt);
            }
            //make dropdown & label visible
            dropdown.style.visibility= "visible";
            dropdownLabel.style.visibility= "visible";
        });
}

let searchButton = document.getElementById("findIdentifications");
searchButton.addEventListener("click", searchIdentifications);