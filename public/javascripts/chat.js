/*
    checkUserIsAuthor - checks if the user stored in IndexedDB matches the author of a post in order to query the user to turn notifications on.
    sendMsg - retrieves a message from the chat input which is posted to the /notify route in order to prompt a notification to the author of the post.
        - emits the message as an event via a socket so that messages appear in the chat for a post in real time for other user and for the message to be stored
          in the MongoDB database.
    outPutMsg - receives events which contain a message sent to the current post which is then displayed in the chat area in the front-end.
 */

import {subscribe} from "./subscription_helper.mjs"

{
    const sightingID = window.location.pathname.split('/').pop().replace(/\s/g, '')
    let socket = io()
    let db
    // the user needs to join a room to receive the appropriate events related to a given sighting.
    socket.emit('join sighting', sightingID)

    const author = document.querySelector('#showAuthor').innerHTML

    const checkUserIsAuthor = () => {
        useUserInfo(async (user) => {
            if (user.username === author) {
                try {
                    await subscribe()
                } catch (e) {
                    // Strange quirk on Firefox where the permissions don't update
                    // in real time, so have to force a refresh
                    if (navigator.userAgent.indexOf("Firefox") > -1) {
                        setInterval(function () {
                            if (Notification.permission === 'granted') {
                                location.reload()
                            }}, 500)
                    }
                }
            }
        })
    }


    document.querySelector('#chatForm').addEventListener('submit', function(event) {event.preventDefault()})

    const requestIDB = indexedDB.open('db', 4)

    requestIDB.onerror = (event) => {
        console.error('IDB: ' + requestIDB.error)
    }

    requestIDB.onsuccess = (event) => {
        document.querySelector('#sendMsgBtn').addEventListener('click', sendMsg)
        document.querySelector('#msgIn').addEventListener('keyup', ({key}) => {
            if (key === 'Enter') sendMsg()
        })
        checkUserIsAuthor()
    }

    const sendMsg = (e) => {
        const msg = document.querySelector('#msgIn').value
        if (msg.trim()) {
            useUserInfo(async (user) => {
                socket.emit('send msg', sightingID, user, msg)
                // Send a post request to /notify with all the data necessary to display the notification
                const data = ({
                    sighting: sightingID,
                    user: user,
                    msg: msg,
                    url: window.location.href
                })
                const options = {
                    method: 'POST',
                    body: JSON.stringify(data),
                    headers: {
                        'Content-type': 'application/json'
                    }
                }
                try {
                    const response = await fetch('/notify', options)
                    const json = await response.json()

                } catch (err) {
                    console.error(err)
                }
            })
        }
    }

    const useUserInfo = (onSuccess) => {
        db = requestIDB.result
        const store = db.transaction('userInfo', 'readonly').objectStore('userInfo')
        const storeRequest = store.get('user')
        storeRequest.onsuccess = (event) => {
            const user = event.target.result
            if (user) {
                onSuccess(user)
            } else {
                console.log('You are not logged in.')
            }
        }
        storeRequest.onerror = (event) => {
            console.error(event.target.error)
        }
    }

    document.querySelector('#toIndexBtn').addEventListener('click', () => {
        socket.emit('leave sighting', sightingID)
        window.location.href = '/sighting/index'
    })

    const outputMsg = (data) => {
        const div = document.createElement('div')
        div.innerHTML = `<p><strong>${data.sender.username}:</strong> ${data.msg}</p>`
        document.getElementById('chatHistory').appendChild(div)
        document.getElementById('msgIn').value = ''
    }

    socket.on('msg', async (message) => {
        outputMsg(message)

        const options = {
            method: 'POST',
            body: JSON.stringify(subscription),
            headers: {
                'Content-type': 'application/json'
            }

        }
        try {
            const response = await fetch('/subscribe', options)
            const json = await response.json()

        } catch (err) {
            console.error(err)
        }
    })
}