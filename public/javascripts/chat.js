{
    let db, room
    let socket = io()
    const requestIDB = indexedDB.open('db', 4)

    requestIDB.onsuccess = (event) => {
        /**
         * Give on click method to rooms loaded via routes.
         */
        function init() {
            const children = document.querySelector('#chatRoomCatalogue').children
            for (let i = 0; i < children.length; i++) {
                children[i].onclick = handleClickChatRoom
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

            if (document.querySelector('#noChatRoomsMsg').style.display != 'none') {
                document.querySelector('#noChatRoomsMsg').style.display = 'none'
            }
        }
        const handleClickChatRoom = (ev) => {
            const clicked_elem = ev.target
            enterChat()
            const chatTitle = document.getElementById('chatTitle')
            room = clicked_elem.getAttribute("chat-room-id")
            chatTitle.innerHTML = room
            getMessages(room, (messages) => {
                populateChatHistory(messages)
            })
                .catch(e => {
                    console.error(e)
                })
            socket.emit('create or join', room)
        }

        const getMessages = async (room, onSuccess) => {
            const data = {
                room: room
            }
            const options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            }
            try {
                const response = await fetch('/api/data/messages', options)
                const json = await response.json()
                onSuccess(json)
            } catch (e) {
                console.error(e)
            }
        }

        const populateChatHistory = (messages) => {
            const fragment = document.createDocumentFragment()
            for (let message of messages) {
                const div = document.createElement('div')
                div.innerHTML = `<p><strong>${message.sender}:</strong>${message.msg}</p>`
                fragment.appendChild(div)
            }
            document.getElementById('chatHistory').appendChild(fragment)
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

        const outputMsg = (data) => {
            const div = document.createElement('div')
            div.innerHTML = `<p><strong>${data.sender}:</strong>${data.msg}</p>`
            document.getElementById('chatHistory').appendChild(div)
            document.getElementById('msgIn').value = ''
        }

        init()
        const addChatRoomBtn = document.getElementById('addChatRoomBtn')
        const exitChatBtn = document.getElementById('exitChatBtn')
        const sendMsgBtn = document.getElementById('sendMsgBtn')
        addChatRoomBtn.addEventListener('click', insertChatRoom)
        exitChatBtn.addEventListener('click', handleExitChatRoom)
        sendMsgBtn.addEventListener('click', sendChatMsg)
    }

    requestIDB.onerror = (event) => {
        console.error('IDB: '+requestIDB.error)
    }
}