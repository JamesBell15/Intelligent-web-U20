const User = require('../models/user')
const mongoose = require('mongoose')
mongoose.set('useFindAndModify', false) // avoid deprecation warning when using findOneAndUpdate

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
                //console.log('updated user location')
            })
        } else {
            user.save((err, results) => {
                if (err) return console.error(err)
                //console.log(results+' saved')
            })
        }
    })
}

/**
 exports.findUser = (name, onSuccess) => {
    User.findOne({username: name}, (err, docs) => {
        if (err) console.error(err)
        onSuccess(docs)
    })
}
 **/

exports.findUser = async (name) => {
    try {
        return await User.findOne({username: name}).exec()
    } catch (e) {
        console.error(e)
    }
}