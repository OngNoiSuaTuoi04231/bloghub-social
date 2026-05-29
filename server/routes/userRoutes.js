const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/auth");
const User = require("../models/User");

// CẬP NHẬT BIO PROFILE CỦA CHÍNH MÌNH
// PUT /api/users/profile
router.put("/profile", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id || req.user.userId;
    const { bio } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { bio: bio || "" },
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
    console.log("Failed to update bio:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// LẤY USER THEO ID
// GET /api/users/:id
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
    console.log("Failed to fetch user:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

module.exports = router;