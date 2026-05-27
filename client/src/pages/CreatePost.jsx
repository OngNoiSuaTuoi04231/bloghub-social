import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import CameraCapture from "../components/CameraCapture";
import VoiceRecorder from "../components/VoiceRecorder";
import { useDarkMode } from "../context/DarkModeContext";

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

function VisibilitySelect({ dark, onChange }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState("Public");
  const ref = useRef();

  const options = [
    { label: "Public", icon: "public" },
    { label: "Friends", icon: "group" },
    { label: "Private", icon: "lock" },
  ];

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (label) => {
    setSelected(label);
    setOpen(false);
    if (onChange) onChange(label);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[12.5px] font-semibold
          transition-all duration-200
          ${
            dark
              ? "bg-[#1e1535] border-violet-700 text-violet-300 hover:bg-[#2a1f4a]"
              : "bg-indigo-50 border-indigo-200 text-indigo-600 hover:bg-indigo-100"
          }`}
      >
        <MI
          name={options.find((o) => o.label === selected)?.icon || "public"}
          className="text-[15px]"
        />
        {selected}
        <MI
          name={open ? "expand_less" : "expand_more"}
          className="text-[15px]"
        />
      </button>

      {open && (
        <div
          className={`absolute right-0 top-9 z-50 w-36 rounded-2xl shadow-xl border overflow-hidden
          transition-all duration-200
          ${dark ? "bg-[#1e1535] border-violet-800" : "bg-white border-indigo-100"}`}
        >
          {options.map(({ label, icon }) => (
            <button
              key={label}
              type="button"
              onClick={() => handleSelect(label)}
              className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-medium transition-colors
                ${
                  selected === label
                    ? dark
                      ? "bg-violet-900/50 text-violet-300"
                      : "bg-indigo-50 text-indigo-600"
                    : dark
                      ? "text-violet-400 hover:bg-violet-900/30"
                      : "text-gray-600 hover:bg-gray-50"
                }`}
            >
              <MI name={icon} className="text-[16px]" />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Waveform({ active, dark }) {
  const bars = [
    3, 6, 10, 14, 10, 7, 12, 16, 11, 8, 13, 9, 15, 10, 6, 11, 8, 14, 7, 10,
  ];

  return (
    <div className="flex items-center gap-[2px] h-8">
      {bars.map((h, i) => (
        <div
          key={i}
          style={{
            height: `${h}px`,
            animationDelay: `${i * 60}ms`,
            animationDuration: `${600 + (i % 4) * 120}ms`,
          }}
          className={`w-[3px] rounded-full transition-colors duration-300
            ${active ? "animate-pulse" : ""}
            ${dark ? "bg-violet-500" : "bg-indigo-400"}`}
        />
      ))}
    </div>
  );
}

export default function CreatePost() {
  const navigate = useNavigate();
  const { dark } = useDarkMode();

  const [content, setContent] = useState("");
  const [mediaFile, setMediaFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [mediaType, setMediaType] = useState("text");
  const [visibility, setVisibility] = useState("Public");
  const [isLoading, setIsLoading] = useState(false);

  const [activeTab, setActiveTab] = useState("photo");
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);

  const timerRef = useRef(null);

  const username = localStorage.getItem("username") || "User";
  const avatarText = username.slice(0, 2).toUpperCase();

  const handleCapture = (file, url) => {
    setMediaFile(file);
    setPreview(url);
    setMediaType("image_locket");
  };

  const handleVoice = (file, url) => {
    setMediaFile(file);
    setPreview(url);
    setMediaType("voice_note");
  };

  const handlePost = async () => {
    if (!content && !mediaFile) {
      toast.error("Vui lòng nhập nội dung hoặc đính kèm media!");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Bạn chưa đăng nhập!");
      navigate("/login");
      return;
    }

    setIsLoading(true);

    const formData = new FormData();
    formData.append("content", content);
    formData.append("mediaType", mediaType);
    formData.append("visibility", visibility);
    formData.append("studyMode", "false");
    formData.append("tags", JSON.stringify([]));

    if (mediaFile) {
      formData.append("image", mediaFile);
    }

    try {
      const res = await fetch(`${SERVER_URL}/api/posts/create`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Đăng bài thành công!");
        setContent("");
        setMediaFile(null);
        setPreview(null);
        setMediaType("text");
        setVisibility("Public");
        navigate("/home");
      } else {
        toast.error("Lỗi: " + data.message);
      }
    } catch (error) {
      toast.error("Lỗi kết nối Server!");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      clearInterval(timerRef.current);
      setIsRecording(false);
    } else {
      setIsRecording(true);
      setRecordTime(0);
      timerRef.current = setInterval(() => setRecordTime((t) => t + 1), 1000);
    }
  };

  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  const fmtTime = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div
      className={`min-h-screen transition-colors duration-500 px-4 py-6
      ${dark ? "bg-[#0d0820]" : "bg-[#f7f4ff]"}`}
    >
      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6">
        <div
          className={`hidden lg:flex rounded-2xl border shadow-sm p-8 min-h-[720px]
          ${
            dark
              ? "bg-[#130d28] border-violet-900"
              : "bg-white border-purple-100"
          }`}
        >
          <div className="w-full">
            <h2
              className={`text-2xl font-bold mb-2 ${dark ? "text-violet-200" : "text-slate-800"}`}
            >
              Create your moment
            </h2>

            <p
              className={`text-sm mb-8 ${dark ? "text-violet-500" : "text-slate-400"}`}
            >
              Share photo, voice note or your thoughts with BlogHub.
            </p>

            <div
              className={`rounded-3xl border-2 border-dashed min-h-[520px] flex items-center justify-center
              ${
                dark
                  ? "border-violet-800 bg-[#1e1535]/60"
                  : "border-purple-200 bg-[#faf7ff]"
              }`}
            >
              {preview && mediaType.includes("image") ? (
                <img
                  src={preview}
                  alt="preview"
                  className="w-full h-[520px] object-cover rounded-3xl"
                />
              ) : preview && mediaType === "voice_note" ? (
                <div className="w-full max-w-md p-6">
                  <audio src={preview} controls className="w-full" />
                </div>
              ) : (
                <div className="text-center">
                  <MI
                    name={activeTab === "photo" ? "add_a_photo" : "mic"}
                    className={`text-[64px] ${dark ? "text-violet-500" : "text-indigo-400"}`}
                  />

                  <p
                    className={`mt-4 font-semibold ${dark ? "text-violet-300" : "text-indigo-500"}`}
                  >
                    Your preview will appear here
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div
          className={`w-full flex flex-col rounded-2xl overflow-hidden transition-all duration-500
          border shadow-sm
          ${
            dark
              ? "bg-[#130d28] border-violet-900 shadow-violet-950/40"
              : "bg-white border-purple-100 shadow-indigo-100/80"
          }`}
        >
          <div
            className={`flex items-center justify-between px-4 py-3 border-b sticky top-0 z-40
          backdrop-blur-md transition-colors duration-500
          ${dark ? "border-violet-900/60 bg-[#130d28]/90" : "border-gray-100 bg-white/90"}`}
          >
            <button
              type="button"
              onClick={handlePost}
              disabled={isLoading}
              className={`w-full h-14 rounded-2xl font-bold text-[15px] text-white
              flex items-center justify-center
              transition-all duration-300 active:scale-[0.99]
              disabled:opacity-50 disabled:cursor-not-allowed
              ${
                dark
                  ? "bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500"
                  : "bg-indigo-500 hover:bg-indigo-600"
              }`}
            >
              {isLoading ? (
                <span className="flex items-center gap-1.5">
                  <svg
                    className="animate-spin w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="white"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="white"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                  Uploading...
                </span>
              ) : (
                "Post"
              )}
            </button>
          </div>

          <div className="flex-1 flex flex-col overflow-y-auto">
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
              <div className="flex items-center gap-3">
                {localStorage.getItem("avatar") ? (
                  <img
                    src={localStorage.getItem("avatar")}
                    alt="avatar"
                    className={`w-11 h-11 rounded-full object-cover flex-shrink-0 shadow-md
                      ${dark ? "shadow-violet-900/50" : "shadow-indigo-200"}`}
                  />
                ) : (
                  <div
                    className={`w-11 h-11 rounded-full flex items-center justify-center
                    font-black text-[15px] text-white flex-shrink-0
                    bg-gradient-to-br from-indigo-400 to-violet-500 shadow-md
                    ${dark ? "shadow-violet-900/50" : "shadow-indigo-200"}`}
                  >
                    {avatarText}
                  </div>
                )}

                <div>
                  <p
                    className={`font-bold text-[14px] leading-tight ${dark ? "text-white" : "text-gray-900"}`}
                  >
                    {username}
                  </p>
                  <p
                    className={`text-[11.5px] ${dark ? "text-violet-500" : "text-gray-400"}`}
                  >
                    {localStorage.getItem("bio") || "Chưa có mô tả cá nhân"}
                  </p>
                </div>
              </div>

              <VisibilitySelect dark={dark} onChange={setVisibility} />
            </div>

            <div className="px-4 pt-2 pb-3">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's happening?"
                rows={3}
                className={`w-full resize-none text-[15px] leading-relaxed outline-none bg-transparent
                transition-colors duration-300 placeholder-gray-300
                ${dark ? "text-violet-100 placeholder-violet-800" : "text-gray-800"}`}
              />
            </div>

            <div
              className={`flex mx-4 mb-3 rounded-2xl p-1 gap-1 ${dark ? "bg-[#1e1535]" : "bg-gray-100"}`}
            >
              {[
                { id: "photo", icon: "photo_camera", label: "Ảnh Locket" },
                { id: "voice", icon: "mic", label: "Voice Note" },
              ].map(({ id, icon, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveTab(id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl
                  text-[13px] font-semibold transition-all duration-200
                  ${
                    activeTab === id
                      ? dark
                        ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-900/40"
                        : "bg-white text-indigo-600 shadow-md shadow-indigo-100"
                      : dark
                        ? "text-violet-500"
                        : "text-gray-400"
                  }`}
                >
                  <MI name={icon} className="text-[17px]" />
                  {label}
                </button>
              ))}
            </div>

            {activeTab === "photo" && (
              <div className="px-4 pb-3">
                <div
                  className={`relative w-full aspect-square rounded-3xl overflow-hidden
                flex flex-col items-center justify-center
                transition-all duration-300
                ${
                  dark
                    ? preview && mediaType.includes("image")
                      ? ""
                      : "bg-gradient-to-br from-[#1e1535] to-[#2d1b5e] border-2 border-dashed border-violet-700"
                    : preview && mediaType.includes("image")
                      ? ""
                      : "bg-gradient-to-br from-slate-200 to-slate-300 border-2 border-dashed border-slate-400"
                }`}
                >
                  {preview && mediaType.includes("image") ? (
                    <>
                      <img
                        src={preview}
                        alt="preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setPreview(null);
                          setMediaFile(null);
                          setMediaType("text");
                        }}
                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center"
                      >
                        <MI name="close" className="text-white text-[17px]" />
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 px-4 py-3 bg-gradient-to-t from-black/60 to-transparent">
                        <p
                          className="text-white font-bold text-sm text-center tracking-wide"
                          style={{ fontFamily: "cursive" }}
                        >
                          Safe chunder
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div
                        className={`absolute inset-8 rounded-full opacity-30 ${dark ? "bg-white/10" : "bg-white/60"}`}
                      />
                      <div
                        className={`absolute inset-16 rounded-full opacity-20 ${dark ? "bg-white/15" : "bg-white/80"}`}
                      />

                      <div className="relative z-10 flex flex-col items-center gap-2">
                        <div
                          className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-1
                        transition-all duration-300
                        ${dark ? "bg-violet-500/20 border border-violet-500/30" : "bg-white/40"}`}
                        >
                          <MI
                            name="add_a_photo"
                            className={`text-[28px] ${dark ? "text-violet-400" : "text-indigo-400"}`}
                          />
                        </div>
                        <p
                          className={`font-bold text-[14px] ${dark ? "text-violet-300" : "text-indigo-500"}`}
                        >
                          Add Photo
                        </p>
                        <p
                          className={`text-[10px] font-black tracking-[0.2em] uppercase ${dark ? "text-violet-600" : "text-indigo-300"}`}
                        >
                          Locket Style
                        </p>
                      </div>

                      <p
                        className={`absolute bottom-5 italic text-[18px] font-light tracking-wide
                      ${dark ? "text-violet-700" : "text-slate-400"}`}
                        style={{ fontFamily: "cursive" }}
                      >
                        Safe chunder
                      </p>
                    </>
                  )}
                </div>

                <div
                  className={`mt-3 w-full rounded-2xl overflow-hidden border transition-colors
                ${dark ? "border-violet-800 bg-[#1e1535]" : "border-indigo-100 bg-indigo-50"}`}
                >
                  <div
                    className={`px-4 py-2 flex items-center gap-2 border-b ${dark ? "border-violet-800" : "border-indigo-100"}`}
                  >
                    <MI
                      name="photo_camera"
                      className={`text-[17px] ${dark ? "text-violet-400" : "text-indigo-400"}`}
                    />
                    <span
                      className={`text-[12px] font-bold uppercase tracking-widest ${dark ? "text-violet-400" : "text-indigo-400"}`}
                    >
                      Camera / Upload
                    </span>
                  </div>
                  <div className="p-3">
                    <CameraCapture
                      onCapture={handleCapture}
                      onCancel={() => {}}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "voice" && (
              <div className="px-4 pb-3">
                <div
                  className={`w-full rounded-3xl border-2 transition-all duration-300
                ${
                  dark
                    ? isRecording
                      ? "bg-[#1e1535] border-violet-500 shadow-lg shadow-violet-900/40"
                      : "bg-[#1e1535] border-violet-800"
                    : isRecording
                      ? "bg-indigo-50 border-indigo-300 shadow-lg shadow-indigo-100"
                      : "bg-gray-50 border-gray-200"
                }`}
                >
                  {preview && mediaType === "voice_note" && (
                    <div className="px-4 pt-4 pb-2">
                      <audio
                        src={preview}
                        controls
                        className="w-full h-10 rounded-xl"
                      />
                    </div>
                  )}

                  <div className="flex items-center gap-3 px-4 py-4">
                    <button
                      type="button"
                      onClick={toggleRecording}
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0
                      transition-all duration-300 active:scale-90
                      ${
                        isRecording
                          ? dark
                            ? "bg-violet-600 shadow-lg shadow-violet-900/60 animate-pulse"
                            : "bg-indigo-500 shadow-lg shadow-indigo-200 animate-pulse"
                          : dark
                            ? "bg-violet-900/60 border border-violet-700"
                            : "bg-white border border-indigo-200 shadow-sm"
                      }`}
                    >
                      <MI
                        name={isRecording ? "stop" : "mic"}
                        className={`text-[22px] transition-colors
                        ${isRecording ? "text-white" : dark ? "text-violet-400" : "text-indigo-500"}`}
                      />
                    </button>

                    <div className="flex-1 flex flex-col">
                      <Waveform active={isRecording} dark={dark} />
                    </div>

                    <span
                      className={`text-[12px] font-mono font-bold flex-shrink-0 ${dark ? "text-violet-400" : "text-indigo-400"}`}
                    >
                      {fmtTime(recordTime)}
                    </span>
                  </div>

                  <div className="text-center pb-4">
                    <p
                      className={`font-bold text-[13px] ${dark ? "text-violet-300" : "text-gray-700"}`}
                    >
                      {isRecording ? "Đang ghi âm..." : "Record Voice"}
                    </p>
                    <p
                      className={`text-[10px] font-black tracking-[0.2em] uppercase mt-0.5 ${dark ? "text-violet-600" : "text-indigo-300"}`}
                    >
                      Audio Note
                    </p>
                  </div>
                </div>

                <div
                  className={`mt-3 w-full rounded-2xl overflow-hidden border transition-colors
                ${dark ? "border-violet-800 bg-[#1e1535]" : "border-indigo-100 bg-indigo-50"}`}
                >
                  <div
                    className={`px-4 py-2 flex items-center gap-2 border-b ${dark ? "border-violet-800" : "border-indigo-100"}`}
                  >
                    <MI
                      name="graphic_eq"
                      className={`text-[17px] ${dark ? "text-violet-400" : "text-indigo-400"}`}
                    />
                    <span
                      className={`text-[12px] font-bold uppercase tracking-widest ${dark ? "text-violet-400" : "text-indigo-400"}`}
                    >
                      Voice Recorder
                    </span>
                  </div>
                  <div className="p-3">
                    <VoiceRecorder onRecordingComplete={handleVoice} />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div
            className={`flex items-center justify-around px-4 py-3 border-t sticky bottom-0
          transition-colors duration-500
          ${
            dark
              ? "border-violet-900/60 bg-[#130d28]/95 backdrop-blur-md"
              : "border-gray-100 bg-white/95 backdrop-blur-md"
          }`}
          >
            {[
              { icon: "photo_library", label: "Gallery", tab: "photo" },
              { icon: "mic", label: "Audio", tab: "voice" },
            ].map(({ icon, label, tab }) => {
              const active = tab && activeTab === tab;

              return (
                <button
                  key={icon}
                  type="button"
                  onClick={() => tab && setActiveTab(tab)}
                  className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl
                  transition-all duration-200 active:scale-90
                  ${
                    active
                      ? dark
                        ? "text-violet-400"
                        : "text-indigo-500"
                      : dark
                        ? "text-violet-700"
                        : "text-gray-400"
                  }`}
                >
                  <MI name={icon} className="text-[22px]" />
                  <span className="text-[9.5px] font-semibold tracking-wide">
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
