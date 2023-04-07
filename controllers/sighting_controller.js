var bodyParser = require("body-parser");
var multer = require('multer');
const Sighting = require('../models/sighting')
const Helper = require('../helpers/controller_helpers/sighting')
const messageController = require('../controllers/messages')
const userController = require('../controllers/user')

exports.new = (req, res) => {
  res.render('sighting/new');
};

exports.create = async (req, res) => {
  let body = req.body
  const user = await userController.findUser(body.user)
  let sighting = new Sighting({
    identificationId: body.identification,
    userId: user,
    location: body.location,
    description: body.description,
    dateTime: new Date(body.dateTime),
    image: Helper.extractFilePathOrURL(req)
  });

  sighting.save(async function (err, results) {
        if (err) {
          res.status(500).send('Invalid data!');
        } else {
          const findSightingByIdentification = async (identificationId, userId) => {
            try {
              return await Sighting.findOne({identificationId: identificationId, userId: userId}).populate('userId').exec()
            } catch (e) {
              console.error(e)
            }
          }
          const sightingDb = await findSightingByIdentification(sighting.identificationId, sighting.userId)
          res.redirect(`/sighting/show/${sightingDb._id}`)
        }
      }
  );
};

exports.index = (req, res) => {
  Sighting.find().populate('userId').exec(function (err, sightings) {
    if (err) err.type = 'database';

    res.render('sighting/index', { sightings: sightings });
  });
};

exports.show = (req, res) => {
  sighting_id = req.params.id
  Sighting.findById(sighting_id).populate('userId').exec(async function (err, sighting) {
    if (err) {
      err.type = 'database'
    } else {
      const messages = await messageController.findMessagesForSighting(sighting)
      console.log(messages)
      res.render('sighting/show', {
        sighting: sighting, messages: messages
      })
    }

  });
}

// prob can delete, dont think this is used
exports.getSighting = (sightingID, onSuccess) => {
  Sighting.findById({_id: sightingID}).then(result => {
    onSuccess(result)
  }).catch(err => {
    console.error(err)
  })
}

exports.findSighting = async (sightingID) => {
  try {
    return await Sighting.findById(sightingID).exec()
  } catch (e) {
    console.error(e)
  }
}

