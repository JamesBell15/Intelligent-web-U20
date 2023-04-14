
exports.getImageFormReq = async (req) => {
    let data = null, contentType = null, url = null

    try {
        url = new URL(req.body.sightingImage)
    } catch (_) {
        data = req.file.buffer
        contentType = req.file.mimeType
    }

    return { data: data, contentType: contentType, url: url }
}

exports.extractFilePathOrURLFromJSON = (body) => {
    try {
        let url = new URL(body.image)
        return url
    } catch (_) {
        return body.image
    }
    return body.image
}