const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    // Sửa userId thành authorId cho khớp với postRoutes.js
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Thêm tên người bình luận để hiển thị
    authorName: {
      type: String,
      default: "Người dùng",
    },
    // Sửa text thành content cho khớp với Frontend
    content: {
      type: String,
      required: true,
    },
    // Thêm hỗ trợ Reply (bình luận con)
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },
    // Bộ đếm số lượng trả lời
    replyCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Comment", commentSchema);
