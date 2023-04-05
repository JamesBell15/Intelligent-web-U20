const express = require('express');
const multer = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/');
    }, filename: function (req, file, cb) {
        var original = file.originalname;
        var file_extension = original.split(".");
        // Make the file name the date + the file extension
        filename = Date.now() + '.' + file_extension[file_extension.length - 1];
        cb(null, filename);
    }
});
const upload = multer({storage: storage});
const router = express.Router();
const sighting_controller = require("../controllers/sighting_controller");

router.get("/", sighting_controller.index)
router.get("/:id", sighting_controller.show)
router.get("/new", sighting_controller.new)
router.post("/new", upload.single('sightingImage'), sighting_controller.create)

module.exports = router