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

    const comments = await Comment.find().sort({ createdAt: -1 });

    const notifications = await Notification.find()
      .populate("sender", "username email avatar")
      .populate("receiver", "username email avatar")
      .populate("post", "content mediaType mediaUrl")
      .sort({ createdAt: -1 });

    const groupByDay = async (Model) => {
      return await Model.aggregate([
        {
          $match: {
            createdAt: { $exists: true },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$createdAt",
                timezone: "Asia/Ho_Chi_Minh",
              },
            },
            count: { $sum: 1 },
          },
        },
        {
          $sort: {
            _id: 1,
          },
        },
      ]);
    };

    const usersByDay = await groupByDay(User);
    const postsByDay = await groupByDay(Post);
    const commentsByDay = await groupByDay(Comment);
    const notificationsByDay = await groupByDay(Notification);

    const allDates = [
      ...usersByDay.map((item) => item._id),
      ...postsByDay.map((item) => item._id),
      ...commentsByDay.map((item) => item._id),
      ...notificationsByDay.map((item) => item._id),
    ];

    const uniqueDates = [...new Set(allDates)].sort();

    const chartData = uniqueDates.map((date) => ({
      date,
      users: usersByDay.find((item) => item._id === date)?.count || 0,
      posts: postsByDay.find((item) => item._id === date)?.count || 0,
      comments: commentsByDay.find((item) => item._id === date)?.count || 0,
      notifications:
        notificationsByDay.find((item) => item._id === date)?.count || 0,
    }));

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
      chartData,
      users,
      posts,
      comments,
      notifications,
    });
  } catch (error) {
    console.log("Admin dashboard error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// DELETE /api/admin/posts/:id
router.delete("/posts/:id", async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    await Comment.deleteMany({ postId: req.params.id });
    await Notification.deleteMany({ post: req.params.id });

    res.json({
      success: true,
      message: "Post deleted",
    });
  } catch (error) {
    console.log("Delete post error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// PUT /api/admin/posts/:id/approve
router.put("/posts/:id/approve", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const wordCount =
      post.content?.trim().split(/\s+/).filter(Boolean).length || 0;

    if (wordCount > 20) {
      return res.status(400).json({
        success: false,
        message: "Post is too long",
      });
    }

    post.visibility = "Public";
    await post.save();

    res.json({
      success: true,
      message: "Post approved",
      post,
    });
  } catch (error) {
    console.log("Approve post error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});
//xoa nguoi dung
router.delete("/users/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Xóa người dùng thành công",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Xóa người dùng thất bại",
    });
  }
});

module.exports = router;