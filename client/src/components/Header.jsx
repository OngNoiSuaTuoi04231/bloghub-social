import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

import {
  Home,
  PenSquare,
  User,
  Bell,
  Menu,
  X,
  LogOut,
  Search,
} from "lucide-react";

const API = import.meta.env.VITE_API_URL + "/api";
const SOCKET_URL = import.meta.env.VITE_API_URL;

export default function Header() {
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  const navigate = useNavigate();
  const dark = true;

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await axios.get(`${API}/notifications/unread-count`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUnreadCount(res.data.count || 0);
      } catch (error) {
        console.log("Lỗi unread:", error);
      }
    };

    fetchUnread();
  }, []);

  useEffect(() => {
    const socket = io(SOCKET_URL);
    const myId = localStorage.getItem("userId");

    if (myId) {
      socket.emit("join_user_room", myId);
    }

    socket.on("new_notification", () => {
      setUnreadCount((prev) => prev + 1);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    const searchUsers = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!search.trim()) {
          setSearchResults([]);
          return;
        }

        const res = await axios.get(
          `${API}/users/search?q=${encodeURIComponent(search)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        setSearchResults(res.data.users || []);
      } catch (error) {
        console.log("Search user error:", error);
      }
    };

    const timeout = setTimeout(searchUsers, 300);

    return () => clearTimeout(timeout);
  }, [search]);

  const handleGoProfile = (userId) => {
    navigate(`/profile/${userId}`);
    setSearch("");
    setSearchResults([]);
    setOpen(false);
    setShowMobileSearch(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    localStorage.removeItem("bio");
    localStorage.removeItem("avatar");

    navigate("/login");
  };

  const navItems = [
    {
      name: "News Feed",
      icon: <Home size={20} />,
      path: "/home",
    },
    {
      name: "Add Article",
      icon: <PenSquare size={20} />,
      path: "/createpost",
    },
    {
      name: "Notice",
      icon: (
        <div className="relative">
          <Bell size={20} className={unreadCount > 0 ? "text-red-500" : ""} />

          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </div>
      ),
      path: "/notification",
    },
    {
      name: "Profile",
      icon: <User size={20} />,
      path: "/profile",
    },
  ];

  return (
    <header
      className={`relative z-[9999] w-full border-b backdrop-blur-lg shadow-sm transition-all duration-500 ${
        dark ? "bg-[#0f172a]/90 border-white/10" : "bg-white/90 border-gray-200"
      }`}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 lg:px-8">
        <div
          onClick={() => navigate("/home")}
          className="flex items-center gap-4 cursor-pointer"
        >
          <div
            className={`w-14 h-14 rounded-2xl backdrop-blur-sm flex items-center justify-center shadow-2xl border transition-all duration-500 ${
              dark
                ? "bg-violet-500/20 border-violet-400/30 shadow-violet-900/40"
                : "bg-white/20 border-white/20 shadow-indigo-900/20"
            }`}
          >
            <svg viewBox="0 0 64 64" className="w-8 h-8" fill="none">
              <path
                d="M10 14 C10 14 20 16 32 16 C44 16 54 14 54 14 L54 50 C54 50 44 48 32 48 C20 48 10 50 10 50 Z"
                fill="white"
                fillOpacity={dark ? "0.08" : "0.15"}
                stroke="white"
                strokeWidth="1.5"
              />

              <path
                d="M32 16 L32 48"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="2 2"
              />

              <path
                d="M18 23 C18 23 24 24 32 24"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path
                d="M18 30 C18 30 24 31 32 31"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path
                d="M18 37 C18 37 24 38 32 38"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path
                d="M46 23 C46 23 40 24 32 24"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path
                d="M46 30 C46 30 40 31 32 31"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path
                d="M46 37 C46 37 40 38 32 38"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
              />

              <circle cx="52" cy="13" r="3.5" fill="white" fillOpacity="0.85" />
              <circle cx="13" cy="11" r="2.5" fill="white" fillOpacity="0.55" />
            </svg>
          </div>

          <div className="flex flex-col">
            <h1
              className={`text-xl font-bold tracking-wide ${
                dark ? "text-white" : "text-gray-800"
              }`}
            >
              VibeNest
            </h1>

            <span
              className={`text-xs ${dark ? "text-gray-400" : "text-gray-500"}`}
            >
              Share your stories
            </span>
          </div>
        </div>

        <nav className="hidden items-center gap-2 md:flex">
          <div className="relative mr-2">
            <div
              className={`flex items-center gap-2 rounded-xl border px-3 py-2 transition-all duration-300 ${
                dark
                  ? "bg-white/5 border-white/10 text-gray-300 focus-within:border-violet-400"
                  : "bg-white border-gray-200 text-gray-700 focus-within:border-violet-500"
              }`}
            >
              <Search size={18} className="text-violet-300" />

              <input
                type="text"
                placeholder="Search user..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`w-44 lg:w-56 bg-transparent text-sm outline-none ${
                  dark
                    ? "text-white placeholder:text-gray-500"
                    : "text-gray-800 placeholder:text-gray-400"
                }`}
              />
            </div>

            {searchResults.length > 0 && (
              <div
                className={`absolute top-full left-0 z-[9999] mt-2 w-full overflow-hidden rounded-xl border shadow-2xl ${
                  dark
                    ? "bg-[#1e293b] border-white/10"
                    : "bg-white border-gray-200"
                }`}
              >
                {searchResults.map((user) => (
                  <button
                    key={user._id}
                    type="button"
                    onClick={() => handleGoProfile(user._id)}
                    className={`flex w-full items-center gap-3 px-4 py-3 text-left transition ${
                      dark ? "hover:bg-violet-500/10" : "hover:bg-violet-50"
                    }`}
                  >
                    <img
                      src={user.avatar || "/default-avatar.png"}
                      alt=""
                      className="h-8 w-8 rounded-full object-cover"
                    />

                    <span
                      className={`text-sm font-medium ${
                        dark ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {user.username}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {navItems.map((item, index) => (
            <NavLink
              key={index}
              to={item.path}
              onClick={() => {
                if (item.path === "/notification") {
                  setUnreadCount(0);
                }
              }}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-xl px-4 py-2 transition-all duration-300 ${
                  isActive
                    ? "bg-violet-500/20 text-violet-300"
                    : dark
                      ? "text-gray-300 hover:bg-violet-500/10 hover:text-violet-300"
                      : "text-gray-700 hover:bg-violet-50 hover:text-violet-600"
                }`
              }
            >
              {item.icon}
              <span className="font-medium">{item.name}</span>
            </NavLink>
          ))}

          <button
            type="button"
            onClick={handleLogout}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 transition-all duration-300 ${
              dark
                ? "text-red-300 hover:bg-red-500/10"
                : "text-red-500 hover:bg-red-50"
            }`}
          >
            <LogOut size={20} />

            <span className="font-medium">Log Out</span>
          </button>
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            onClick={() => setShowMobileSearch(!showMobileSearch)}
            className={`rounded-xl p-2 transition ${
              dark
                ? "text-white hover:bg-white/10"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Search size={23} />
          </button>

          <button
            type="button"
            onClick={() => setOpen(!open)}
            className={`rounded-xl p-2 transition ${
              dark
                ? "text-white hover:bg-white/10"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {showMobileSearch && (
        <div
          className={`border-t px-4 py-3 md:hidden ${
            dark ? "bg-[#0f172a] border-white/10" : "bg-white border-gray-200"
          }`}
        >
          <div
            className={`flex items-center gap-2 rounded-xl border px-3 py-2 ${
              dark
                ? "bg-white/5 border-white/10 text-gray-300"
                : "bg-white border-gray-200 text-gray-700"
            }`}
          >
            <Search size={18} className="text-violet-300" />

            <input
              type="text"
              placeholder="Search user..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full bg-transparent text-sm outline-none ${
                dark
                  ? "text-white placeholder:text-gray-500"
                  : "text-gray-800 placeholder:text-gray-400"
              }`}
            />
          </div>

          {searchResults.length > 0 && (
            <div
              className={`mt-3 overflow-hidden rounded-xl border ${
                dark
                  ? "bg-[#1e293b] border-white/10"
                  : "bg-white border-gray-200"
              }`}
            >
              {searchResults.map((user) => (
                <button
                  key={user._id}
                  type="button"
                  onClick={() => handleGoProfile(user._id)}
                  className={`flex w-full items-center gap-3 px-4 py-3 text-left transition ${
                    dark ? "hover:bg-violet-500/10" : "hover:bg-violet-50"
                  }`}
                >
                  <img
                    src={user.avatar || "/default-avatar.png"}
                    alt=""
                    className="h-9 w-9 rounded-full object-cover"
                  />

                  <span
                    className={`text-sm font-medium ${
                      dark ? "text-white" : "text-gray-800"
                    }`}
                  >
                    {user.username}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {open && (
        <div
          className={`border-t md:hidden ${
            dark ? "bg-[#0f172a] border-white/10" : "bg-white border-gray-200"
          }`}
        >
          <div className="flex flex-col p-4">
            {navItems.map((item, index) => (
              <NavLink
                key={index}
                to={item.path}
                onClick={() => {
                  if (item.path === "/notification") {
                    setUnreadCount(0);
                  }

                  setOpen(false);
                }}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-300 ${
                    isActive
                      ? "bg-violet-500/20 text-violet-300"
                      : dark
                        ? "text-gray-300 hover:bg-violet-500/10 hover:text-violet-300"
                        : "text-gray-700 hover:bg-violet-50 hover:text-violet-600"
                  }`
                }
              >
                {item.icon}
                <span className="font-medium">{item.name}</span>
              </NavLink>
            ))}

            <button
              type="button"
              onClick={() => {
                setOpen(false);
                handleLogout();
              }}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-300 ${
                dark
                  ? "text-red-300 hover:bg-red-500/10"
                  : "text-red-500 hover:bg-red-50"
              }`}
            >
              <LogOut size={20} />

              <span className="font-medium">Đăng xuất</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
