{
    // I've kept the user.js file separate from chat.js, might want to combine them? Might be hard to understand.
    // username value needs to be parsed to chat.js somehow if the js classes aren't combined.
    let username = null
    let coords = null
    let socket = io()

    const geoFindUser = () => {
        const status = document.querySelector('#status')
        const coordinateIn =  document.querySelector('#coordinateIn')

        const success = (position) => {
            const latitude = position.coords.latitude
            const longitude = position.coords.longitude
            // In GeoJSON longitude comes first
            coords = [Number(longitude), Number(latitude)]
            coordinateIn.value = `${coords[0]},${coords[1]}`
            status.textContent = `${coords[0]},${coords[1]}`
            console.log(coords)
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

    socket.on('login status', () => {
        console.log('loud and clear')
        document.getElementById('closeModalBtn').click()
        document.getElementById('loginModalBtn').classList.add('hidden')
        document.getElementById('profileBtn').classList.remove('hidden')
        document.getElementById('profileBtn').innerText = username
    })

    const submitLoginRegister = () => {
        const usernameIn = document.querySelector('#usernameIn')
        const coordinateIn = document.querySelector('#coordinateIn')
        if (usernameIn.value != '' && coordinateIn.value != '') {
            // coords will be null if a user didn't select to user their current location
            if (coords == null) {
                const coordsString = coordinateIn.value
                const coordsArray = coordsString.split(',')
                coords = [Number(coordsArray[0]), Number(coordsArray[1])]
            }
            username = usernameIn.value
            const data = {
                username: username,
                coords: coords
            }
            socket.emit('login/register', data)
        } else {
            // Want to do this with bootstrap alerts, looks a bit complicated?
            document.querySelector('#formStatus').textContent = 'Username and location is require to submit'
        }
    }

    // There is some inconsistency with use of querySelector and getElementById, better to use one consistently.
    document.querySelector("#findUserBtn").addEventListener("click", geoFindUser)
    document.getElementById('loginBtn').addEventListener("click", submitLoginRegister)
}