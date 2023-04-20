let mongoose = require('mongoose')
let Schema = mongoose.Schema

const subscriptionSchema = new Schema({
    userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    subscriptionObject: {type: String, required: true},
})


subscriptionSchema.statics.findSubscription = async (user) => {
    try {
        return await Subscription.findOne({userId: user}).exec()
    } catch (e) {
        console.error(e)
    }
}



var Subscription = mongoose.model('Subscription', subscriptionSchema)
module.exports = Subscription




