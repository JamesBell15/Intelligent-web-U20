var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

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
