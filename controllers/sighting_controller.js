var bodyParser = require("body-parser");
var multer = require('multer');
const Sighting = require('../models/sighting')

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
    image: req.file.path
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
