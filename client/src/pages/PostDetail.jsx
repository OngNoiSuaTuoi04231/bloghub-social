import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useDarkMode } from "../context/DarkModeContext";

const API = "https://bloghub-social.onrender.com/api";

export default function PostDetail() {
  const { id } = useParams();
  const { dark } = useDarkMode();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [replyText, setReplyText] = useState({});

  const fetchPost = async () => {
    try {
      const res = await axios.get(`${API}/posts/${id}`);
      setPost(res.data.post);
    } catch (error) {
      console.log("Lỗi lấy bài viết:", error);
    }
  };

  const fetchRepliesRecursive = async (parentId) => {
    try {
      const res = await axios.get(
        `${API}/posts/${id}/comments?parentId=${parentId}`,
      );

      const replies = res.data.comments || [];

      const nestedReplies = await Promise.all(
        replies.map(async (reply) => {
          const childReplies = await fetchRepliesRecursive(reply._id);

          return {
            ...reply,
            replies: childReplies,
          };
        }),
      );

      return nestedReplies;
    } catch {
      return [];
    }
  };

  const fetchComments = async () => {
    try {
      const res = await axios.get(`${API}/posts/${id}/comments`);
      const rootComments = res.data.comments || [];

      const commentsWithReplies = await Promise.all(
        rootComments.map(async (comment) => {
          const replies = await fetchRepliesRecursive(comment._id);

          return {
            ...comment,
            replies,
          };
        }),
      );

      setComments(commentsWithReplies);
    } catch (error) {
      console.log("Lỗi lấy comment:", error);
    }
  };

  useEffect(() => {
    fetchPost();
    fetchComments();
  }, [id]);

  const handleSendComment = async () => {
    if (!commentText.trim()) return;

    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        `${API}/posts/${id}/comments`,
        { content: commentText },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (res.data.success) {
        setComments((prev) => [
          {
            ...res.data.comment,
            replies: [],
          },
          ...prev,
        ]);

        setCommentText("");
      }
    } catch (error) {
      console.log("Lỗi gửi comment:", error);
    }
  };

  const handleReply = async (parentId) => {
    const text = replyText[parentId];

    if (!text?.trim()) return;

    try {
      const token = localStorage.getItem("token");

      await axios.post(
        `${API}/posts/${id}/comments`,
        {
          content: text,
          parentId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setReplyText({
        ...replyText,
        [parentId]: "",
      });

      fetchComments();
    } catch (error) {
      console.log("Lỗi reply:", error);
    }
  };

  const renderReply = (reply, level = 1) => {
    return (
      <div
        key={reply._id}
        className={`rounded-lg p-3 ${dark ? "bg-[#130d28]" : "bg-white"}`}
      >
        <p className="font-semibold text-sm">{reply.authorName}</p>

        <p
          className={
            dark ? "text-violet-200 text-sm mt-1" : "text-gray-700 text-sm mt-1"
          }
        >
          {reply.content}
        </p>

        <p
          className={
            dark ? "text-violet-600 text-xs mt-1" : "text-gray-400 text-xs mt-1"
          }
        >
          {new Date(reply.createdAt).toLocaleString("vi-VN")}
        </p>

        <div className="flex gap-2 mt-3">
          <input
            value={replyText[reply._id] || ""}
            onChange={(e) =>
              setReplyText({
                ...replyText,
                [reply._id]: e.target.value,
              })
            }
            placeholder="Trả lời phản hồi..."
            className={`flex-1 px-3 py-2 rounded-lg border outline-none text-sm ${
              dark
                ? "bg-[#1e1535] border-violet-800 text-white placeholder-violet-500"
                : "bg-white border-gray-200 text-gray-800"
            }`}
          />

          <button
            type="button"
            onClick={() => handleReply(reply._id)}
            className="px-3 py-2 rounded-lg bg-violet-500 text-white text-sm"
          >
            Reply
          </button>
        </div>

        {reply.replies?.length > 0 && (
          <div className="mt-3 ml-6 flex flex-col gap-2">
            {reply.replies.map((childReply) =>
              renderReply(childReply, level + 1),
            )}
          </div>
        )}
      </div>
    );
  };

  if (!post) {
    return (
      <div
        className={`min-h-screen p-6 ${
          dark ? "bg-[#0d0820] text-white" : "bg-[#f7f4ff] text-gray-900"
        }`}
      >
        Post not found
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen px-4 py-6 ${
        dark ? "bg-[#0d0820]" : "bg-[#f7f4ff]"
      }`}
    >
      <div
        className={`max-w-3xl mx-auto rounded-3xl border p-5 shadow-sm ${
          dark
            ? "bg-[#130d28] border-violet-900 text-white"
            : "bg-white border-purple-100 text-gray-900"
        }`}
      >
        <div className="flex items-center gap-3 mb-4">
          {post.user?.avatar ? (
            <img
              src={post.user.avatar}
              alt="avatar"
              className="w-11 h-11 rounded-full object-cover"
            />
          ) : (
            <div className="w-11 h-11 rounded-full bg-indigo-500 text-white flex items-center justify-center font-black">
              {post.user?.username?.charAt(0)?.toUpperCase() || "?"}
            </div>
          )}

          <div>
            <p className="font-bold">{post.user?.username || "User"}</p>

            <p
              className={
                dark ? "text-violet-500 text-xs" : "text-gray-400 text-xs"
              }
            >
              {new Date(post.createdAt).toLocaleString("vi-VN")}
            </p>
          </div>
        </div>

        {post.content && (
          <p className={dark ? "text-violet-100 mb-4" : "text-gray-800 mb-4"}>
            {post.content}
          </p>
        )}

        {/* LIKE COUNT */}
        <div className="flex items-center gap-2 mb-4">
          <span className={dark ? "text-pink-400" : "text-pink-500"}>❤</span>

          <span
            className={`text-sm font-semibold ${
              dark ? "text-violet-300" : "text-gray-600"
            }`}
          >
            {post.likeCount || 0} lượt thích
          </span>
        </div>

        {(post.mediaType === "image" || post.mediaType === "image_locket") &&
          post.mediaUrl && (
            <img
              src={post.mediaUrl}
              alt="post"
              className="w-full rounded-2xl object-cover"
            />
          )}

        {post.mediaType === "voice_note" && post.mediaUrl && (
          <audio src={post.mediaUrl} controls className="w-full mt-4" />
        )}

        <div
          className={`mt-6 border-t pt-4 ${
            dark ? "border-violet-900" : "border-gray-100"
          }`}
        >
          <h3 className="font-bold mb-3">Bình luận</h3>

          <div className="flex gap-2 mb-4">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Viết bình luận..."
              className={`flex-1 px-4 py-2 rounded-xl border outline-none ${
                dark
                  ? "bg-[#1e1535] border-violet-800 text-white placeholder-violet-500"
                  : "bg-white border-gray-200 text-gray-800"
              }`}
            />

            <button
              type="button"
              onClick={handleSendComment}
              className="px-4 py-2 rounded-xl bg-indigo-500 text-white font-semibold"
            >
              Sent
            </button>
          </div>

          <div className="flex flex-col gap-4">
            {comments.length === 0 ? (
              <p
                className={
                  dark ? "text-violet-500 text-sm" : "text-gray-400 text-sm"
                }
              >
                No comments yet
              </p>
            ) : (
              comments.map((cmt) => (
                <div
                  key={cmt._id}
                  className={`rounded-xl p-3 ${
                    dark ? "bg-[#1e1535]" : "bg-gray-50"
                  }`}
                >
                  <p className="font-semibold text-sm">{cmt.authorName}</p>

                  <p
                    className={
                      dark
                        ? "text-violet-200 text-sm mt-1"
                        : "text-gray-700 text-sm mt-1"
                    }
                  >
                    {cmt.content}
                  </p>

                  <p
                    className={
                      dark
                        ? "text-violet-600 text-xs mt-1"
                        : "text-gray-400 text-xs mt-1"
                    }
                  >
                    {new Date(cmt.createdAt).toLocaleString("vi-VN")}
                  </p>

                  <div className="flex gap-2 mt-3">
                    <input
                      value={replyText[cmt._id] || ""}
                      onChange={(e) =>
                        setReplyText({
                          ...replyText,
                          [cmt._id]: e.target.value,
                        })
                      }
                      placeholder="Trả lời bình luận..."
                      className={`flex-1 px-3 py-2 rounded-lg border outline-none text-sm ${
                        dark
                          ? "bg-[#130d28] border-violet-800 text-white placeholder-violet-500"
                          : "bg-white border-gray-200 text-gray-800"
                      }`}
                    />

                    <button
                      type="button"
                      onClick={() => handleReply(cmt._id)}
                      className="px-3 py-2 rounded-lg bg-violet-500 text-white text-sm"
                    >
                      Reply
                    </button>
                  </div>

                  {cmt.replies?.length > 0 && (
                    <div className="mt-3 ml-6 flex flex-col gap-2">
                      {cmt.replies.map((reply) => renderReply(reply))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
