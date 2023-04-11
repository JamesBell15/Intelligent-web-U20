const bodyParser = require("body-parser")
const multer = require('multer')
const Helper = require('../helpers/controller_helpers/sighting')
const Sighting = require('../models/sighting')
const User = require('../models/user')
const Message = require('../models/messages')

exports.new = (req, res) => {
    res.render('sighting/new')
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
