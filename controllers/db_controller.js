const Sighting = require('../models/sighting')
const User = require('../models/user')
const Message = require('../models/messages')
const Helper = require('../helpers/controller_helpers/db')

exports.get_server_data = async (req, res) => {
    // takes user ID and returns all sightings connected to that user
    // + messages connected to those sightings
    // + all the sightings but with bare min data birdID, userID, location & time

    username = req.params.username

    // const user = await User.findUser(username)

    let json = {sightings: {}, messages: {}}
    // split into messages controller and sighting controller
    Sighting.find().populate('userId').exec(function (err, sightings) {
        if (err) err.type = 'database'

        for (let sighting of sightings) {
            if (sighting.userId.username == username) {
                json['sightings'][`${sighting.id}`] = sighting
            } else {
                let reducedSighting = {
                    identificationName: sighting.identificationName,
                    userId: sighting.userId,
                    location: sighting.location,
                    dateTime: sighting.dateTime
                }

                json['sightings'][`${sighting.id}`] = reducedSighting
            }
        }

        Message.find().populate('sender').exec(function (err, messages) {
            if (err) err.type = 'database'

            json['messages'] = messages

            res.status(200).json({data: json})
        })
    })
}

exports.update_sighting_data = async (req, res) => {
    // recieves and updates server with new sighting

    let body = req.body

    const user = await Helper.resolveNoUser(body.userId, body.location)

    let sighting = new Sighting({
        identificationURI: body.identificationURI,
        identificationName: body.identificationName,
        confirmation: body.confirmation,
        userId: user,
        location: body.location,
        description: body.description,
        dateTime: new Date(body.dateTime),
        image: body.image
    })

    sighting.save(async function (err, results) {
        if (err) {
            console.log(err)
            res.status(500).send('Invalid data for sighting!')
        } else {
            res.status(200).json({postId: results._id})
        }
    })
}

exports.update_message_data = async (req, res) => {
    let body = req.body

    const user = await User.findUser(body.senderId)

    let message = new Message({
        sender: user.id,
        post: body.postId,
        msg: body.msg,
        createdAt: body.createdAt
    })

    message.save(async function (err, results) {
        if (err) {
            console.log(err)
            res.status(500).send('Invalid data for message!')
        } else {
            res.status(200)
        }
    })
}