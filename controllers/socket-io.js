const messageController = require('../controllers/messages.js')
const messageModel = require('../models/messages')

exports.init = function(io) {
    io.sockets.on('connection', function (socket) {
        try {
            socket.on('create or join', (room, name) => {
                messageModel.find({post:room}).then(result => {
                    console.log(name+' => '+room)
                    socket.join(room)
                    socket.emit('history', result)
                })
            })
            socket.on('send msg', (room, name, msg) => {
                console.log(name+' => '+room+': '+msg)
                const data = {
                    sender: name,
                    post: room,
                    msg: msg
                }
                messageController.insert(data)
                io.to(room).emit('msg', data)
            })
            socket.on('disconnect', (room) => {
                socket.leave(room)
            })
        } catch (e) {
            console.error(e)
        }
    })
}