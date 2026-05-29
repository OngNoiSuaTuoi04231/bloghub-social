const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const verifyToken = require("../middleware/auth");
const upload = require("../middleware/upload");
const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const checkUser = await User.findOne({ email });
    if (checkUser) return res.status(400).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });

    await newUser.save();
    res.status(201).json({ message: "Account created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Incorrect password" });

    const token = jwt.sign({ id: user._id }, "bloghub_secret", {
      expiresIn: "7d",
    });

    const { password: _, ...userSafe } = user._doc;

    res.json({
      message: "Login successful",
      token,
      user: userSafe,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/avatar", verifyToken, upload.single("avatar"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file chosen",
      });
    }

    const userId = req.user.id || req.user._id || req.user.userId;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { avatar: req.file.path },
      { new: true }
    ).select("-password");

    res.json({
      success: true,
      message: "Update avatar successful",
      user: updatedUser,
      avatar: updatedUser.avatar,
    });
  } catch (error) {
    console.log("Failed to upload avatar:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

module.exports = router;