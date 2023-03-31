
exports.extractFilePathOrURL = (req) => {
  try {
    let url = new URL(req.body.sightingImage);
    return url
  } catch (_) {
    return req.file.path;
  }
  return req.file.path;
}