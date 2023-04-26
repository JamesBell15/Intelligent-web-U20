const User = require('../../models/user')

// Returns a User after finding or creating a new one
exports.resolveNoUser = async (userId, location) => {
    let user = await User.findUser(userId)

    if (typeof user != "User") {
        user = await new User({
            username: userId,
            location: location
        })

        user.save(async function (err) {
            if (err) {
                console.log(err)
                return null
            }
        })
    }

    return user
}
