const bodyParser = require("body-parser")
const multer = require('multer')
const Helper = require('../helpers/controller_helpers/sighting')
const Sighting = require('../models/sighting')
const Identification = require('../models/identification')

exports.create = async (req, res) => {
    let body = req.body
    let identification = new Identification({
        sightingId: body.sightingId,
        birdName: body.birdName,
        birdURI: body.birdURI,
        confirmation: body.confirmation
    })

    identification.save(async function (err, results) {
        if (err) {
            //console.log(results);
            //console.log(err);
            res.status(500).send('Invalid data!')
        } else {
            const findIdentificationBySighting = async (sightingId) => {
                try {
                    return await Identification.findOne(
                        {
                            sightingId: sightingId
                        }
                    ).populate('sightingId').exec()
                    //what am i populating here
                    //giving sighting an Identification
                    //or giving the identification a sighting
                    //probably the first
                } catch (e) {
                    console.error(e)
                }
            }
            const identificationDb = await findIdentificationBySighting(identification.sightingId)
            //do i want a redirect here, the identification is going to be a partial rather than its own page
            res.redirect(`/sighting/show/${identificationDb._id}`)
        }
    })
}

//is this needed for identifications
//since we only want to get details from an identification object linked to a sighting
exports.show = (req, res) => {
    identification_id = req.params.id
    //same here, what am i populating
    //or is this just sighting specific stuff
    Identification.findById(identification_id).populate('userId').exec(async function (err, sighting) {
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
/*
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
            //console.log(results);
            //console.log(err);
            res.status(500).send('Invalid data!')
        } else {
            res.status(200)
        }
    })
}
*/