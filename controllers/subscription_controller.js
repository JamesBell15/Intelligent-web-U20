const bodyParser = require("body-parser")
const multer = require('multer')
const Subscription = require('../models/subscription')
const User = require("../models/user")

exports.create = async (req, res) => {
    let body = req.body
    const user = await User.findUser(body.user.username)
    const subscription = body.subscription



    let subscriptionEntry = new Subscription({
        userId: user,
        subscriptionObject: JSON.stringify(subscription)
    })

    await subscriptionEntry.insertUpdate(user, JSON.stringify(subscription))

}