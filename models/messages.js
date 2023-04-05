const mongoose = require('mongoose')
const Schema = mongoose.Schema

const messageSchema = new Schema({
        sender: {
            type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true
        }, post: {
            type: mongoose.Schema.Types.ObjectId, ref: 'Sighting', required: true
        }, msg: {
            type: String, required: true
        }
    },
    {timestamps: true}
)

const Message = mongoose.model('Message', messageSchema)
module.exports = Message