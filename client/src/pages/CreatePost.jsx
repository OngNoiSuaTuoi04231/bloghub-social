import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import CameraCapture from "../components/CameraCapture";
import VoiceRecorder from "../components/VoiceRecorder";
import { useDarkMode } from "../context/DarkModeContext";

// Đã loại bỏ localhost và fix lại URL tránh bị lặp "/api" khi fetch
const SERVER_URL = "https://bloghub-social.onrender.com";

function MI({ name, className = "" }) {
  return (
    <span
      className={`material-icons-round select-none leading-none ${className}`}
    >
      {name}
    </span>
  );
}

function VisibilitySelect({ dark, value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  const options = [
    { label: "Public", value: "public", icon: "public" },
    { label: "Friends", value: "friends", icon: "group" },
  ];

  const selectedOption = options.find((o) => o.value === value) || options[0];

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (option) => {
    if (onChange) onChange(option.value);
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[12.5px] font-semibold transition-all duration-200 ${
          dark
            ? "bg-[#1e1535] border-violet-700 text-violet-300 hover:bg-[#2a1f4a]"
            : "bg-indigo-50 border-indigo-200 text-indigo-600 hover:bg-indigo-100"
        }`}
      >
        <MI name={selectedOption.icon} className="text-[15px]" />
        {selectedOption.label}
        <MI
          name={open ? "expand_less" : "expand_more"}
          className="text-[15px]"
        />
      </button>

      {open && (
        <div
          className={`absolute right-0 top-9 z-50 w-36 rounded-2xl shadow-xl border overflow-hidden transition-all duration-200 ${
            dark
              ? "bg-[#1e1535] border-violet-800"
              : "bg-white border-indigo-100"
          }`}
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option)}
              className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-medium transition-colors ${
                selectedOption.value === option.value
                  ? dark
                    ? "bg-violet-900/50 text-violet-300"
                    : "bg-indigo-50 text-indigo-600"
                  : dark
                    ? "text-violet-400 hover:bg-violet-900/30"
                    : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <MI name={option.icon} className="text-[16px]" />
              {option.label}
            </button>
          ))}
        </div>
      )}
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
  const [visibility, setVisibility] = useState("public");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("photo");

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

  const clearMedia = () => {
    setPreview(null);
    setMediaFile(null);
    setMediaType("text");
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
    formData.append(
      "visibility",
      visibility === "friends" ? "Friends" : "Public",
    );
    formData.append("privacy", visibility);
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
        setVisibility("public");
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

  return (
    <div
      className={`min-h-screen transition-colors duration-500 px-4 py-6 ${
        dark ? "bg-[#0d0820]" : "bg-[#f7f4ff]"
      }`}
    >
      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6">
        <div
          className={`hidden lg:flex rounded-2xl border shadow-sm p-8 min-h-[720px] ${
            dark
              ? "bg-[#130d28] border-violet-900"
              : "bg-white border-purple-100"
          }`}
        >
          <div className="w-full">
            <h2
              className={`text-2xl font-bold mb-2 ${
                dark ? "text-violet-200" : "text-slate-800"
              }`}
            >
              Create your moment
            </h2>

            <p
              className={`text-sm mb-8 ${
                dark ? "text-violet-500" : "text-slate-400"
              }`}
            >
              Capture and share moments on VibeNest!
            </p>

            <div
              className={`rounded-3xl border-2 border-dashed min-h-[520px] flex items-center justify-center ${
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
                    className={`text-[64px] ${
                      dark ? "text-violet-500" : "text-indigo-400"
                    }`}
                  />

                  <p
                    className={`mt-4 font-semibold ${
                      dark ? "text-violet-300" : "text-indigo-500"
                    }`}
                  >
                    Your preview will appear here
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div
          className={`w-full flex flex-col rounded-2xl overflow-hidden transition-all duration-500 border shadow-sm ${
            dark
              ? "bg-[#130d28] border-violet-900 shadow-violet-950/40"
              : "bg-white border-purple-100 shadow-indigo-100/80"
          }`}
        >
          <div
            className={`flex items-center justify-between px-4 py-3 border-b sticky top-0 z-40 backdrop-blur-md transition-colors duration-500 ${
              dark
                ? "border-violet-900/60 bg-[#130d28]/90"
                : "border-gray-100 bg-white/90"
            }`}
          >
            <button
              type="button"
              onClick={handlePost}
              disabled={isLoading}
              className={`w-full h-14 rounded-2xl font-bold text-[15px] text-white flex items-center justify-center transition-all duration-300 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed ${
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
                    className={`w-11 h-11 rounded-full object-cover flex-shrink-0 shadow-md ${
                      dark ? "shadow-violet-900/50" : "shadow-indigo-200"
                    }`}
                  />
                ) : (
                  <div
                    className={`w-11 h-11 rounded-full flex items-center justify-center font-black text-[15px] text-white flex-shrink-0 bg-gradient-to-br from-indigo-400 to-violet-500 shadow-md ${
                      dark ? "shadow-violet-900/50" : "shadow-indigo-200"
                    }`}
                  >
                    {avatarText}
                  </div>
                )}

                <div>
                  <p
                    className={`font-bold text-[14px] leading-tight ${
                      dark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {username}
                  </p>

                  <p
                    className={`text-[11.5px] ${
                      dark ? "text-violet-500" : "text-gray-400"
                    }`}
                  >
                    {localStorage.getItem("bio") || "No bio yet"}
                  </p>
                </div>
              </div>

              <VisibilitySelect
                dark={dark}
                value={visibility}
                onChange={setVisibility}
              />
            </div>

            <div className="px-4 pt-2 pb-3">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's happening?"
                rows={3}
                className={`w-full resize-none text-[15px] leading-relaxed outline-none bg-transparent transition-colors duration-300 placeholder-gray-300 ${
                  dark
                    ? "text-violet-100 placeholder-violet-800"
                    : "text-gray-800"
                }`}
              />
            </div>

            <div
              className={`flex mx-4 mb-3 rounded-2xl p-1 gap-1 ${
                dark ? "bg-[#1e1535]" : "bg-gray-100"
              }`}
            >
              {[
                { id: "photo", icon: "photo_camera", label: "Live Photo" },
                { id: "voice", icon: "mic", label: "Voice" },
              ].map(({ id, icon, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveTab(id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-200 ${
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
                  className={`mt-3 w-full rounded-2xl overflow-hidden border transition-colors ${
                    dark
                      ? "border-violet-800 bg-[#1e1535]"
                      : "border-indigo-100 bg-indigo-50"
                  }`}
                >
                  <div
                    className={`px-4 py-2 flex items-center gap-2 border-b ${
                      dark ? "border-violet-800" : "border-indigo-100"
                    }`}
                  >
                    <MI
                      name="photo_camera"
                      className={`text-[17px] ${
                        dark ? "text-violet-400" : "text-indigo-400"
                      }`}
                    />

                    <span
                      className={`text-[12px] font-bold uppercase tracking-widest ${
                        dark ? "text-violet-400" : "text-indigo-400"
                      }`}
                    >
                      Camera / Upload
                    </span>
                  </div>

                  <div className="p-3">
                    <CameraCapture
                      onCapture={handleCapture}
                      onCancel={() => {}}
                    />

                    {preview && mediaType.includes("image") && (
                      <div className="mt-4 relative">
                        <img
                          src={preview}
                          alt="Preview"
                          className="w-full rounded-2xl max-h-[500px] object-cover border"
                        />

                        <button
                          type="button"
                          onClick={clearMedia}
                          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                        >
                          ×
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "voice" && (
              <div className="px-4 pb-3">
                <div
                  className={`w-full rounded-3xl border-2 transition-all duration-300 ${
                    dark
                      ? "bg-[#1e1535] border-violet-800"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  {preview && mediaType === "voice_note" && (
                    <div className="px-4 pt-4 pb-3">
                      <p
                        className={`text-[12px] font-bold mb-2 ${
                          dark ? "text-violet-300" : "text-gray-700"
                        }`}
                      >
                        Voice Preview
                      </p>

                      <audio
                        src={preview}
                        controls
                        className="w-full h-10 rounded-xl"
                      />

                      <button
                        type="button"
                        onClick={clearMedia}
                        className={`mt-3 w-full py-2 rounded-xl text-[12px] font-bold border transition-all ${
                          dark
                            ? "border-violet-800 text-violet-300 hover:bg-violet-900/40"
                            : "border-gray-200 text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        Xóa voice
                      </button>
                    </div>
                  )}
                </div>

                <div
                  className={`mt-3 w-full rounded-2xl overflow-hidden border transition-colors ${
                    dark
                      ? "border-violet-800 bg-[#1e1535]"
                      : "border-indigo-100 bg-indigo-50"
                  }`}
                >
                  <div
                    className={`px-4 py-2 flex items-center gap-2 border-b ${
                      dark ? "border-violet-800" : "border-indigo-100"
                    }`}
                  >
                    <MI
                      name="graphic_eq"
                      className={`text-[17px] ${
                        dark ? "text-violet-400" : "text-indigo-400"
                      }`}
                    />

                    <span
                      className={`text-[12px] font-bold uppercase tracking-widest ${
                        dark ? "text-violet-400" : "text-indigo-400"
                      }`}
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
        </div>
      </div>
    </div>
  );
}
