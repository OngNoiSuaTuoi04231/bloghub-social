const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const verifyToken = require("../middleware/auth");
const upload = require("../middleware/upload");
const router = express.Router();

// Helper: loại bỏ tag HTML nguy hiểm (không cần cài thêm thư viện)
const sanitize = (str) =>
  typeof str === "string"
    ? str
        .trim()
        .replace(/<[^>]*>/g, "")
        .replace(/[<>'"]/g, "")
    : "";

router.post("/register", async (req, res) => {
  try {
    const username = sanitize(req.body.username);
    const email = sanitize(req.body.email);
    const password = req.body.password || "";

    if (!username || username.length < 3 || username.length > 50) {
      return res.status(400).json({ message: "Username phải từ 3-50 ký tự" });
    }

    if (!/^[\w\s\u00C0-\u024F\u1E00-\u1EFF]+$/.test(username)) {
      return res
        .status(400)
        .json({ message: "Username không được chứa ký tự đặc biệt" });
    }

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ message: "Email không hợp lệ" });
    }

    if (!password || password.length < 6 || password.length > 100) {
      return res.status(400).json({ message: "Mật khẩu phải từ 6-100 ký tự" });
    }

    const checkUser = await User.findOne({ email });

    if (checkUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(201).json({
      message: "Account created successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Incorrect password",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET || "bloghub_secret",
      {
        expiresIn: "7d",
      }
    );

    const { password: _, ...userSafe } = user._doc;

    res.json({
      message: "Login successful",
      token,
      user: userSafe,
    });
  } catch (error) {
    console.log("Login error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
});

router.put(
  "/avatar",
  verifyToken,
  upload.single("avatar"),
  async (req, res) => {
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
  }
);

module.exports = router;