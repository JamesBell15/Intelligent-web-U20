var bodyParser = require("body-parser");
var multer = require('multer');
const Helper = require('../helpers/controller_helpers/sighting')
const Sighting = require('../models/sighting')
const User = require('../models/user')
const Message = require('../models/messages')

exports.new = (req, res) => {
  res.render('sighting/new');
};

exports.create = async (req, res) => {
  let body = req.body
  const user = await User.findUser(body.user)
  const temp = body.location.split(','),
      longitude = Number(temp[0]), latitude = Number(temp[1])
  console.log(typeof longitude + " " + longitude)
  let sighting = new Sighting({
    identificationId: body.identification,
    userId: user,
    location: {
      type: 'Point',
      coordinates: [longitude, latitude]
    }, // -> this needs to be updated to be a numbered coordinate
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

exports.index = async (req, res) => {
  Sighting.find().populate('userId').exec(function (err, sightings) {
    if (err) err.type = 'database';
    res.render('sighting/index', {sightings: sightings});
  });

  /**
   //1 Paris - 2.3291015625000004, 48.864714761802794
   //2 NY - -73.97094726562501, 40.697299008636755
   //3 London - -0.087890625, 51.45400691005982
   //4 Sheffield - -1.4282226562500002, 53.31774904749089
   //5 Tokyo - 139.74609375000003, 35.67068501330238
   **/
};

exports.show = (req, res) => {
  sighting_id = req.params.id
  Sighting.findById(sighting_id).populate('userId').exec(async function (err, sighting) {
    if (err) {
      err.type = 'database'
    } else {
      const messages = await Message.findMessagesForSighting(sighting)
      console.log(messages)
      res.render('sighting/show', {
        sighting: sighting, messages: messages
      })
    }

  });
}

