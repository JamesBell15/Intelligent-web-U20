var express = require('express');
var multer = require('multer');
var storage = multer.diskStorage({
destination: function (req, file, cb) {
    cb(null, 'public/uploads/');
  },
  filename: function (req, file, cb) {
    var original = file.originalname;
    var file_extension = original.split(".");
    // Make the file name the date + the file extension
    filename = Date.now() + '.' + file_extension[file_extension.length-1];
    cb(null, filename);
  }
});
var upload = multer({ storage: storage });
var router = express.Router();

const sighting_controller = require("../controllers/sighting_controller");

router.get("/sighting/index", sighting_controller.index)
router.get("/sighting/show/:id", sighting_controller.show)
router.get("/sighting/new", sighting_controller.new);
router.post("/sighting/new", upload.single('sightingImage'), sighting_controller.create);

const messagesController = require('../controllers/messages')
router.post('/api/data/messages', function (req, res) {
    const room = req.body.room
    messagesController.getMessagesForRoom(room, (messages) => {
        res.json(messages)
    })
})

const usersController = require('../controllers/user')

router.post('/api/data/users', function(req, res) {
    const userToQuery = req.body.name
    usersController.findUser(userToQuery, (docs) => {
        res.json(docs)
    })
})

/**
 * Should be the home page rather than '/chat'
 */
router.get('/chat', function(req, res, next) {
  messagesController.getRooms(
      (result) => {
        if (result.length > 0) {
            res.render('chat', {rooms: result})
        } else {
          // Need to implement display message in ejs.
          res.render('chat', {message: 'There are no existing rooms.'})
        }
      }
  )
})

router.get('/test', function(req, res, next) {
  res.render('user');
})

module.exports = router;
