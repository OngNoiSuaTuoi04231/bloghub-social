const cloudinary = require("cloudinary").v2;

// ============================================================
// CLOUDINARY — Hardcode theo style của Leader (không dùng .env)
// ============================================================
cloudinary.config({
  cloud_name: "daxz2sem9",
  api_key: "769972498452276",
  api_secret: "XmITydy633H6tcGL9KSUNv5OmEQ",
});

module.exports = cloudinary;
