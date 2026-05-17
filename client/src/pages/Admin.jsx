import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function MI({ name, className = "" }) {
  return (
    <span className={`material-icons-round select-none leading-none ${className}`}>
      {name}
    </span>
  );
}

function Avatar({ name = "?", size = "md" }) {
  const grads = [
    "from-indigo-400 to-violet-500",
    "from-violet-400 to-purple-500",
    "from-pink-400 to-rose-500",
    "from-emerald-400 to-teal-500",
  ];

  const safeName = name || "?";

  const initials = safeName
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const g = grads[safeName.charCodeAt(0) % grads.length];

  const sz = {
    sm: "w-8 h-8 text-[11px]",
    md: "w-9 h-9 text-[12px]",
    lg: "w-10 h-10 text-[13px]",
  }[size];

  return (
    <div
      className={`${sz} rounded-full bg-gradient-to-br ${g} flex items-center justify-center font-black text-white flex-shrink-0`}
    >
      {initials}
    </div>
  );
}

function StatCard({ icon, label, value, sub, badge, badgeColor, dark }) {
  return (
    <div
      className={`rounded-2xl border p-5 flex flex-col gap-3 flex-1 min-w-0 transition-colors duration-300
      ${dark ? "bg-[#130d28] border-violet-900/60" : "bg-white border-gray-100 shadow-sm"}`}
    >
      <div className="flex items-start justify-between">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center
          ${dark ? "bg-violet-900/50" : "bg-indigo-50"}`}
        >
          <MI
            name={icon}
            className={`text-[22px] ${
              dark ? "text-violet-400" : "text-indigo-500"
            }`}
          />
        </div>

        {badge && (
          <span
            className={`text-[11.5px] font-bold px-2 py-0.5 rounded-full ${badgeColor}`}
          >
            {badge}
          </span>
        )}
      </div>

      <div>
        <p
          className={`text-[12.5px] font-medium mb-1 ${
            dark ? "text-violet-500" : "text-gray-500"
          }`}
        >
          {label}
        </p>

        <p
          className={`text-[26px] font-black leading-none ${
            dark ? "text-white" : "text-gray-900"
          }`}
        >
          {value ?? "—"}
        </p>

        {sub && (
          <p
            className={`text-[11.5px] mt-1.5 ${
              dark ? "text-violet-600" : "text-gray-400"
            }`}
          >
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}

function GrowthChart({ dark, data = [] }) {
  const bars = Array.isArray(data) && data.length > 0 ? data : [0];
  const max = Math.max(...bars, 1);

  return (
    <div
      className={`rounded-2xl border p-5 flex-1 min-w-0 min-h-[148px] transition-colors
      ${dark ? "bg-[#130d28] border-violet-900/60" : "bg-white border-gray-100 shadow-sm"}`}
    >
      <p
        className={`text-[13px] font-bold mb-4 ${
          dark ? "text-violet-300" : "text-gray-700"
        }`}
      >
        Growth Chart
      </p>

      <div className="flex items-end gap-2 h-[68px]">
        {bars.map((h, i) => (
          <div key={i} className="flex-1 flex flex-col justify-end">
            <div
              style={{ height: `${(h / max) * 68}px` }}
              className={`rounded-t-lg transition-all duration-500
                ${
                  i === bars.length - 1
                    ? dark
                      ? "bg-violet-500"
                      : "bg-indigo-500"
                    : dark
                    ? "bg-violet-800/60"
                    : "bg-indigo-200"
                }`}
            />
          </div>
        ))}
      </div>

      <p
        className={`text-[11px] mt-2.5 ${
          dark ? "text-violet-600" : "text-gray-400"
        }`}
      >
        New Registrations
      </p>
    </div>
  );
}

function ModerationCard({ item, dark, onDelete, onApprove }) {
  const statusMap = {
    reported: {
      label: "REPORTED",
      cls: dark
        ? "bg-red-950 text-red-400 border border-red-900"
        : "bg-red-50 text-red-500 border border-red-200",
    },
    pending: {
      label: "PENDING",
      cls: dark
        ? "bg-amber-950 text-amber-400 border border-amber-900"
        : "bg-amber-50 text-amber-600 border border-amber-200",
    },
    flagged: {
      label: "FLAGGED",
      cls: dark
        ? "bg-orange-950 text-orange-400 border border-orange-900"
        : "bg-orange-50 text-orange-600 border border-orange-200",
    },
  };

  const st = statusMap[item.status] || statusMap.pending;

  return (
    <div
      className={`rounded-2xl border overflow-hidden transition-colors
      ${dark ? "bg-[#1e1535] border-violet-800/60" : "bg-white border-gray-100 shadow-sm"}`}
    >
      <div
        className={`flex items-center justify-between px-4 py-3 border-b
        ${dark ? "border-violet-800/40" : "border-gray-50"}`}
      >
        <div className="flex items-center gap-2">
          <MI
            name={item.type === "comment" ? "comment" : "article"}
            className={`text-[16px] ${
              dark ? "text-violet-500" : "text-gray-400"
            }`}
          />

          <span
            className={`text-[12.5px] font-semibold ${
              dark ? "text-violet-300" : "text-gray-700"
            }`}
          >
            {item.type === "comment" ? "Comment" : "Post"} by {item.author}
          </span>
        </div>

        <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${st.cls}`}>
          {st.label}
        </span>
      </div>

      <div className="px-4 py-3">
        <p
          className={`text-[13px] leading-relaxed italic ${
            dark ? "text-violet-300" : "text-gray-600"
          }`}
        >
          "{item.content}"
        </p>
      </div>

      <div
        className={`flex items-center justify-end gap-3 px-4 py-3 border-t
        ${dark ? "border-violet-800/40" : "border-gray-50"}`}
      >
        <button
          type="button"
          onClick={() => onDelete(item.id)}
          className={`flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-xl transition-all active:scale-95
            ${dark ? "text-red-400 hover:bg-red-950/40" : "text-red-500 hover:bg-red-50"}`}
        >
          <MI name="delete" className="text-[15px]" />
          Delete
        </button>

        <button
          type="button"
          onClick={() => onApprove(item.id)}
          className={`flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-xl transition-all active:scale-95
            ${dark ? "text-emerald-400 hover:bg-emerald-950/40" : "text-emerald-600 hover:bg-emerald-50"}`}
        >
          <MI name="check_circle" className="text-[15px]" />
          Approve
        </button>
      </div>
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
            ? "text-violet-600 hover:bg-violet-900/30 hover:text-violet-400"
            : "text-gray-600 hover:bg-gray-50"
        }`}
    >
      <MI name={icon} className="text-[18px]" />
      {label}
    </button>
  );
}

function Admin() {
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const [dark, setDark] = useState(false);
  const [activeNav, setActiveNav] = useState("statistics");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingBan, setLoadingBan] = useState(null);
  const [notificationOpen, setNotificationOpen] = useState(false);

  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    localStorage.removeItem("role");

    navigate("/login");
  };

  useEffect(() => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDark(prefersDark);
  }, []);

  useEffect(() => {
    fetchData();
    fetchReports();
    fetchNotifications();
  }, []);

  const fetchData = async () => {
    try {
      const statsRes = await axios.get("http://localhost:5000/api/admin/stats");
      const usersRes = await axios.get("http://localhost:5000/api/admin/users");

      setStats(statsRes.data);
      setUsers(usersRes.data);
    } catch {
      setStats({});
      setUsers([]);
    }
  };

  const fetchReports = async () => {
    try {
      const reportsRes = await axios.get("http://localhost:5000/api/admin/reports");
      setReports(reportsRes.data);
    } catch {
      setReports([]);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/notifications");
      setNotifications(res.data);
    } catch {
      setNotifications([]);
    }
  };

  const banUser = async (id) => {
    setLoadingBan(id);

    try {
      await axios.put(`http://localhost:5000/api/admin/ban/${id}`);
      fetchData();
    } finally {
      setLoadingBan(null);
    }
  };

  const unbanUser = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/unban/${id}`);
      fetchData();
    } catch {
      alert("Unban user thất bại");
    }
  };

  const deleteReport = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/admin/reports/${id}`);
      fetchReports();
      fetchData();
    } catch {
      alert("Xóa report thất bại");
    }
  };

  const approveReport = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/reports/${id}/approve`);
      fetchReports();
      fetchData();
    } catch {
      alert("Duyệt report thất bại");
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      !searchQuery ||
      u.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const flaggedCount = reports.length;

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-500
      ${dark ? "bg-[#0d0820]" : "bg-[#f4f6fb]"}`}
    >
      <header
        className={`sticky top-0 z-40 border-b backdrop-blur-md flex-shrink-0
        ${dark ? "bg-[#0d0820]/90 border-violet-900/50" : "bg-white/90 border-gray-100"}`}
      >
        <div className="px-4 h-[54px] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen((p) => !p)}
              className={`lg:hidden w-9 h-9 rounded-xl flex items-center justify-center border transition-all active:scale-90
                ${dark ? "border-violet-800 text-violet-400" : "border-gray-200 text-gray-500"}`}
            >
              <MI name="menu" className="text-[20px]" />
            </button>

            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center
                ${dark ? "bg-violet-600" : "bg-indigo-500"}`}
              >
                <span className="text-white font-black text-[14px]">G</span>
              </div>

              <span
                className={`font-black text-[15px] hidden sm:block ${
                  dark ? "text-violet-300" : "text-gray-800"
                }`}
              >
                Admin Dashboard
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div
              className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-2xl border text-[12.5px]
              ${dark ? "bg-[#1e1535] border-violet-800" : "bg-gray-100 border-transparent"}`}
            >
              <MI
                name="search"
                className={`text-[17px] ${dark ? "text-violet-500" : "text-gray-400"}`}
              />

              <input
                type="text"
                placeholder="Tìm tên người dùng..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`bg-transparent outline-none w-[160px] text-[12.5px]
                  ${dark ? "text-violet-200 placeholder-violet-700" : "text-gray-700 placeholder-gray-400"}`}
              />
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => setNotificationOpen((p) => !p)}
                className={`relative w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-90
                  ${
                    dark
                      ? "bg-[#1e1535] text-violet-400 border border-violet-800"
                      : "bg-gray-100 text-gray-500"
                  }`}
              >
                <MI name="notifications_none" className="text-[20px]" />

                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </button>

              {notificationOpen && (
                <div
                  className={`absolute right-0 mt-2 w-[280px] rounded-2xl border shadow-xl overflow-hidden z-50
                    ${dark ? "bg-[#1e1535] border-violet-800" : "bg-white border-gray-100"}`}
                >
                  <div
                    className={`px-4 py-3 border-b font-black text-[13px]
                      ${dark ? "border-violet-800 text-violet-200" : "border-gray-100 text-gray-800"}`}
                  >
                    Thông báo Admin
                  </div>

                  {notifications.length === 0 ? (
                    <div
                      className={`px-4 py-6 text-center text-[12.5px] ${
                        dark ? "text-violet-500" : "text-gray-400"
                      }`}
                    >
                      Chưa có thông báo mới
                    </div>
                  ) : (
                    <div className="max-h-[300px] overflow-y-auto">
                      {notifications.map((noti) => (
                        <div
                          key={noti.id}
                          className={`px-4 py-3 border-b last:border-b-0
                            ${
                              dark
                                ? "border-violet-900/50 hover:bg-violet-900/30"
                                : "border-gray-100 hover:bg-gray-50"
                            }`}
                        >
                          <div className="flex items-start gap-2">
                            <MI
                              name={noti.type === "voice" ? "keyboard_voice" : "image"}
                              className={`text-[18px] mt-0.5 ${
                                dark ? "text-violet-400" : "text-indigo-500"
                              }`}
                            />

                            <div className="flex-1 min-w-0">
                              <p
                                className={`text-[12.5px] font-bold ${
                                  dark ? "text-violet-200" : "text-gray-800"
                                }`}
                              >
                                {noti.username} vừa đăng{" "}
                                {noti.type === "voice" ? "voice" : "ảnh"}
                              </p>

                              <p
                                className={`text-[11px] mt-0.5 ${
                                  dark ? "text-violet-600" : "text-gray-400"
                                }`}
                              >
                                {noti.createdAt}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setDark((p) => !p)}
              className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all active:scale-90
                ${dark ? "bg-[#1e1535] border-violet-700 text-violet-300" : "bg-white border-gray-200 text-gray-500"}`}
            >
              <MI name={dark ? "light_mode" : "dark_mode"} className="text-[18px]" />
            </button>

            <div className="flex items-center gap-2">
              {/* <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-[13px] text-white bg-gradient-to-br from-indigo-500 to-violet-600">
                A
              </div> */}

              {/* <span
                className={`hidden sm:block text-[12.5px] font-semibold ${
                  dark ? "text-violet-300" : "text-gray-700"
                }`}
              >
                Administrator
              </span> */}

              {/* <button
                type="button"
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all
                  ${
                    dark
                      ? "text-violet-400 hover:bg-violet-900/40"
                      : "text-gray-500 hover:bg-gray-100"
                  }`}
              >
                <MI name="settings" className="text-[18px]" />
              </button> */}

              <button
                type="button"
                onClick={logout}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all
                  ${
                    dark
                      ? "text-red-400 hover:bg-red-950/40"
                      : "text-red-500 hover:bg-red-50"
                  }`}
              >
                <MI name="logout" className="text-[18px]" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 min-h-0">
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <aside
          className={`fixed lg:sticky top-[54px] left-0 z-30
            h-[calc(100vh-54px)] lg:h-auto
            w-[200px] flex-shrink-0 flex flex-col
            border-r transition-all duration-300
            ${dark ? "bg-[#0d0820] border-violet-900/50" : "bg-white border-gray-100"}
            ${sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0"}`}
        >
          <div className="p-4 flex flex-col gap-1">
            <p
              className={`text-[10.5px] font-black tracking-[0.15em] uppercase px-3 mb-2
                ${dark ? "text-violet-700" : "text-gray-400"}`}
            >
              Management
            </p>

            <NavItem
              icon="bar_chart"
              label="Statistics"
              active={activeNav === "statistics"}
              onClick={() => {
                setActiveNav("statistics");
                setSidebarOpen(false);
              }}
              dark={dark}
            />

            <NavItem
              icon="article"
              label="Content Management"
              active={activeNav === "content"}
              onClick={() => {
                setActiveNav("content");
                setSidebarOpen(false);
              }}
              dark={dark}
            />

            <NavItem
              icon="manage_accounts"
              label="User Management"
              active={activeNav === "users"}
              onClick={() => {
                setActiveNav("users");
                setSidebarOpen(false);
              }}
              dark={dark}
            />
          </div>

          <div
            className={`mx-4 mt-auto mb-4 rounded-2xl border p-3
              ${dark ? "bg-[#1e1535] border-violet-800" : "bg-indigo-50 border-indigo-100"}`}
          >
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />

              <span
                className={`text-[11.5px] font-bold ${
                  dark ? "text-violet-300" : "text-indigo-600"
                }`}
              >
                {stats.systemStatus || "Online"}
              </span>
            </div>

            <p
              className={`text-[11px] ${
                dark ? "text-violet-600" : "text-indigo-400"
              }`}
            >
              System Status
            </p>
          </div>
        </aside>

        <main className="flex-1 min-w-0 overflow-y-auto">
          <div className="p-4 md:p-6 max-w-[1100px] flex flex-col gap-6">
            {(activeNav === "statistics" ||
              activeNav === "users" ||
              activeNav === "content") && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2
                    className={`font-black text-[18px] ${
                      dark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Statistics Overview
                  </h2>

                  {/* <button
                    type="button"
                    onClick={fetchData}
                    className={`flex items-center gap-1.5 text-[12.5px] font-semibold transition-all active:scale-95
                      ${dark ? "text-violet-400 hover:text-violet-200" : "text-indigo-500 hover:text-indigo-700"}`}
                  >
                    View Detailed Report
                    <MI name="arrow_forward" className="text-[15px]" />
                  </button> */}
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <StatCard
                    icon="group"
                    label="Total Users"
                    value={stats.totalUsers?.toLocaleString()}
                    sub={`${stats.totalReports || 0} active reports`}
                    badge={
                      stats.userGrowth !== undefined && stats.userGrowth !== null
                        ? `${stats.userGrowth > 0 ? "+" : ""}${stats.userGrowth}%`
                        : null
                    }
                    badgeColor={
                      dark
                        ? "bg-emerald-900/50 text-emerald-400"
                        : "bg-emerald-50 text-emerald-600"
                    }
                    dark={dark}
                  />

                  <StatCard
                    icon="edit_note"
                    label="Posts Today"
                    value={(stats.postsToday ?? stats.totalPosts)?.toLocaleString()}
                    sub={
                      stats.peakTime
                        ? `Highest activity at ${stats.peakTime}`
                        : "Activity today"
                    }
                    badge={
                      stats.postGrowth !== undefined && stats.postGrowth !== null
                        ? `${stats.postGrowth > 0 ? "+" : ""}${stats.postGrowth}%`
                        : null
                    }
                    badgeColor={
                      dark
                        ? "bg-emerald-900/50 text-emerald-400"
                        : "bg-emerald-50 text-emerald-600"
                    }
                    dark={dark}
                  />

                  <GrowthChart dark={dark} data={stats.registrationGrowth || []} />
                </div>
              </section>
            )}

            <div className="flex flex-col lg:flex-row gap-6">
              {(activeNav === "statistics" || activeNav === "users") && (
                <section className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-4">
                    <h2
                      className={`font-black text-[17px] ${
                        dark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      User Management
                    </h2>

                    <button
                      type="button"
                      onClick={() => setActiveNav("users")}
                      className={`text-[12.5px] font-bold px-4 py-1.5 rounded-full border transition-all active:scale-95
                        ${
                          dark
                            ? "border-violet-700 text-violet-300 hover:bg-violet-900/40"
                            : "border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                        }`}
                    >
                      View All
                    </button>
                  </div>

                  <div
                    className={`flex md:hidden items-center gap-2 px-3 py-2 rounded-2xl border mb-3
                    ${dark ? "bg-[#1e1535] border-violet-800" : "bg-gray-100 border-transparent"}`}
                  >
                    <MI
                      name="search"
                      className={`text-[17px] ${
                        dark ? "text-violet-500" : "text-gray-400"
                      }`}
                    />

                    <input
                      type="text"
                      placeholder="Tìm tên người dùng..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`flex-1 bg-transparent outline-none text-[12.5px]
                        ${dark ? "text-violet-200 placeholder-violet-700" : "text-gray-700 placeholder-gray-400"}`}
                    />
                  </div>

                  <div
                    className={`rounded-2xl border overflow-hidden
                    ${dark ? "bg-[#130d28] border-violet-900/60" : "bg-white border-gray-100 shadow-sm"}`}
                  >
                    {filteredUsers.length === 0 ? (
                      <div
                        className={`flex flex-col items-center justify-center py-10 text-center
                        ${dark ? "text-violet-600" : "text-gray-400"}`}
                      >
                        <MI name="people_outline" className="text-[36px] mb-2" />
                        <p className="text-[13px] font-medium">Không có user</p>
                      </div>
                    ) : (
                      filteredUsers.map((user, idx) => (
                        <div
                          key={user.id}
                          className={`flex items-center gap-3 px-4 py-3.5 transition-colors
                            ${
                              idx !== 0
                                ? dark
                                  ? "border-t border-violet-900/50"
                                  : "border-t border-gray-50"
                                : ""
                            }
                            ${dark ? "hover:bg-violet-900/20" : "hover:bg-gray-50/80"}`}
                        >
                          <Avatar name={user.username} size="md" />

                          <div className="flex-1 min-w-0">
                            <p
                              className={`font-bold text-[13.5px] truncate ${
                                dark ? "text-white" : "text-gray-900"
                              }`}
                            >
                              {user.username}
                            </p>

                            <p
                              className={`text-[11.5px] truncate ${
                                dark ? "text-violet-600" : "text-gray-400"
                              }`}
                            >
                              {user.email}
                            </p>
                          </div>

                          <span
                            className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full flex-shrink-0
                            ${
                              user.status === "banned"
                                ? dark
                                  ? "bg-red-950 text-red-400 border border-red-900"
                                  : "bg-red-50 text-red-500 border border-red-200"
                                : user.status === "reported"
                                ? dark
                                  ? "bg-amber-950 text-amber-400 border border-amber-900"
                                  : "bg-amber-50 text-amber-600 border border-amber-200"
                                : dark
                                ? "bg-emerald-900/50 text-emerald-400 border border-emerald-800"
                                : "bg-emerald-50 text-emerald-600 border border-emerald-200"
                            }`}
                          >
                            {user.status || "active"}
                          </span>

                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            {user.status === "banned" ? (
                              <button
                                type="button"
                                onClick={() => unbanUser(user.id)}
                                className={`text-[11.5px] font-bold px-3 py-1.5 rounded-xl border transition-all active:scale-90
                                  ${
                                    dark
                                      ? "border-violet-700 text-violet-300 hover:bg-violet-900/40"
                                      : "border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                                  }`}
                              >
                                Unban
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => banUser(user.id)}
                                disabled={loadingBan === user.id}
                                className={`text-[11.5px] font-bold px-3 py-1.5 rounded-xl border transition-all active:scale-90
                                  disabled:opacity-50 disabled:cursor-not-allowed
                                  ${
                                    dark
                                      ? "border-red-800 text-red-400 hover:bg-red-950/50"
                                      : "border-red-200 text-red-500 hover:bg-red-50"
                                  }`}
                              >
                                {loadingBan === user.id ? "..." : "Ban"}
                              </button>
                            )}

                            <button
                              type="button"
                              className={`text-[11.5px] font-bold px-3 py-1.5 rounded-xl border transition-all active:scale-90
                                ${
                                  dark
                                    ? "border-violet-700 text-violet-300 hover:bg-violet-900/40"
                                    : "border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                                }`}
                            >
                              {user.status === "banned" ? "Logs" : "Profile"}
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="flex gap-3 mt-4">
                    {[
                      {
                        icon: "people",
                        label: "Total Users",
                        value: stats.totalUsers ?? "—",
                      },
                      {
                        icon: "article",
                        label: "Total Posts",
                        value: stats.totalPosts ?? "—",
                      },
                      {
                        icon: "flag",
                        label: "Total Reports",
                        value: stats.totalReports ?? "—",
                      },
                    ].map(({ icon, label, value }) => (
                      <div
                        key={label}
                        className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-2xl border transition-colors
                          ${dark ? "bg-[#130d28] border-violet-900/60" : "bg-white border-gray-100 shadow-sm"}`}
                      >
                        <MI
                          name={icon}
                          className={`text-[20px] ${
                            dark ? "text-violet-500" : "text-indigo-400"
                          }`}
                        />

                        <p
                          className={`font-black text-[17px] leading-none ${
                            dark ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {value}
                        </p>

                        <p
                          className={`text-[10.5px] text-center ${
                            dark ? "text-violet-600" : "text-gray-400"
                          }`}
                        >
                          {label}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {(activeNav === "statistics" || activeNav === "content") && (
                <section className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-4">
                    <h2
                      className={`font-black text-[17px] ${
                        dark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      Content Moderation
                    </h2>

                    {flaggedCount > 0 && (
                      <span
                        className={`text-[11.5px] font-bold px-3 py-1 rounded-full
                        ${
                          dark
                            ? "bg-red-950 text-red-400 border border-red-900"
                            : "bg-red-50 text-red-500 border border-red-200"
                        }`}
                      >
                        {flaggedCount} Flagged
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col gap-3">
                    {reports.length === 0 ? (
                      <div
                        className={`rounded-2xl border flex flex-col items-center justify-center py-10 text-center
                        ${
                          dark
                            ? "bg-[#130d28] border-violet-900/60 text-violet-600"
                            : "bg-white border-gray-100 text-gray-400 shadow-sm"
                        }`}
                      >
                        <MI
                          name="check_circle"
                          className="text-[36px] mb-2 text-emerald-500"
                        />
                        <p className="text-[13px] font-semibold">
                          Không có nội dung cần duyệt
                        </p>
                      </div>
                    ) : (
                      reports.map((item) => (
                        <ModerationCard
                          key={item.id}
                          item={item}
                          dark={dark}
                          onDelete={deleteReport}
                          onApprove={approveReport}
                        />
                      ))
                    )}
                  </div>
                </section>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Admin;