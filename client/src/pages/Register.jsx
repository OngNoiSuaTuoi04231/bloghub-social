
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

/* ─── Icon wrapper — Google Material Icons Round ─────────────────────── */
function MI({ name, className = "" }) {
  return (
    <span className={`material-icons-round select-none leading-none ${className}`}>
      {name}
    </span>
  );
}

/* ─── InputField —  dark mode ─────────────────────────────────── */
function InputField({ label, id, type, placeholder, icon, value, onChange, rightEl, autoComplete, dark }) {
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
          ${dark
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
            ${dark
              ? focused ? "text-violet-400" : "text-violet-600"
              : focused ? "text-indigo-400" : "text-gray-400"
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
          autoComplete={autoComplete || "off"}
          className={`flex-1 bg-transparent text-[14px] outline-none transition-colors duration-300
            ${dark
              ? "text-violet-100 placeholder-violet-700"
              : "text-gray-700 placeholder-gray-400"
            }`}
        />
        {rightEl}
      </div>
    </div>
  );
}

/* ─── Toast Banner ───────────────────────────────────────────────────── */
function Toast({ msg, ok, dark }) {
  if (!msg) return null;
  return (
    <div
      className={`flex items-center gap-2 text-[13px] font-medium px-4 py-3 rounded-2xl mb-5 border transition-colors duration-300
        ${ok
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

/* ─── Left Panel Logo  ────────────────────────────────── */
function LeftPanel({ dark }) {
  return (
    <div className={`hidden md:flex flex-col items-center justify-center
      flex-1 rounded-l-[32px] p-10 lg:p-14 relative overflow-hidden min-h-full
      transition-all duration-500
      ${dark
        ? "bg-gradient-to-br from-[#1a0f35] via-[#2d1b5e] to-[#1e0a3c]"
        : "bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600"
      }`}>

      {/* Decorative blobs */}
      <div className={`absolute -top-16 -left-16 w-60 h-60 rounded-full
        ${dark ? "bg-violet-500/10" : "bg-white/10"}`} />
      <div className={`absolute -bottom-12 -right-12 w-52 h-52 rounded-full
        ${dark ? "bg-purple-400/10" : "bg-white/10"}`} />
      <div className={`absolute top-1/3 right-0 w-32 h-32 rounded-full
        ${dark ? "bg-indigo-400/5" : "bg-white/5"}`} />

      {/* Animated glow — chỉ dark mode */}
      {dark && (
        <>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
            w-64 h-64 rounded-full bg-violet-600/20 blur-3xl pointer-events-none" />
          <div className="absolute top-1/4 left-1/4
            w-32 h-32 rounded-full bg-indigo-500/20 blur-2xl pointer-events-none" />
        </>
      )}

      <div className="relative z-10 flex flex-col items-center text-center w-full">

        {/* Book icon */}
        <div className={`w-24 h-24 lg:w-28 lg:h-28 rounded-3xl backdrop-blur-sm
          flex items-center justify-center mb-6 shadow-2xl border transition-all duration-500
          ${dark
            ? "bg-violet-500/20 border-violet-400/30 shadow-violet-900/40"
            : "bg-white/20 border-white/20 shadow-indigo-900/20"
          }`}>
          <svg viewBox="0 0 64 64" className="w-12 h-12 lg:w-14 lg:h-14" fill="none">
            <path d="M10 14 C10 14 20 16 32 16 C44 16 54 14 54 14 L54 50 C54 50 44 48 32 48 C20 48 10 50 10 50 Z"
              fill="white" fillOpacity={dark ? "0.08" : "0.15"} stroke="white" strokeWidth="1.5"/>
            <path d="M32 16 L32 48" stroke="white" strokeWidth="2" strokeLinecap="round" strokeDasharray="2 2"/>
            <path d="M18 23 C18 23 24 24 32 24" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M18 30 C18 30 24 31 32 31" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M18 37 C18 37 24 38 32 38" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M46 23 C46 23 40 24 32 24" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M46 30 C46 30 40 31 32 31" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M46 37 C46 37 40 38 32 38" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            <circle cx="52" cy="13" r="3.5" fill="white" fillOpacity="0.85"/>
            <circle cx="13" cy="11" r="2.5" fill="white" fillOpacity="0.55"/>
          </svg>
        </div>

        {/* Brand */}
        <h2 className="text-white font-black text-3xl lg:text-4xl tracking-tight mb-3 drop-shadow">
        VibeNest
        </h2>
        <p className={`text-sm lg:text-[15px] leading-relaxed max-w-[240px] lg:max-w-[280px]
          ${dark ? "text-violet-300" : "text-indigo-100"}`}>
          A place where every story creates impact.
        </p>

        {/* Stats */}
        <div className="flex gap-6 lg:gap-10 mt-9">
          {[
            { num: "7K+", label: "Posts" },
            { num: "5K+",  label: "Authors"  },
            { num: "98%",  label: "Satisfied" },
          ].map(({ num, label }) => (
            <div key={label} className="flex flex-col items-center">
              <span className="text-white font-extrabold text-xl lg:text-2xl leading-none">{num}</span>
              <span className={`text-[11px] lg:text-xs mt-1 ${dark ? "text-violet-400" : "text-indigo-200"}`}>
                {label}
              </span>
            </div>
          ))}
        </div>

        <div className={`w-full h-px my-8 ${dark ? "bg-violet-500/20" : "bg-white/15"}`} />

        {/* Testimonial */}
        <div className={`backdrop-blur-sm border rounded-2xl px-5 py-4 w-full max-w-[280px] text-left
          transition-all duration-500
          ${dark
            ? "bg-violet-500/10 border-violet-500/20"
            : "bg-white/15 border-white/20"
          }`}>
          <div className="flex gap-1 mb-2">
            {[1,2,3,4,5].map(i => (
              <span key={i} className="text-yellow-300 text-sm leading-none">★</span>
            ))}
          </div>
          <p className="text-white text-[12.5px] lg:text-[13px] leading-relaxed italic">
            "VibeNest giúp tôi kết nối với hàng ngàn độc giả chỉ sau 1 tuần đăng bài."
          </p>
          <div className="flex items-center gap-2.5 mt-3">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center
              text-white text-[10px] font-bold flex-shrink-0
              ${dark ? "bg-violet-500/40" : "bg-white/30"}`}>
              TH
            </div>
            <span className={`text-[11px] font-semibold ${dark ? "text-violet-300" : "text-indigo-100"}`}>
              Trần Hương · Tech Writer
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Dark Mode Toggle Button ────────────────────────────────────────── */
function DarkToggle({ dark, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`fixed top-5 right-5 z-50
        w-11 h-11 rounded-2xl flex items-center justify-center
        shadow-lg border transition-all duration-300 active:scale-90
        ${dark
          ? "bg-[#1e1535] border-violet-700 text-violet-300 hover:bg-[#2a1f4a] shadow-violet-900/50"
          : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50 shadow-gray-200"
        }`}
    >
      <MI name={dark ? "light_mode" : "dark_mode"} className="text-[20px]" />
    </button>
  );
}


function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");

  /* ── State UI  ── */
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed]             = useState(false);
  const [loading, setLoading]           = useState(false);
  const [toast, setToast]               = useState({ msg: "", ok: true });
  const [dark, setDark]                 = useState(false);

  /* hệ thống khi load */
  useEffect(() => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDark(prefersDark);
  }, []);

  /* ── handleRegister  ── */
  const handleRegister = async (e) => {
    e.preventDefault();

    if (!username || !email || !password) {
      setToast({ msg: "Vui lòng nhập đầy đủ thông tin!", ok: false });
      return;
    }

    setLoading(true);
    setToast({ msg: "", ok: true });

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/register",
        { username, email, password }
      );

      setToast({ msg: res.data.message, ok: true });

      /* reset form  */
      setUsername("");
      setEmail("");
      setPassword("");
      setAgreed(false);

    } catch (error) {
      setToast({
        msg: error.response?.data?.message || "Đăng ký thất bại",
        ok: false,
      });
    } finally {
      setLoading(false);
    }
  };

  /* ════════════════════════════ UI ════════════════════════════════════ */
  return (
    /* Nền ngoài: trắng (light) / đen tím đậm (dark) */
    <div className={`min-h-screen flex items-center justify-center p-4 md:p-8
      transition-colors duration-500
      ${dark ? "bg-[#0d0820]" : "bg-gray-50"}`}
    >
      {/* Dark mode trên phải */}
      <DarkToggle dark={dark} onToggle={() => setDark(p => !p)} />

      {/* ── Card wrapper ── */}
      <div className={`flex w-full max-w-[420px] md:max-w-[820px] lg:max-w-[960px]
        min-h-[600px] md:min-h-[640px]
        rounded-[28px] md:rounded-[32px] overflow-hidden
        transition-all duration-500
        ${dark
          ? "shadow-2xl shadow-violet-950/80"
          : "shadow-2xl shadow-indigo-200/60"
        }`}>

        {/* ════ LEFT — logo panel ════ */}
        <LeftPanel dark={dark} />

        {/* ════ RIGHT — form panel ════ */}
        <div className={`flex-1 flex flex-col justify-center
          px-7 py-9 md:px-10 md:py-10 lg:px-14 lg:py-12
          transition-colors duration-500
          ${dark ? "bg-[#130d28]" : "bg-white"}`}>

          {/* Logo — chỉ hiện mobile */}
          <p className={`md:hidden text-center font-extrabold text-[27px] tracking-tight mb-5
            transition-colors duration-300
            ${dark ? "text-violet-400" : "text-indigo-500"}`}>
            VibeNest
          </p>

          {/* Title */}
          <h1 className={`text-center md:text-left
            text-[25px] md:text-[26px] lg:text-[30px]
            font-extrabold leading-snug transition-colors duration-300
            ${dark ? "text-white" : "text-gray-900"}`}>
            Create Account
          </h1>
          <p className={`text-center md:text-left text-[13.5px] mt-1.5 mb-7 transition-colors duration-300
            ${dark ? "text-violet-400" : "text-gray-400"}`}>
            Start your intellectual journey today.
          </p>

          {/* Toast */}
          <Toast msg={toast.msg} ok={toast.ok} dark={dark} />

          {/* Form */}
          <form onSubmit={handleRegister} className="flex flex-col gap-[14px]" autoComplete="off">

            <InputField
              label="Full Name" id="username" type="text"
              placeholder="Nguyen Van A" icon="person"
              value={username} onChange={(e) => setUsername(e.target.value)}
              autoComplete="off" dark={dark}
            />

            <InputField
              label="Email" id="email" type="email"
              placeholder="nguyenvana@gmail.com" icon="mail"
              value={email} onChange={(e) => setEmail(e.target.value)}
              autoComplete="off" dark={dark}
            />

            <InputField
              label="Password" id="password"
              type={showPassword ? "text" : "password"}
              placeholder="********" icon="lock"
              value={password} onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password" dark={dark}
              rightEl={
                <button type="button" onClick={() => setShowPassword(p => !p)}
                  className={`transition-colors ${dark ? "text-violet-600 hover:text-violet-400" : "text-gray-400 hover:text-indigo-500"}`}>
                  <MI name={showPassword ? "visibility_off" : "visibility"} className="text-[19px]" />
                </button>
              }
            />

            {/* Checkbox */}
            <label className="flex items-start gap-2.5 cursor-pointer mt-0.5">
              <button type="button" onClick={() => setAgreed(p => !p)}
                className="flex-shrink-0 mt-[1px] text-[21px] leading-none transition-colors duration-200"
                style={{ color: agreed ? (dark ? "#a78bfa" : "#6366f1") : (dark ? "#3b2f6e" : "#d1d5db") }}>
                <MI name={agreed ? "check_box" : "check_box_outline_blank"} className="text-[21px]" />
              </button>
              <span className={`text-[12.5px] leading-relaxed pt-0.5 transition-colors duration-300
                ${dark ? "text-violet-400" : "text-gray-500"}`}>
                I agree to the{" "}
                <span className={`font-semibold hover:underline cursor-pointer
                  ${dark ? "text-violet-300" : "text-indigo-500"}`}>
                  Terms of Service
                </span>{" "}
                and{" "}
                <span className={`font-semibold hover:underline cursor-pointer
                  ${dark ? "text-violet-300" : "text-indigo-500"}`}>
                  Privacy Policy
                </span>.
              </span>
            </label>

            {/* Sign Up */}
            <button type="submit" disabled={loading}
              className={`mt-2 w-full py-[15px] rounded-2xl font-bold text-[15px] tracking-wide text-white
                active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
                transition-all duration-300 flex items-center justify-center gap-2
                ${dark
                  ? "bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 shadow-lg shadow-violet-900/60"
                  : "bg-indigo-400 hover:bg-indigo-500 shadow-md shadow-indigo-200 hover:shadow-indigo-300"
                }`}>
              {loading ? (
                <>
                  <svg className="animate-spin w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4"/>
                    <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Đang xử lý...
                </>
              ) : "Sign Up"}
            </button>
          </form>

          {/* Already have account */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <span className={`text-[13px] transition-colors duration-300 ${dark ? "text-violet-500" : "text-gray-500"}`}>
              Already have an account?
            </span>
            <Link to="/login" type="button"
              className={`text-[12.5px] font-semibold px-4 py-1.5 rounded-full border
                active:scale-95 transition-all duration-300
                ${dark
                  ? "text-violet-300 border-violet-700 hover:bg-violet-900/50 hover:border-violet-500"
                  : "text-indigo-500 border-indigo-200 hover:bg-indigo-50 hover:border-indigo-400"
                }`}>
              Log In
            </Link>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className={`flex-1 h-px transition-colors duration-300 ${dark ? "bg-violet-900" : "bg-gray-100"}`}/>
            <span className={`text-[11px] font-semibold tracking-[0.12em] uppercase transition-colors duration-300
              ${dark ? "text-violet-700" : "text-gray-400"}`}>
              Or join with
            </span>
            <div className={`flex-1 h-px transition-colors duration-300 ${dark ? "bg-violet-900" : "bg-gray-100"}`}/>
          </div>

          {/* Social Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <a href="http://localhost:5000/api/auth/google"
              className={`flex items-center justify-center gap-2 py-[13px] rounded-2xl
                text-[13.5px] font-semibold border
                active:scale-95 transition-all duration-300 cursor-pointer no-underline
                ${dark
                  ? "bg-[#1e1535] border-violet-800 text-violet-200 hover:border-red-500/50 hover:bg-[#2a1f4a]"
                  : "bg-white border-gray-200 text-gray-700 hover:border-red-300 hover:bg-red-50/60"
                }`}>
              <svg width="17" height="17" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              Google
            </a>

            <a href="http://localhost:5000/api/auth/facebook"
              className={`flex items-center justify-center gap-2 py-[13px] rounded-2xl
                text-[13.5px] font-semibold border
                active:scale-95 transition-all duration-300 cursor-pointer no-underline
                ${dark
                  ? "bg-[#1e1535] border-violet-800 text-violet-200 hover:border-blue-500/50 hover:bg-[#2a1f4a]"
                  : "bg-white border-gray-200 text-gray-700 hover:border-blue-400 hover:bg-blue-50/60"
                }`}>
              <svg width="18" height="18" viewBox="0 0 48 48">
                <linearGradient id="fb_grad2" x1="9.993" y1="9.993" x2="40.615" y2="40.615" gradientUnits="userSpaceOnUse">
                  <stop offset="0" stopColor="#2aa4f4"/>
                  <stop offset="1" stopColor="#007ad9"/>
                </linearGradient>
                <path fill="url(#fb_grad2)" d="M24 4C13 4 4 13 4 24c0 10 7.3 18.3 17 19.8V30h-5v-6h5v-4.5c0-5 3-7.8 7.5-7.8 2.2 0 4.5.4 4.5.4V17h-2.5c-2.5 0-3.3 1.6-3.3 3.2V24h5.5l-.9 6H27v13.8C36.7 42.3 44 34 44 24c0-11-9-20-20-20z"/>
              </svg>
              Facebook
            </a>
          </div>

        </div>{/* end right panel */}
      </div>{/* end card wrapper */}
    </div>
  );
}

export default Register;