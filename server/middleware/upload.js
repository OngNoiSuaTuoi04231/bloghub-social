const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "bloghub_media",
    resource_type: "auto",
    allowed_formats: [
      "jpg",
      "jpeg",
      "png",
      "webp",

      "mp3",
      "wav",
      "webm",
      "ogg",
      "mp4",
      "m4a",
      "aac",
    ],
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 20 * 1024 * 1024,
  },
});

module.exports = upload;
