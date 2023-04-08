{
    let socket = io()
    let sightingID

    const init = () => {
        const children = document.querySelector('#sightingsCatalogue').children
        for (let i = 0; i < children.length; i++) {
            children[i].onclick = handleClickSighting
        }
    }

    const handleClickSighting = async (ev) => {
        const parentClosest = ev.target.closest('#sightingBody')
        if (parentClosest) {
            sightingID = parentClosest.getAttribute("sighting-post-id")
        }
        window.location.href = `show/${sightingID}`
    }

    //init()

}