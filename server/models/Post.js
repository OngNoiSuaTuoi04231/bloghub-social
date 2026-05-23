const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// ============================================================
// POST MODEL
// ============================================================
const postSchema = new Schema(
  {
    // Người đăng bài — tham chiếu tới User để populate username/avatar
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Nội dung văn bản
    content: {
      type: String,
      trim: true,
      maxlength: 5000,
    },

    // Loại media đính kèm
    mediaType: {
      type: String,
      enum: ["text", "image_locket", "voice_note", "pdf_document", "poll"],
      default: "text",
    },

    // URL ảnh / audio trên Cloudinary
    mediaUrl: {
      type: String,
      default: "",
    },

    // Thời lượng audio (ví dụ: "0:42")
    audioDuration: {
      type: String,
      default: "0:00",
    },

    // Danh sách thẻ chủ đề
    tags: {
      type: [String],
      default: [],
    },

    // Quyền riêng tư
    visibility: {
      type: String,
      enum: ["Public", "Friends", "Private"],
      default: "Public",
    },

    // Chế độ học tập
    studyMode: {
      type: Boolean,
      default: false,
    },

    // Đếm số like (tối ưu truy vấn)
    likeCount: {
      type: Number,
      default: 0,
    },

    // Lưu danh sách userId đã like — tránh like 2 lần
    likedBy: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // Đếm số comment (hiển thị nhanh ngoài Feed)
    commentCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

// Index giúp Feed tải nhanh
postSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Post", postSchema);
