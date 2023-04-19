let mongoose = require('mongoose')
let Schema = mongoose.Schema

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