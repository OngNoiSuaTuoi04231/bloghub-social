// 1. Tìm hàm handleSubmitComment của Member 1, cập nhật thêm header Authorization:
const handleSubmitComment = async (e) => {
  e.preventDefault();
  if (!content.trim()) return;

  const token = localStorage.getItem("token"); // Lấy token từ luồng đăng nhập của M2

  try {
    const res = await fetch(`${API_BASE}/api/posts/${postId}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // Bổ sung quyền bảo mật
      },
      body: JSON.stringify({ content }),
    });

    const data = await res.json();
    if (data.success) {
      setContent("");
    }
  } catch (err) {
    console.error("Lỗi gửi bình luận gốc:", err);
  }
};

// 2. Thay thế hoàn toàn component CommentItem cuối file bằng logic đệ quy sạch dưới đây:
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
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_BASE}/api/posts/${postId}/comments?parentId=${comment._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      if (data.success) {
        setReplies(data.comments);
        setShowReplies(true);
      }
    } catch (err) {
      console.error("Lỗi lấy danh sách phản hồi:", err);
    }
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE}/api/posts/${postId}/comments`, {
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
      console.error("Lỗi gửi phản hồi:", err);
    }
  };

  return (
    <div className="pl-3 border-l border-violet-200/30 mt-2">
      {/* Khung nội dung bình luận chuẩn UI Member 1 */}
      <div
        className={`rounded-2xl px-4 py-2.5 transition-all duration-300 ${dark ? "bg-[#1e1535]" : "bg-gray-50"}`}
      >
        <div className="flex items-center justify-between gap-3">
          <h4
            className={`font-bold text-[12.5px] ${dark ? "text-white" : "text-gray-900"}`}
          >
            {comment.authorName}
          </h4>
          <span
            className={`text-[10px] ${dark ? "text-violet-500" : "text-gray-400"}`}
          >
            {formatTime(comment.createdAt)}
          </span>
        </div>
        <p
          className={`text-[13px] mt-1 leading-relaxed whitespace-pre-wrap ${dark ? "text-violet-100" : "text-gray-700"}`}
        >
          {comment.content}
        </p>
      </div>

      {/* Nút chức năng */}
      <div className="flex items-center gap-4 mt-1 ml-2">
        <button
          type="button"
          onClick={() => setOpenReply((p) => !p)}
          className={`text-[11px] font-semibold ${dark ? "text-violet-400" : "text-indigo-500"}`}
        >
          Trả lời
        </button>
        {(comment.replyCount > 0 || replies.length > 0) && (
          <button
            type="button"
            onClick={loadReplies}
            className={`text-[11px] font-bold ${dark ? "text-violet-500" : "text-indigo-500"}`}
          >
            {showReplies
              ? "Ẩn phản hồi"
              : `Xem thêm (${replies.length > 0 ? replies.length : comment.replyCount})`}
          </button>
        )}
      </div>

      {/* Form phản hồi nhanh */}
      {openReply && (
        <form onSubmit={handleReplySubmit} className="mt-2 ml-2">
          <div
            className={`flex items-center gap-2 rounded-xl px-3 py-1.5 border ${dark ? "bg-[#1a1330] border-violet-800" : "bg-white border-gray-200"}`}
          >
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Viết phản hồi học thuật..."
              className={`flex-1 bg-transparent text-[12px] outline-none ${dark ? "text-violet-100" : "text-gray-700"}`}
            />
            <button
              type="submit"
              className={dark ? "text-violet-400" : "text-indigo-500"}
            >
              <span className="material-icons-round text-[16px]">send</span>
            </button>
          </div>
        </form>
      )}

      {/* LUỒNG ĐỆ QUY TỰ ĐỘNG GỌI LẠI CHÍNH NÓ NẾU CÓ REPLIES CON */}
      {showReplies && replies.length > 0 && (
        <div className="flex flex-col gap-2 mt-2">
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
