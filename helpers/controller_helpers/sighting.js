
exports.getImageFormReq = async (req) => {
    let data = null, contentType = null, url = null

    try {
        url = new URL(req.body.sightingImage)
    } catch (_) {
        data = req.file.buffer
        contentType = req.file.mimetype
    }

    return { data: data, contentType: contentType, url: url }
}
