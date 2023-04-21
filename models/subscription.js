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




