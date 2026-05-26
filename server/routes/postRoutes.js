const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const User = require("../models/User");
const upload = require("../middleware/upload");
const verifyToken = require("../middleware/auth");

// ============================================================
// 1. LẤY DANH SÁCH BÀI VIẾT — TRANG CHỦ FEED
//    GET /api/posts
//    Query: ?page=1&limit=10
// ============================================================
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const posts = await Post.find({ visibility: "Public" })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      // populate để lấy username + avatar của người đăng
      .populate("user", "username avatar bio");

    res.status(200).json({ success: true, posts });
  } catch (error) {
    console.log("Lỗi lấy feed:", error.message);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
});

// ============================================================
// 2. TẠO BÀI VIẾT MỚI — CÓ HỖ TRỢ UPLOAD ẢNH / AUDIO
//    POST /api/posts/create
//    Headers: Authorization: Bearer <token>
//    Body: FormData (content, mediaType, visibility, media file)
// ============================================================
router.post(
  "/create",
  verifyToken,
  upload.single("image"),
  async (req, res) => {
    try {
      const { content, mediaType, audioDuration, tags, visibility, studyMode } =
        req.body;

      // Parse tags từ JSON string (frontend gửi JSON.stringify([...]))
      let parsedTags = [];
      if (tags) {
        try {
          parsedTags = JSON.parse(tags);
        } catch {
          parsedTags = [];
        }
      }

      const newPost = new Post({
        user: req.user.id, // từ JWT token
        content: content || "",
        mediaType: mediaType || (req.file ? "image_locket" : "text"),
        mediaUrl: req.file ? req.file.path : "", // Link Cloudinary
        audioDuration: audioDuration || "0:00",
        tags: parsedTags,
        visibility: visibility || "Public",
        studyMode: studyMode === "true",
      });

      await newPost.save();

      // populate trước khi trả về để frontend có ngay username + avatar
      await newPost.populate("user", "username avatar bio");

      res.status(201).json({ success: true, post: newPost });
    } catch (error) {
      console.log("Lỗi tạo bài:", error.message);
      res.status(500).json({ success: false, message: "Lỗi server" });
    }
  },
);

// ============================================================
// 3. LIKE / UNLIKE BÀI VIẾT
//    PUT /api/posts/:id/like
//    Headers: Authorization: Bearer <token>
// ============================================================
router.put("/:id/like", verifyToken, async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
      if (!post) {
        return res
          .status(404)
          .json({ success: false, message: "Không tìm thấy bài viết" });
      }
  
      const user = req.user.id.toString();
      const idx = post.likedBy.findIndex((id) => id.toString() === user);
  
      if (idx === -1) {
        // Chưa like → thêm like
        post.likedBy.push(req.user.id);
        post.likeCount += 1;
      } else {
        // Đã like → bỏ like
        post.likedBy.splice(idx, 1);
        post.likeCount = Math.max(0, post.likeCount - 1);
      }
  
      await post.save();
  
      res.json({
        success: true,
        likeCount: post.likeCount,
        liked: idx === -1, // true = vừa like, false = vừa bỏ like
      });
    } catch (error) {
      console.log("Lỗi like:", error.message);
      res.status(500).json({ success: false, message: "Lỗi server" });
    }
  });
  
  // ============================================================
  // 4. XOÁ BÀI VIẾT
  //    DELETE /api/posts/:id
  //    Headers: Authorization: Bearer <token>
  // ============================================================
  router.delete("/:id", verifyToken, async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
      if (!post) {
        return res
          .status(404)
          .json({ success: false, message: "Không tìm thấy bài viết" });
      }
  
      // Chỉ người đăng bài mới được xoá
      if (post.user.toString() !== req.user.id.toString()) {
        return res
          .status(403)
          .json({ success: false, message: "Không có quyền xoá" });
      }
  
      await Post.findByIdAndDelete(req.params.id);
      // Xoá luôn toàn bộ comment của bài viết
      await Comment.deleteMany({ postId: req.params.id });
  
      res.json({ success: true, message: "Đã xoá bài viết" });
    } catch (error) {
      console.log("Lỗi xoá bài:", error.message);
      res.status(500).json({ success: false, message: "Lỗi server" });
    }
  });
  
  // ============================================================
  // 5. GỬI BÌNH LUẬN / REPLY
  //    POST /api/posts/:postId/comments
  //    Headers: Authorization: Bearer <token>
  //    Body: { content, parentId? }
  //
  //    ⚠️  authorName được lấy từ DB (theo userId trong token)
  //        KHÔNG nhận từ client — tránh giả mạo tên
  // ============================================================
  router.post("/:postId/comments", verifyToken, async (req, res) => {
    try {
      const { postId } = req.params;
      const { content, parentId } = req.body;
  
      if (!content || !content.trim()) {
        return res
          .status(400)
          .json({ success: false, message: "Nội dung không được trống" });
      }
  
      // Kiểm tra bài viết tồn tại
      const post = await Post.findById(postId);
      if (!post) {
        return res
          .status(404)
          .json({ success: false, message: "Không tìm thấy bài viết" });
    }

    // Lấy tên user từ DB (token chỉ chứa id)
    const user = await User.findById(req.user.id).select("username avatar");
    const authorName = user ? user.username : "Người dùng";

    const newComment = new Comment({
      postId,
      authorId: req.user.id,
      authorName,
      content: content.trim(),
      parentId: parentId || null,
    });

    await newComment.save();

    // Cập nhật bộ đếm
    if (parentId) {
      await Comment.findByIdAndUpdate(parentId, { $inc: { replyCount: 1 } });
    }
    await Post.findByIdAndUpdate(postId, { $inc: { commentCount: 1 } });

    // Phát real-time qua Socket.io (req.io được inject bởi server/index.js)
    if (req.io) {
      req.io.to(`post_${postId}`).emit("new_comment_received", newComment);
    }

    res.status(201).json({ success: true, comment: newComment });
  } catch (error) {
    console.log("Lỗi comment:", error.message);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
});

// ============================================================
// 6. LẤY DANH SÁCH BÌNH LUẬN CỦA BÀI VIẾT
//    GET /api/posts/:postId/comments
//    Query: ?parentId=null  (lấy comment gốc)
//           ?parentId=<id>  (lấy reply của comment đó)
// ============================================================
router.get("/:postId/comments", async (req, res) => {
  try {
    const { postId } = req.params;
    const { parentId } = req.query;

    const query = {
      postId,
      parentId: !parentId || parentId === "null" ? null : parentId,
    };

    const comments = await Comment.find(query).sort({ createdAt: -1 });

    res.status(200).json({ success: true, comments });
  } catch (error) {
    console.log("Lỗi lấy comment:", error.message);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
});

module.exports = router;