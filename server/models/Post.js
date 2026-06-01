const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },

    privacy: {
      type: String,
      enum: ["public", "friends"],
      default: "public",
    },

    content: {
      type: String,
      default: "",
    },

    mediaUrl: {
      type: String,
      default: "",
    },

    mediaType: {
      type: String,
      default: "text",
    },

    visibility: {
      type: String,
      enum: ["Public", "Friends"],
      default: "Public",
    },

    tags: [{ type: String }],

    audioDuration: {
      type: String,
      default: "0:00",
    },

    studyMode: {
      type: Boolean,
      default: false,
    },

    likedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    likeCount: {
      type: Number,
      default: 0,
    },

    commentCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Post", postSchema);
