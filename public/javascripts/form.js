{

    const requestIDB = indexedDB.open('db', 4)

    requestIDB.onupgradeneeded = (event) => {
        const db = requestIDB.result
        db.createObjectStore('userInfo', {autoIncrement: false})
        console.log('IDB: Object store created.')
    }

    requestIDB.onerror = (event) => {
        console.error('IDB: ' + requestIDB.error)
    }

    requestIDB.onsuccess = async (event) => {
        getUserInfo((user) => {
            if (user) {
                const form = document.querySelector('#xForm')
                const input = document.createElement('input')
                input.type = 'hidden'
                input.name = 'user'
                input.value = user.username
                form.appendChild(input)
            } else {
                console.log('You are not logged in.')
            }
        })
    }

    const getUserInfo = (onSuccess) => {
        const db = requestIDB.result
        const store = db.transaction('userInfo', 'readonly').objectStore('userInfo')
        const storeRequest = store.get('user')
        storeRequest.onsuccess = async (event) => {
            const user = await event.target.result
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

}