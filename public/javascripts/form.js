{
    /**
     * Used to pass IDB user to the routes as an invisible input.
     *
     */
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

    const getCurrentPosition = (btn) => {
        btn.value = "Getting location please wait!"
        let loader = document.getElementById('loader')
        loader.classList.remove('hidden')

        navigator.geolocation.getCurrentPosition((position) => {
            let pos = [
                position.coords.longitude,
                position.coords.latitude
            ]
            let locationInput = document.getElementById('location')

            // use the users last know location
            if (pos[0] != null || pos[1] != null){
                btn.value = "Found current location!"
                loader.classList.add('hidden')

                locationInput.value = `${pos[0]},${pos[1]}`
            } else {
                const db = requestIDB.result
                const store = db.transaction('userInfo', 'readonly').objectStore('userInfo')
                const storeRequest = store.get('user')

                storeRequest.onsuccess = async (event) => {
                    const user = await event.target.result

                    btn.value = "Unable to find current location, used user location"
                    loader.classList.add('hidden')

                    locationInput.value = `${user.coords[0]},${user.coords[1]}`
                }
            }
        })
    }

    const requestIDB = indexedDB.open('db', 4)

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
    let btn = document.getElementById('locationButton')

    btn.addEventListener("click", (event) => {getCurrentPosition(btn)})
}