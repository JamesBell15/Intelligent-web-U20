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