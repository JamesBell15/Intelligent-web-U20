let mongoose = require('mongoose');
var Schema = mongoose.Schema;

const sighting = new Schema({
  active: {type: Boolean, default: true},
  userId: {type: String, required: true},
  description: {type: String, required: true, max:280},
  dateTime: {type: Date, required: true},
  identificationId: {type: String},
  location: {type: String},
  image: {type: String}
});

sighting.methods.timeAsUTC = function() {
  return this.dateTime.toUTCString();
};

// Method to handel url images and those stored directly in the DB
sighting.methods.getImageSrc = function() {
  let image_path = this.image
  let url;

  try {
    url = new URL(image_path);
  } catch (_) {
    return String(image_path).replace('public/', '/');
  }

  return url
};

var Sighting = mongoose.model('Sighting', sighting);
module.exports = Sighting;