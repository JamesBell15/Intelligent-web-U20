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

const messageController = require('../controllers/messages')

exports.show = (req, res) => {
  sighting_id = req.params.id
  Sighting.findById(sighting_id).exec(function (err, sighting) {
    if (err) err.type = 'database';
    messageController.getMessagesForRoom(sighting_id, (results) => {
      res.render('sighting/show', {
        sighting: sighting, messages: results
      });
    });

  });
}

exports.getSighting = (sightingID, onSuccess) => {
  Sighting.findById({_id: sightingID}).then(result => {
    onSuccess(result)
  }).catch(err => {
    console.error(err)
  })
}