import { useRef, useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Camera, Grid, Mic, FileText } from "lucide-react";
import { useDarkMode } from "../context/DarkModeContext";
import axios from "axios";
import { io } from "socket.io-client";

const API = "https://bloghub-social-api.onrender.com/api";
const SOCKET_URL = "https://bloghub-social-api.onrender.com";

export default function Profile() {
  const navigate = useNavigate();
  const { userId } = useParams();
  const { dark } = useDarkMode();
  const fileInputRef = useRef(null);

  const token = localStorage.getItem("token");
  const currentUserId = localStorage.getItem("userId");

  const profileUserId = userId || currentUserId;
  const isMyProfile = !userId || String(userId) === String(currentUserId);

  const [activeTab, setActiveTab] = useState("moments");
  const [isEditing, setIsEditing] = useState(false);
  const [myPosts, setMyPosts] = useState([]);
  const [avatar, setAvatar] = useState("");
  const [relationship, setRelationship] = useState("none");
  const [totalPosts, setTotalPosts] = useState(0);

  const [friends, setFriends] = useState([]);
  const [showFriends, setShowFriends] = useState(false);
  const [friendCount, setFriendCount] = useState(0);

  const [user, setUser] = useState({ name: "", bio: "" });
  const [form, setForm] = useState({ name: "", bio: "" });

  useEffect(() => {
    if (!token) navigate("/login");
  }, [token, navigate]);

  // FIX 1: useCallback + nhận pid làm tham số tránh closure cũ
  const fetchFriends = useCallback(
    async (pid) => {
      try {
        const res = await axios.get(`${API}/users/${pid}/friends`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
        });
        setFriends(res.data.friends || []);
        setFriendCount(res.data.count || 0);
      } catch (error) {
        console.log("Friends error:", error.response?.data || error.message);
      }
    },
    [token],
  );

  // FIX 2: fetchRelationship riêng + chặn cache 304
  const fetchRelationship = useCallback(
    async (pid) => {
      try {
        const res = await axios.get(`${API}/users/relationship/${pid}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
        });
        setRelationship(res.data.status || "none");
      } catch (error) {
        console.log(
          "Relationship error:",
          error.response?.data || error.message,
        );
      }
    },
    [token],
  );

  // FIX 3: reset state khi đổi profile tránh hiện data cũ
  useEffect(() => {
    setMyPosts([]);
    setFriends([]);
    setFriendCount(0);
    setTotalPosts(0);
    setRelationship("none");
    setAvatar("");
    setUser({ name: "", bio: "" });
    setActiveTab("moments");
  }, [profileUserId]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!profileUserId) return;

        const userRes = await axios.get(`${API}/users/${profileUserId}`);
        const profileUser = userRes.data.user;

        setUser({
          name: profileUser.username || "User",
          bio: profileUser.bio || "",
        });
        setForm({
          name: profileUser.username || "User",
          bio: profileUser.bio || "",
        });
        setAvatar(profileUser.avatar || "");

        const postsRes = await axios.get(`${API}/posts/user/${profileUserId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMyPosts(postsRes.data.posts || []);
        setTotalPosts(
          postsRes.data.totalPosts ?? postsRes.data.posts?.length ?? 0,
        );

        await fetchFriends(profileUserId);

        if (!isMyProfile) {
          await fetchRelationship(profileUserId);
        }
      } catch (error) {
        console.log("Lỗi lấy profile:", error);
      }
    };

    fetchProfile();
  }, [profileUserId, isMyProfile, token, fetchFriends, fetchRelationship]);

  useEffect(() => {
    const socket = io(SOCKET_URL);
    const myId = localStorage.getItem("userId");

    if (myId) socket.emit("join_user_room", myId);

    socket.on("friend_status_updated", (data) => {
      if (String(data.userId) === String(profileUserId)) {
        setRelationship(data.status);
        fetchFriends(profileUserId);
      }
    });

    return () => socket.disconnect();
  }, [profileUserId, fetchFriends]);

  const handleAvatarChange = async (e) => {
    try {
      if (!isMyProfile) return;
      const file = e.target.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("avatar", file);

      const res = await axios.put(`${API}/auth/avatar`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      const newAvatar = res.data.avatar;
      setAvatar(newAvatar);
      localStorage.setItem("avatar", newAvatar);
      alert("Cập nhật avatar thành công");
    } catch (error) {
      console.log(error.response?.data || error.message);
      alert("Upload avatar thất bại");
    }
  };

  const handleSave = async () => {
    try {
      if (!isMyProfile) return;

      const res = await axios.put(
        `${API}/users/profile`,
        { bio: form.bio },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const updatedUser = res.data.user;
      setUser({
        name: updatedUser.username || "User",
        bio: updatedUser.bio || "",
      });
      setForm({
        name: updatedUser.username || "User",
        bio: updatedUser.bio || "",
      });
      localStorage.setItem("bio", updatedUser.bio || "");
      setIsEditing(false);
      alert("Cập nhật bio thành công");
    } catch (error) {
      console.log(error.response?.data || error.message);
      alert("Lưu bio thất bại");
    }
  };

  // FIX 4: handleFollow fetch lại từ server + chặn cache
  const handleFollow = async () => {
    try {
      await axios.put(
        `${API}/users/follow/${profileUserId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setRelationship("pending");
      await fetchRelationship(profileUserId);
      await fetchFriends(profileUserId);
    } catch (error) {
      console.log("Follow error:", error.response?.data || error.message);
      alert("Follow thất bại");
    }
  };

  const handleAccept = async () => {
    try {
      await axios.put(
        `${API}/users/accept/${profileUserId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setRelationship("friends");
      fetchFriends(profileUserId);
    } catch (error) {
      console.log("Accept error:", error.response?.data || error.message);
      alert("Chấp nhận thất bại");
    }
  };

  const handleReject = async () => {
    try {
      await axios.put(
        `${API}/users/reject/${profileUserId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setRelationship("none");
      fetchFriends(profileUserId);
    } catch (error) {
      console.log("Reject error:", error.response?.data || error.message);
      alert("Từ chối thất bại");
    }
  };

  const handleUnfriend = async () => {
    try {
      await axios.put(
        `${API}/users/unfriend/${profileUserId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setRelationship("none");
      fetchFriends(profileUserId);
    } catch (error) {
      console.log("Unfriend error:", error.response?.data || error.message);
      alert("Hủy kết bạn thất bại");
    }
  };

  const momentPosts = myPosts.filter(
    (post) => post.mediaType === "image" || post.mediaType === "image_locket",
  );
  const voicePosts = myPosts.filter((post) => post.mediaType === "voice_note");
  const textPosts = myPosts.filter(
    (post) => post.mediaType === "text" || !post.mediaType,
  );

  return (
    <div
      className={`min-h-screen transition-colors duration-500 ${dark ? "bg-[#0d0820]" : "bg-[#f7f4ff]"}`}
    >
      <main className="max-w-7xl mx-auto px-4 py-6">
        <section
          className={`border rounded-2xl p-6 shadow-sm transition-colors duration-500 ${dark ? "bg-[#130d28] border-violet-900" : "bg-white border-purple-100"}`}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                {avatar ? (
                  <img
                    src={avatar}
                    alt="profile"
                    className={`w-28 h-28 rounded-full object-cover border-4 ${dark ? "border-violet-800" : "border-indigo-100"}`}
                  />
                ) : (
                  <div
                    className={`w-28 h-28 rounded-full border-4 flex items-center justify-center font-black text-4xl uppercase ${dark ? "border-violet-800 bg-violet-900 text-violet-200" : "border-indigo-100 bg-indigo-500 text-white"}`}
                  >
                    {user.name?.charAt(0) || "U"}
                  </div>
                )}
                {isMyProfile && isEditing && (
                  <>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current.click()}
                      className="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center shadow-lg"
                    >
                      <Camera size={15} />
                    </button>
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </>
                )}
              </div>

              <div>
                {isMyProfile && isEditing ? (
                  <div className="space-y-3">
                    <div
                      className={`w-[280px] px-4 py-2 rounded-lg border cursor-not-allowed ${dark ? "bg-[#1e1535] border-violet-800 text-violet-400" : "bg-gray-100 border-purple-200 text-gray-500"}`}
                    >
                      {user.name}
                    </div>
                    <input
                      value={form.bio}
                      onChange={(e) =>
                        setForm({ ...form, bio: e.target.value })
                      }
                      placeholder="Enter your bio"
                      className={`w-[280px] px-4 py-2 rounded-lg border outline-none transition ${dark ? "bg-[#1e1535] border-violet-800 text-violet-100 placeholder-violet-700 focus:ring-2 focus:ring-violet-600" : "bg-white border-purple-200 text-slate-700 focus:ring-2 focus:ring-indigo-300"}`}
                    />
                  </div>
                ) : (
                  <>
                    <h2
                      className={`text-lg font-semibold ${dark ? "text-white" : "text-slate-800"}`}
                    >
                      {user.name || "User"}
                    </h2>
                    <p
                      className={`text-sm mt-1 ${user.bio ? (dark ? "text-violet-400" : "text-slate-500") : dark ? "text-violet-600 italic" : "text-slate-400 italic"}`}
                    >
                      {user.bio || "No bio yet"}
                    </p>
                  </>
                )}
                <div className="flex gap-10 mt-5">
                  <Stat number={totalPosts} text="All Posts" dark={dark} />
                  <button
                    type="button"
                    onClick={() => setShowFriends(true)}
                    className="text-left"
                  >
                    <Stat number={friendCount} text="Friends" dark={dark} />
                  </button>
                </div>
              </div>
            </div>

            {isMyProfile &&
              (isEditing ? (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setForm(user);
                      setIsEditing(false);
                    }}
                    className={`px-4 py-2 rounded-lg text-sm transition ${dark ? "bg-[#1e1535] text-violet-300 hover:bg-violet-900/40" : "bg-slate-100 text-slate-600"}`}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    className="px-5 py-2 rounded-lg bg-indigo-500 text-white text-sm shadow hover:bg-indigo-600"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="px-5 py-2 rounded-lg bg-indigo-400 hover:bg-indigo-500 transition text-white text-sm shadow"
                >
                  Edit Profile
                </button>
              ))}

            {!isMyProfile && relationship === "none" && (
              <button
                type="button"
                onClick={handleFollow}
                className="px-5 py-2 rounded-lg bg-indigo-500 text-white text-sm shadow hover:bg-indigo-600"
              >
                Follow
              </button>
            )}
            {!isMyProfile && relationship === "pending" && (
              <button
                type="button"
                disabled
                className="px-5 py-2 rounded-lg bg-gray-500 text-white text-sm shadow cursor-not-allowed"
              >
                Requested
              </button>
            )}
            {!isMyProfile && relationship === "friends" && (
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled
                  className="px-5 py-2 rounded-lg bg-green-600 text-white text-sm shadow cursor-default"
                >
                  Friends
                </button>
                <button
                  type="button"
                  onClick={handleUnfriend}
                  className="px-5 py-2 rounded-lg bg-red-600 text-white text-sm shadow hover:bg-red-700"
                >
                  Unfollow
                </button>
              </div>
            )}
            {!isMyProfile && relationship === "need_accept" && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleAccept}
                  className="px-5 py-2 rounded-lg bg-green-600 text-white text-sm shadow hover:bg-green-700"
                >
                  Accept
                </button>
                <button
                  type="button"
                  onClick={handleReject}
                  className="px-5 py-2 rounded-lg bg-red-600 text-white text-sm shadow hover:bg-red-700"
                >
                  Decline
                </button>
              </div>
            )}
          </div>
        </section>

        <div className="flex flex-wrap gap-3 mt-7 mb-6">
          <TabButton
            active={activeTab === "moments"}
            onClick={() => setActiveTab("moments")}
            icon={<Grid size={15} />}
            text="Snapshot"
            dark={dark}
          />
          <TabButton
            active={activeTab === "voices"}
            onClick={() => setActiveTab("voices")}
            icon={<Mic size={15} />}
            text="Audio Recording"
            dark={dark}
          />
          <TabButton
            active={activeTab === "posts"}
            onClick={() => setActiveTab("posts")}
            icon={<FileText size={15} />}
            text="Article"
            dark={dark}
          />
        </div>

        {activeTab === "moments" && (
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {momentPosts.length > 0 ? (
              momentPosts.map((post) => (
                <MomentCard
                  key={post._id}
                  post={post}
                  dark={dark}
                  onClick={() => navigate(`/post/${post._id}`)}
                />
              ))
            ) : (
              <EmptyBox text="No moments yet" dark={dark} />
            )}
          </section>
        )}
        {activeTab === "voices" && (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {voicePosts.length > 0 ? (
              voicePosts.map((post) => (
                <VoiceCard
                  key={post._id}
                  post={post}
                  dark={dark}
                  onClick={() => navigate(`/post/${post._id}`)}
                />
              ))
            ) : (
              <EmptyBox text="No voice notes yet" dark={dark} />
            )}
          </section>
        )}
        {activeTab === "posts" && (
          <section className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-5">
            {textPosts.length > 0 ? (
              textPosts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  dark={dark}
                  onClick={() => navigate(`/post/${post._id}`)}
                />
              ))
            ) : (
              <EmptyBox text="No posts yet" dark={dark} />
            )}
          </section>
        )}

        {showFriends && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div
              className={`w-full max-w-md rounded-2xl p-5 ${dark ? "bg-[#130d28]" : "bg-white"}`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3
                  className={`font-bold text-lg ${dark ? "text-white" : "text-slate-800"}`}
                >
                  Friend list ({friendCount})
                </h3>
                <button
                  type="button"
                  onClick={() => setShowFriends(false)}
                  className="text-red-500 font-bold"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {friends.length === 0 ? (
                  <p
                    className={`text-sm ${dark ? "text-violet-400" : "text-slate-500"}`}
                  >
                    No friends yet
                  </p>
                ) : (
                  friends.map((friend) => (
                    <div
                      key={friend._id}
                      className={`flex items-center justify-between p-3 rounded-xl ${dark ? "bg-[#1e1535]" : "bg-slate-100"}`}
                    >
                      <div
                        className="flex items-center gap-3 cursor-pointer"
                        onClick={() => {
                          setShowFriends(false);
                          navigate(`/profile/${friend._id}`);
                        }}
                      >
                        {friend.avatar ? (
                          <img
                            src={friend.avatar}
                            alt=""
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center">
                            {friend.username?.charAt(0)}
                          </div>
                        )}
                        <span
                          className={dark ? "text-white" : "text-slate-800"}
                        >
                          {friend.username}
                        </span>
                      </div>
                      {isMyProfile && (
                        <button
                          type="button"
                          onClick={async () => {
                            await axios.put(
                              `${API}/users/unfriend/${friend._id}`,
                              {},
                              { headers: { Authorization: `Bearer ${token}` } },
                            );
                            fetchFriends(profileUserId);
                          }}
                          className="px-3 py-1 rounded-lg bg-red-500 text-white text-xs"
                        >
                          Hủy
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function TabButton({ active, onClick, icon, text, dark }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm transition shadow-sm ${active ? (dark ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white" : "bg-indigo-500 text-white") : dark ? "bg-[#1e1535] text-violet-400 hover:bg-violet-900/40" : "bg-indigo-100 text-indigo-500 hover:bg-indigo-200"}`}
    >
      {icon}
      {text}
    </button>
  );
}

function MomentCard({ post, dark, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`cursor-pointer rounded-2xl overflow-hidden border shadow-sm max-w-[360px] ${dark ? "bg-[#130d28] border-violet-900" : "bg-white border-purple-100"}`}
    >
      {post.mediaUrl && (
        <img
          src={post.mediaUrl}
          alt="moment"
          className="w-full h-[240px] object-cover"
        />
      )}
      {post.content && (
        <p
          className={`p-3 text-sm ${dark ? "text-violet-300" : "text-slate-600"}`}
        >
          {post.content}
        </p>
      )}
    </div>
  );
}

function VoiceCard({ post, dark, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`cursor-pointer border rounded-2xl p-4 shadow-sm max-w-[520px] ${dark ? "bg-[#130d28] border-violet-900" : "bg-white border-purple-100"}`}
    >
      <p
        className={`text-sm font-medium mb-2 ${dark ? "text-violet-300" : "text-indigo-600"}`}
      >
        {post.content?.trim() ? post.content : "Audio Recording"}
      </p>
      <p
        className={`text-xs mb-3 ${dark ? "text-violet-600" : "text-slate-400"}`}
      >
        {post.createdAt ? new Date(post.createdAt).toLocaleString("vi-VN") : ""}
      </p>
      {post.mediaUrl && (
        <audio controls src={post.mediaUrl} className="w-full" />
      )}
    </div>
  );
}

function PostCard({ post, dark, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`cursor-pointer border rounded-2xl p-4 shadow-sm w-full ${dark ? "bg-[#130d28] border-violet-900" : "bg-white border-purple-100"}`}
    >
      <p
        className={`text-sm font-medium mb-2 ${dark ? "text-violet-300" : "text-indigo-600"}`}
      >
        Article!
      </p>
      <p className={`text-sm ${dark ? "text-violet-200" : "text-slate-600"}`}>
        {post.content}
      </p>
      <p
        className={`text-xs mt-4 ${dark ? "text-violet-600" : "text-slate-400"}`}
      >
        {post.createdAt ? new Date(post.createdAt).toLocaleString("vi-VN") : ""}
      </p>
    </div>
  );
}

function EmptyBox({ text, dark }) {
  return (
    <div
      className={`h-[320px] rounded-2xl border-2 border-dashed flex items-center justify-center text-sm ${dark ? "border-violet-800 bg-[#130d28]/70 text-violet-500" : "border-purple-200 bg-white/60 text-slate-400"}`}
    >
      {text}
    </div>
  );
}

function Stat({ number, text, dark }) {
  return (
    <div>
      <p
        className={`font-semibold text-sm ${dark ? "text-white" : "text-slate-800"}`}
      >
        {number}
      </p>
      <p
        className={`text-[11px] uppercase ${dark ? "text-violet-500" : "text-slate-400"}`}
      >
        {text}
      </p>
    </div>
  );
}
