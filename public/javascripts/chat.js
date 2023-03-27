{
    let name = 'James'
    let room = null
    let socket = io()

    /**
     * Populates the homepage with all existing rooms in the DB which is called window.onload.
     */
    const insertChatRoomDB = () => {
        socket.emit('get rooms')
        socket.on('rooms in', data => {
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
        connectToRoom(room, name)
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

    const connectToRoom = (room, name) => {
        socket.emit('create or join', room, name)
    }

    const sendChatMsg = () => {
        const msg = document.getElementById('msgIn').value
        socket.emit('send msg', room, name, msg)
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
    window.onload = insertChatRoomDB // window.addEventListener('load', insertChatRoomDB)
    exitChatBtn.addEventListener('click', handleExitChatRoom)
    sendMsgBtn.addEventListener('click', sendChatMsg)
}