const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary"); // Chắc chắn phải có dấu { }
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "bloghub_media",
    // Cho phép upload cả ảnh và file âm thanh
    allowed_formats: [
      "jpg",
      "png",
      "jpeg",
      "webp",
      "mp3",
      "wav",
      "webm",
      "ogg",
    ],
    resource_type: "auto",
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Giới hạn 10MB
});

module.exports = upload;
