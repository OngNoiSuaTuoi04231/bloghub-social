import { useEffect, useState } from "react";
import axios from "axios";
import { useDarkMode } from "../context/DarkModeContext";
import { useNavigate } from "react-router-dom";

const API = "https://wall-necessarily-formal-reduced.trycloudflare.com/api";

export default function Notification() {
  const { dark } = useDarkMode();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(`${API}/notifications`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setNotifications(res.data.notifications || []);

        await axios.put(
          `${API}/notifications/read-all`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } catch (error) {
        console.log("Lỗi lấy thông báo:", error);
      }
    };

    fetchNotifications();
  }, []);

  const handleOpenPost = (item) => {
    const postId = item.post?._id || item.post;

    if (!postId) return;

    navigate(`/post/${postId}`);
  };

  return (
    <div
      className={`min-h-screen px-4 py-6 ${
        dark ? "bg-[#0d0820]" : "bg-[#f7f4ff]"
      }`}
    >
      <div className="max-w-3xl mx-auto">
        <h1
          className={`text-2xl font-black mb-5 ${
            dark ? "text-white" : "text-gray-900"
          }`}
        >
          Notifications
        </h1>

        <div className="flex flex-col gap-3">
          {notifications.length === 0 ? (
            <div
              className={`rounded-2xl p-6 text-center ${
                dark
                  ? "bg-[#130d28] text-violet-400"
                  : "bg-white text-gray-400"
              }`}
            >
              No notifications yet
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item._id}
                onClick={() => handleOpenPost(item)}
                className={`rounded-2xl p-4 border shadow-sm cursor-pointer transition-all duration-200 hover:scale-[1.01] ${
                  dark
                    ? "bg-[#130d28] border-violet-900 text-violet-100 hover:border-violet-600"
                    : "bg-white border-purple-100 text-gray-800 hover:shadow-md"
                }`}
              >
                <p className="font-semibold text-sm">{item.message}</p>

                {item.post?.content && (
                  <p
                    className={`text-sm mt-2 ${
                      dark ? "text-violet-400" : "text-gray-500"
                    }`}
                  >
                    Bài viết: {item.post.content}
                  </p>
                )}

                {!item.post?.content && item.post?.mediaType && (
                  <p
                    className={`text-sm mt-2 ${
                      dark ? "text-violet-400" : "text-gray-500"
                    }`}
                  >
                    Bài viết:{" "}
                    {item.post.mediaType === "voice_note"
                      ? "Audio"
                      : item.post.mediaType === "image_locket" ||
                        item.post.mediaType === "image"
                      ? "Ảnh"
                      : "Bài viết"}
                  </p>
                )}

                <p
                  className={`text-xs mt-2 ${
                    dark ? "text-violet-600" : "text-gray-400"
                  }`}
                >
                  {new Date(item.createdAt).toLocaleString("vi-VN")}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}