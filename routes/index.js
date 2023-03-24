var express = require('express');
var multer = require('multer');
var storage = multer.diskStorage({
destination: function (req, file, cb) {
    cb(null, 'public/uploads/');
  },
  filename: function (req, file, cb) {
    var original = file.originalname;
    var file_extension = original.split(".");
    // Make the file name the date + the file extension
    filename = Date.now() + '.' + file_extension[file_extension.length-1];
    cb(null, filename);
  }
});
var upload = multer({ storage: storage });
var router = express.Router();

const sighting_controller = require("../controllers/sighting_controller");

router.get("/sighting/index", sighting_controller.index)
router.get("/sighting/new", sighting_controller.new);
router.post("/sighting/new", upload.single('sightingImage'), sighting_controller.create);

module.exports = router;
