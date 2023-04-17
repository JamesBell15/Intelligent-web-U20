let mongoose = require('mongoose')
let Schema = mongoose.Schema

//sightingId - link to the sighting this identification is for - points to the sighting object
//birdName - name of the identified bird (eg: "Mockingbird") - should be dbpedia page label (unless offline)
//birdURI - URI of the bird's DBPedia knowledge graph resource page
    //null if sighting made offline, since DBPedia won't be accessible (also default)
    //must be set when user is online, either during creation or editing
//confirmation - confidence/status of the particular sighting - unknown, unconfirmed, confirmed
    //unknown = bird identification is unknown, no supplementary URI
    //unconfirmed = identification is not confirmed, may have supplementary URI if the sighting was created online
    //confirmed = identification has been confirmed (either set when creating sighting when online, or editing later)

const sighting = new Schema({
    active: {type: Boolean, default: true},
    userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    description: {type: String, required: true, max:280},
    dateTime: {type: Date, required: true},
    identificationName: {type: String, required:true},
    identificationURI: {type: String, required: true, default: null},
    confirmation: {type:String, default: "unknown"},
    location: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    image: {
        data: { type: String, set: binaryString },
        contentType: { type: String },
        url: { type: String },
    },
})

sighting.index({ "location": "2dsphere" })

sighting.methods.timeAsUTC = function() {
    return this.dateTime.toUTCString()
}

sighting.statics.findSighting = async (sightingId) => {
    try {
        return await Sighting.findById(sightingId).exec()
    } catch (e) {
        console.error(e)
    }
}

function binaryString(data) {
    if (data != null)
    return data.toString('base64')
}

var Sighting = mongoose.model('Sighting', sighting)
module.exports = Sighting