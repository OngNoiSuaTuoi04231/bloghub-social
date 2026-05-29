import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

const API = "http://localhost:5000/api";

function formatTime(dateString) {
  if (!dateString) return "Vừa xong";

  return new Date(dateString).toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function Comment({ postId, dark }) {
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState("");

  useEffect(() => {
    if (!postId) return;

    const socket = io(API);
    socket.emit("join_post_room", postId);

    socket.on("new_comment_received", (newComment) => {
      if (!newComment.parentId) {
        setComments((prev) => [newComment, ...prev]);
      }
    });

    fetch(`${API}/posts/${postId}/comments`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setComments(data.comments);
      })
      .catch((err) => console.error("Lỗi lấy comment:", err));

    return () => {
      socket.emit("leave_post_room", postId);
      socket.disconnect();
    };
  }, [postId]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${API}/posts/${postId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      });

      const data = await res.json();

      if (data.success) {
        setComments((prev) => [data.comment, ...prev]);
        setContent("");
      }
    } catch (err) {
      console.error("Lỗi gửi comment:", err);
    }
  };

  return (
    <div className="mt-4">
      <form onSubmit={handleSubmitComment} className="mb-4">
        <div
          className={`flex items-center gap-2 rounded-2xl px-3 py-2 border transition-all duration-300
          ${
            dark
              ? "bg-[#1e1535] border-violet-800"
              : "bg-gray-50 border-gray-200"
          }`}
        >
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Viết bình luận..."
            className={`flex-1 bg-transparent text-[13px] outline-none
            ${
              dark
                ? "text-violet-100 placeholder-violet-700"
                : "text-gray-700 placeholder-gray-400"
            }`}
          />

          <button
            type="submit"
            className={`transition-all active:scale-90
            ${
              dark
                ? "text-violet-400 hover:text-violet-200"
                : "text-indigo-500 hover:text-indigo-700"
            }`}
          >
            <span className="material-icons-round text-[20px]">send</span>
          </button>
        </div>
      </form>

      <div className="flex flex-col gap-3">
        {comments.length === 0 ? (
          <p
            className={`text-[12px] text-center py-3
            ${dark ? "text-violet-500" : "text-gray-400"}`}
          >
            Chưa có bình luận nào
          </p>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment._id}
              comment={comment}
              postId={postId}
              dark={dark}
            />
          ))
        )}
      </div>
    </div>
  );
}

function CommentItem({ comment, postId, dark }) {
  const [replies, setReplies] = useState([]);
  const [showReplies, setShowReplies] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [openReply, setOpenReply] = useState(false);

  const loadReplies = async () => {
    if (showReplies) {
      setShowReplies(false);
      return;
    }

    try {
      const res = await fetch(
        `${API}/api/posts/${postId}/comments?parentId=${comment._id}`
      );

      const data = await res.json();

      if (data.success) {
        setReplies(data.comments);
        setShowReplies(true);
      }
    } catch (err) {
      console.error("Lỗi load replies:", err);
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${API}/api/posts/${postId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: replyText,
          parentId: comment._id,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setReplies((prev) => [data.comment, ...prev]);
        setReplyText("");
        setOpenReply(false);
        setShowReplies(true);
      }
    } catch (err) {
      console.error("Lỗi reply:", err);
    }
  };

  return (
    <div className="pl-3 border-l border-violet-200/40">
      <div
        className={`rounded-2xl px-4 py-3 transition-all duration-300
        ${dark ? "bg-[#1e1535]" : "bg-gray-50"}`}
      >
        <div className="flex items-center justify-between gap-3">
          <h4
            className={`font-bold text-[13px]
            ${dark ? "text-white" : "text-gray-900"}`}
          >
            {comment.authorName || "Người dùng"}
          </h4>

          <span
            className={`text-[10px]
            ${dark ? "text-violet-500" : "text-gray-400"}`}
          >
            {formatTime(comment.createdAt)}
          </span>
        </div>

        <p
          className={`text-[13px] mt-1 leading-relaxed whitespace-pre-wrap
          ${dark ? "text-violet-100" : "text-gray-700"}`}
        >
          {comment.content}
        </p>
      </div>

      <div className="flex items-center gap-4 mt-1 ml-2">
        <button
          type="button"
          onClick={() => setOpenReply((p) => !p)}
          className={`text-[11px] font-semibold transition-colors
          ${
            dark
              ? "text-violet-400 hover:text-violet-200"
              : "text-indigo-500 hover:text-indigo-700"
          }`}
        >
          Trả lời
        </button>

        {comment.replyCount > 0 && (
          <button
            type="button"
            onClick={loadReplies}
            className={`text-[11px] font-bold transition-colors
            ${
              dark
                ? "text-violet-500 hover:text-violet-300"
                : "text-indigo-500 hover:text-indigo-700"
            }`}
          >
            {showReplies
              ? "Ẩn phản hồi"
              : `Xem ${comment.replyCount} phản hồi`}
          </button>
        )}
      </div>

      {openReply && (
        <form onSubmit={handleReply} className="mt-2 ml-2">
          <div
            className={`flex items-center gap-2 rounded-xl px-3 py-2 border
            ${
              dark
                ? "bg-[#1a1330] border-violet-800"
                : "bg-white border-gray-200"
            }`}
          >
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Viết phản hồi..."
              className={`flex-1 bg-transparent text-[12px] outline-none
              ${
                dark
                  ? "text-violet-100 placeholder-violet-700"
                  : "text-gray-700 placeholder-gray-400"
              }`}
            />

            <button
              type="submit"
              className={`transition-all active:scale-90
              ${
                dark
                  ? "text-violet-400 hover:text-violet-200"
                  : "text-indigo-500 hover:text-indigo-700"
              }`}
            >
              <span className="material-icons-round text-[18px]">send</span>
            </button>
          </div>
        </form>
      )}

      {showReplies && replies.length > 0 && (
        <div className="flex flex-col gap-3 mt-3 ml-3">
          {replies.map((reply) => (
            <CommentItem
              key={reply._id}
              comment={reply}
              postId={postId}
              dark={dark}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Comment;