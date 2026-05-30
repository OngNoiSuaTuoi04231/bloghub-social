const express = require("express");
const router = express.Router();

const Post = require("../models/Post");
const Comment = require("../models/Comment");
const User = require("../models/User");
const Notification = require("../models/Notification");

const upload = require("../middleware/upload");
const verifyToken = require("../middleware/auth");

async function attachRealCommentCount(posts) {
  return await Promise.all(
    posts.map(async (post) => {
      const commentCount = await Comment.countDocuments({
        postId: post._id,
      });

      return {
        ...post,
        commentCount,
      };
    })
  );
}

// GET /api/posts
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("user", "username avatar bio")
      .lean();

    const postsWithCount = await attachRealCommentCount(posts);

    res.status(200).json({
      success: true,
      posts: postsWithCount,
    });
  } catch (error) {
    console.log("Failed to fetch feed:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// GET /api/posts/me
router.get("/me", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id || req.user.userId;

    const posts = await Post.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate("user", "username avatar bio")
      .lean();

    const postsWithCount = await attachRealCommentCount(posts);

    res.status(200).json({
      success: true,
      posts: postsWithCount,
    });
  } catch (error) {
    console.log("Failed to fetch user posts:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// GET /api/posts/user/:userId
router.get("/user/:userId", async (req, res) => {
  try {
    const posts = await Post.find({ user: req.params.userId })
      .sort({ createdAt: -1 })
      .populate("user", "username avatar bio")
      .lean();

    const postsWithCount = await attachRealCommentCount(posts);

    res.status(200).json({
      success: true,
      posts: postsWithCount,
    });
  } catch (error) {
    console.log("Failed to fetch posts by user:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// POST /api/posts/create
router.post("/create", verifyToken, upload.single("image"), async (req, res) => {
  try {
    const { content, mediaType, audioDuration, tags, visibility, studyMode } =
      req.body;

    let parsedTags = [];

    if (tags) {
      try {
        parsedTags = JSON.parse(tags);
      } catch {
        parsedTags = [];
      }
    }

    const newPost = new Post({
      user: req.user.id || req.user._id || req.user.userId,
      content: content || "",
      mediaType: mediaType || (req.file ? "image_locket" : "text"),
      mediaUrl: req.file ? req.file.path : "",
      audioDuration: audioDuration || "0:00",
      tags: parsedTags,
      visibility: visibility || "Public",
      studyMode: studyMode === "true",
      commentCount: 0,
    });

    await newPost.save();
    await newPost.populate("user", "username avatar bio");

    res.status(201).json({
      success: true,
      post: newPost,
    });
  } catch (error) {
    console.log("Failed to create post:", error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
});

// PUT /api/posts/:id/like
router.put("/:id/like", verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const userId = req.user.id || req.user._id || req.user.userId;
    const user = userId.toString();

    const idx = post.likedBy.findIndex((id) => id.toString() === user);

    if (idx === -1) {
      post.likedBy.push(userId);
      post.likeCount += 1;
    } else {
      post.likedBy.splice(idx, 1);
      post.likeCount = Math.max(0, post.likeCount - 1);
    }

    await post.save();

    if (idx === -1 && post.user.toString() !== user) {
      const sender = await User.findById(userId).select("username avatar");

      await Notification.create({
        receiver: post.user,
        sender: userId,
        post: post._id,
        type: "like",
        message: `${sender?.username || "User"} liked your post`,
      });
    }

    res.json({
      success: true,
      likeCount: post.likeCount,
      liked: idx === -1,
    });
  } catch (error) {
    console.log("Failed to like post:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// PUT /api/posts/:id
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const { content } = req.body;
    const userId = req.user.id || req.user._id || req.user.userId;

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    if (post.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to edit",
      });
    }

    post.content = content || post.content;

    await post.save();
    await post.populate("user", "username avatar bio");

    res.json({
      success: true,
      message: "Post updated successfully",
      post,
    });
  } catch (error) {
    console.log("Failed to update post:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// DELETE /api/posts/:id
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id || req.user.userId;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    if (post.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to delete",
      });
    }

    await Post.findByIdAndDelete(req.params.id);
    await Comment.deleteMany({ postId: req.params.id });
    await Notification.deleteMany({ post: req.params.id });

    res.json({
      success: true,
      message: "Post deleted",
    });
  } catch (error) {
    console.log("Failed to delete post:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// GET /api/posts/:id
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("user", "username avatar bio")
      .lean();

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const commentCount = await Comment.countDocuments({
      postId: post._id,
    });

    res.json({
      success: true,
      post: {
        ...post,
        commentCount,
      },
    });
  } catch (error) {
    console.log("Failed to fetch post details:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// POST /api/posts/:postId/comments
router.post("/:postId/comments", verifyToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const { content, parentId } = req.body;
    const userId = req.user.id || req.user._id || req.user.userId;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: "Content cannot be empty",
      });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const user = await User.findById(userId).select("username avatar");
    const authorName = user ? user.username : "User";

    const newComment = new Comment({
      postId,
      authorId: userId,
      authorName,
      content: content.trim(),
      parentId: parentId || null,
    });

    await newComment.save();

    if (parentId) {
      const parentComment = await Comment.findById(parentId);

      if (
        parentComment &&
        parentComment.authorId.toString() !== userId.toString()
      ) {
        await Notification.create({
          receiver: parentComment.authorId,
          sender: userId,
          post: post._id,
          type: "comment",
          message: `${authorName} replied to your comment`,
        });
      }

      await Comment.findByIdAndUpdate(parentId, {
        $inc: { replyCount: 1 },
      });
    }

    const realCommentCount = await Comment.countDocuments({ postId });

    await Post.findByIdAndUpdate(postId, {
      commentCount: realCommentCount,
    });

    if (!parentId && post.user.toString() !== userId.toString()) {
      await Notification.create({
        receiver: post.user,
        sender: userId,
        post: post._id,
        type: "comment",
        message: `${authorName} commented on your post`,
      });
    }

    if (req.io) {
      req.io.to(`post_${postId}`).emit("new_comment_received", newComment);
    }

    res.status(201).json({
      success: true,
      comment: newComment,
      commentCount: realCommentCount,
    });
  } catch (error) {
    console.log("Failed to comment:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// GET /api/posts/:postId/comments
router.get("/:postId/comments", async (req, res) => {
  try {
    const { postId } = req.params;
    const { parentId } = req.query;

    const query = {
      postId,
      parentId: !parentId || parentId === "null" ? null : parentId,
    };

    const comments = await Comment.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      comments,
    });
  } catch (error) {
    console.log("Failed to fetch comments:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;