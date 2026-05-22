const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const upload = require("../middleware/upload"); // Trình tiếp quản upload file của nhóm
const verifyToken = require("../middleware/auth"); // Lá chắn verify token bảo mật toàn cục từ Member 2

// =========================================================================
// 1. LẤY DANH SÁCH BÀI VIẾT (TRANG CHỦ FEED)
// =========================================================================
router.get("/", async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // Lấy các bài viết công khai, thực hiện populate thông tin User để tránh lỗi N+1 Query ngoài trang chủ
    const posts = await Post.find({ visibility: "Public" })
      .populate("userId", "username avatar bio") // Khớp nối với bảng User để lấy đầy đủ hình ảnh/tên sinh viên
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({ success: true, posts });
  } catch (error) {
    next(error);
  }
});

// =========================================================================
// 2. TẠO BÀI VIẾT MỚI (HỖ TRỢ ĐÍNH KÈM LOCKET IMAGE / AUDIO NOTE)
// =========================================================================
router.post(
  "/create",
  verifyToken,
  upload.single("media"),
  async (req, res, next) => {
    try {
      const { content, mediaType, audioDuration, tags, visibility, studyMode } =
        req.body;

      let parsedTags = [];
      if (tags) {
        try {
          parsedTags = JSON.parse(tags);
        } catch (e) {
          parsedTags = [];
        }
      }

      const newPost = new Post({
        userId: req.user.id || req.user._id, // Đồng bộ hóa ObjectId sạch đã được verifyToken bóc tách
        content,
        mediaType: mediaType || (req.file ? "image_locket" : "text"),
        mediaUrl: req.file ? req.file.path : "", // Đường dẫn trực tiếp từ kho lưu trữ đám mây Cloudinary
        audioDuration,
        tags: parsedTags,
        visibility: visibility || "Public",
        studyMode: studyMode === "true",
      });

      await newPost.save();

      // Nạp trước dữ liệu người dùng vừa tạo để trả về Frontend render ngay lập tức không cần ép tải lại trang
      const populatedPost = await Post.findById(newPost._id).populate(
        "userId",
        "username avatar bio",
      );

      res.status(201).json({ success: true, post: populatedPost });
    } catch (error) {
      next(error);
    }
  },
);

// =========================================================================
// 3. TẠO BÌNH LUẬN HOẶC PHẢN HỒI CON (REPLY ĐỆ QUY) - ĐÃ BẢO MẬT
// =========================================================================
router.post("/:postId/comments", verifyToken, async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { content, parentId } = req.body;

    // Kiểm tra xem bài viết mục tiêu có tồn tại thực tế hay không
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bài viết trên hệ thống!",
      });
    }

    // Đóng gói thực thể bình luận mới lấy thông tin chính chủ từ Token xác thực
    const newComment = new Comment({
      postId,
      content,
      authorId: req.user.id || req.user._id, // Ghi nhận ID tài khoản chính xác
      authorName: req.user.username || "Ẩn danh", // Tên thật của sinh viên lưu từ LocalStorage qua Token
      parentId: parentId || null, // Nếu có ID cha, cấu trúc cây đệ quy sẽ tự động kích hoạt
    });

    await newComment.save();

    // Thực hiện cập nhật bộ đếm tĩnh tăng 1 đơn vị
    if (parentId) {
      await Comment.findByIdAndUpdate(parentId, { $inc: { replyCount: 1 } });
    }
    // Tăng trường commentCount đồng bộ với giao diện thẻ bài viết Home.jsx của Member 1
    await Post.findByIdAndUpdate(postId, { $inc: { commentCount: 1 } });

    // Kích hoạt cổng phát sóng thời gian thực Socket.io nếu Client đang kết nối trực tiếp
    if (req.io) {
      req.io.to(`post_${postId}`).emit("new_comment_received", newComment);
    }

    res.status(201).json({ success: true, comment: newComment });
  } catch (error) {
    next(error);
  }
});

// =========================================================================
// 4. LẤY DANH SÁCH BÌNH LUẬN CỦA BÀI VIẾT (PHÂN TÁCH CẤP CHA - CON ĐỆ QUY)
// =========================================================================
router.get("/:postId/comments", async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { parentId = null } = req.query;

    // Xử lý bộ lọc thông minh: Nếu parentId truyền lên là chuỗi 'null' hoặc rỗng thì mặc định tìm bình luận gốc (null)
    const query = {
      postId,
      parentId: parentId === "null" || !parentId ? null : parentId,
    };

    // Sắp xếp bình luận mới nhất đẩy lên đầu luồng thảo luận
    const comments = await Comment.find(query).sort({ createdAt: -1 });

    res.status(200).json({ success: true, comments });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
