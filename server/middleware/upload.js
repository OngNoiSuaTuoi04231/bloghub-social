const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

// ============================================================
// MULTER + CLOUDINARY STORAGE
// Tự động upload file lên Cloudinary khi nhận request
// ============================================================
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "bloghub_media", // Tên folder trên Cloudinary
    resource_type: "auto", // Tự nhận dạng: ảnh / audio
    allowed_formats: [
      "jpg",
      "jpeg",
      "png",
      "webp", // Ảnh
      "mp3",
      "wav",
      "webm",
      "ogg", // Âm thanh
    ],
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Giới hạn 10 MB
});

module.exports = upload;