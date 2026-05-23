const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// ============================================================
// COMMENT MODEL — Hỗ trợ lồng nhau (nested reply)
// ============================================================
const commentSchema = new Schema(
  {
    // Bài viết chứa comment này
    postId: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
      index: true,
    },

    // ObjectId người viết comment (dùng để populate sau)
    authorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    // Tên hiển thị — lưu trực tiếp để render nhanh, không cần populate
    authorName: {
      type: String,
      default: "Người dùng",
    },

    // Nội dung comment
    content: {
      type: String,
      required: true,
      trim: true,
    },

    // null  = comment gốc (top-level)
    // ObjectId = đây là reply của comment cha
    parentId: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
      index: true,
    },

    // Đếm số reply trực tiếp
    replyCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

// Index tổng hợp: query nhanh theo bài viết + cấp cha + thời gian
commentSchema.index({ postId: 1, parentId: 1, createdAt: -1 });

module.exports = mongoose.model("Comment", commentSchema);
