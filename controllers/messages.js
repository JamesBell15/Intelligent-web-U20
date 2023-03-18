const Message = require('../models/messages')
const mongoose = require('mongoose')

/**
 * Controller might be useless as you can't use socket.io here BUT you can in socket-io.js
 */

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