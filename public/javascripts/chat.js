{
    let db, room
    let socket = io()
    const requestIDB = indexedDB.open('db', 4)

    requestIDB.onsuccess = (event) => {
        /**
         * Retrieve all existing rooms in the DB which is called on window.onload.
         */
        function init() {
            socket.emit('get rooms')
            socket.on('rooms in', data => {
                userPresentOnLoad()
                const chatRoomCatalogue = document.getElementById('chatRoomCatalogue')
                for (const i in data) {
                    let chatRoomIn = data[i]
                    const div = document.createElement('div')
                    div.setAttribute("chat-room-id", chatRoomIn)
                    div.innerHTML = `${chatRoomIn}`
                    div.onclick = handleClickChatRoom
                    chatRoomCatalogue.appendChild(div)
                }
            })
        }

        /**
         * Check that there is a user in IDB upon opening a window and alter html to show appropriate elements.
         */
        const userPresentOnLoad = () => {
            db = requestIDB.result
            const store = db.transaction('userInfo', 'readonly').objectStore('userInfo')
            const storeRequest = store.get('user')
            storeRequest.onsuccess = (event) => {
                const user = event.target.result
                if (user) {
                    const profileBtn = document.querySelector('#profileBtn')
                    profileBtn.innerHTML = user.username
                    profileBtn.classList.remove('hidden')
                    document.querySelector('#logoutBtn').classList.remove('hidden')
                    document.querySelector('#loginModalBtn').classList.add('hidden')
                } else {
                    console.log('No user present in IDB.')
                }
            }
            storeRequest.onerror = (event) => {
                console.log(event.target.error)
            }
        }

        /**
         * Method will be replaced with handling posts rather than manually generated rooms
         */

        const insertChatRoom = () => {
            const chatRoomIn = document.getElementById('chatRoomIn').value
            const div = document.createElement('div')
            div.setAttribute("chat-room-id", chatRoomIn)
            div.innerHTML = `${chatRoomIn}`
            div.onclick = handleClickChatRoom
            const chatRoomCatalogue = document.getElementById('chatRoomCatalogue')
            chatRoomCatalogue.appendChild(div)
        }
        const handleClickChatRoom = (ev) => {
            const clicked_elem = ev.target
            enterChat()
            const chatTitle = document.getElementById('chatTitle')
            room = clicked_elem.getAttribute("chat-room-id")
            chatTitle.innerHTML = room
            socket.emit('create or join', room)
        }

        const handleExitChatRoom = () => {
            const history = document.getElementById('chatHistory')
            while (history.firstChild) {
                history.removeChild(history.firstChild)
            }
            enterChat(false)
            socket.emit('leave chatroom', room)
        }

        const enterChat = (enter = true) => {
            let hide = document.getElementById('chatRoomMain')
            let show = document.getElementById('chatMain')
            if (!enter)
                [hide, show] = [show, hide]
            hide.classList.add('hidden')
            show.classList.remove('hidden')
        }

        const sendChatMsg = () => {
            const msg = document.getElementById('msgIn').value
            db = requestIDB.result
            const store = db.transaction('userInfo', 'readonly').objectStore('userInfo')
            const storeRequest = store.get('user')
            storeRequest.onsuccess = () => {
                useUserInfo(
                    (user) => {
                        socket.emit('send msg', room, user.username, msg)
                    }
                )
            }
        }

        /**
         * Queries indexedDB for the current logged-in user which can be used in a self-defined onSuccess function.
         * e.g. Used for socket.io connection where we need the logged-in user's username
         * @param onSuccess
         */
        const useUserInfo = (onSuccess) => {
            db = requestIDB.result
            const store = db.transaction('userInfo', 'readwrite').objectStore('userInfo')
            const storeRequest = store.get('user')
            storeRequest.onsuccess = (event) => {
                const user = event.target.result
                if (user) {
                    onSuccess(user)
                } else {
                    // This is placeholder for now, you want to do something if you are not logged in
                    console.log('You are not logged in.')
                }
            }
            storeRequest.onerror = (event) => {
                console.error(event.target.error)
            }
        }


        socket.on('msg', (data) => {
            outputMsg(data)
        })

        socket.on('history', data => {
            for (const i in data) {
                outputMsg(data[i])
            }
        })

        const outputMsg = (data) => {
            const div = document.createElement('div')
            div.innerHTML = `<p><strong>${data.sender}:</strong>${data.msg}</p>`
            document.getElementById('chatHistory').appendChild(div)
            document.getElementById('msgIn').value = ''
        }

        const addChatRoomBtn = document.getElementById('addChatRoomBtn')
        const exitChatBtn = document.getElementById('exitChatBtn')
        const sendMsgBtn = document.getElementById('sendMsgBtn')
        addChatRoomBtn.addEventListener('click', insertChatRoom)
        //window.addEventListener('load', init)
        // init is not always being called onload
        // i think it might have something to do with socket emitting and receiving
        // could do it in the routes to retrieve the list on load instead?
        document.body.onload = init
        exitChatBtn.addEventListener('click', handleExitChatRoom)
        sendMsgBtn.addEventListener('click', sendChatMsg)
    }

    requestIDB.onupgradeneeded = (event) => {
        const db = requestIDB.result
        db.createObjectStore('userInfo', {autoIncrement: false})
        console.log('IDB: Object store created.')
    }

    requestIDB.onerror = (event) => {
        console.error('IDB: '+requestIDB.error)
    }
}