let mongoose = require('mongoose');
var Schema = mongoose.Schema;

const sighting = new Schema({
    active: {type: Boolean, default: true},
    userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    description: {type: String, required: true, max: 280},
    dateTime: {type: Date, required: true},
    identificationId: {type: String},
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
    }, // shouldn't be a string
    image: {type: String, set: normalisePath}
});

sighting.index({location: '2dsphere'});

sighting.methods.timeAsUTC = function () {
    return this.dateTime.toUTCString();
};

sighting.statics.findSighting = async (sightingId) => {
    try {
        return await Sighting.findById(sightingId).exec()
    } catch (e) {
        console.error(e)
    }
}

sighting.statics.sortByDistance = async (coordinates) => {
    try {
        const sightings = await Sighting.aggregate([
            {
                $geoNear: {
                    near: {type: 'Point', coordinates: coordinates},
                    distanceField: 'dist.calculated',
                    spherical: true
                }
            },
            {$sort: {distance: 1}}
        ])
        await Sighting.populate(sightings, {path: 'userId'})
        return sightings
    } catch (e) {
        console.error(e)
    }
}

sighting.statics.sortByRecent = async () => {
    try {
        const sightings = await Sighting.find({}).populate('userId').sort({dateTime: 1}).exec()
        return sightings
    } catch (e) {
        console.error(e)
    }
}

// Method to handel url images and those stored directly in the DB
function normalisePath(path) {
    let url;

    try {
        url = new URL(path);
    } catch (_) {
        return String(path).replace('\\', '/').replace('public/', '/');
    }

    return url
};

var Sighting = mongoose.model('Sighting', sighting);
module.exports = Sighting;