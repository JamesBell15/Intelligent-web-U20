function getSorted(sortType) {
    try {
        useUserInfo(async (user) => {
            let response
            switch (sortType) {
                case "distance":
                    const coordinates = user.coords
                    response = await fetch(`/sighting/index?sort=distance&long=${coordinates[0]}&lat=${coordinates[1]}`)
                    break
                case "recent":
                    response = await fetch(`/sighting/index?sort=recent`)
                    break
                case "alphabetical":
                    response = await fetch(`/sighting/index?sort=alphabetical`)
                    break
                default:
                    response = await fetch(`/sighting/index`)
                    break
            }
            const text = await response.text()
            updateSightingHtml(text)
        })
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
    document.querySelector('#distSort').addEventListener('click', () => getSorted('distance'))
    document.querySelector('#timeSort').addEventListener('click', () => getSorted('recent'))
    document.querySelector('#alphabetSort').addEventListener('click', () => getSorted('alphabetical'))
}
requestIDB.onerror = (event) => {
    console.error('IDB: ' + requestIDB.error)
}