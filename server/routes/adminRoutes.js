const express = require("express");
const router = express.Router();

const User = require("../models/User");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const Notification = require("../models/Notification");

// GET /api/admin/dashboard
router.get("/dashboard", async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    const posts = await Post.find()
      .populate("user", "username email avatar role")
      .sort({ createdAt: -1 });

    const comments = await Comment.find()
      .sort({ createdAt: -1 });

    const notifications = await Notification.find()
      .populate("sender", "username email avatar")
      .populate("receiver", "username email avatar")
      .populate("post", "content mediaType mediaUrl")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      stats: {
        totalUsers: users.length,
        totalPosts: posts.length,
        totalComments: comments.length,
        totalNotifications: notifications.length,
        totalReports: 0,
        postsToday: posts.length,
        systemStatus: "Online",
      },
      users,
      posts,
      comments,
      notifications,
    });
  } catch (error) {
    console.log("Lỗi admin dashboard:", error.message);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
});

router.delete("/posts/:id", async (req, res) => {
    try {
      await Post.findByIdAndDelete(req.params.id);
      await Comment.deleteMany({ postId: req.params.id });
      await Notification.deleteMany({ post: req.params.id });
  
      res.json({
        success: true,
        message: "Đã xóa bài viết",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Lỗi server",
      });
    }
  });
  
  router.put("/posts/:id/approve", async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
  
      if (!post) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy bài viết",
        });
      }
  
      const wordCount = post.content?.trim().split(/\s+/).filter(Boolean).length || 0;
  
      if (wordCount > 20) {
        return res.status(400).json({
          success: false,
          message: "Bài viết quá dài, không được duyệt quá 20 từ",
        });
      }
  
      post.visibility = "Public";
      await post.save();
  
      res.json({
        success: true,
        message: "Đã duyệt bài viết",
        post,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Lỗi server",
      });
    }
  });
  
module.exports = router;