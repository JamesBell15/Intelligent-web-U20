/*
	Controller for sightings. The methods below are used to render pages or redirect to other pages sometimes after fulfilling
	another task such as adding a new entry to the database.
 */

const bodyParser = require("body-parser")
const multer = require('multer')
const Helper = require('../helpers/controller_helpers/sighting')
const Sighting = require('../models/sighting')
const User = require('../models/user')
const Message = require('../models/messages')

// GET
exports.new = (req, res) => {
	res.render('sighting/new')
}

// POST
exports.create = async (req, res) => {
	let body = req.body

	const user = await User.findUser(body.user)
	const temp = body.location.split(','), longitude = Number(temp[0]), latitude = Number(temp[1])
    const image = await Helper.getImageFormReq(req)

	let sighting = new Sighting({
		identificationURI: body.identificationURI,
		identificationName: body.identificationName,
		confirmation: body.confirmation,
		userId: user,
		location: {
			type: 'Point',
			coordinates: [longitude, latitude]
		},
		description: body.description,
		dateTime: new Date(body.dateTime),
		image: image
	})

    sighting.save(async function (err, results) {
        if (err) {
			console.log(req.body)
            console.log(results)
            console.log(err)
            res.status(500).send('Invalid data!')
        } else {
			//find sighting by timestamp and user that created it
            const findSighting = async (dateTime, userId) => {
                try {
                    return await Sighting.findOne(
                        {
                            dateTime: dateTime,
                            userId: userId
                        }
                    ).populate('userId').exec()
                } catch (e) {
                    console.error(e)
                }
            }
            const sightingDb = await findSighting(sighting.dateTime, sighting.userId)
            res.redirect(`/sighting/show/${sightingDb._id}`)
        }
    })
}

// GET
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
		queryObject.identificationName = {$regex: name, $options: 'i'}
	}

	let result = Sighting.find(queryObject).populate('userId')

	if (sort == 'recent') {
		result = result.sort('-dateTime')
	}
	if (sort == 'alphabetical') {
		result = result.sort('identificationName')
	}

	result = await result.exec()

	res.render('sighting/index', {sightings: result})
}

// GET
exports.show = (req, res) => {
    sighting_id = req.params.id

    Sighting.findById(sighting_id).populate('userId').exec(async function (err, sighting) {
        if (err) {
            err.type = 'database'
        } else {
            const messages = await Message.findMessagesForSighting(sighting)

            res.render('sighting/show', {
                sighting: sighting, messages: messages
            })
        }
    })
}

//update sighting object with new identification details
// POST
exports.update = async (req,res) => {
	let body = req.body
	let id = body.id
	let sighting = await Sighting.findOne({_id: id})

	sighting.identificationURI = body.identificationURI
	sighting.identificationName = body.identificationName
	sighting.confirmation = body.confirmation

	sighting.save(async (err, results) => {
		if (err) {
			console.log(req.body)
			console.log(results)
			console.log(err)
			res.status(500).send('Invalid data!')
		} else {
			res.redirect(`/sighting/show/${id}`)
		}
	})

}
