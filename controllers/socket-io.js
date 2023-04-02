const messageController = require('../controllers/messages.js')
const userController = require('../controllers/user.js')

exports.init = function(io) {
    io.sockets.on('connection', function (socket) {
        try {
            // Sockets need renaming
            socket.on('create or join', (room) => {
                socket.join(room)
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


            // INTERACTIONS WITH USER DB
            socket.on('login/register', (data) => {
                userController.insert(data)
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