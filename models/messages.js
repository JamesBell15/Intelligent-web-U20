/*
    The model for messages linked to a particular sighting and user. Three fields are required:

    sender - references a user in the database who is responsible for sending a given message.
    post - references a sighting in the database for which a message is attached to.
    msg - a message that has been sent.
 */

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

messageSchema.methods.insert = async function() {
    try {
        return await this.save()
    } catch (e) {
        console.error(e)
    }
}

messageSchema.statics.findMessagesForSighting = async (sighting) => {
    try {
        return await Message.find({post: sighting}).populate(['sender', 'post']).exec()
    } catch (e) {
        console.error(e)
    }
}

const Message = mongoose.model('Message', messageSchema)
module.exports = Message