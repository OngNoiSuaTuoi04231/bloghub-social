const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/auth");
const User = require("../models/User");

const sanitize = (str) =>
  typeof str === "string"
    ? str
        .trim()
        .replace(/<[^>]*>/g, "")
        .replace(/[<>'"]/g, "")
    : "";

// PUT /api/users/profile
router.put("/profile", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id || req.user.userId;

    // Sanitize bio
    const bio = sanitize(req.body.bio || "");
    if (bio.length > 500) {
      return res
        .status(400)
        .json({ success: false, message: "Bio tối đa 500 ký tự" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { bio },
      { new: true },
    ).select("-password");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.log("Failed to update bio:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// GET /api/users/:id
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.log("Failed to fetch user:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
