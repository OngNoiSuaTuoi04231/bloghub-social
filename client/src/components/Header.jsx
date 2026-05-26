import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";

import { Home, PenSquare, User, Menu, X, LogOut } from "lucide-react";

export default function Header() {
  const [open, setOpen] = useState(false);

  const navigate = useNavigate();

  // Demo dark mode
  const dark = true;

  /* ───────────────────────────── */
  /* LOGOUT */
  /* ───────────────────────────── */

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    localStorage.removeItem("bio");
    localStorage.removeItem("avatar");

    navigate("/login");
  };

  /* ───────────────────────────── */
  /* NAV ITEMS */
  /* ───────────────────────────── */

  const navItems = [
    {
      name: "Bảng tin",
      icon: <Home size={20} />,
      path: "/home",
    },
    {
      name: "Thêm bài viết",
      icon: <PenSquare size={20} />,
      path: "/createpost",
    },
    {
      name: "Cá nhân",
      icon: <User size={20} />,
      path: "/profile",
    },
  ];

  return (
    <header
      className={`w-full border-b backdrop-blur-lg shadow-sm transition-all duration-500
      ${
        dark ? "bg-[#0f172a]/90 border-white/10" : "bg-white/90 border-gray-200"
      }`}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 lg:px-8">
        {/* ───────────────── LOGO ───────────────── */}
        <div
          onClick={() => navigate("/home")}
          className="flex items-center gap-4 cursor-pointer"
        >
          {/* SVG LOGO */}
          <div
            className={`w-14 h-14 rounded-2xl backdrop-blur-sm
            flex items-center justify-center shadow-2xl border transition-all duration-500
            ${
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

          {/* TEXT */}
          <div className="flex flex-col">
            <h1
              className={`text-xl font-bold tracking-wide
              ${dark ? "text-white" : "text-gray-800"}`}
            >
              VibeNest
            </h1>

            <span
              className={`text-xs
              ${dark ? "text-gray-400" : "text-gray-500"}`}
            >
              Share your stories
            </span>
          </div>
        </div>

        {/* ───────────────── DESKTOP MENU ───────────────── */}
        <nav className="hidden items-center gap-2 md:flex">
          {/* NAVIGATION */}
          {navItems.map((item, index) => (
            <NavLink
              key={index}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-xl px-4 py-2 transition-all duration-300
                ${
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

          {/* LOGOUT */}
          <button
            onClick={handleLogout}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 transition-all duration-300
              ${
                dark
                  ? "text-red-300 hover:bg-red-500/10"
                  : "text-red-500 hover:bg-red-50"
              }`}
          >
            <LogOut size={20} />

            <span className="font-medium">Đăng xuất</span>
          </button>
        </nav>

        {/* ───────────────── MOBILE BUTTON ───────────────── */}
        <button
          onClick={() => setOpen(!open)}
          className={`rounded-xl p-2 transition md:hidden
          ${
            dark
              ? "text-white hover:bg-white/10"
              : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* ───────────────── MOBILE MENU ───────────────── */}
      {open && (
        <div
          className={`border-t md:hidden
          ${
            dark ? "bg-[#0f172a] border-white/10" : "bg-white border-gray-200"
          }`}
        >
          <div className="flex flex-col p-4">
            {/* NAVIGATION */}
            {navItems.map((item, index) => (
              <NavLink
                key={index}
                to={item.path}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-300
                  ${
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

            {/* LOGOUT MOBILE */}
            <button
              onClick={() => {
                setOpen(false);
                handleLogout();
              }}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-300
                ${
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
