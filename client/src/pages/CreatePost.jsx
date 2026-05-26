import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
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
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[12.5px] font-semibold transition-all duration-200
          ${dark ? "bg-[#1e1535] border-violet-700 text-violet-300" : "bg-indigo-50 border-indigo-200 text-indigo-600"}`}
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
              <MI name={icon} className="text-[16px]" /> {label}
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
  const [mediaType, setMediaType] = useState("text"); // 'text', 'image_locket', 'voice_note'
  const [visibility, setVisibility] = useState("Public");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("photo");

  // Dùng useRef để ẩn thẻ input file đi cho đẹp giao diện
  const imageInputRef = useRef(null);
  const audioInputRef = useRef(null);

  const username = localStorage.getItem("username") || "User";
  const avatarText = username.slice(0, 2).toUpperCase();

  // Xử lý khi user chọn file ảnh từ máy
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMediaFile(file);
      setPreview(URL.createObjectURL(file));
      setMediaType("image_locket"); // Sửa thành image_locket để khớp Backend
    }
  };

  // Xử lý khi user chọn file âm thanh từ máy
  const handleAudioUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMediaFile(file);
      setPreview(URL.createObjectURL(file));
      setMediaType("voice_note"); // Sửa thành voice_note để khớp Backend
    }
  };

  // Xử lý khi user dùng Component VoiceRecorder thu âm trực tiếp
  const handleVoiceRecord = (file, url) => {
    setMediaFile(file);
    setPreview(url);
    setMediaType("voice_note"); // Sửa thành voice_note để khớp Backend
  };

  const removeMedia = () => {
    setPreview(null);
    setMediaFile(null);
    setMediaType("text");
    if (imageInputRef.current) imageInputRef.current.value = "";
    if (audioInputRef.current) audioInputRef.current.value = "";
  };

  const handlePost = async () => {
    if (!content.trim() && !mediaFile) {
      toast.error("Vui lòng nhập nội dung hoặc tải lên ảnh/âm thanh!");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Bạn chưa đăng nhập!");
      // Tạm comment navigate để bạn test UI, nếu có Auth rồi thì mở ra
      // navigate("/login");
      // return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append("content", content);
    formData.append("mediaType", mediaType);
    formData.append("visibility", visibility);
    formData.append("studyMode", "false");
    formData.append("tags", JSON.stringify([]));

    if (mediaFile) {
      formData.append("media", mediaFile); // Trùng khớp với upload.single("media") ở Backend
    }

    try {
      const res = await fetch(`${SERVER_URL}/api/posts/create`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }, // Token có thể undefined lúc test
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Đăng bài thành công! 🎉");
        setContent("");
        removeMedia();
        // navigate("/"); // Chuyển về HomeFeed
      } else {
        toast.error("Lỗi Server: " + data.message);
      }
    } catch (error) {
      toast.error("Lỗi kết nối Server! Vui lòng kiểm tra Backend.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-500 px-4 py-6 ${dark ? "bg-[#0d0820]" : "bg-[#f7f4ff]"}`}
    >
      <div
        className={`w-full max-w-3xl mx-auto flex flex-col rounded-2xl overflow-hidden transition-all duration-500 border shadow-sm ${dark ? "bg-[#130d28] border-violet-900 shadow-violet-950/40" : "bg-white border-purple-100 shadow-indigo-100/80"}`}
      >
        {/* NÚT POST */}
        <div
          className={`flex items-center justify-between px-4 py-3 border-b sticky top-0 z-40 backdrop-blur-md ${dark ? "border-violet-900/60 bg-[#130d28]/90" : "border-gray-100 bg-white/90"}`}
        >
          <h2
            className={`font-bold text-lg ${dark ? "text-violet-200" : "text-gray-800"}`}
          >
            Tạo bài viết
          </h2>
          <button
            type="button"
            onClick={handlePost}
            disabled={isLoading}
            className={`px-6 py-2 rounded-xl font-bold text-[14px] text-white flex items-center justify-center transition-all duration-300 disabled:opacity-50
              ${dark ? "bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500" : "bg-indigo-500 hover:bg-indigo-600"}`}
          >
            {isLoading ? "Đang đăng..." : "Đăng bài"}
          </button>
        </div>

        <div className="flex-1 flex flex-col overflow-y-auto">
          {/* USER INFO */}
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <div className="flex items-center gap-3">
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center font-black text-[15px] text-white flex-shrink-0 bg-gradient-to-br from-indigo-400 to-violet-500 shadow-md`}
              >
                {avatarText}
              </div>
              <div>
                <p
                  className={`font-bold text-[14px] leading-tight ${dark ? "text-white" : "text-gray-900"}`}
                >
                  {username}
                </p>
                <p
                  className={`text-[11.5px] ${dark ? "text-violet-500" : "text-gray-400"}`}
                >
                  Chia sẻ suy nghĩ của bạn...
                </p>
              </div>
            </div>
            <VisibilitySelect dark={dark} onChange={setVisibility} />
          </div>

          {/* TEXTAREA */}
          <div className="px-4 pt-2 pb-3">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Bạn đang nghĩ gì thế?"
              rows={4}
              className={`w-full resize-none text-[15px] leading-relaxed outline-none bg-transparent transition-colors duration-300 placeholder-gray-400 ${dark ? "text-violet-100" : "text-gray-800"}`}
            />
          </div>

          {/* HIỂN THỊ PREVIEW ẢNH/AUDIO ĐÃ CHỌN */}
          {preview && (
            <div className="px-4 pb-4">
              <div className="relative w-full rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 flex justify-center items-center">
                {mediaType === "image_locket" ? ( // Đã cập nhật điều kiện hiển thị
                  <img
                    src={preview}
                    alt="preview"
                    className="max-h-[400px] w-full object-cover"
                  />
                ) : (
                  <div className="w-full p-6 bg-indigo-50 flex flex-col items-center gap-3">
                    <MI
                      name="audiotrack"
                      className="text-[40px] text-indigo-400"
                    />
                    <audio src={preview} controls className="w-full max-w-sm" />
                  </div>
                )}

                <button
                  onClick={removeMedia}
                  className="absolute top-2 right-2 w-8 h-8 bg-black/60 rounded-full flex justify-center items-center hover:bg-black/80 transition"
                >
                  <MI name="close" className="text-white text-[18px]" />
                </button>
              </div>
            </div>
          )}

          {/* TAB CHỌN LOẠI MEDIA NẾU CHƯA CÓ PREVIEW */}
          {!preview && (
            <>
              <div
                className={`flex mx-4 mb-3 rounded-xl p-1 gap-1 ${dark ? "bg-[#1e1535]" : "bg-gray-100"}`}
              >
                {[
                  { id: "photo", icon: "image", label: "Tải ảnh lên" },
                  { id: "voice", icon: "mic", label: "Tải/Ghi âm Audio" },
                ].map(({ id, icon, label }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[13px] font-semibold transition-all duration-200
                      ${activeTab === id ? (dark ? "bg-violet-600 text-white" : "bg-white text-indigo-600 shadow-sm") : "text-gray-500"}`}
                  >
                    <MI name={icon} className="text-[18px]" /> {label}
                  </button>
                ))}
              </div>

              {/* KHU VỰC TẢI ẢNH */}
              {activeTab === "photo" && (
                <div className="px-4 pb-6 flex justify-center">
                  <input
                    type="file"
                    accept="image/*"
                    ref={imageInputRef}
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => imageInputRef.current.click()}
                    className={`w-full py-8 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 transition-colors
                      ${dark ? "border-violet-700 bg-[#1e1535] hover:bg-violet-900/40" : "border-indigo-200 bg-indigo-50 hover:bg-indigo-100"}`}
                  >
                    <MI
                      name="cloud_upload"
                      className={`text-[40px] ${dark ? "text-violet-400" : "text-indigo-400"}`}
                    />
                    <span
                      className={`font-semibold ${dark ? "text-violet-300" : "text-indigo-600"}`}
                    >
                      Nhấn để tải ảnh lên từ thiết bị
                    </span>
                  </button>
                </div>
              )}

              {/* KHU VỰC TẢI / GHI ÂM AUDIO */}
              {activeTab === "voice" && (
                <div className="px-4 pb-6 flex flex-col gap-4">
                  <input
                    type="file"
                    accept="audio/*"
                    ref={audioInputRef}
                    onChange={handleAudioUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => audioInputRef.current.click()}
                    className={`w-full py-4 border-2 border-dashed rounded-xl flex items-center justify-center gap-2 transition-colors
                      ${dark ? "border-violet-700 bg-[#1e1535] hover:bg-violet-900/40" : "border-indigo-200 bg-indigo-50 hover:bg-indigo-100"}`}
                  >
                    <MI
                      name="audio_file"
                      className={`text-[24px] ${dark ? "text-violet-400" : "text-indigo-400"}`}
                    />
                    <span
                      className={`font-semibold ${dark ? "text-violet-300" : "text-indigo-600"}`}
                    >
                      Tải file Audio lên (.mp3, .wav)
                    </span>
                  </button>

                  <div className="flex items-center gap-2">
                    <hr className="flex-1 border-gray-200" />
                    <span className="text-xs text-gray-400 font-medium">
                      HOẶC
                    </span>
                    <hr className="flex-1 border-gray-200" />
                  </div>

                  <VoiceRecorder onRecordingComplete={handleVoiceRecord} />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
