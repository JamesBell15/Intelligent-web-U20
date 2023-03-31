let mongoose = require('mongoose');
var Schema = mongoose.Schema;

const sighting = new Schema({
  active: {type: Boolean, default: true},
  userId: {type: String, required: true},
  description: {type: String, required: true, max:280},
  dateTime: {type: Date, required: true},
  identificationId: {type: String},
  location: {type: String},
  image: {type: String, set: normalisePath}
});

sighting.methods.timeAsUTC = function() {
  return this.dateTime.toUTCString();
};

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