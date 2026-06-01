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
router.get("/", verifyToken, async (req, res) => {
  try {
    const currentUserId = req.user.id || req.user._id || req.user.userId;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;

    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate("user", "username avatar bio followers following")
      .lean();

    const filteredPosts = posts.filter((post) => {
      const owner = post.user;
      if (!owner?._id) return false;

      const isOwner = owner._id.toString() === currentUserId.toString();
      const isPublic = !post.privacy || post.privacy === "public";

      const iFollowOwner =
        owner.followers?.some(
          (id) => id.toString() === currentUserId.toString()
        ) || false;

      const ownerFollowMe =
        owner.following?.some(
          (id) => id.toString() === currentUserId.toString()
        ) || false;

      return isOwner || isPublic || (iFollowOwner && ownerFollowMe);
    });

    const paginatedPosts = filteredPosts.slice(
      (page - 1) * limit,
      page * limit
    );

    const postsWithCount = await attachRealCommentCount(paginatedPosts);

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
router.get("/user/:userId", verifyToken, async (req, res) => {
  try {
    const viewerId = req.user.id || req.user._id || req.user.userId;
    const profileUserId = req.params.userId;

    const profileUser = await User.findById(profileUserId);

    if (!profileUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const posts = await Post.find({ user: profileUserId })
      .sort({ createdAt: -1 })
      .populate("user", "username avatar bio followers following")
      .lean();

    const filteredPosts = posts.filter((post) => {
      const isOwner = String(viewerId) === String(profileUserId);
      const isPublic = !post.privacy || post.privacy === "public";

      const viewerFollowProfile =
        profileUser.followers?.some((id) => String(id) === String(viewerId)) ||
        false;

      const profileFollowViewer =
        profileUser.following?.some((id) => String(id) === String(viewerId)) ||
        false;

      return isOwner || isPublic || (viewerFollowProfile && profileFollowViewer);
    });

    const postsWithCount = await attachRealCommentCount(filteredPosts);

    res.status(200).json({
      success: true,
      posts: postsWithCount,
      totalPosts: posts.length,
    });
  } catch (error) {
    console.log("Failed to fetch posts by user:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// POST /api/posts/create
router.post("/create", verifyToken, upload.single("image"), async (req, res) => {
  try {
    const {
      content,
      mediaType,
      audioDuration,
      tags,
      visibility,
      privacy,
      studyMode,
    } = req.body;

    let parsedTags = [];

    if (tags) {
      try {
        parsedTags = JSON.parse(tags);
      } catch {
        parsedTags = [];
      }
    }

    const finalPrivacy = privacy === "friends" ? "friends" : "public";
    const finalVisibility = finalPrivacy === "friends" ? "Friends" : "Public";

    const newPost = new Post({
      user: req.user.id || req.user._id || req.user.userId,
      privacy: finalPrivacy,
      content: content || "",
      mediaType: mediaType || (req.file ? "image_locket" : "text"),
      mediaUrl: req.file ? req.file.path : "",
      audioDuration: audioDuration || "0:00",
      tags: parsedTags,
      visibility: visibility || finalVisibility,
      studyMode: studyMode === "true",
      commentCount: 0,
    });

    await newPost.save();
    await newPost.populate("user", "username avatar bio");

    if (req.io) {
      if (newPost.privacy === "public") {
        req.io.emit("new_post_created", newPost);
      }

      if (newPost.privacy === "friends") {
        const owner = await User.findById(newPost.user._id || newPost.user);

        const followers = owner.followers || [];
        const following = owner.following || [];

        const friendIds = followers.filter((followerId) =>
          following.some(
            (followingId) => followingId.toString() === followerId.toString()
          )
        );

        const receiverIds = [
          owner._id.toString(),
          ...friendIds.map((id) => id.toString()),
        ];

        receiverIds.forEach((id) => {
          req.io.to(id).emit("new_post_created", newPost);
        });
      }
    }

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

// PUT /api/posts/comments/:commentId
router.put("/comments/:commentId", verifyToken, async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user.id || req.user._id || req.user.userId;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: "Comment không được để trống",
      });
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    if (comment.authorId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền sửa comment này",
      });
    }

    comment.content = content.trim();
    comment.isEdited = true;
    comment.editedAt = new Date();

    await comment.save();

    if (req.io) {
      req.io.to(`post_${comment.postId}`).emit("comment_updated", comment);
    }

    res.json({
      success: true,
      message: "Đã cập nhật comment",
      comment,
    });
  } catch (error) {
    console.log("Edit comment error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// DELETE /api/posts/comments/:commentId
router.delete("/comments/:commentId", verifyToken, async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id || req.user._id || req.user.userId;

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    if (comment.authorId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền xóa comment này",
      });
    }

    const postId = comment.postId;
    const parentId = comment.parentId;

    await Comment.deleteMany({
      $or: [{ _id: commentId }, { parentId: commentId }],
    });

    if (parentId) {
      await Comment.findByIdAndUpdate(parentId, {
        $inc: { replyCount: -1 },
      });
    }

    const realCommentCount = await Comment.countDocuments({ postId });

    await Post.findByIdAndUpdate(postId, {
      commentCount: realCommentCount,
    });

    if (req.io) {
      req.io.to(`post_${postId}`).emit("comment_deleted", {
        commentId,
        parentId,
        postId,
        commentCount: realCommentCount,
      });
    }

    res.json({
      success: true,
      message: "Đã xóa comment",
      commentId,
      parentId,
      postId,
      commentCount: realCommentCount,
    });
  } catch (error) {
    console.log("Delete comment error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
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