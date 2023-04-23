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
	const temp = body.location.split(','),
		longitude = Number(temp[0]), latitude = Number(temp[1])
	console.log(typeof longitude + " " + longitude)
    const image = await Helper.getImageFormReq(req)
	let sighting = new Sighting({
		identificationURI: body.identificationURI,
		identificationName: body.identificationName,
		confirmation: body.confirmation,
		userId: user,
		location: {
			type: 'Point',
			coordinates: [longitude, latitude]
		}, // -> this needs to be updated to be a numbered coordinate
		description: body.description,
		dateTime: new Date(body.dateTime),
		image: image
	})

    sighting.save(async function (err, results) {
        if (err) {
			console.log(req.body);
            console.log(results);
            console.log(err);
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
		result = result.sort('dateTime')
	}
	if (sort == 'alphabetical') {
		result = result.sort('identificationName')
	}

	/*
	const page = Number(req.query.page) || 1
	const limit = Number(req.query.limit) || 5
	const skip = (page - 1) * limit

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
}

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

//render edit page for a given sighting
exports.edit = (req, res) => {
	sighting_id = req.params.id;
	Sighting.findById(sighting_id).populate('userId').exec(async function (err, sighting) {
		if (err) {
			err.type = 'database'
		} else {
			res.render('sighting/edit', {
				sighting: sighting
			})
		}
	})
}
