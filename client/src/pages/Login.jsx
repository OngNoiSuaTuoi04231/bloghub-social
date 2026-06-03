import { useDarkMode } from "../context/DarkModeContext";
import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

import { motion } from "framer-motion";

/* ───────────────────────────────────────────── */
function MI({ name, className = "" }) {
  return (
    <span
      className={`material-icons-round select-none leading-none ${className}`}
    >
      {name}
    </span>
  );
}

/* ───────────────────────────────────────────── */
function InputField({
  label,
  id,
  type,
  placeholder,
  icon,
  value,
  onChange,
  rightEl,
  dark,
}) {
  const [focused, setFocused] = useState(false);

  return (
    <div className="flex flex-col gap-[6px]">
      <label
        htmlFor={id}
        className={`text-[13px] font-semibold transition-colors duration-300
        ${dark ? "text-violet-300" : "text-gray-600"}`}
      >
        {label}
      </label>

      <div
        className={`flex items-center gap-3 px-4 py-[13px] rounded-2xl transition-all duration-200
          ${
            dark
              ? focused
                ? "bg-[#2a1f4a] ring-2 ring-violet-500 shadow-sm shadow-violet-900"
                : "bg-[#1e1535]"
              : focused
                ? "bg-white ring-2 ring-indigo-400 shadow-sm shadow-indigo-100"
                : "bg-[#eeecfb]"
          }`}
      >
        <MI
          name={icon}
          className={`text-[19px] transition-colors duration-200
            ${
              dark
                ? focused
                  ? "text-violet-400"
                  : "text-violet-600"
                : focused
                  ? "text-indigo-400"
                  : "text-gray-400"
            }`}
        />

        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoComplete="off"
          style={{}}
          className={`flex-1 bg-transparent text-[14px] outline-none transition-colors duration-300
            [&::-ms-reveal]:hidden
            [&::-ms-clear]:hidden
            ${
              dark
                ? "text-violet-100 placeholder-violet-700"
                : "text-gray-700 placeholder-gray-400"
            }`}
        />

        {rightEl}
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────── */
function Toast({ msg, ok, dark }) {
  if (!msg) return null;

  return (
    <div
      className={`flex items-center gap-2 text-[13px] font-medium px-4 py-3 rounded-2xl mb-5 border transition-colors duration-300
        ${
          ok
            ? dark
              ? "bg-emerald-950 text-emerald-400 border-emerald-800"
              : "bg-emerald-50 text-emerald-700 border-emerald-200"
            : dark
              ? "bg-red-950 text-red-400 border-red-900"
              : "bg-red-50 text-red-600 border-red-200"
        }`}
    >
      <MI name={ok ? "check_circle" : "error"} className="text-[18px]" />
      {msg}
    </div>
  );
}

/* ───────────────────────────────────────────── */
function LeftPanel({ dark }) {
  return (
    <div
      className={`hidden md:flex flex-col items-center justify-center
      flex-1 rounded-r-[32px] p-10 lg:p-14 relative overflow-hidden min-h-full
      transition-all duration-500
      ${
        dark
          ? "bg-gradient-to-br from-[#1a0f35] via-[#2d1b5e] to-[#1e0a3c]"
          : "bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600"
      }`}
    >
      <div
        className={`absolute -top-16 -left-16 w-60 h-60 rounded-full
        ${dark ? "bg-violet-500/10" : "bg-white/10"}`}
      />
      <div
        className={`absolute -bottom-12 -right-12 w-52 h-52 rounded-full
        ${dark ? "bg-purple-400/10" : "bg-white/10"}`}
      />
      <div
        className={`absolute top-1/3 right-0 w-32 h-32 rounded-full
        ${dark ? "bg-indigo-400/5" : "bg-white/5"}`}
      />

      {dark && (
        <>
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
            w-64 h-64 rounded-full bg-violet-600/20 blur-3xl pointer-events-none"
          />
          <div
            className="absolute top-1/4 left-1/4
            w-32 h-32 rounded-full bg-indigo-500/20 blur-2xl pointer-events-none"
          />
        </>
      )}

      <div className="relative z-10 flex flex-col items-center text-center w-full">
        <div
          className={`w-24 h-24 lg:w-28 lg:h-28 rounded-3xl backdrop-blur-sm
          flex items-center justify-center mb-6 shadow-2xl border transition-all duration-500
          ${
            dark
              ? "bg-violet-500/20 border-violet-400/30 shadow-violet-900/40"
              : "bg-white/20 border-white/20 shadow-indigo-900/20"
          }`}
        >
          <svg
            viewBox="0 0 64 64"
            className="w-12 h-12 lg:w-14 lg:h-14"
            fill="none"
          >
            <path
              d="M10 14 C10 14 20 16 32 16 C44 16 54 14 54 14 L54 50 C54 50 44 48 32 48 C20 48 10 50 10 50 Z"
              fill="white"
              fillOpacity={dark ? "0.08" : "0.15"}
              stroke="white"
              strokeWidth="1.5"
            />
          </svg>
        </div>

        <h2 className="text-white font-black text-3xl lg:text-4xl tracking-tight mb-3 drop-shadow text-center [font-family:'Poppins',sans-serif]">
          VibeNest
        </h2>

        <p
          className={`text-sm lg:text-[15px] leading-relaxed max-w-[240px] lg:max-w-[280px]
          text-center mx-auto
          [font-family:'Poppins',sans-serif]
          ${dark ? "text-violet-300" : "text-indigo-100"}`}
        >
          A place where every story creates impact.
        </p>
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────── */
function DarkToggle({ dark, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`fixed top-5 right-5 z-50
        w-11 h-11 rounded-2xl flex items-center justify-center
        shadow-lg border transition-all duration-300 active:scale-90
        ${
          dark
            ? "bg-[#1e1535] border-violet-700 text-violet-300 hover:bg-[#2a1f4a]"
            : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
        }`}
    >
      <MI name={dark ? "light_mode" : "dark_mode"} className="text-[20px]" />
    </button>
  );
}

/* ───────────────────────────────────────────── */
function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [toast, setToast] = useState({
    msg: "",
    ok: true,
  });

  const navigate = useNavigate();

  const { dark, toggleDark } = useDarkMode();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setToast({
        msg: "Please fill in all fields!",
        ok: false,
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      setToast({
        msg: "Please enter a valid email!",
        ok: false,
      });
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(
        "https://bloghub-social-api.onrender.com/api/auth/login",
        {
          email,
          password,
        },
      );

      localStorage.setItem("token", res.data.token);

      if (res.data.user) {
        localStorage.setItem("userId", res.data.user._id || "");
        localStorage.setItem("username", res.data.user.username || "");
        localStorage.setItem("role", res.data.user.role || "user");
        localStorage.setItem("avatar", res.data.user.avatar || "");
        localStorage.setItem("bio", res.data.user.bio || "");
      }

      setToast({
        msg: res.data.message,
        ok: true,
      });

      setEmail("");
      setPassword("");

      const role = res.data.user?.role;

      setTimeout(() => {
        if (role === "admin") {
          navigate("/admin");
        } else {
          navigate("/home");
        }
      }, 2000);
    } catch (error) {
      setToast({
        msg: error.response?.data?.message || "Login failed",
        ok: false,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 80 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -80 }}
      transition={{
        duration: 0.35,
        ease: "easeInOut",
      }}
      className={`min-h-screen flex items-center justify-center p-4 md:p-8 ${
        dark ? "bg-[#0d0820]" : "bg-gray-50"
      }`}
    >
      <DarkToggle dark={dark} onToggle={toggleDark} />

      <div
        className={`flex w-full max-w-[920px] rounded-[32px] overflow-hidden ${
          dark
            ? "shadow-2xl shadow-violet-950/80"
            : "shadow-2xl shadow-indigo-200/60"
        }`}
      >
        <div
          className={`flex-1 flex flex-col justify-center px-7 py-9 md:px-12 ${
            dark ? "bg-[#130d28]" : "bg-white"
          }`}
        >
          <p
            className={`md:hidden text-center font-extrabold text-[27px] mb-5 ${
              dark ? "text-violet-400" : "text-indigo-500"
            }`}
          >
            VibeNest
          </p>

          <h1
            className={`text-[30px] font-extrabold text-center
            [font-family:'Poppins',sans-serif]
            ${dark ? "text-white" : "text-gray-900"}`}
          >
            Welcome Back
          </h1>

          <p
            className={`text-[13px] text-center mt-1 mb-7
            [font-family:'Poppins',sans-serif]
            ${dark ? "text-violet-400" : "text-gray-400"}`}
          >
            Login to continue your journey.
          </p>

          <Toast msg={toast.msg} ok={toast.ok} dark={dark} />

          <form onSubmit={handleLogin} className="flex flex-col gap-[14px]">
            <InputField
              label="Email"
              id="email"
              type="email"
              placeholder="nguyenvana@gmail.com"
              icon="mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              dark={dark}
            />

            <InputField
              label="Password"
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="********"
              icon="lock"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              dark={dark}
              rightEl={
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className={dark ? "text-violet-500" : "text-gray-400"}
                >
                  {/* FIX: khi showPassword=false (đang ẩn) → hiện "visibility" (mắt mở) để user biết click vào sẽ xem được
                         khi showPassword=true  (đang hiện) → hiện "visibility_off" (mắt gạch) để user biết click vào sẽ ẩn đi */}
                  <MI name={showPassword ? "visibility" : "visibility_off"} />
                </button>
              }
            />

            <button
              type="submit"
              disabled={loading}
              className={`mt-2 w-full py-[15px] rounded-2xl font-bold text-white transition-all duration-300 ${
                dark
                  ? "bg-gradient-to-r from-violet-600 to-purple-600"
                  : "bg-indigo-500 hover:bg-indigo-600"
              }`}
            >
              {loading ? "Please wait..." : "Login"}
            </button>
          </form>

          <div className="flex items-center justify-center gap-3 mt-6">
            <span
              className={`text-[13px] ${
                dark ? "text-violet-500" : "text-gray-500"
              }`}
            >
              You don't have an account yet?
            </span>

            <Link
              to="/register"
              className={`text-[12.5px] font-semibold px-4 py-1.5 rounded-full border transition-all duration-300 ${
                dark
                  ? "text-violet-300 border-violet-700 hover:bg-violet-900/50"
                  : "text-indigo-500 border-indigo-200 hover:bg-indigo-50"
              }`}
            >
              Sign Up
            </Link>
          </div>
        </div>

        <div className="hidden md:block flex-1">
          <LeftPanel dark={dark} />
        </div>
      </div>
    </motion.div>
  );
}

export default Login;
