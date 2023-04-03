const addResourcesToCache = async (resources) => {
  const cache = await caches.open("v1");
  await cache.addAll(resources);
};

const indexDBDummy = {
  _id: ObjectId("6426f1c25af377c7ca1fbc87"),
  active: true,
  identificationId: 'Bird',
  userId: 'TODO',
  location: 'Hull',
  description: 'Fluffy!',
  dateTime: ISODate("2023-03-31T14:44:00.000Z"),
  image: 'https://i.redd.it/zkblo85nmqqa1.jpg',
  __v: 0
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    addResourcesToCache([
      "sighting/index",
      "/manifest.json",
      "/app_sw.js"
    ])
  );
});

const putInCache = async (request, response) => {
  const cache = await caches.open("v1");
  await cache.put(request, response);
};

// PWA Architecture cache first
const cacheFirst = async (request) => {
  const responseFromCache = await caches.match(request);
  if (responseFromCache) {
    return responseFromCache;
  }
  const responseFromNetwork = await fetch(request);
  putInCache(request, responseFromNetwork.clone());
  return responseFromNetwork;
};

self.addEventListener("fetch", (event) => {
  event.respondWith(cacheFirst(event.request));
});