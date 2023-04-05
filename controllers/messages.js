const Message = require('../models/messages')
const mongoose = require('mongoose')

exports.insert = (data, onSuccess) => {
    let message = new Message({
        sender: data.sender,
        post: data.post,
        msg: data.msg
    })
    message.save((err, results) => {
        if (err) {
            return console.error(err)
        } else {
            console.log(results + ' saved')
            onSuccess()
        }
    })
}

exports.getRooms = (onSuccess) => {
    Message.distinct('post').then(result => {
        onSuccess(result)
    }).catch(err => {
        console.error(err)
    })
}

// probably can delete
exports.getMessagesForRoom = (room, onSuccess) => {
    Message.find({post:room}).then(result => {
        onSuccess(result)
    }).catch(err => {
        console.error(err)
    })
}

exports.findMessagesForSighting = async (sighting) => {
    try {
        return await Message.find({post: sighting}).populate(['sender', 'post']).exec()
    } catch (e) {
        console.error(e)
    }
}