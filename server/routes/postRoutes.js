const express = require("express");
const router = express.Router();

const Post = require("../models/Post");
const Comment = require("../models/Comment");
const User = require("../models/User");
const Notification = require("../models/Notification");

const upload = require("../middleware/upload");
const verifyToken = require("../middleware/auth");

// ============================================================
// 1. LẤY DANH SÁCH BÀI VIẾT — TRANG CHỦ FEED
//    GET /api/posts
// ============================================================
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("user", "username avatar bio");

    res.status(200).json({ success: true, posts });
  } catch (error) {
    console.log("Lỗi lấy feed:", error.message);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
});

// ============================================================
// 1.1. LẤY BÀI VIẾT CÁ NHÂN — TAB PERSON
//    GET /api/posts/me
// ============================================================
router.get("/me", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id || req.user.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Không xác định được user từ token",
      });
    }

    const posts = await Post.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate("user", "username avatar bio");

    res.status(200).json({ success: true, posts });
  } catch (error) {
    console.log("Lỗi lấy bài cá nhân:", error.message);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
});
// ============================================================
// 1.2. LẤY BÀI VIẾT THEO USER ID — PROFILE NGƯỜI KHÁC
//    GET /api/posts/user/:userId
// ============================================================
router.get("/user/:userId", async (req, res) => {
  try {
    const posts = await Post.find({ user: req.params.userId })
      .sort({ createdAt: -1 })
      .populate("user", "username avatar bio");

    res.status(200).json({
      success: true,
      posts,
    });
  } catch (error) {
    console.log("Lỗi lấy bài theo user:", error.message);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
});

// ============================================================
// 2. TẠO BÀI VIẾT MỚI
//    POST /api/posts/create
// ============================================================
router.post("/create", verifyToken, upload.single("image"), async (req, res) => {
  try {
    const { content, mediaType, audioDuration, tags, visibility, studyMode } =
      req.body;

    let parsedTags = [];

    if (tags) {
      try {
        parsedTags = JSON.parse(tags);
      } catch {
        parsedTags = [];
      }
    }

    const newPost = new Post({
      user: req.user.id,
      content: content || "",
      mediaType: mediaType || (req.file ? "image_locket" : "text"),
      mediaUrl: req.file ? req.file.path : "",
      audioDuration: audioDuration || "0:00",
      tags: parsedTags,
      visibility: visibility || "Public",
      studyMode: studyMode === "true",
    });

    await newPost.save();
    await newPost.populate("user", "username avatar bio");

    res.status(201).json({
      success: true,
      post: newPost,
    });
  } catch (error) {
    console.log("Lỗi tạo bài:", error.message);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
});

// ============================================================
// 3. LIKE / UNLIKE BÀI VIẾT
//    PUT /api/posts/:id/like
// ============================================================
router.put("/:id/like", verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bài viết",
      });
    }

    const userId = req.user.id || req.user._id || req.user.userId;
    const user = userId.toString();

    const idx = post.likedBy.findIndex((id) => id.toString() === user);

    if (idx === -1) {
      post.likedBy.push(userId);
      post.likeCount += 1;
    } else {
      post.likedBy.splice(idx, 1);
      post.likeCount = Math.max(0, post.likeCount - 1);
    }

    await post.save();

    // Tạo thông báo khi LIKE, không tạo khi unlike, không tự thông báo chính mình
    if (idx === -1 && post.user.toString() !== user) {
      const sender = await User.findById(userId).select("username avatar");

      await Notification.create({
        receiver: post.user,
        sender: userId,
        post: post._id,
        type: "like",
        message: `${sender?.username || "Ai đó"} đã thích bài viết của bạn`,
      });
    }

    res.json({
      success: true,
      likeCount: post.likeCount,
      liked: idx === -1,
    });
  } catch (error) {
    console.log("Lỗi like:", error.message);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
});

// ============================================================
// 3.1. CHỈNH SỬA BÀI VIẾT
//    PUT /api/posts/:id
// ============================================================
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const { content } = req.body;
    const userId = req.user.id || req.user._id || req.user.userId;

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bài viết",
      });
    }

    if (post.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Không có quyền chỉnh sửa",
      });
    }

    post.content = content || post.content;

    await post.save();
    await post.populate("user", "username avatar bio");

    res.json({
      success: true,
      message: "Đã cập nhật bài viết",
      post,
    });
  } catch (error) {
    console.log("Lỗi chỉnh sửa bài viết:", error.message);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
});

// ============================================================
// 4. XOÁ BÀI VIẾT
//    DELETE /api/posts/:id
// ============================================================
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id || req.user.userId;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bài viết",
      });
    }

    if (post.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Không có quyền xoá",
      });
    }

    await Post.findByIdAndDelete(req.params.id);
    await Comment.deleteMany({ postId: req.params.id });
    await Notification.deleteMany({ post: req.params.id });

    res.json({
      success: true,
      message: "Đã xoá bài viết",
    });
  } catch (error) {
    console.log("Lỗi xoá bài:", error.message);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
});
// ============================================================
// 4.1. LẤY CHI TIẾT 1 BÀI VIẾT
//    GET /api/posts/:id
// ============================================================
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("user", "username avatar bio");

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bài viết",
      });
    }

    res.json({
      success: true,
      post,
    });
  } catch (error) {
    console.log("Lỗi lấy chi tiết bài viết:", error.message);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
});
// ============================================================
// 5. GỬI BÌNH LUẬN / REPLY
//    POST /api/posts/:postId/comments
// ============================================================
router.post("/:postId/comments", verifyToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const { content, parentId } = req.body;
    const userId = req.user.id || req.user._id || req.user.userId;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: "Nội dung không được trống",
      });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bài viết",
      });
    }

    const user = await User.findById(userId).select("username avatar");
    const authorName = user ? user.username : "Người dùng";

    const newComment = new Comment({
      postId,
      authorId: userId,
      authorName,
      content: content.trim(),
      parentId: parentId || null,
    });

    await newComment.save();

    // Reply comment → thông báo cho chủ comment gốc
    if (parentId) {
      const parentComment = await Comment.findById(parentId);

      if (
        parentComment &&
        parentComment.authorId.toString() !== userId.toString()
      ) {
        await Notification.create({
          receiver: parentComment.authorId,
          sender: userId,
          post: post._id,
          type: "comment",
          message: `${authorName} đã trả lời bình luận của bạn`,
        });
      }

      await Comment.findByIdAndUpdate(parentId, {
        $inc: { replyCount: 1 },
      });
    }

    // Comment bài viết → thông báo cho chủ bài viết
    if (!parentId && post.user.toString() !== userId.toString()) {
      await Notification.create({
        receiver: post.user,
        sender: userId,
        post: post._id,
        type: "comment",
        message: `${authorName} đã bình luận bài viết của bạn`,
      });
    }

    await Post.findByIdAndUpdate(postId, {
      $inc: { commentCount: 1 },
    });

    if (req.io) {
      req.io.to(`post_${postId}`).emit("new_comment_received", newComment);
    }

    res.status(201).json({
      success: true,
      comment: newComment,
    });
  } catch (error) {
    console.log("Lỗi comment:", error.message);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
});

// ============================================================
// 6. LẤY DANH SÁCH BÌNH LUẬN CỦA BÀI VIẾT
//    GET /api/posts/:postId/comments
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

    res.status(200).json({
      success: true,
      comments,
    });
  } catch (error) {
    console.log("Lỗi lấy comment:", error.message);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
});

module.exports = router;