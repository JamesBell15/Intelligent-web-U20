var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

const messagesController = require('../controllers/messages')
const {response} = require("express");
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

/**
 *
 * Un-used but maybe useful later.
 *
let username, coordinates
let loginStatus = false
router.post('/chat', function(req, res) {
    username = req.body.username
    coordinates = req.body.coords
    loginStatus = req.body.loginStatus
    console.log(req.body)
    res.json({
      username: username,
      coords: coordinates,
      loginStatus: loginStatus
    })
})
 **/

router.get('/test', function(req, res, next) {
  res.render('user');
})

module.exports = router;
