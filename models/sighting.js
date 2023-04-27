let mongoose = require('mongoose')
let Schema = mongoose.Schema

const sighting = new Schema({
    active: {type: Boolean, default: true},
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