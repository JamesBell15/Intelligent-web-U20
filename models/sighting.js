let mongoose = require('mongoose');
var Schema = mongoose.Schema;

const sighting = new Schema({
  userId: {type: String, required: true},
  description: {type: String, required: true, max:280},
  dateTime: {type: Date, required: true},
  identificationId: {type: String},
  location: {type: String}
});

var Sighting = mongoose.model('Sighting', sighting);
module.exports = Sighting;