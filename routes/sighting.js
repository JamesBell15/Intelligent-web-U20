let express = require('express')
let multer = require('multer')
let storage = multer.memoryStorage()
let upload = multer({storage: storage})
let router = express.Router()


const sighting_controller = require("../controllers/sighting_controller")
const db_controller = require("../controllers/db_controller")

// Routes accociated with online sightings
router.get("/sighting/index", sighting_controller.index)
router.get("/sighting/show", sighting_controller.index)
router.get("/sighting/show/:id", sighting_controller.show)
router.get("/sighting/new", sighting_controller.new)
router.post("/sighting/new", upload.single('sightingImage'), sighting_controller.create)
router.get("/sighting/edit/:id", sighting_controller.edit)

// Routes accociated with online chat messages
const User = require('../models/user')
router.post('/api/data/users', async function (req, res) {
    const userToQuery = await User.findUser(req.body.name)
    res.json(userToQuery)
})

// Routes accociated with syncing server and client db
router.get("/db/get/:username", db_controller.get_server_data)
router.post("/db/sighting/update", db_controller.update_sighting_data)
router.post("/db/message/update", db_controller.update_message_data)

module.exports = router
