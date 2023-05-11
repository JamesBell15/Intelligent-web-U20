const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
    username: {type: String, required: true},
    location: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            // LONG, LAT
            type: [Number],
            required: true
        }
    }
})

userSchema.methods.insertUpdate = async function() {
    try {
        const user = await User.findOne({username: this.username})
        if (user) {
            const query = {'username': this.username}
            const update = {'location': {
                    'type': 'Point',
                    'coordinates': this.location.coordinates
                }}
            return await User.findOneAndUpdate(query, update)
        } else {
            return await this.save()
        }
    } catch (e) {
        console.error(e)
    }
}

userSchema.statics.findUser = async (name) => {
    try {
        return await User.findOne({username: name}).exec()
    } catch (e) {
        console.error(e)
    }
}

const User = mongoose.model('User', userSchema)
module.exports = User