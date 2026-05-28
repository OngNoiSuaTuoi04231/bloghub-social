import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:5000/api";

function MI({ name, className = "" }) {
  return (
    <span className={`material-icons-round select-none leading-none ${className}`}>
      {name}
    </span>
  );
}

function Avatar({ name = "?", size = "md" }) {
  const initials = name?.charAt(0)?.toUpperCase() || "?";

  const sz = {
    sm: "w-8 h-8 text-[11px]",
    md: "w-9 h-9 text-[12px]",
    lg: "w-10 h-10 text-[13px]",
  }[size];

  return (
    <div
      className={`${sz} rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center font-black text-white flex-shrink-0`}
    >
      {initials}
    </div>
  );
}

function StatCard({ icon, label, value, dark }) {
  return (
    <div
      className={`rounded-2xl border p-5 flex-1 ${
        dark ? "bg-[#130d28] border-violet-900/60" : "bg-white border-gray-100 shadow-sm"
      }`}
    >
      <MI
        name={icon}
        className={`text-[28px] ${dark ? "text-violet-400" : "text-indigo-500"}`}
      />

      <p className={`text-[12px] mt-3 ${dark ? "text-violet-500" : "text-gray-500"}`}>
        {label}
      </p>

      <p className={`text-[28px] font-black ${dark ? "text-white" : "text-gray-900"}`}>
        {value ?? 0}
      </p>
    </div>
  );
}

function NavItem({ icon, label, active, onClick, dark }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all
        ${
          active
            ? dark
              ? "bg-violet-900/60 text-violet-300"
              : "bg-indigo-50 text-indigo-600"
            : dark
            ? "text-violet-600 hover:bg-violet-900/30"
            : "text-gray-600 hover:bg-gray-50"
        }`}
    >
      <MI name={icon} className="text-[18px]" />
      {label}
    </button>
  );
}

function ModerationCard({ item, dark, onDelete, onApprove }) {
  return (
    <div
      className={`rounded-2xl border overflow-hidden ${
        dark ? "bg-[#1e1535] border-violet-800/60" : "bg-white border-gray-100 shadow-sm"
      }`}
    >
      <div
        className={`flex items-center justify-between px-4 py-3 border-b ${
          dark ? "border-violet-800/40" : "border-gray-50"
        }`}
      >
        <div className="flex items-center gap-2">
          <MI name="article" className={dark ? "text-violet-500" : "text-gray-400"} />

          <span className={`text-[13px] font-bold ${dark ? "text-violet-300" : "text-gray-800"}`}>
            Post by {item.user?.username || "Unknown"}
          </span>
        </div>

        <span
          className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
            dark
              ? "bg-amber-950 text-amber-400 border border-amber-900"
              : "bg-amber-50 text-amber-600 border border-amber-200"
          }`}
        >
          PENDING
        </span>
      </div>

      <div className="px-4 py-4">
        <p className={`text-[14px] italic ${dark ? "text-violet-300" : "text-gray-700"}`}>
          "{item.content || item.mediaType || "Không có nội dung"}"
        </p>

        {item.mediaUrl &&
          (item.mediaType === "image" || item.mediaType === "image_locket") && (
            <img
              src={item.mediaUrl}
              alt="post"
              className="mt-3 w-full max-h-[260px] rounded-xl object-cover"
            />
          )}

        {item.mediaUrl && item.mediaType === "voice_note" && (
          <audio src={item.mediaUrl} controls className="w-full mt-3" />
        )}
      </div>

      <div
        className={`flex items-center justify-end gap-4 px-4 py-3 border-t ${
          dark ? "border-violet-800/40" : "border-gray-50"
        }`}
      >
        <button
          type="button"
          onClick={() => onDelete(item._id)}
          className="flex items-center gap-2 text-red-500 font-semibold"
        >
          <MI name="delete" />
          Delete
        </button>

        <button
          type="button"
          onClick={() => onApprove(item._id)}
          className="flex items-center gap-2 text-emerald-600 font-semibold"
        >
          <MI name="check_circle" />
          Approve
        </button>
      </div>
    </div>
  );
}

export default function Admin() {
  const navigate = useNavigate();

  const [dark, setDark] = useState(false);
  const [activeNav, setActiveNav] = useState("statistics");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(`${API}/admin/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setStats(res.data.stats || {});
      setUsers(res.data.users || []);
      setPosts(res.data.posts || []);
      setNotifications(res.data.notifications || []);
    } catch (error) {
      console.log("Lỗi admin:", error);
      setStats({});
      setUsers([]);
      setPosts([]);
      setNotifications([]);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    navigate("/login");
  };

  const deletePost = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await axios.delete(`${API}/admin/posts/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      fetchData();
    } catch {
      alert("Xóa bài viết thất bại");
    }
  };

  const approvePost = async (id) => {
    try {
      const post = posts.find((p) => p._id === id);
      const wordCount =
        post?.content?.trim().split(/\s+/).filter(Boolean).length || 0;

      if (wordCount > 20) {
        alert("Bài viết quá dài, không được duyệt quá 20 từ");
        return;
      }

      const token = localStorage.getItem("token");

      await axios.put(
        `${API}/admin/posts/${id}/approve`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchData();
    } catch {
      alert("Duyệt bài viết thất bại");
    }
  };

  const filteredUsers = users.filter((u) =>
    searchQuery
      ? u.username?.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  return (
    <div
      className={`min-h-screen flex flex-col ${
        dark ? "bg-[#0d0820]" : "bg-[#f4f6fb]"
      }`}
    >
      <header
        className={`sticky top-0 z-40 border-b backdrop-blur-md ${
          dark ? "bg-[#0d0820]/90 border-violet-900/50" : "bg-white/90 border-gray-100"
        }`}
      >
        <div className="px-4 h-[54px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen((p) => !p)}
              className={`lg:hidden w-9 h-9 rounded-xl border ${
                dark ? "border-violet-800 text-violet-400" : "border-gray-200 text-gray-500"
              }`}
            >
              <MI name="menu" className="text-[20px]" />
            </button>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-500 flex items-center justify-center">
                <span className="text-white font-black text-[14px]">A</span>
              </div>

              <span className={`font-black text-[15px] ${dark ? "text-violet-300" : "text-gray-800"}`}>
                Admin Dashboard
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setDark((p) => !p)}
              className={`w-9 h-9 rounded-xl border ${
                dark ? "bg-[#1e1535] border-violet-700 text-violet-300" : "bg-white border-gray-200 text-gray-500"
              }`}
            >
              <MI name={dark ? "light_mode" : "dark_mode"} className="text-[18px]" />
            </button>

            <button
              type="button"
              onClick={logout}
              className="w-9 h-9 rounded-xl text-red-500"
            >
              <MI name="logout" className="text-[18px]" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <aside
          className={`fixed lg:sticky top-[54px] left-0 z-30 h-[calc(100vh-54px)] w-[220px] border-r p-4 transition-all
          ${dark ? "bg-[#0d0820] border-violet-900/50" : "bg-white border-gray-100"}
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
        >
          <p className={`text-[11px] font-black uppercase mb-3 ${dark ? "text-violet-700" : "text-gray-400"}`}>
            Management
          </p>

          <NavItem
            icon="bar_chart"
            label="Statistics"
            active={activeNav === "statistics"}
            onClick={() => setActiveNav("statistics")}
            dark={dark}
          />

          <NavItem
            icon="article"
            label="Content Management"
            active={activeNav === "content"}
            onClick={() => setActiveNav("content")}
            dark={dark}
          />

          <NavItem
            icon="manage_accounts"
            label="User Management"
            active={activeNav === "users"}
            onClick={() => setActiveNav("users")}
            dark={dark}
          />
        </aside>

        <main className="flex-1 p-5 md:p-6">
          {(activeNav === "statistics" ||
            activeNav === "users" ||
            activeNav === "content") && (
            <section className="mb-6">
              <h2 className={`font-black text-[20px] mb-4 ${dark ? "text-white" : "text-gray-900"}`}>
                Statistics Overview
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <StatCard icon="group" label="Total Users" value={stats.totalUsers} dark={dark} />
                <StatCard icon="article" label="Total Posts" value={stats.totalPosts} dark={dark} />
                <StatCard icon="comment" label="Total Comments" value={stats.totalComments} dark={dark} />
                <StatCard icon="notifications" label="Notifications" value={stats.totalNotifications} dark={dark} />
              </div>
            </section>
          )}

          {(activeNav === "statistics" || activeNav === "users") && (
            <section className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className={`font-black text-[18px] ${dark ? "text-white" : "text-gray-900"}`}>
                  User Management
                </h2>

                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm user..."
                  className="px-4 py-2 rounded-xl border outline-none text-sm"
                />
              </div>

              <div
                className={`rounded-2xl border overflow-hidden ${
                  dark ? "bg-[#130d28] border-violet-900/60" : "bg-white border-gray-100 shadow-sm"
                }`}
              >
                {filteredUsers.map((user) => (
                  <div
                    key={user._id}
                    className={`flex items-center gap-3 px-4 py-3 border-b last:border-b-0 ${
                      dark ? "border-violet-900/50" : "border-gray-50"
                    }`}
                  >
                    <Avatar name={user.username} />

                    <div className="flex-1">
                      <p className={`font-bold ${dark ? "text-white" : "text-gray-900"}`}>
                        {user.username}
                      </p>
                      <p className={`text-xs ${dark ? "text-violet-600" : "text-gray-400"}`}>
                        {user.email}
                      </p>
                    </div>

                    <span className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-600">
                      {user.role || "user"}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {(activeNav === "statistics" || activeNav === "content") && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`font-black text-[18px] ${dark ? "text-white" : "text-gray-900"}`}>
                  Content Moderation
                </h2>

                <span className="text-[12px] font-bold px-4 py-2 rounded-full bg-red-50 text-red-500 border border-red-200">
                  {posts.length} Posts
                </span>
              </div>

              <div className="flex flex-col gap-4">
                {posts.length === 0 ? (
                  <div className="rounded-2xl border bg-white p-8 text-center text-gray-400">
                    Không có bài viết
                  </div>
                ) : (
                  posts.map((item) => (
                    <ModerationCard
                      key={item._id}
                      item={item}
                      dark={dark}
                      onDelete={deletePost}
                      onApprove={approvePost}
                    />
                  ))
                )}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}