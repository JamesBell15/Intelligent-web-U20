async function sortDist() {
    try {
        useUserInfo(async (user) => {
            const data = {
                sort: 'distance',
                coords: user.coords
            }
            const options = {
                method: 'POST',
                body: JSON.stringify(data),
                headers: {
                    'Content-type': 'application/json'
                }
            }
            try {
                const response = await fetch('/api/data/sort', options)
                const text = await response.text()

                updateSightingHtml(text)

            } catch (err) {
                console.error(err)
            }
        })
    } catch (e) {
        console.error(e)
    }
}
async function sortRecent() {
    try {
        const data = {
            sort: 'recent'
        }
        const options = {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-type': 'application/json'
            }
        }
        try {
            const response = await fetch('/api/data/sort', options)
            const text = await response.text()

            updateSightingHtml(text)
        } catch (err) {
            console.error(err)
        }
    } catch (e) {
        console.error(e)
    }
}

const updateSightingHtml = (text) => {
    const sightingList = document.querySelector('#sightingList')

    const div = document.createElement('div')
    div.innerHTML = text

    const fragment = document.createDocumentFragment()
    const targetElems = div.querySelectorAll('#sightingBody')
    targetElems.forEach(element => fragment.appendChild(element))

    sightingList.innerHTML = ''
    sightingList.appendChild(fragment)
}

const useUserInfo = (onSuccess) => {
    const db = requestIDB.result
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

const requestIDB = indexedDB.open('db', 4)

requestIDB.onupgradeneeded = (event) => {
    const db = requestIDB.result
    db.createObjectStore('userInfo', {autoIncrement: false})
    console.log('IDB: Object store created.')
}
requestIDB.onsuccess = (event) => {
    document.querySelector('#distSort').addEventListener('click', sortDist)
}
requestIDB.onerror = (event) => {
    console.error('IDB: ' + requestIDB.error)
}

document.querySelector('#timeSort').addEventListener('click', sortRecent)