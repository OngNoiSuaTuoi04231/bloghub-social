const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/auth");
const User = require("../models/User");
const Notification = require("../models/Notification");

// Helper: loại bỏ tag HTML nguy hiểm
const sanitize = (str) =>
  typeof str === "string"
    ? str
        .trim()
        .replace(/<[^>]*>/g, "")
        .replace(/[<>'"]/g, "")
    : "";

// TÌM KIẾM NGƯỜI DÙNG
router.get("/search", verifyToken, async (req, res) => {
  try {
    const keyword = req.query.q?.trim();

    if (!keyword) {
      return res.json({
        success: true,
        users: [],
      });
    }

    const users = await User.find({
      username: {
        $regex: keyword,
        $options: "i",
      },
    })
      .select("_id username avatar email")
      .limit(10);

    res.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("Search user error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// GỬI LỜI MỜI KẾT BẠN / FOLLOW
router.put("/follow/:id", verifyToken, async (req, res) => {
  try {
    const currentUserId = req.user.id || req.user._id || req.user.userId;
    const targetUserId = req.params.id;

    if (currentUserId === targetUserId) {
      return res.status(400).json({
        success: false,
        message: "You cannot follow yourself",
      });
    }

    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(targetUserId);

    if (!currentUser || !targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const alreadyFollowing = currentUser.following?.some(
      (id) => id.toString() === targetUserId,
    );

    if (alreadyFollowing) {
      return res.json({
        success: true,
        message: "Already requested",
      });
    }

    currentUser.following.push(targetUserId);
    targetUser.followers.push(currentUserId);

    const alreadyRequested = targetUser.friendRequests?.some(
      (id) => id.toString() === currentUserId,
    );

    if (!alreadyRequested) {
      targetUser.friendRequests.push(currentUserId);
    }

    await currentUser.save();
    await targetUser.save();

    await Notification.create({
      receiver: targetUserId,
      sender: currentUserId,
      type: "follow",
      message: `${currentUser.username} Sent you a friend request`,
    });

    res.json({
      success: true,
      message: "Sent a friend request",
    });
  } catch (error) {
    console.error("Follow error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// CHẤP NHẬN LỜI MỜI
router.put("/accept/:id", verifyToken, async (req, res) => {
  try {
    const currentUserId = req.user.id || req.user._id || req.user.userId;
    const senderId = req.params.id;

    const currentUser = await User.findById(currentUserId);
    const senderUser = await User.findById(senderId);

    if (!currentUser || !senderUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const hasRequest = currentUser.friendRequests?.some(
      (id) => id.toString() === senderId,
    );

    if (!hasRequest) {
      return res.status(400).json({
        success: false,
        message: "No invitation from this person",
      });
    }

    const currentFollowingSender = currentUser.following?.some(
      (id) => id.toString() === senderId,
    );

    if (!currentFollowingSender) {
      currentUser.following.push(senderId);
    }

    const senderHasCurrentFollower = senderUser.followers?.some(
      (id) => id.toString() === currentUserId,
    );

    if (!senderHasCurrentFollower) {
      senderUser.followers.push(currentUserId);
    }

    currentUser.friendRequests.pull(senderId);

    await currentUser.save();
    await senderUser.save();

    if (req.io) {
      req.io.to(senderId).emit("friend_status_updated", {
        userId: currentUserId,
        status: "friends",
      });

      req.io.to(currentUserId).emit("friend_status_updated", {
        userId: senderId,
        status: "friends",
      });
    }

    await Notification.create({
      receiver: senderId,
      sender: currentUserId,
      type: "accept",
      message: `${currentUser.username} đã chấp nhận lời mời kết bạn`,
    });

    res.json({
      success: true,
      message: "Đã trở thành bạn bè",
    });
  } catch (error) {
    console.error("Accept friend error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// TỪ CHỐI LỜI MỜI
router.put("/reject/:id", verifyToken, async (req, res) => {
  try {
    const currentUserId = req.user.id || req.user._id || req.user.userId;
    const senderId = req.params.id;

    const currentUser = await User.findById(currentUserId);
    const senderUser = await User.findById(senderId);

    if (!currentUser || !senderUser) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng",
      });
    }

    currentUser.friendRequests.pull(senderId);
    senderUser.following.pull(currentUserId);
    currentUser.followers.pull(senderId);

    await currentUser.save();
    await senderUser.save();

    if (req.io) {
      req.io.to(senderId).emit("friend_status_updated", {
        userId: currentUserId,
        status: "none",
      });

      req.io.to(currentUserId).emit("friend_status_updated", {
        userId: senderId,
        status: "none",
      });
    }

    await Notification.create({
      receiver: senderId,
      sender: currentUserId,
      type: "reject",
      message: `${currentUser.username} đã từ chối lời mời kết bạn`,
    });

    res.json({
      success: true,
      message: "Đã từ chối lời mời",
    });
  } catch (error) {
    console.error("Reject friend error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// KIỂM TRA QUAN HỆ GIỮA 2 USER
router.get("/relationship/:id", verifyToken, async (req, res) => {
  try {
    const currentUserId = req.user.id || req.user._id || req.user.userId;
    const targetUserId = req.params.id;

    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(targetUserId);

    if (!currentUser || !targetUser) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng",
      });
    }

    const iFollowTarget = currentUser.following?.some(
      (id) => id.toString() === targetUserId,
    );

    const targetFollowsMe = targetUser.following?.some(
      (id) => id.toString() === currentUserId,
    );

    const targetRequestedMe = currentUser.friendRequests?.some(
      (id) => id.toString() === targetUserId,
    );

    const iRequestedTarget = targetUser.friendRequests?.some(
      (id) => id.toString() === currentUserId,
    );

    let status = "none";

    if (iFollowTarget && targetFollowsMe) {
      status = "friends";
    } else if (targetRequestedMe) {
      status = "need_accept";
    } else if (iRequestedTarget || iFollowTarget) {
      status = "pending";
    }

    res.json({
      success: true,
      status,
    });
  } catch (error) {
    console.error("Relationship error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// LẤY DANH SÁCH BẠN BÈ
router.get("/:id/friends", verifyToken, async (req, res) => {
  try {
    const targetUserId = req.params.id;

    const user = await User.findById(targetUserId)
      .populate("followers", "username avatar email")
      .populate("following", "username avatar email");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng",
      });
    }

    const followingIds = user.following.map((u) => u._id.toString());

    const friends = user.followers.filter((follower) =>
      followingIds.includes(follower._id.toString()),
    );

    res.json({
      success: true,
      friends,
      count: friends.length,
    });
  } catch (error) {
    console.error("Get friends error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// HỦY BẠN BÈ
router.put("/unfriend/:id", verifyToken, async (req, res) => {
  try {
    const currentUserId = req.user.id || req.user._id || req.user.userId;
    const targetUserId = req.params.id;

    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(targetUserId);

    if (!currentUser || !targetUser) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng",
      });
    }

    currentUser.following.pull(targetUserId);
    currentUser.followers.pull(targetUserId);

    targetUser.following.pull(currentUserId);
    targetUser.followers.pull(currentUserId);

    await currentUser.save();
    await targetUser.save();

    if (req.io) {
      req.io.to(targetUserId).emit("friend_status_updated", {
        userId: currentUserId,
        status: "none",
      });

      req.io.to(currentUserId).emit("friend_status_updated", {
        userId: targetUserId,
        status: "none",
      });
    }

    res.json({
      success: true,
      message: "Đã hủy kết bạn",
    });
  } catch (error) {
    console.error("Unfriend error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// CẬP NHẬT BIO PROFILE CỦA CHÍNH MÌNH
router.put("/profile", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id || req.user.userId;

    // Sử dụng sanitize từ helper để chặn mã độc
    const bio = sanitize(req.body.bio || "");

    if (bio.length > 500) {
      return res.status(400).json({
        success: false,
        message: "Bio tối đa 500 ký tự",
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { bio },
      { new: true },
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Failed to update bio:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// LẤY USER THEO ID
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Failed to fetch user:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

module.exports = router;
