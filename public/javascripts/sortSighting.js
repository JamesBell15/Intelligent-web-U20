/*
    Function relating to retrieving and displaying the sorted list of sightings

    getSorted - Responsible for performing a fetch request to the index route based on filter/search options in the front-end to retrieve a sorted list of sightings.
    updateSightingHtml - Injects a list of sightings into the index page.
    getUser - Retrieves the logged-in user from IndexedDB.
 */
{
    let sortParameters = ''
    const search = document.querySelector('#sightingSearch')
    const sortByDistance = document.querySelector('#distSort')
    const sortByRecent = document.querySelector('#timeSort')
    const sortByAlphabet = document.querySelector('#alphabetSort')
    const removeFilters = document.querySelector('#removeFilters')

    async function getSorted(sortType) {
        try {
            switch (sortType) {
                case "distance":
                    try {
                        const user = await getUser()
                        if (user) {
                            const coordinates = user.coords
                            sortParameters = `sort=distance&long=${coordinates[0]}&lat=${coordinates[1]}`
                        }
                    } catch (e) {
                        console.error(e)
                    }
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

    const getUser = async () => {
        return new Promise((resolve, reject)=> {
            const db = requestIDB.result
            const store = db.transaction('userInfo', 'readonly').objectStore('userInfo')
            const storeRequest = store.get('user')

            storeRequest.onsuccess = (event) => {
                const user = event.target.result
                if (user) {
                    resolve(user)
                } else {
                    console.log('You are not logged in.')
                    resolve(null)
                }
            }
            storeRequest.onerror = (event) => {
                console.error(event.target.error)
                reject(event.target.error)
            }
        })
    }

    const requestIDB = indexedDB.open('db', 4)

    requestIDB.onsuccess = async (event) => {
        sortByDistance.addEventListener('click', () => getSorted('distance'))
        sortByRecent.addEventListener('click', () => getSorted('recent'))
        sortByAlphabet.addEventListener('click', () => getSorted('alphabetical'))
        removeFilters.addEventListener('click', () => getSorted())
    }
    requestIDB.onerror = (event) => {
        console.error('IDB: ' + requestIDB.error)
    }

    /*
        Queries the index route to retrieve sightings that match search terms.
        This works on top of requesting filtering on the sightings.
     */
    search.addEventListener('keyup', async (e) => {
        let searchQuery = e.target.value.trim()
        let response = await fetch(`/sighting/index?${sortParameters}&name=${searchQuery}`)
        let text = await response.text()
        updateSightingHtml(text)
    })
}
