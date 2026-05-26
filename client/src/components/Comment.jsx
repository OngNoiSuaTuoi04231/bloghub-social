import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const SERVER_URL = "http://localhost:5000";

function MI({ name, className = "" }) {
  return (
    <span
      className={`material-icons-round select-none leading-none ${className}`}
    >
      {name}
    </span>
  );
}

export default function Comment({ postId, dark }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);

  // Gọi API lấy danh sách bình luận của bài viết
  const fetchComments = async () => {
    try {
      const res = await axios.get(`${SERVER_URL}/api/posts/${postId}/comments`);
      if (res.data.success) {
        setComments(res.data.comments);
      }
    } catch (error) {
      console.error("Lỗi lấy comment:", error);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  // Xử lý gửi bình luận mới
  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Vui lòng đăng nhập để bình luận!");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
        `${SERVER_URL}/api/posts/${postId}/comments`,
        { content: newComment },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (res.data.success) {
        // Thêm bình luận mới lên đầu danh sách
        setComments([res.data.comment, ...comments]);
        setNewComment("");
      }
    } catch (error) {
      toast.error("Lỗi gửi bình luận");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-3">
      {/* Form nhập comment */}
      <form onSubmit={handlePostComment} className="flex gap-2 mb-4">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Viết bình luận của bạn..."
          className={`flex-1 px-4 py-2.5 rounded-xl text-[13px] outline-none border transition-colors
            ${
              dark
                ? "bg-[#1e1535] border-violet-800 text-violet-100 placeholder-violet-600 focus:border-violet-500"
                : "bg-gray-50 border-gray-200 text-gray-800 focus:border-indigo-400"
            }`}
        />
        <button
          type="submit"
          disabled={loading || !newComment.trim()}
          className={`px-4 rounded-xl font-bold flex items-center justify-center transition-all disabled:opacity-50 active:scale-95
            ${
              dark
                ? "bg-violet-600 text-white hover:bg-violet-500"
                : "bg-indigo-500 text-white hover:bg-indigo-600"
            }`}
        >
          {loading ? (
            <MI name="hourglass_empty" className="text-[18px] animate-spin" />
          ) : (
            <MI name="send" className="text-[18px]" />
          )}
        </button>
      </form>

      {/* Danh sách hiển thị comment */}
      <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-1">
        {comments.length === 0 ? (
          <p
            className={`text-center text-[12.5px] italic pb-2 ${dark ? "text-violet-500" : "text-gray-400"}`}
          >
            Chưa có bình luận nào. Hãy là người đầu tiên!
          </p>
        ) : (
          comments.map((cmt) => (
            <div key={cmt._id} className="flex gap-2.5 items-start">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-[12px] text-white bg-gradient-to-br from-indigo-400 to-violet-500 shadow-sm`}
              >
                {cmt.authorName?.slice(0, 2).toUpperCase() || "U"}
              </div>
              <div
                className={`flex-1 rounded-2xl px-3.5 py-2.5 border ${dark ? "bg-[#1a1130] border-violet-900/50" : "bg-gray-50 border-gray-100"}`}
              >
                <p
                  className={`font-bold text-[12.5px] ${dark ? "text-white" : "text-gray-900"}`}
                >
                  {cmt.authorName}
                </p>
                <p
                  className={`text-[13.5px] leading-relaxed mt-0.5 ${dark ? "text-violet-200" : "text-gray-700"}`}
                >
                  {cmt.content}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
