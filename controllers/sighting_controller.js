const bodyParser = require("body-parser")
const multer = require('multer')
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
  const {sort, long, lat, name} = req.query
  const queryObject = {}

  if (sort == 'distance') {
    queryObject.location = {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [parseInt(long), parseInt(lat)]
        }
      }
    }
  }
  if (name) {
    queryObject.identificationId = {$regex: name, $options: 'i'}
  }
  let result = Sighting.find(queryObject).populate('userId')

  if (sort == 'recent') {
    result = result.sort('dateTime')
  }
  if (sort == 'alphabetical') {
    result = result.sort('identificationId')
  }

  /*
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 5;
  const skip = (page - 1) * limit;

  result = result.skip(skip).limit(limit)
  */

  result = await result.exec()

  res.render('sighting/index', {sightings: result})

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
>>>>>>> 7a9e4a5 (implement sighting sort by distance and most recent without have to render a new page -> an issue with this is that when you enter a sighting and return to the index, the sort will not be maintained and the timeAsUTC method doesn't work because of the way sort by distance is calculated)
}

exports.create = async (req, res) => {
    let body = req.body
    const user = await User.findUser(body.user)
    let sighting = new Sighting({
        identificationId: body.identification,
        userId: user,
        location: body.location,
        description: body.description,
        dateTime: new Date(body.dateTime),
        image: Helper.extractFilePathOrURL(req)
    })

    sighting.save(async function (err, results) {
        if (err) {
            res.status(500).send('Invalid data!')
        } else {
            const findSightingByIdentification = async (identificationId, userId) => {
                try {
                    return await Sighting.findOne(
                        {
                            identificationId: identificationId,
                            userId: userId
                        }
                    ).populate('userId').exec()
                } catch (e) {
                    console.error(e)
                }
            }
            const sightingDb = await findSightingByIdentification(sighting.identificationId, sighting.userId)
            res.redirect(`/sighting/show/${sightingDb._id}`)
        }
    })
}

exports.index = (req, res) => {
    Sighting.find().populate('userId').exec(function (err, sightings) {
        if (err) err.type = 'database'

        res.render('sighting/index', { sightings: sightings })
    })
}

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
    })
}

exports.get_server_data = async (req, res) => {
    // takes user ID and returns all sightings connected to that user
    // + messages connected to those sightings
    // + all the sightings but with bare min data birdID, userID, location & time

    let json = {}


    // split into messages controller and sighting controller
    Sighting.find().populate('userId').exec(function (err, sightings) {
        if (err) err.type = 'database'

        json['sightings'] = sightings

        Message.find().populate('sender').exec(function (err, messages) {
            if (err) err.type = 'database'

            json['messages'] = messages

            res.status(200).json({data: json})
        })
    })
}

exports.update_server_data = async (req, res) => {
    // recieves and updates server with new sighting

    let body = req.body

    const user = await User.findUser(body.userId)
    let sighting = new Sighting({
        identificationId: body.identificationId,
        userId: user,
        location: body.location,
        description: body.description,
        dateTime: new Date(body.dateTime),
        image: Helper.extractFilePathOrURLFromJSON(body)
    })

    sighting.save(async function (err, results) {
        if (err) {
            res.status(500).send('Invalid data!')
        } else {
            res.status(200)
        }
    })
}
