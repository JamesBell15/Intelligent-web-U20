const addResourcesToCache = async (resources) => {
  const cache = await caches.open("v1")
  await cache.addAll(resources)
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    addResourcesToCache([
      "sighting/index",
      "/manifest.json",
      "/app_sw.js",
      "/stylesheets/style.css",
      "/html/offline.html",
      "/html/sighting/new.html",
      "/html/sighting/index.html",
      "/html/sighting/show.html",
      "/javascripts/sighting/new_helper.js",
      "/javascripts/sighting/index_helper.js",
      "/javascripts/sighting/show_helper.js",
      "/javascripts/indexedDB.js"
    ])
  )
})

const putInCache = async (request, response) => {
  const cache = await caches.open("v1")
  await cache.put(request, response)
}

// PWA Architecture cache first
const cacheFirst = async (request, fallbackUrl) => {
  const responseFromCache = await caches.match(request)
  if (responseFromCache) {
    return responseFromCache
  }
  try {
    const responseFromNetwork = await fetch(request)
    putInCache(request, responseFromNetwork.clone())
    return responseFromNetwork
  } catch (error) {
    const fallbackResponse = await caches.match(fallbackUrl)
    if (fallbackResponse) {
      return fallbackResponse
    }
    // when even the fallback response is not available,
    // there is nothing we can do, but we must always
    // return a Response object
    return new Response("Network error happened", {
      status: 408,
      headers: { "Content-Type": "text/plain" },
    })
  }
}

const rerouting = async (pathname) => {
  return await caches.match('/html' + pathname + '.html')
}

self.addEventListener('sync', async event => {
  if (event.tag === 'sighting-data-sync') {
    fetch('/sighting/refresh').then(
    (response) => response.json()).then((data) => {
      // use this to store data from db
      console.log(data)
    })
  }
})

self.addEventListener("fetch", (event) => {
  let pathname = new URL(event.request.url).pathname

  if (pathname == '/sighting/index' || pathname == '/sighting/show' || pathname == '/sighting/new'){
    let responseFromCache = rerouting(pathname)

    event.respondWith(cacheFirst(pathname))
  } else {
    event.respondWith(cacheFirst(event.request, "/html/offline.html"))
  }
})