let mongoose = require('mongoose');
var Schema = mongoose.Schema;

//Identification Model
//identification details for a specific sighting (1:1 relation)
//values will be updated (change identification, set confirmation status), unlike Sighting model attributes

//sightingId - link to the sighting this identification is for - points to the sighting object
//birdName - name of the identified bird (eg: "Mockingbird") - should be dbpedia page label (unless offline)
//birdURI - URI of the bird's DBPedia knowledge graph resource page
    //null if sighting made offline, since DBPedia won't be accessible (also default)
    //must be set when user is online, either during creation or editing
//confirmation - confidence/status of the particular sighting - unknown, unconfirmed, confirmed
    //unknown = bird identification is unknown, no supplementary URI
    //unconfirmed = identification is not confirmed, may have supplementary URI if the sighting was created online
    //confirmed = identification has been confirmed (either set when creating sighting when online, or editing later)


const identification = new Schema({
    sightingId: {type: mongoose.Schema.Types.ObjectId, ref: 'Sighting', required: true},
    birdName: {type: String, required: true},
    birdURI: {type: String, required: true, default:null},
    confirmation: {type: String, default:"unknown"}
});


identification.statics.findIdentification = async (identificationId) => {
    try {
        return await Identification.findById(identificationId).exec()
    } catch (e) {
        console.error(e)
    }
}

let Identification = mongoose.model('Identification', identification);
module.exports = Identification;