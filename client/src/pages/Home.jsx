import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { useDarkMode } from "../context/DarkModeContext";
import Comment from "../components/Comment";

const API = "http://localhost:5000/api";

function MI({ name, className = "" }) {
  return (
    <span className={`material-icons-round select-none leading-none ${className}`}>
      {name}
    </span>
  );
}

function DarkToggle({ dark, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`w-9 h-9 rounded-xl flex items-center justify-center border
        transition-all duration-300 active:scale-90
        ${
          dark
            ? "bg-[#1e1535] border-violet-700 text-violet-300 hover:bg-[#2a1f4a]"
            : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
        }`}
    >
      <MI name={dark ? "light_mode" : "dark_mode"} className="text-[18px]" />
    </button>
  );
}

function Avatar({ username, avatarUrl, size = "md" }) {
  const gradients = [
    "from-indigo-400 to-violet-500",
    "from-violet-400 to-purple-500",
    "from-pink-400 to-rose-500",
    "from-emerald-400 to-teal-500",
    "from-amber-400 to-orange-500",
  ];

  const initials = username
    ? username
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  const grad = gradients[(username?.charCodeAt(0) || 0) % gradients.length];

  const sz = {
    sm: "w-8 h-8 text-[11px]",
    md: "w-10 h-10 text-[13px]",
    lg: "w-12 h-12 text-[15px]",
  }[size];

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={username}
        className={`${sz} rounded-full object-cover flex-shrink-0 shadow-md`}
      />
    );
  }

  return (
    <div
      className={`${sz} rounded-full bg-gradient-to-br ${grad}
      flex items-center justify-center font-black text-white flex-shrink-0 shadow-md`}
    >
      {initials}
    </div>
  );
}

function PostMenu({ dark, isOwner, onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const h = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };

    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all active:scale-90
          ${
            dark
              ? "text-violet-500 hover:bg-violet-900/40"
              : "text-gray-400 hover:bg-gray-100"
          }`}
      >
        <MI name="more_horiz" className="text-[20px]" />
      </button>

      {open && (
        <div
          className={`absolute right-0 top-10 z-50 w-44 rounded-2xl shadow-xl border overflow-hidden
          ${dark ? "bg-[#1e1535] border-violet-800" : "bg-white border-gray-100"}`}
        >
          {isOwner && (
            <button
              type="button"
              onClick={() => {
                onEdit();
                setOpen(false);
              }}
              className={`w-full flex items-center gap-2.5 px-4 py-3 text-[13px] font-medium transition-colors
                ${
                  dark
                    ? "text-violet-300 hover:bg-violet-900/40"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
            >
              <MI name="edit" className="text-[16px]" />
              Chỉnh sửa
            </button>
          )}

          {isOwner && (
            <button
              type="button"
              onClick={() => {
                onDelete();
                setOpen(false);
              }}
              className={`w-full flex items-center gap-2.5 px-4 py-3 text-[13px] font-medium border-t transition-colors
                ${
                  dark
                    ? "text-red-400 hover:bg-red-950/40 border-violet-800"
                    : "text-red-500 hover:bg-red-50 border-gray-100"
                }`}
            >
              <MI name="delete" className="text-[16px]" />
              Xóa bài viết
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              toast("Đã gửi báo cáo");
              setOpen(false);
            }}
            className={`w-full flex items-center gap-2.5 px-4 py-3 text-[13px] font-medium border-t transition-colors
              ${
                dark
                  ? "text-violet-400 hover:bg-violet-900/30 border-violet-800"
                  : "text-gray-600 hover:bg-gray-50 border-gray-100"
              }`}
          >
            <MI name="flag" className="text-[16px]" />
            Báo cáo
          </button>
        </div>
      )}
    </div>
  );
}

function EditModal({ post, dark, onClose, onSave }) {
  const [value, setValue] = useState(post?.content || "");

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(5px)" }}
    >
      <div
        className={`w-full max-w-[440px] rounded-3xl shadow-2xl p-6
        ${dark ? "bg-[#130d28] border border-violet-800" : "bg-white"}`}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className={`font-black text-[17px] ${dark ? "text-white" : "text-gray-900"}`}>
            Chỉnh sửa bài viết
          </h3>

          <button
            type="button"
            onClick={onClose}
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors
              ${
                dark
                  ? "text-violet-400 hover:bg-violet-900/40"
                  : "text-gray-400 hover:bg-gray-100"
              }`}
          >
            <MI name="close" className="text-[20px]" />
          </button>
        </div>

        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={4}
          className={`w-full resize-none rounded-2xl px-4 py-3 text-[14px] leading-relaxed outline-none border-2 transition-all
            ${
              dark
                ? "bg-[#1e1535] border-violet-700 text-violet-100 placeholder-violet-700 focus:border-violet-500"
                : "bg-indigo-50 border-indigo-100 text-gray-800 placeholder-gray-400 focus:border-indigo-400"
            }`}
          placeholder="Nội dung bài viết..."
        />

        <div className="flex gap-3 mt-4">
          <button
            type="button"
            onClick={onClose}
            className={`flex-1 py-3 rounded-2xl font-semibold text-[13.5px] border transition-all active:scale-95
              ${
                dark
                  ? "border-violet-700 text-violet-400 hover:bg-violet-900/30"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
          >
            Hủy
          </button>

          <button
            type="button"
            onClick={() => onSave(post._id, value)}
            className={`flex-1 py-3 rounded-2xl font-bold text-[13.5px] text-white transition-all active:scale-95
              ${
                dark
                  ? "bg-gradient-to-r from-violet-600 to-purple-600 shadow-lg shadow-violet-900/50"
                  : "bg-indigo-500 hover:bg-indigo-600 shadow-md shadow-indigo-200"
              }`}
          >
            Lưu thay đổi
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteConfirm({ dark, onClose, onConfirm }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(5px)" }}
    >
      <div
        className={`w-full max-w-[360px] rounded-3xl shadow-2xl p-6
        ${dark ? "bg-[#130d28] border border-violet-800" : "bg-white"}`}
      >
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4
          ${dark ? "bg-red-950 border border-red-900" : "bg-red-50"}`}
        >
          <MI name="delete_forever" className="text-[28px] text-red-500" />
        </div>

        <h3 className={`font-black text-[17px] text-center mb-2 ${dark ? "text-white" : "text-gray-900"}`}>
          Xóa bài viết?
        </h3>

        <p className={`text-[13px] text-center mb-6 ${dark ? "text-violet-400" : "text-gray-400"}`}>
          Hành động này không thể hoàn tác.
        </p>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className={`flex-1 py-3 rounded-2xl font-semibold text-[13.5px] border transition-all active:scale-95
              ${dark ? "border-violet-700 text-violet-400 hover:bg-violet-900/30" : "border-gray-200 text-gray-600"}`}
          >
            Hủy
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 py-3 rounded-2xl font-bold text-[13.5px] text-white bg-red-500 hover:bg-red-600 active:scale-95 transition-all"
          >
            Xóa
          </button>
        </div>
      </div>
    </div>
  );
}

function Waveform({ dark }) {
  const bars = [4, 8, 13, 10, 16, 7, 12, 9, 15, 11, 6, 14, 8, 10, 13, 5, 11, 9, 7, 12];

  return (
    <div className="flex items-center gap-[2.5px] h-7">
      {bars.map((h, i) => (
        <div
          key={i}
          style={{ height: `${h}px` }}
          className={`w-[3px] rounded-full ${dark ? "bg-violet-500" : "bg-indigo-400"}`}
        />
      ))}
    </div>
  );
}

function SkeletonCard({ dark }) {
  return (
    <div
      className={`rounded-3xl border p-4 animate-pulse
      ${dark ? "bg-[#130d28] border-violet-900/60" : "bg-white border-purple-100 shadow-sm"}`}
    >
      <div className="flex gap-3 mb-4">
        <div className={`w-10 h-10 rounded-full flex-shrink-0 ${dark ? "bg-violet-900/50" : "bg-gray-100"}`} />

        <div className="flex-1 flex flex-col gap-2 justify-center">
          <div className={`h-3 w-28 rounded-full ${dark ? "bg-violet-900/50" : "bg-gray-100"}`} />
          <div className={`h-2.5 w-20 rounded-full ${dark ? "bg-violet-900/30" : "bg-gray-50"}`} />
        </div>
      </div>

      <div className={`h-3.5 w-full rounded-full mb-2 ${dark ? "bg-violet-900/40" : "bg-gray-100"}`} />
      <div className={`h-3.5 w-3/4 rounded-full mb-4 ${dark ? "bg-violet-900/30" : "bg-gray-100"}`} />
      <div className={`h-48 w-full rounded-2xl ${dark ? "bg-violet-900/20" : "bg-gray-50"}`} />
    </div>
  );
}

function EmptyState({ dark }) {
  return (
    <div
      className={`rounded-3xl border flex flex-col items-center justify-center py-16 text-center px-6
      ${dark ? "bg-[#130d28] border-violet-900/60" : "bg-white border-purple-100 shadow-sm"}`}
    >
      <div
        className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-5
        ${dark ? "bg-violet-900/40 border border-violet-800" : "bg-indigo-50 border border-indigo-100"}`}
      >
        <MI name="dynamic_feed" className={`text-[36px] ${dark ? "text-violet-500" : "text-indigo-400"}`} />
      </div>

      <h3 className={`font-black text-[17px] mb-2 ${dark ? "text-white" : "text-gray-900"}`}>
        Chưa có bài viết nào
      </h3>

      <p className={`text-[13px] max-w-[220px] leading-relaxed ${dark ? "text-violet-500" : "text-gray-400"}`}>
        Hãy là người đầu tiên chia sẻ điều gì đó!
      </p>
    </div>
  );
}

function PostCard({ post, dark, currentUserId, onEdit, onDelete }) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes ?? 0);
  const [showCmt, setShowCmt] = useState(false);
  // const [comment, setComment] = useState("");

  const isOwner =
    currentUserId &&
    (String(post.userId) === String(currentUserId) ||
      String(post.userId?._id) === String(currentUserId));

  const timeLabel = post.createdAt
    ? new Date(post.createdAt).toLocaleString("vi-VN", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  const handleLike = () => {
    setLiked((p) => !p);
    setLikeCount((p) => (liked ? p - 1 : p + 1));
  };

  return (
    <div
      className={`rounded-3xl border overflow-hidden transition-all duration-300
      ${
        dark
          ? "bg-[#130d28] border-violet-900/60 hover:border-violet-700/50"
          : "bg-white border-gray-100 shadow-sm hover:shadow-md hover:shadow-indigo-50/80"
      }`}
    >
      <div className="flex items-start justify-between px-4 pt-4 pb-3">
        <div className="flex items-center gap-3">
          <Avatar
            username={post.username || post.userId?.username || ""}
            avatarUrl={
              String(post.userId?._id || post.userId) === String(currentUserId)
                ? localStorage.getItem("avatar")
                : post.userId?.avatar || null
            }
          />

          <div>
            <p className={`font-bold text-[14px] leading-tight ${dark ? "text-white" : "text-gray-900"}`}>
              {post.username || post.userId?.username || "User name"}
            </p>

            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`text-[11.5px] ${dark ? "text-violet-500" : "text-gray-400"}`}>
                {timeLabel}
              </span>

              {timeLabel && (
                <span className={`text-[10px] ${dark ? "text-violet-800" : "text-gray-300"}`}>·</span>
              )}

              <span
                className={`inline-flex items-center gap-0.5 text-[11px] font-medium
                ${dark ? "text-violet-500" : "text-indigo-400"}`}
              >
                <MI name={post.visibility === "Private" ? "lock" : "public"} className="text-[12px]" />
                {post.visibility || "Public"}
              </span>
            </div>
          </div>
        </div>

        <PostMenu
          dark={dark}
          isOwner={isOwner}
          onEdit={() => onEdit(post)}
          onDelete={() => onDelete(post)}
        />
      </div>

      {post.content && (
        <div className="px-4 pb-3">
          <p
            className={`text-[14.5px] leading-relaxed whitespace-pre-wrap
            ${dark ? "text-violet-100" : "text-gray-800"}`}
          >
            {post.content}
          </p>

          {post.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className={`text-[11.5px] font-semibold px-2.5 py-0.5 rounded-full
                    ${dark ? "bg-violet-900/50 text-violet-300" : "bg-indigo-50 text-indigo-500"}`}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {(post.mediaType === "image" || post.mediaType === "image_locket") && post.mediaUrl && (
        <div className="mx-4 mb-3 rounded-2xl overflow-hidden relative">
          <img
            src={post.mediaUrl}
            alt="media"
            className="w-full object-cover"
            style={{ maxHeight: 400 }}
            loading="lazy"
          />

          {post.mediaType === "image_locket" && (
            <div
              className="absolute bottom-0 left-0 right-0 py-4 px-5
              bg-gradient-to-t from-black/55 to-transparent pointer-events-none"
            >
              <p
                className="text-white text-center text-[16px] italic font-light tracking-wide"
                style={{ fontFamily: "cursive" }}
              >
                VibeNest
              </p>
            </div>
          )}
        </div>
      )}

      {post.mediaType === "voice_note" && (
        <div
          className={`mx-4 mb-3 rounded-2xl border px-4 py-3
          ${dark ? "bg-[#1e1535] border-violet-800" : "bg-indigo-50 border-indigo-100"}`}
        >
          <div className="flex items-center gap-3 mb-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0
              ${dark ? "bg-violet-600/20" : "bg-indigo-100"}`}
            >
              <MI name="mic" className={`text-[20px] ${dark ? "text-violet-400" : "text-indigo-500"}`} />
            </div>

            <div className="flex-1 min-w-0">
              <Waveform dark={dark} />
            </div>

            {post.audioDuration && (
              <span
                className={`text-[11px] font-mono font-bold flex-shrink-0
                ${dark ? "text-violet-400" : "text-indigo-400"}`}
              >
                {post.audioDuration}
              </span>
            )}
          </div>

          {post.mediaUrl && (
            <audio src={post.mediaUrl} controls className="w-full rounded-xl" style={{ height: 36 }} />
          )}

          <p
            className={`text-[10px] font-black tracking-[0.15em] uppercase mt-2
            ${dark ? "text-violet-700" : "text-indigo-300"}`}
          >
            Audio Note
          </p>
        </div>
      )}

      <div
        className={`flex items-center justify-between px-3 py-2.5 border-t
        ${dark ? "border-violet-900/60" : "border-gray-50"}`}
      >
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={handleLike}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-semibold text-[12.5px]
              transition-all duration-200 active:scale-90
              ${
                liked
                  ? dark
                    ? "text-pink-400 bg-pink-950/40"
                    : "text-pink-500 bg-pink-50"
                  : dark
                  ? "text-violet-500 hover:bg-violet-900/30"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
          >
            <MI name={liked ? "favorite" : "favorite_border"} className="text-[18px]" />
            {likeCount > 0 && likeCount}
          </button>

          <button
            type="button"
            onClick={() => setShowCmt((p) => !p)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-semibold text-[12.5px]
              transition-all duration-200 active:scale-90
              ${
                showCmt
                  ? dark
                    ? "text-indigo-400 bg-indigo-950/40"
                    : "text-indigo-500 bg-indigo-50"
                  : dark
                  ? "text-violet-500 hover:bg-violet-900/30"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
          >
            <MI name="chat_bubble_outline" className="text-[18px]" />
            {post.comments > 0 && post.comments}
          </button>

          <button
            type="button"
            onClick={() => {
              navigator.clipboard?.writeText(`${window.location.origin}/post/${post._id}`);
              toast("Đã sao chép link!");
            }}
            className={`flex items-center px-3 py-2 rounded-xl transition-all duration-200 active:scale-90
              ${dark ? "text-violet-500 hover:bg-violet-900/30" : "text-gray-500 hover:bg-gray-50"}`}
          >
            <MI name="share" className="text-[18px]" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => setSaved((p) => !p)}
          className={`px-3 py-2 rounded-xl transition-all duration-200 active:scale-90
            ${
              saved
                ? dark
                  ? "text-violet-400 bg-violet-900/40"
                  : "text-indigo-500 bg-indigo-50"
                : dark
                ? "text-violet-600 hover:bg-violet-900/30"
                : "text-gray-400 hover:bg-gray-50"
            }`}
        >
          <MI name={saved ? "bookmark" : "bookmark_border"} className="text-[20px]" />
        </button>
      </div>

      {showCmt && (
  <div
    className={`px-4 pb-4 border-t ${
      dark ? "border-violet-900/60" : "border-gray-50"
    }`}
  >
    <Comment
      postId={post._id}
      dark={dark}
    />
  </div>
)}


    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const { dark, toggleDark } = useDarkMode();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState("all");
  const [editTarget, setEditTarget] = useState(null);
  const [delTarget, setDelTarget] = useState(null);

  const currentUserId = localStorage.getItem("userId");

  const fetchPosts = async (pageNum = 1, replace = true) => {
    try {
      replace ? setLoading(true) : setLoadingMore(true);

      const token = localStorage.getItem("token");

      const res = await axios.get(`${API}/posts?page=${pageNum}&limit=10`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const fetched = res.data?.posts || [];

      setPosts((prev) => (replace ? fetched : [...prev, ...fetched]));
      setHasMore(fetched.length === 10);
    } catch {
      toast.error("Không thể tải bài viết");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchPosts(1, true);
  }, []);

  const handleEditSave = async (id, newContent) => {
    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `${API}/posts/${id}`,
        { content: newContent },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setPosts((prev) =>
        prev.map((p) => (p._id === id ? { ...p, content: newContent } : p))
      );

      toast.success("Đã cập nhật bài viết");
    } catch {
      toast.error("Cập nhật thất bại");
    } finally {
      setEditTarget(null);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      const token = localStorage.getItem("token");

      await axios.delete(`${API}/posts/${delTarget._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setPosts((prev) => prev.filter((p) => p._id !== delTarget._id));

      toast.success("Đã xóa bài viết");
    } catch {
      toast.error("Xóa thất bại");
    } finally {
      setDelTarget(null);
    }
  };

  const handleLoadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchPosts(next, false);
  };

  const visiblePosts =
    activeTab === "mine"
      ? posts.filter(
          (p) =>
            String(p.userId) === String(currentUserId) ||
            String(p.userId?._id) === String(currentUserId)
        )
      : posts;

  return (
    <div
      className={`min-h-screen transition-colors duration-500
      ${dark ? "bg-[#0d0820]" : "bg-[#f7f4ff]"}`}
    >
      <header
        className={`sticky top-0 z-40 border-b backdrop-blur-md transition-colors duration-500
        ${dark ? "bg-[#0d0820]/90 border-violet-900/50" : "bg-white/90 border-purple-100"}`}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="h-14 flex items-center justify-between">
            <div
              className={`hidden md:flex items-center gap-1 rounded-2xl p-1
              ${dark ? "bg-[#1e1535]" : "bg-gray-100"}`}
            >
              {[
                { id: "all", icon: "dynamic_feed", label: "Everyone" },
                { id: "mine", icon: "person", label: "Person" },
              ].map(({ id, icon, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12.5px] font-semibold transition-all duration-200
                    ${
                      activeTab === id
                        ? dark
                          ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-900/40"
                          : "bg-white text-indigo-600 shadow-md shadow-indigo-100"
                        : dark
                        ? "text-violet-500"
                        : "text-gray-500"
                    }`}
                >
                  <MI name={icon} className="text-[16px]" />
                  {label}
                </button>
              ))}
            </div>

            <div className="ml-auto flex items-center gap-2">
  <DarkToggle dark={dark} onToggle={toggleDark} />
</div>
          </div>

          <div className="flex md:hidden items-center gap-1 pb-2.5">
            {[
              { id: "all", icon: "dynamic_feed", label: "Tất cả" },
              { id: "mine", icon: "person", label: "Của tôi" },
            ].map(({ id, icon, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold transition-all
                  ${
                    activeTab === id
                      ? dark
                        ? "bg-violet-900/50 text-violet-300"
                        : "bg-indigo-100 text-indigo-600"
                      : dark
                      ? "text-violet-600"
                      : "text-gray-500"
                  }`}
              >
                <MI name={icon} className="text-[14px]" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
        <main className="min-w-0 flex flex-col gap-5">
          {loading ? (
            [1, 2, 3].map((i) => <SkeletonCard key={i} dark={dark} />)
          ) : visiblePosts.length === 0 ? (
            <EmptyState dark={dark} />
          ) : (
            <>
              {visiblePosts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  dark={dark}
                  currentUserId={currentUserId}
                  onEdit={setEditTarget}
                  onDelete={setDelTarget}
                />
              ))}

              {hasMore && (
                <button
                  type="button"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className={`w-full py-3.5 rounded-3xl font-bold text-[13px] border
                    flex items-center justify-center gap-2 transition-all active:scale-95
                    ${
                      dark
                        ? "bg-[#130d28] border-violet-800 text-violet-400 hover:bg-violet-900/20"
                        : "bg-white border-gray-200 text-indigo-500 hover:bg-indigo-50 shadow-sm"
                    }`}
                >
                  {loadingMore ? "Đang tải..." : "Xem thêm"}
                </button>
              )}
            </>
          )}
        </main>

        <aside className="hidden lg:flex flex-col gap-5 w-full sticky top-20">
          <div
            className={`rounded-3xl border p-5 transition-colors duration-500
            ${dark ? "bg-[#130d28] border-violet-900/60" : "bg-white border-purple-100 shadow-sm"}`}
          >
            <div className="flex items-center gap-3 mb-4">
              <Avatar
                username={localStorage.getItem("username") || ""}
                avatarUrl={localStorage.getItem("avatar") || null}
                size="lg"
              />

              <div>
                <p className={`font-black text-[15px] leading-tight ${dark ? "text-white" : "text-gray-900"}`}>
                  {localStorage.getItem("username") || "User name"}
                </p>

                <p className={`text-[12px] mt-0.5 ${dark ? "text-violet-500" : "text-gray-400"}`}>
                  {localStorage.getItem("bio") || "Chưa có mô tả cá nhân"}
                </p>
              </div>
            </div>

            <div className={`text-center py-2.5 rounded-2xl mb-4 ${dark ? "bg-[#1e1535]" : "bg-gray-50"}`}>
              <p className={`font-extrabold text-[16px] ${dark ? "text-white" : "text-gray-900"}`}>
                {
                  visiblePosts.filter(
                    (p) =>
                      String(p.userId) === String(currentUserId) ||
                      String(p.userId?._id) === String(currentUserId)
                  ).length
                }
              </p>

              <p className={`text-[11px] ${dark ? "text-violet-500" : "text-gray-400"}`}>
                Bài viết của tôi
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/CreatePost")}
              className={`w-full py-3 rounded-2xl font-bold text-[13px] text-white transition-all active:scale-95
                ${
                  dark
                    ? "bg-gradient-to-r from-violet-600 to-purple-600 shadow-lg shadow-violet-900/40"
                    : "bg-indigo-500 hover:bg-indigo-600 shadow-md shadow-indigo-200"
                }`}
            >
              New Post
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              setPage(1);
              fetchPosts(1, true);
            }}
            className={`w-full py-3 rounded-2xl font-semibold text-[13px] border flex items-center justify-center gap-2
              transition-all active:scale-95
              ${
                dark
                  ? "bg-[#130d28] border-violet-800 text-violet-400 hover:bg-violet-900/20"
                  : "bg-white border-gray-200 text-indigo-500 hover:bg-indigo-50 shadow-sm"
              }`}
          >
            <MI name="refresh" className="text-[17px]" />
            Tải lại bài viết
          </button>
        </aside>
      </div>

      <button
        type="button"
        onClick={() => navigate("/CreatePost")}
        className={`fixed bottom-5 right-5 z-40 lg:hidden w-14 h-14 rounded-2xl
          flex items-center justify-center text-white shadow-xl active:scale-90 transition-all duration-300
          ${
            dark
              ? "bg-gradient-to-br from-violet-600 to-purple-600 shadow-violet-900/60"
              : "bg-indigo-500 shadow-indigo-300"
          }`}
      >
        <MI name="add" className="text-[26px]" />
      </button>

      {editTarget && (
        <EditModal
          post={editTarget}
          dark={dark}
          onClose={() => setEditTarget(null)}
          onSave={handleEditSave}
        />
      )}

      {delTarget && (
        <DeleteConfirm
          dark={dark}
          onClose={() => setDelTarget(null)}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </div>
  );
}