{
    const sightingID = window.location.pathname.split('/').pop().replace(/\s/g, '')
    let socket = io()
    let db
    socket.emit('join sighting', sightingID)

    const author = document.querySelector('#author').innerHTML
    console.log(author)

    const checkUserIsAuthor = () => {
        useUserInfo(async (user) => {
            if (user.username === author) {
                let subscription

                let registration

                try {
                    registration = await navigator.serviceWorker.ready
                    //console.log(registration)
                    subscription = await registration.pushManager.subscribe({
                        userVisibleOnly: true,
                        applicationServerKey: "BLbjzsibeJ_ETEMWPGY6gS5Mvu-tDYwurLa0GIk05Q5-0MEZMRG2swTsI-mW_UgXOaCBuAph_BFKNVOZiM85X_0"
                    })
                    //console.log(subscription)
                }catch (e) {
                    console.log('does not work')
                    console.log(e)
                }





                //registration = navigator.serviceWorker.getRegistration("../app_sw.js").then(r => console.log(r))

                const db = requestIDB.result

                const userStore = db.transaction('userInfo', 'readonly').objectStore('userInfo')
                const userStoreRequest = userStore.get('user')

                userStoreRequest.onsuccess = async (event) => {
                    const user = userStoreRequest.result
                    console.log(user)
                    if (user !== undefined) {
                        console.log(subscription)

                        const data = {
                            user: user,
                            subscription: subscription
                        }
                        const options = {
                            method: 'POST',
                            body: JSON.stringify(data),
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
        checkUserIsAuthor()
        document.querySelector('#sendMsgBtn').addEventListener('click', sendMsg)
        document.querySelector('#msgIn').addEventListener('keyup', ({key}) => {
            if (key === 'Enter') sendMsg()
        })



    }



    const sendMsg = (e) => {
        const msg = document.querySelector('#msgIn').value
        if (msg.trim()) {
            useUserInfo(async (user) => {
                socket.emit('send msg', sightingID, user, msg)
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
    })
}