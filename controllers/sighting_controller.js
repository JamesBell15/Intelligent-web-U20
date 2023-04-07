var bodyParser = require("body-parser");
var multer = require('multer');
const Sighting = require('../models/sighting')
const Helper = require('../helpers/controller_helpers/sighting')

exports.new = (req, res) => {
  res.render('sighting/new');
};

exports.create = (req, res) => {
  let body = req.body
  let sighting = new Sighting({
    identificationId: body.identification,
    userId: 'TODO',
    location: body.location,
    description: body.description,
    dateTime: new Date(body.dateTime),
    image: Helper.extractFilePathOrURL(req)
  });

  sighting.save(function (err, results) {
      if (err) {
        res.status(500).send('Invalid data!');
      }else {
        res.render('sighting/create', {sighting: sighting})
      }
    }
  );
};

exports.index = (req, res) => {
  Sighting.find().exec(function (err, sightings) {
    if (err) err.type = 'database';

    res.render('sighting/index', { sightings: sightings });
  });
};

exports.show = (req, res) => {
  sighting_id = req.params.id
  Sighting.findById(sighting_id).exec(function (err, sighting) {
    if (err) err.type = 'database';

    res.render('sighting/show', { sighting: sighting });
  });
}

exports.refresh = (req, res) => {
  res.status(200).json({hi: 'hello'})
}