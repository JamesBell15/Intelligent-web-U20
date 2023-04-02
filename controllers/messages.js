const Message = require('../models/messages')
const mongoose = require('mongoose')

exports.insert = (data) => {
    let message = new Message({
        sender: data.sender,
        post: data.post,
        msg: data.msg
    })
    message.save((err, results) => {
        if (err) return console.error(err)
        console.log(results+' saved')
    })
}

exports.getRooms = (onSuccess) => {
    Message.distinct('post').then(result => {
        onSuccess(result)
    }).catch(err => {
        console.error(err)
    })
}

exports.getMessagesForRoom = (room, onSuccess) => {
    Message.find({post:room}).then(result => {
        onSuccess(result)
    }).catch(err => {
        console.error(err)
    })
}