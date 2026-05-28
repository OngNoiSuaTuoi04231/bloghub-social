const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");
const verifyToken = require("../middleware/auth");

// ============================================================
// ĐẾM THÔNG BÁO CHƯA ĐỌC
// GET /api/notifications/unread-count
// ============================================================
router.get("/unread-count", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id || req.user.userId;

    const count = await Notification.countDocuments({
      receiver: userId,
      isRead: false,
    });

    res.json({
      success: true,
      count,
    });
  } catch (error) {
    console.log("Lỗi đếm notification:", error.message);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
});

router.get("/", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id || req.user.userId;

    const notifications = await Notification.find({ receiver: userId })
      .populate("sender", "username avatar")
      .populate("post", "content mediaType mediaUrl")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      notifications,
    });
  } catch (error) {
    console.log("Lỗi lấy thông báo:", error.message);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
});

router.put("/read-all", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id || req.user.userId;

    await Notification.updateMany(
      { receiver: userId },
      { isRead: true }
    );

    res.json({
      success: true,
      message: "Đã đọc tất cả thông báo",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
});

module.exports = router;