/*
    Manages socket-io events.
 */
const User = require('../models/user.js')
const Sighting = require('../models/sighting.js')
const Message = require('../models/messages.js')
const Subscription = require('../models/subscription.js')

exports.init = function(io) {
    io.sockets.on('connection', function (socket) {
        try {
            socket.on('join sighting', (room) => {
                socket.join(room)
            })
            socket.on('leave sighting', (room) => {
                socket.leave(room)
            })
            socket.on('send msg', async (room, userIDB, msg) => {
                const user = await User.findUser(userIDB.username)
                const sighting = await Sighting.findSighting(room)
                let author = await Sighting.findById(room).populate('userId').exec()
                author = author.userId

                const message = new Message({
                    sender: user,
                    post: sighting,
                    msg: msg
                })

                // messages are saved in mongoDB.
                await message.insert()
                io.to(room).emit('msg', message)


            })
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