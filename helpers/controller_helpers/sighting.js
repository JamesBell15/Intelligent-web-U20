
exports.extractFilePathOrURL = (req) => {
  try {
    let url = new URL(req.body.sightingImage);
    return url
  } catch (_) {
    return req.file.path;
  }
  return req.file.path;
}

exports.extractFilePathOrURLFromJSON = (body) => {
  try {
    let url = new URL(body.image);
    return url
  } catch (_) {
    return body.image;
  }
  return body.image;
}