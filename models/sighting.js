let mongoose = require('mongoose')
let Schema = mongoose.Schema

const sighting = new Schema({
    active: {type: Boolean, default: true},
    userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    description: {type: String, required: true, max:280},
    dateTime: {type: Date, required: true},
    identificationId: {type: String},
    location: location: {
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
        data: Buffer,
        contentType: String,
        url: String,
    },
})

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

sighting.statics.findSighting = async (sightingId) => {
	try {
		return await Sighting.findById(sightingId).exec()
	} catch (e) {
		console.error(e)
	}
}

// Method to handle url images and those stored directly in the DB
function normalisePath(path) {
	let url

	try {
		url = new URL(path)
	} catch (_) {
		return String(path).replace('\\', '/').replace('public/', '/')
	}

	return url
}

var Sighting = mongoose.model('Sighting', sighting)
module.exports = Sighting