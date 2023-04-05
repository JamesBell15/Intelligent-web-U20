const messageController = require('../controllers/messages.js')
const userController = require('../controllers/user.js')
const sightingController = require('../controllers/sighting_controller.js')


exports.init = function(io) {
    io.sockets.on('connection', function (socket) {
        try {
            // THESE ARE NEW ONES
            socket.on('join sighting', (room) => {
                socket.join(room)
            })
            socket.on('leave sighting', (room) => {
                socket.leave(room)
            })
            socket.on('send msg', async (room, name, msg) => {
                const user = await userController.findUser(name)
                const sighting = await sightingController.findSighting(room)

                const data = {
                    sender: user,
                    post: sighting,
                    msg: msg
                }

                messageController.insert(data, () => {
                    io.to(room).emit('msg', data)
                })


            })

            // NEED to update lists of chat rooms/posts when one is created from another user.

            // INTERACTIONS WITH USER DB
            socket.on('login/register', (data) => {
                userController.insert(data)
                socket.emit('login status')
            })
        } catch (e) {
            console.error(e)
        }
    })
}