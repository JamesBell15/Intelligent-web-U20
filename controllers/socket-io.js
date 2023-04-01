const messageController = require('../controllers/messages.js')
const userController = require('../controllers/user.js')
const messageModel = require('../models/messages')
const userModel = require('../models/user')

exports.init = function(io) {
    io.sockets.on('connection', function (socket) {
        try {
            // Sockets need renaming
            socket.on('create or join', (room) => {
                messageModel.find({post:room}).then(result => {
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


            // NEED to update lists of chat rooms/posts when one is created from another user.


            // get rooms not needed
            socket.on('get rooms', () => {
                messageModel.distinct('post').then(result => {
                    socket.emit('rooms in', result)
                    console.log(result)
                })
            })
            // INTERACTIONS WITH USER DB
            socket.on('login/register', (data) => {
                userController.insert(data)
                // I want to be able to differentiate between an update and a register to create a different alert in response.
                // i.e. alert to say if you want to make changes to a user's location -> alert might include the user's most current location in DB for reference.
                // Might not be necessary and just overkill.
                // The only way I can think of doing this is by accessing userModel from here and emitting a message using socket to indicate if the user
                // is a duplicate.
                socket.emit('login status')
            })

            socket.on('leave chatroom', (room) => {
                socket.leave(room)
            })
        } catch (e) {
            console.error(e)
        }
    })
}