{
    // I've kept the user.js file separate from chat.js, might want to combine them? Might be hard to understand.
    // username value needs to be parsed to chat.js somehow if the js classes aren't combined.
    let socket = io()
    let db

    const geoFindUser = () => {
        const status = document.querySelector('#status')
        const coordinateIn =  document.querySelector('#coordinateIn')

        const success = (position) => {
            const latitude = position.coords.latitude
            const longitude = position.coords.longitude
            // In GeoJSON longitude comes first
            coordinateIn.value = `${longitude},${latitude}`
            status.textContent = `${longitude},${latitude}`
            console.log(coordinateIn.value)
        }

        const error = (error) => {
            status.textContent = `ERROR(${error.code}): ${error.message}`
        }

        if (!navigator.geolocation) {
            status.textContent = "Geolocation is not supported by your browser"
        } else {
            status.textContent = "Locating…"
            navigator.geolocation.getCurrentPosition(success, error)
        }
    }

    const loginSuccess = () => {
        document.getElementById('closeModalBtn').click()
        document.getElementById('loginModalBtn').classList.add('hidden')
        document.getElementById('logoutBtn').classList.remove('hidden')
        document.getElementById('profileBtn').classList.remove('hidden')
        db = requestIDB.result
        const store = db.transaction('userInfo', 'readonly').objectStore('userInfo')
        const storeRequest = store.get('user')
        storeRequest.onsuccess = (event) => {
            let user = event.target.result
            if (user) {
                document.getElementById('profileBtn').innerText = user.username
            } else {
                console.log('You are not logged in.')
            }
        }
        storeRequest.onerror = (event) => {
            console.log(event.target.error)
        }
    }

    socket.on('login status', () => {
        loginSuccess()
    })

    const submitLoginRegister = () => {
        const usernameIn = document.querySelector('#usernameIn')
        const coordinateIn = document.querySelector('#coordinateIn')
        // Need to add a form check that the coordinates are in correct form i.e. [Number, Number]
        // before allowing the form to be submitted.
        if (usernameIn.value != '' && coordinateIn.value != '') {
            const coordsArray = coordinateIn.value.split(','),
                coords = [Number(coordsArray[0]), Number(coordsArray[1])]
            const username = usernameIn.value
            const data = {
                username: username,
                coords: coords
            }
            db = requestIDB.result
            const store = db.transaction('userInfo', 'readwrite').objectStore('userInfo')
            const storeRequest = store.add({username: username, coords:coords}, 'user')
            storeRequest.onsuccess = (event) => {
                console.log('IDB: Request to add user successful.')
            }

            socket.emit('login/register', data)

        } else {
            // Want to do this with bootstrap alerts, looks a bit complicated?
            document.querySelector('#formStatus').textContent = 'Username and location is require to submit'
        }
    }

    const logout = () => {
        document.querySelector('#loginModalBtn').classList.remove('hidden')
        document.querySelector('#logoutBtn').classList.add('hidden')
        document.querySelector('#profileBtn').classList.add('hidden')

        db = requestIDB.result
        const store = db.transaction('userInfo', 'readwrite').objectStore('userInfo')
        const storeRequest = store.clear()
        storeRequest.onsuccess = async () => {
            console.log('IDB: User information deleted.')
            /**
             *
             * Example code of sending data to a route which is not used.
             *
            const data = {
                loginStatus: false
            }
            const options = {
                method: 'POST',
                body: JSON.stringify(data),
                headers: {
                    'Content-type': 'application/json'
                }
            }
            try {
                const response = await fetch('/chat', options)
                const data = await response.json()
                console.log(data)
            } catch (e) {
                console.error(e)
            }
             **/
        }
    }

    // There is some inconsistency with use of querySelector and getElementById, better to use one consistently.
    document.querySelector("#findUserBtn").addEventListener("click", geoFindUser)

    // IDB GitHub Example
    // https://github.com/mdn/dom-examples/blob/main/to-do-notifications/scripts/todo.js
    const requestIDB = indexedDB.open('db', 4)

    requestIDB.onupgradeneeded = (event) => {
        const db = requestIDB.result
        db.createObjectStore('userInfo', {autoIncrement: false})
        console.log('IDB: Object store created.')
    }
    requestIDB.onsuccess = (event) => {
        document.querySelector('#loginBtn').addEventListener("click", submitLoginRegister)
        document.querySelector('#logoutBtn').addEventListener("click", logout)
    }
    requestIDB.onerror = (event) => {
        console.error('IDB: '+requestIDB.error)
    }

}