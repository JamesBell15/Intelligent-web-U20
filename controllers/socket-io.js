const User = require('../models/user.js')
const Sighting = require('../models/sighting.js')
const Message = require('../models/messages.js')

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
                const user = await User.findUser(name)
                const sighting = await Sighting.findSighting(room)

                const message = new Message({
                    sender: user,
                    post: sighting,
                    msg: msg
                })

                await message.insert()
                io.to(room).emit('msg', message)


            })

            // NEED to update lists of chat rooms/posts when one is created from another user.

            // INTERACTIONS WITH USER DB
            socket.on('login/register', (data) => {
                const user = new User({
                    username: data.username,
                    location: {
                        type: 'Point',
                        coordinates: data.coords
                    }
                })
                user.insertUpdate()
                socket.emit('login status')
            })
        } catch (e) {
            console.error(e)
        }
    })
}