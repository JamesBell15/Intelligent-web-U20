/*
    Model for a sighting. It has 8 parameters:

    userId - references a user in the database that the sighting is attached to.
    description - a description of the sighting.
    dateTime - the date and time the sighting was made.
    identificationName - the name of the bird that was sighted.
    identificationURI - a link to the corresponding DBpedia page for the bird identified in the sighting.
    confirmation - a boolean representing if the sighting was confirmed or not.
    location - the coordinates where the sighting was made which is stored as a GeoJSON object.
    image - either an image from a url or from a local device.

 */

let mongoose = require('mongoose')
let Schema = mongoose.Schema

const sighting = new Schema({
    userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    description: {type: String, required: true, max:280},
    dateTime: {type: Date, required: true},
    identificationName: {type: String, required:true, default: "unknown"},
    identificationURI: {type: String, required: true, default: "unknown"},
    confirmation: {type: String, default: "unknown"},
    location: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            // LONG, LAT
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

//get styling for the confirmation column entry (creates a FontAwesome symbol with relevant symbol)
sighting.methods.getConfirmationStyle = function() {
    switch(this.confirmation){
        case "confirmed":
            return ' class="fa-sharp fa-solid fa-circle-check fa-xl" style="color: #80ff80;"';
        case "unconfirmed":
            return ' class="fa-solid fa-circle-question fa-xl" style="color: #ff9f00;"';
        case "unknown":
            return ' class="fa-sharp fa-solid fa-circle-xmark fa-xl" style="color: #ff5959;"';
    }
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