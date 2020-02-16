const multer = require("multer");

const storage = multer.memoryStorage();

// const storage = multer.diskStorage({
//   destination: function(req, file, cb) {
//     cb(null, "./uploads/");
//   },
//   filename: function(req, file, cb) {
//     cb(null, Date.now() + "_" + file.originalname);
//   }
// });

const fileFilter = function(req, file, cb) {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "video/mp4"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 16
  },
  fileFilter: fileFilter
});

module.exports.single = name => {
  return upload.single(name);
};

module.exports.array = (name, maxCount) => {
  return upload.array(name, maxCount);
};
