/*
    The model for storing the subscriptions in the database. Two fields are required:

    userId - References a user in the database that the subscription is attached to
    subscriptionObject - The unique subscription for the user containing the endpoint and keys. Stored as a string

 */



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

subscriptionSchema.methods.insert = async function() {
    try {
        return await this.save()
    } catch (e) {
        console.error(e)
    }
}

subscriptionSchema.methods.insertUpdate = async function(user, sub) {
    try {
        const subscription = await Subscription.findOne({userId: user})
        // Check if the subscription entry already exists. If so, update the current record with the new subscription.
        // If not, create a new one
        if (subscription) {
            const query = {userId: user}
            const update = {subscriptionObject: sub}
            return await Subscription.findOneAndUpdate(query, update)
        }
        else {
            return await this.save()
        }
    } catch (e) {
        console.error(e)
    }
}


var Subscription = mongoose.model('Subscription', subscriptionSchema)
module.exports = Subscription




