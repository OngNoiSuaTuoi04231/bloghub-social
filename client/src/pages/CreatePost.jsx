import { useState } from "react";
import CameraCapture from "../components/CameraCapture";
import VoiceRecorder from "../components/VoiceRecorder";
import Comment from "../components/Comment"; // Nhúng trực tiếp component Comment đệ quy thời gian thực
import toast from "react-hot-toast";

export default function CreatePost() {
  const [content, setContent] = useState("");
  const [mediaFile, setMediaFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [mediaType, setMediaType] = useState("text");
  const [visibility, setVisibility] = useState("Public"); // Quản lý trạng thái quyền riêng tư động
  const [isLoading, setIsLoading] = useState(false);
  const [createdPostId, setCreatedPostId] = useState(null); // Lưu ID bài viết vừa tạo để mở khung comment

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

  const resetForm = () => {
    setContent("");
    setMediaFile(null);
    setPreview(null);
    setMediaType("text");
    setVisibility("Public");
  };

  const handlePost = async () => {
    if (!content && !mediaFile) {
      return toast.error("Vui lòng nhập nội dung hoặc đính kèm media!");
    }

    // Lấy chiếc thẻ thông hành token từ luồng đăng nhập của Member 2
    const token = localStorage.getItem("token");
    if (!token) {
      return toast.error(
        "Bạn chưa đăng nhập! Vui lòng đăng nhập để thực hiện tính năng này.",
      );
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append("content", content);
    formData.append("mediaType", mediaType);
    formData.append("visibility", visibility); // Gửi chính xác lựa chọn Public/Friends/Private của người dùng
    if (mediaFile) formData.append("media", mediaFile);

    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const res = await fetch(`${API_URL}/api/posts/create`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`, // BẮT BUỘC: Đính kèm mã xác thực danh tính
        },
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        toast.success("Đăng bài thành công! 🎉");
        setCreatedPostId(data.post._id); // Ghi nhận ID bài viết để kích hoạt khung comment real-time phía dưới
        resetForm();
      } else {
        toast.error("Lỗi: " + data.message);
      }
    } catch (error) {
      toast.error("Lỗi kết nối tới Server!");
      console.error("Lỗi đăng bài:", error);
    } finally {
      setIsLoading(false); // SỬA LỖI: Chuyển đổi dứt điểm lỗi chữ 'military' thành 'finally' chuẩn JS
    }
  };
  // Đọc thông tin hiển thị User đăng nhập từ LocalStorage để render Avatar động
  const username = localStorage.getItem("username") || "Alex Rivers";
  const initials = username
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.container}>
        {/* Khu vực thông tin User đồng bộ theo Figma */}
        <div style={styles.userInfo}>
          <div style={styles.avatar}>{initials}</div>
          <div style={styles.userText}>
            <span style={styles.userName}>{username}</span>
            <span style={styles.userSub}>Computer Science Junior</span>
          </div>
          <select
            value={visibility}
            onChange={(e) => setVisibility(e.target.value)}
            style={styles.selectVisibility}
          >
            <option value="Public">Public</option>
            <option value="Friends">Friends</option>
            <option value="Private">Private</option>
          </select>
        </div>

        {/* Ô nhập nội dung */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Chia sẻ khoảnh khắc của bạn..."
          style={styles.textarea}
        />

        {/* Khung hiển thị Preview ảnh chụp / ghi âm âm thanh */}
        {preview && mediaType.includes("image") && (
          <img src={preview} alt="preview" style={styles.previewImg} />
        )}

        {preview && mediaType === "voice_note" && (
          <audio src={preview} controls style={styles.previewAudio} />
        )}

        {/* Hàng nút bấm chức năng đa phương tiện (Chụp hình Camera / Thu âm Voice) */}
        <div style={styles.mediaRow}>
          <div style={styles.mediaItem}>
            <CameraCapture onCapture={handleCapture} onCancel={resetForm} />
          </div>
          <div style={styles.mediaItem}>
            <VoiceRecorder onRecordingComplete={handleVoice} />
          </div>
        </div>

        {/* Nút Đăng bài */}
        <button onClick={handlePost} disabled={isLoading} style={styles.btn}>
          {isLoading ? "Đang tải lên hệ thống..." : "Post"}
        </button>

        {/* VÙNG KẾT NỐI: Tự động mở vùng test Comment Real-time ngay bên dưới bài viết vừa tạo */}
        {createdPostId && (
          <div style={styles.commentSectionWrapper}>
            <p style={styles.commentTitle}>
              📍 Khu vực thử nghiệm bình luận thời gian thực cho bài viết vừa
              đăng:
            </p>
            {/* Nhúng component Comment có chứa logic đệ quy đa cấp lồng nhau và Socket.io */}
            <Comment postId={createdPostId} dark={false} />
          </div>
        )}
      </div>
    </div>
  );
}

// Bộ CSS Object cấu hình Design System ánh tím Threads/Locket đồng bộ toàn ứng dụng
const styles = {
  pageWrapper: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "85vh",
    background: "#fdfbfe",
    padding: "20px",
  },
  container: {
    width: "100%",
    maxWidth: "460px",
    background: "#ffffff",
    padding: "24px",
    borderRadius: "24px",
    boxShadow: "0 8px 32px rgba(127, 119, 221, 0.06)",
    border: "1px solid #f1effd",
    display: "flex",
    flexDirection: "column",
  },
  userInfo: {
    display: "flex",
    alignItems: "center",
    marginBottom: "16px",
    gap: "12px",
  },
  avatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    background: "#7F77DD", // Đồng bộ tone màu tím chủ đạo thay cho màu blue cũ
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    fontSize: "14px",
  },
  userText: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
  },
  userName: {
    fontWeight: "600",
    fontSize: "14px",
    color: "#1a1a1a",
    textAlign: "left",
  },
  userSub: {
    fontSize: "11px",
    color: "#8e8e93",
    textAlign: "left",
    marginTop: "2px",
  },
  selectVisibility: {
    padding: "6px 12px",
    borderRadius: "20px",
    border: "1px solid #e5e5ea",
    fontSize: "12px",
    color: "#666",
    background: "#fafafa",
    outline: "none",
    cursor: "pointer",
  },
  textarea: {
    width: "100%",
    minHeight: "100px",
    border: "none",
    outline: "none",
    fontSize: "15px",
    resize: "none",
    color: "#222",
    lineHeight: "1.5",
    padding: "4px 0",
    marginBottom: "12px",
    boxSizing: "border-box",
  },
  previewImg: {
    width: "100%",
    maxHeight: "300px",
    objectFit: "cover",
    borderRadius: "16px",
    marginBottom: "12px",
  },
  previewAudio: {
    width: "100%",
    marginBottom: "12px",
  },
  mediaRow: {
    display: "flex",
    gap: "12px",
    margin: "8px 0 16px 0",
    width: "100%",
  },
  mediaItem: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  btn: {
    width: "100%",
    padding: "14px",
    background: "#7F77DD",
    color: "#ffffff",
    border: "none",
    borderRadius: "16px",
    fontWeight: "600",
    fontSize: "15px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    boxShadow: "0 4px 12px rgba(127, 119, 221, 0.2)",
  },
  commentSectionWrapper: {
    marginTop: "25px",
    paddingTop: "20px",
    borderTop: "1px dashed #e5e3f7",
    textAlign: "left",
  },
  commentTitle: {
    fontSize: "13px",
    color: "#27ae60",
    fontWeight: "bold",
    margin: "0 0 10px 0",
  },
};
