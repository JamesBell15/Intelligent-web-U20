/*
    Controller for subscriptions. It has two methods:

    create - Creates a subscription object from the data that is passed in and inserts it into the db

    sendNotification - Uses webpush.sendNotification to send a push event to the specified user with the
                       payload (the body of the notification)

 */

const bodyParser = require("body-parser")
const multer = require('multer')
const Subscription = require('../models/subscription')
const User = require("../models/user")
const Sighting = require("../models/sighting")
const webPush = require("web-push")

exports.create = async (req, res) => {
    let body = req.body
    const user = await User.findUser(body.user.username)
    const subscription = body.subscription


    // Create a subscription object from the data that is passed in
    // Either insert it into the db if it doesn't already exist or
    // update the existing entry
    let subscriptionEntry = new Subscription({
        userId: user,
        subscriptionObject: JSON.stringify(subscription)
    })

    await subscriptionEntry.insertUpdate(user, JSON.stringify(subscription))

}


exports.sendNotification = async (req, res) => {
    // Getting all the correct data needed to send the notification
    const sighting = req.body.sighting
    const sightingDB = await Sighting.findById(sighting).populate('userId').exec()
    let author = sightingDB.userId
    const subscription = await Subscription.findSubscription(author)
    // If the subscription exists then check if the user that is commenting is the same as the author
    // Covers the case that the subscription might not exist if the author has not made a decision about
    // accepting notifications
    if (subscription) {
        if (author.username !== req.body.user.username) {
            res.status(201).json({})
            const payload = JSON.stringify({
                title: sightingDB.identificationId,
                body: `${req.body.user.username}: ${req.body.msg}`,
                url: req.body.url
            })

            // Check if the subscription object is not null. Null would represent a user that has blocked notifications
            if (subscription.subscriptionObject !== null) {
                webPush.sendNotification(JSON.parse(subscription.subscriptionObject), payload).catch((error) => {
                    // Handle the 410 error status where the subscription is in the database, but it is no longer valid
                    // because the author has chosen to block notifications. In this case set the subscription to null.
                    if (error.statusCode === 410) {
                        const query = {userId: author._id}
                        const update = {subscriptionObject: null}

                        Subscription.findOneAndUpdate(query, update, (error) => {
                            if (error) {
                                console.log(error)
                            }
                        })
                    } else {
                        console.log(error)
                    }
                })
            }
        }

    }
}