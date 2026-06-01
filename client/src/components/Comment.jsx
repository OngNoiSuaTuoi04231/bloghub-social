import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

const API = "http://localhost:5000/api";
const SOCKET_URL = "http://localhost:5000";

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

    const socket = io(SOCKET_URL);
    socket.emit("join_post_room", postId);

    socket.on("new_comment_received", (newComment) => {
      if (!newComment.parentId) {
        setComments((prev) => {
          if (prev.some((c) => c._id === newComment._id)) return prev;
          return [newComment, ...prev];
        });
      }
    });

    socket.on("comment_updated", (updatedComment) => {
      if (!updatedComment.parentId) {
        setComments((prev) =>
          prev.map((c) =>
            c._id === updatedComment._id ? updatedComment : c
          )
        );
      }
    });

    socket.on("comment_deleted", ({ commentId, parentId }) => {
      if (!parentId) {
        setComments((prev) => prev.filter((c) => c._id !== commentId));
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

  useEffect(() => {
    const handleLocalDelete = (e) => {
      const { commentId, parentId } = e.detail;

      if (!parentId) {
        setComments((prev) => prev.filter((c) => c._id !== commentId));
      }
    };

    window.addEventListener("comment_deleted_local", handleLocalDelete);

    return () => {
      window.removeEventListener("comment_deleted_local", handleLocalDelete);
    };
  }, []);

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
        body: JSON.stringify({
          content,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setComments((prev) => {
          if (prev.some((c) => c._id === data.comment._id)) return prev;
          return [data.comment, ...prev];
        });

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
          className={`flex items-center gap-2 rounded-2xl px-3 py-2 border transition-all duration-300 ${
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
            className={`flex-1 bg-transparent text-[13px] outline-none ${
              dark
                ? "text-violet-100 placeholder-violet-700"
                : "text-gray-700 placeholder-gray-400"
            }`}
          />

          <button
            type="submit"
            className={`transition-all active:scale-90 ${
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
            className={`text-[12px] text-center py-3 ${
              dark ? "text-violet-500" : "text-gray-400"
            }`}
          >
            Be the first to comment!
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
  const [localComment, setLocalComment] = useState(comment);
  const [replies, setReplies] = useState([]);
  const [showReplies, setShowReplies] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [openReply, setOpenReply] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(comment.content);

  const currentUserId = localStorage.getItem("userId");

  const isOwner =
    String(localComment.authorId?._id || localComment.authorId) ===
    String(currentUserId);

  useEffect(() => {
    setLocalComment(comment);
    setEditText(comment.content);
  }, [comment]);

  useEffect(() => {
    const socket = io(SOCKET_URL);
    socket.emit("join_post_room", postId);

    socket.on("new_comment_received", (newComment) => {
      if (String(newComment.parentId) === String(localComment._id)) {
        setReplies((prev) => {
          if (prev.some((r) => r._id === newComment._id)) return prev;
          return [newComment, ...prev];
        });

        setShowReplies(true);
      }
    });

    socket.on("comment_updated", (updatedComment) => {
      if (String(updatedComment._id) === String(localComment._id)) {
        setLocalComment(updatedComment);
        setEditText(updatedComment.content);
      }

      if (String(updatedComment.parentId) === String(localComment._id)) {
        setReplies((prev) =>
          prev.map((r) =>
            r._id === updatedComment._id ? updatedComment : r
          )
        );
      }
    });

    socket.on("comment_deleted", ({ commentId, parentId }) => {
      if (String(parentId) === String(localComment._id)) {
        setReplies((prev) => prev.filter((r) => r._id !== commentId));
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [postId, localComment._id]);

  useEffect(() => {
    const handleLocalDelete = (e) => {
      const { commentId, parentId } = e.detail;

      if (String(parentId) === String(localComment._id)) {
        setReplies((prev) => prev.filter((r) => r._id !== commentId));
      }
    };

    window.addEventListener("comment_deleted_local", handleLocalDelete);

    return () => {
      window.removeEventListener("comment_deleted_local", handleLocalDelete);
    };
  }, [localComment._id]);

  const loadReplies = async () => {
    if (showReplies) {
      setShowReplies(false);
      return;
    }

    try {
      const res = await fetch(
        `${API}/posts/${postId}/comments?parentId=${localComment._id}`
      );

      const data = await res.json();

      if (data.success) {
        setReplies(data.comments || []);
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
      const res = await fetch(`${API}/posts/${postId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: replyText,
          parentId: localComment._id,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setReplies((prev) => {
          if (prev.some((r) => r._id === data.comment._id)) return prev;
          return [data.comment, ...prev];
        });

        setReplyText("");
        setOpenReply(false);
        setShowReplies(true);
      }
    } catch (err) {
      console.error("Lỗi reply:", err);
    }
  };

  const handleEdit = async () => {
    if (!editText.trim()) return;

    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${API}/posts/comments/${localComment._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: editText,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setLocalComment(data.comment);
        setEditText(data.comment.content);
        setEditing(false);
      } else {
        alert(data.message || "Sửa comment thất bại");
      }
    } catch (err) {
      console.error("Edit comment error:", err);
      alert("Sửa comment thất bại");
    }
  };

  const handleDelete = async () => {
    const ok = window.confirm("Bạn có chắc muốn xóa comment này không?");
    if (!ok) return;

    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${API}/posts/comments/${localComment._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data.success) {
        window.dispatchEvent(
          new CustomEvent("comment_deleted_local", {
            detail: {
              commentId: localComment._id,
              parentId: localComment.parentId,
            },
          })
        );
      } else {
        alert(data.message || "Xóa comment thất bại");
      }
    } catch (err) {
      console.error("Delete comment error:", err);
      alert("Xóa comment thất bại");
    }
  };

  return (
    <div className="pl-3 border-l border-violet-200/40">
      <div
        className={`rounded-2xl px-4 py-3 transition-all duration-300 ${
          dark ? "bg-[#1e1535]" : "bg-gray-50"
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <h4
            className={`font-bold text-[13px] ${
              dark ? "text-white" : "text-gray-900"
            }`}
          >
            {localComment.authorName || "Người dùng"}
          </h4>

          <span
            className={`text-[10px] ${
              dark ? "text-violet-500" : "text-gray-400"
            }`}
          >
            {formatTime(localComment.createdAt)}
          </span>
        </div>

        {editing ? (
          <div className="mt-2 flex flex-col gap-2">
            <input
              type="text"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className={`px-3 py-2 rounded-xl border outline-none text-[13px] ${
                dark
                  ? "bg-[#130d28] border-violet-700 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
            />

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleEdit}
                className="text-green-500 text-[11px] font-bold"
              >
                Done
              </button>

              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setEditText(localComment.content);
                }}
                className="text-red-500 text-[11px] font-bold"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p
            className={`text-[13px] mt-1 leading-relaxed whitespace-pre-wrap ${
              dark ? "text-violet-100" : "text-gray-700"
            }`}
          >
            {localComment.content}

            {localComment.isEdited && (
              <span
                className={`ml-2 text-[10px] ${
                  dark ? "text-violet-500" : "text-gray-400"
                }`}
              >
                (đã chỉnh sửa)
              </span>
            )}
          </p>
        )}
      </div>

      <div className="flex items-center gap-4 mt-1 ml-2">
        <button
          type="button"
          onClick={() => setOpenReply((p) => !p)}
          className={`text-[11px] font-semibold transition-colors ${
            dark
              ? "text-violet-400 hover:text-violet-200"
              : "text-indigo-500 hover:text-indigo-700"
          }`}
        >
          Reply
        </button>

        {isOwner && (
          <>
            <button
              type="button"
              onClick={() => {
                setEditing(true);
                setEditText(localComment.content);
              }}
              className={`text-[11px] font-semibold transition-colors ${
                dark
                  ? "text-violet-400 hover:text-violet-200"
                  : "text-indigo-500 hover:text-indigo-700"
              }`}
            >
              Edit
            </button>

            <button
              type="button"
              onClick={handleDelete}
              className={`text-[11px] font-semibold transition-colors ${
                dark
                  ? "text-red-400 hover:text-red-300"
                  : "text-red-500 hover:text-red-700"
              }`}
            >
              Delete
            </button>
          </>
        )}

        {localComment.replyCount > 0 && (
          <button
            type="button"
            onClick={loadReplies}
            className={`text-[11px] font-bold transition-colors ${
              dark
                ? "text-violet-500 hover:text-violet-300"
                : "text-indigo-500 hover:text-indigo-700"
            }`}
          >
            {showReplies
              ? "Ẩn phản hồi"
              : `Xem ${localComment.replyCount} phản hồi`}
          </button>
        )}
      </div>

      {openReply && (
        <form onSubmit={handleReply} className="mt-2 ml-2">
          <div
            className={`flex items-center gap-2 rounded-xl px-3 py-2 border ${
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
              className={`flex-1 bg-transparent text-[12px] outline-none ${
                dark
                  ? "text-violet-100 placeholder-violet-700"
                  : "text-gray-700 placeholder-gray-400"
              }`}
            />

            <button
              type="submit"
              className={`transition-all active:scale-90 ${
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