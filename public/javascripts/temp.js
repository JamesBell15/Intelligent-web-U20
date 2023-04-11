let sortParameters = ''
const search = document.querySelector('#sightingSearch')
const sortByDistance = document.querySelector('#distSort')
const sortByRecent = document.querySelector('#timeSort')
const sortByAlphabet = document.querySelector('#alphabetSort')
const removeFilters = document.querySelector('#removeFilters')

function getSorted(sortType) {
    try {
        useUserInfo(async (user) => {
            switch (sortType) {
                case "distance":
                    const coordinates = user.coords
                    sortParameters = `sort=distance&long=${coordinates[0]}&lat=${coordinates[1]}`
                    break
                case "recent":
                    sortParameters = 'sort=recent'
                    break
                case "alphabetical":
                    sortParameters = 'sort=alphabetical'
                    break
                default:
                    sortByDistance.checked = sortByRecent.checked = sortByAlphabet.checked = false
                    sortParameters = ''
                    break
            }
            let response = await fetch(`/sighting/index?${sortParameters}`)
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
    sortByDistance.addEventListener('click', () => getSorted('distance'))
    sortByRecent.addEventListener('click', () => getSorted('recent'))
    sortByAlphabet.addEventListener('click', () => getSorted('alphabetical'))
    removeFilters.addEventListener('click', () => getSorted())
}
requestIDB.onerror = (event) => {
    console.error('IDB: ' + requestIDB.error)

}

search.addEventListener('keyup', async (e) => {
    let searchQuery = e.target.value.trim()
    let response = await fetch(`/sighting/index?${sortParameters}&name=${searchQuery}`)
    let text = await response.text()
    updateSightingHtml(text)
})