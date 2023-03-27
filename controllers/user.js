const User = require('../models/user')
const mongoose = require('mongoose')
mongoose.set('useFindAndModify', false) // avoid deprecation warning when using findOneAndUpdate

/**
 * Controller might be useless as you can't use socket.io here BUT you can in socket-io.js
 */

exports.insert = (data) => {
    let user = new User({
        username: data.username,
        location: {
            type: 'Point',
            coordinates: data.coords
        }
    })
    // Checks if user exists -> Might want to rename method so this is known intuitively
    User.find({username: data.username}, (err, docs) => {
        if (err) return console.error(err)
        if (docs.length) {
            const query = {'username': data.username}
            const update = {'location': {
                                'type': 'Point',
                                'coordinates': data.coords
                           }}
            User.findOneAndUpdate(query, update, () => {
                if (err) return console.error(err)
                console.log('updated user location')
            })
        } else {
            user.save((err, results) => {
                if (err) return console.error(err)
                console.log(results+' saved')
            })
        }
    })
}