let mongoose = require('mongoose');
var Schema = mongoose.Schema;

const sighting = new Schema({
  active: {type: Boolean, default: true},
  userId: {type: String, required: true},
  description: {type: String, required: true, max:280},
  dateTime: {type: Date, required: true},
  identificationId: {type: String},
  location: {
    type: {
      type: String, // Don't do `{ location: { type: String } }`
      enum: ['Point'], // 'location.type' must be 'Point'
      required: true
    },
    coordinates: {
      type: [Number], // Long, Lat
      required: true
    }
  },
  image: {type: String}
});

var Sighting = mongoose.model('Sighting', sighting);
module.exports = Sighting;