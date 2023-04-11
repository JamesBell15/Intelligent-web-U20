{
    const sightingID = window.location.pathname.split('/').pop().replace(/\s/g, '')
    let socket = io()
    let db
    socket.emit('join sighting', sightingID)

    const requestIDB = indexedDB.open('db', 4)

    requestIDB.onerror = (event) => {
        console.error('IDB: ' + requestIDB.error)
    }

    requestIDB.onsuccess = (event) => {
        document.querySelector('#sendMsgBtn').addEventListener('click', sendMsg)
    }

    const sendMsg = (e) => {
        const msg = document.querySelector('#msgIn').value
        if (msg) {
            useUserInfo((user) => {
                socket.emit('send msg', sightingID, user.username, msg)
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

    socket.on('msg', (data) => {
        outputMsg(data)
    })
}