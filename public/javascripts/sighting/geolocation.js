
function getCurrentPosition(argument) {
  navigator.geolocation.getCurrentPosition((position) => {
    const pos = {
      "type" : "Point",
      "coordinates": [
        position.coords.longitude,
        position.coords.latitude
      ]
    };
    return pos
  });
}
