const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/auth");
const User = require("../models/User");
const Notification = require("../models/Notification");

const sanitize = (str) =>
  typeof str === "string"
    ? str.trim().replace(/<[^>]*>/g, "").replace(/[<>'"]/g, "")
    : "";

const sameId = (a, b) => String(a) === String(b);

const hasId = (arr = [], id) => arr.some((item) => sameId(item, id));

const getUserId = (req) => req.user.id || req.user._id || req.user.userId;

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

router.put("/follow/:id", verifyToken, async (req, res) => {
  try {
    const currentUserId = getUserId(req);
    const targetUserId = req.params.id;

    if (sameId(currentUserId, targetUserId)) {
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

    if (!hasId(currentUser.following, targetUserId)) {
      currentUser.following.push(targetUserId);
    }

    if (!hasId(targetUser.followers, currentUserId)) {
      targetUser.followers.push(currentUserId);
    }

    if (!hasId(targetUser.friendRequests, currentUserId)) {
      targetUser.friendRequests.push(currentUserId);
    }

    await currentUser.save();
    await targetUser.save();

    const notification = await Notification.create({
      receiver: targetUserId,
      sender: currentUserId,
      type: "follow",
      message: `${currentUser.username} sent you a friend request`,
    });

    await notification.populate("sender", "username avatar");

    if (req.io) {
      req.io.to(targetUserId).emit("friend_request_received", {
        senderId: currentUserId,
        senderName: currentUser.username,
        status: "need_accept",
      });

      req.io.to(targetUserId).emit("new_notification", notification);

      req.io.to(currentUserId).emit("friend_status_updated", {
        userId: targetUserId,
        status: "pending",
      });
    }

    res.json({
      success: true,
      message: "Sent a friend request",
      status: "pending",
    });
  } catch (error) {
    console.error("Follow error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

router.put("/accept/:id", verifyToken, async (req, res) => {
  try {
    const currentUserId = getUserId(req);
    const senderId = req.params.id;

    const currentUser = await User.findById(currentUserId);
    const senderUser = await User.findById(senderId);

    if (!currentUser || !senderUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const hasRequest = hasId(currentUser.friendRequests, senderId);

    if (!hasRequest) {
      return res.status(400).json({
        success: false,
        message: "No invitation from this person",
      });
    }

    if (!hasId(currentUser.following, senderId)) {
      currentUser.following.push(senderId);
    }

    if (!hasId(currentUser.followers, senderId)) {
      currentUser.followers.push(senderId);
    }

    if (!hasId(senderUser.following, currentUserId)) {
      senderUser.following.push(currentUserId);
    }

    if (!hasId(senderUser.followers, currentUserId)) {
      senderUser.followers.push(currentUserId);
    }

    currentUser.friendRequests.pull(senderId);
    senderUser.friendRequests.pull(currentUserId);

    await currentUser.save();
    await senderUser.save();

    const notification = await Notification.create({
      receiver: senderId,
      sender: currentUserId,
      type: "accept",
      message: `${currentUser.username} accepted your friend request`,
    });

    await notification.populate("sender", "username avatar");

    if (req.io) {
      req.io.to(senderId).emit("friend_status_updated", {
        userId: currentUserId,
        status: "friends",
      });

      req.io.to(currentUserId).emit("friend_status_updated", {
        userId: senderId,
        status: "friends",
      });

      req.io.to(senderId).emit("new_notification", notification);
    }

    res.json({
      success: true,
      message: "You are now friends",
      status: "friends",
    });
  } catch (error) {
    console.error("Accept friend error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

router.put("/reject/:id", verifyToken, async (req, res) => {
  try {
    const currentUserId = getUserId(req);
    const senderId = req.params.id;

    const currentUser = await User.findById(currentUserId);
    const senderUser = await User.findById(senderId);

    if (!currentUser || !senderUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    currentUser.friendRequests.pull(senderId);
    currentUser.followers.pull(senderId);
    senderUser.following.pull(currentUserId);

    await currentUser.save();
    await senderUser.save();

    const notification = await Notification.create({
      receiver: senderId,
      sender: currentUserId,
      type: "reject",
      message: `${currentUser.username} rejected your friend request`,
    });

    await notification.populate("sender", "username avatar");

    if (req.io) {
      req.io.to(senderId).emit("friend_status_updated", {
        userId: currentUserId,
        status: "none",
      });

      req.io.to(currentUserId).emit("friend_status_updated", {
        userId: senderId,
        status: "none",
      });

      req.io.to(senderId).emit("new_notification", notification);
    }

    res.json({
      success: true,
      message: "Rejected friend request",
      status: "none",
    });
  } catch (error) {
    console.error("Reject friend error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

router.put("/unfriend/:id", verifyToken, async (req, res) => {
  try {
    const currentUserId = getUserId(req);
    const targetUserId = req.params.id;

    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(targetUserId);

    if (!currentUser || !targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    currentUser.following.pull(targetUserId);
    currentUser.followers.pull(targetUserId);
    currentUser.friendRequests.pull(targetUserId);

    targetUser.following.pull(currentUserId);
    targetUser.followers.pull(currentUserId);
    targetUser.friendRequests.pull(currentUserId);

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
      message: "Unfriended",
      status: "none",
    });
  } catch (error) {
    console.error("Unfriend error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

router.get("/relationship/:id", verifyToken, async (req, res) => {
  try {
    const currentUserId = getUserId(req);
    const targetUserId = req.params.id;

    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(targetUserId);

    if (!currentUser || !targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const iFollowTarget = hasId(currentUser.following, targetUserId);
    const targetFollowsMe = hasId(targetUser.following, currentUserId);

    const targetRequestedMe = hasId(currentUser.friendRequests, targetUserId);
    const iRequestedTarget = hasId(targetUser.friendRequests, currentUserId);

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

router.get("/:id/friends", verifyToken, async (req, res) => {
  try {
    const targetUserId = req.params.id;

    const user = await User.findById(targetUserId)
      .populate("followers", "username avatar email")
      .populate("following", "username avatar email");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const followingIds = user.following.map((u) => String(u._id));

    const friends = user.followers.filter((follower) =>
      followingIds.includes(String(follower._id))
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

router.put("/profile", verifyToken, async (req, res) => {
  try {
    const userId = getUserId(req);
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
      { new: true }
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