/*
    checkLoginStatus - This function is ran at the very start of loading a page in order to display the correct items in the navbar depending on the login status.
 */

{
    const requestIDB = indexedDB.open('db', 4)

    requestIDB.onerror = (event) => {
        console.error('IDB: '+requestIDB.error)
    }

    requestIDB.onsuccess = (event) => {
        const checkLoginStatus = () => {
            const db = requestIDB.result
            const storeRequest = db.transaction('userInfo', 'readonly').objectStore('userInfo').get('user')
            storeRequest.onsuccess = (event) => {
                const user = event.target.result
                if (user) {
                    document.getElementById('loginModalBtn').classList.add('hidden')
                    document.getElementById('logoutBtn').classList.remove('hidden')
                    document.getElementById('profileBtn').classList.remove('hidden')
                    document.getElementById('profileBtn').querySelector(":nth-child(2)").innerText = user.username
                    const distSort = document.getElementById('distSortLbl')
                    if (distSort) distSort.classList.remove('hidden')
                }
            }
        }
        checkLoginStatus()
    }
}