import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Grid, Mic, FileText } from "lucide-react";
import { useDarkMode } from "../context/DarkModeContext";

export default function Profile({ moments = [], voices = [], posts = [] }) {
  const navigate = useNavigate();
  const { dark } = useDarkMode();

  const fileInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState("moments");
  const [isEditing, setIsEditing] = useState(false);

  const [avatar, setAvatar] = useState(
    localStorage.getItem("avatar") || "https://i.pravatar.cc/150?img=12",
  );

  const username = localStorage.getItem("username") || "User";
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  const [user, setUser] = useState({
    name: username,
    bio: localStorage.getItem("bio") || "",
  });

  const [form, setForm] = useState({
    name: username,
    bio: localStorage.getItem("bio") || "",
  });

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const imageUrl = URL.createObjectURL(file);
    setAvatar(imageUrl);
    localStorage.setItem("avatar", imageUrl);
  };

  const handleSave = () => {
    setUser({
      ...user,
      bio: form.bio,
    });

    localStorage.setItem("bio", form.bio);

    setIsEditing(false);
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-500
      ${dark ? "bg-[#0d0820]" : "bg-[#f7f4ff]"}`}
    >
      <main className="max-w-7xl mx-auto px-4 py-6">
        <section
          className={`border rounded-2xl p-6 shadow-sm transition-colors duration-500
          ${
            dark
              ? "bg-[#130d28] border-violet-900"
              : "bg-white border-purple-100"
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <img
                  src={avatar}
                  alt="profile"
                  className={`w-28 h-28 rounded-full object-cover border-4
                  ${dark ? "border-violet-800" : "border-indigo-100"}`}
                />

                {isEditing && (
                  <>
                    <button
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
                {isEditing ? (
                  <div className="space-y-3">
                    <div
                      className={`w-[280px] px-4 py-2 rounded-lg border cursor-not-allowed
                      ${
                        dark
                          ? "bg-[#1e1535] border-violet-800 text-violet-400"
                          : "bg-gray-100 border-purple-200 text-gray-500"
                      }`}
                    >
                      {user.name}
                    </div>

                    <input
                      value={form.bio}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          bio: e.target.value,
                        })
                      }
                      placeholder="Nhập mô tả cá nhân"
                      className={`w-[280px] px-4 py-2 rounded-lg border outline-none transition
                      ${
                        dark
                          ? "bg-[#1e1535] border-violet-800 text-violet-100 placeholder-violet-700 focus:ring-2 focus:ring-violet-600"
                          : "bg-white border-purple-200 text-slate-700 focus:ring-2 focus:ring-indigo-300"
                      }`}
                    />
                  </div>
                ) : (
                  <>
                    <h2
                      className={`text-lg font-semibold
                      ${dark ? "text-white" : "text-slate-800"}`}
                    >
                      {user.name}
                    </h2>

                    {user.bio ? (
                      <p
                        className={`text-sm mt-1
                        ${dark ? "text-violet-400" : "text-slate-500"}`}
                      >
                        {user.bio}
                      </p>
                    ) : (
                      <p
                        className={`text-sm mt-1 italic
                        ${dark ? "text-violet-600" : "text-slate-400"}`}
                      >
                        Chưa có mô tả cá nhân
                      </p>
                    )}
                  </>
                )}

                <div className="flex gap-10 mt-5">
                  <Stat
                    number={moments.length + voices.length + posts.length}
                    text="Posts"
                    dark={dark}
                  />
                </div>
              </div>
            </div>

            {isEditing ? (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setForm(user);
                    setIsEditing(false);
                  }}
                  className={`px-4 py-2 rounded-lg text-sm transition
                  ${
                    dark
                      ? "bg-[#1e1535] text-violet-300 hover:bg-violet-900/40"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  Cancel
                </button>

                <button
                  onClick={handleSave}
                  className="px-5 py-2 rounded-lg bg-indigo-500 text-white text-sm shadow hover:bg-indigo-600"
                >
                  Save
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-5 py-2 rounded-lg bg-indigo-400 hover:bg-indigo-500 transition text-white text-sm shadow"
              >
                Edit Profile
              </button>
            )}
          </div>
        </section>

        <div className="flex flex-wrap gap-3 mt-7 mb-6">
          <TabButton
            active={activeTab === "moments"}
            onClick={() => setActiveTab("moments")}
            icon={<Grid size={15} />}
            text="Moments"
            dark={dark}
          />

          <TabButton
            active={activeTab === "voices"}
            onClick={() => setActiveTab("voices")}
            icon={<Mic size={15} />}
            text="Voice Notes"
            dark={dark}
          />

          <TabButton
            active={activeTab === "posts"}
            onClick={() => setActiveTab("posts")}
            icon={<FileText size={15} />}
            text="Post"
            dark={dark}
          />
        </div>

        {activeTab === "moments" && (
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {moments.length > 0 ? (
              moments.map((item) => (
                <MomentCard key={item.id} item={item} dark={dark} />
              ))
            ) : (
              <EmptyBox text="No moments yet" dark={dark} />
            )}
          </section>
        )}

        {activeTab === "voices" && (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {voices.length > 0 ? (
              voices.map((voice) => (
                <VoiceCard key={voice.id} voice={voice} dark={dark} />
              ))
            ) : (
              <EmptyBox text="No voice notes yet" dark={dark} />
            )}
          </section>
        )}

        {activeTab === "posts" && (
          <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {posts.length > 0 ? (
              posts.map((post) => (
                <PostCard key={post.id} post={post} dark={dark} />
              ))
            ) : (
              <EmptyBox text="No posts yet" dark={dark} />
            )}
          </section>
        )}
      </main>
    </div>
  );
}

function TabButton({ active, onClick, icon, text, dark }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm transition shadow-sm
        ${
          active
            ? dark
              ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white"
              : "bg-indigo-500 text-white"
            : dark
              ? "bg-[#1e1535] text-violet-400 hover:bg-violet-900/40"
              : "bg-indigo-100 text-indigo-500 hover:bg-indigo-200"
        }`}
    >
      {icon}
      {text}
    </button>
  );
}

function MomentCard({ item, dark }) {
  return (
    <div
      className={`rounded-2xl overflow-hidden border shadow-sm
      ${dark ? "bg-[#130d28] border-violet-900" : "bg-white border-purple-100"}`}
    >
      <img
        src={item.imageUrl}
        alt="moment"
        className="w-full h-[320px] object-cover"
      />

      {item.caption && (
        <p
          className={`p-3 text-sm ${dark ? "text-violet-300" : "text-slate-600"}`}
        >
          {item.caption}
        </p>
      )}
    </div>
  );
}

function VoiceCard({ voice, dark }) {
  return (
    <div
      className={`border rounded-2xl p-4 shadow-sm
      ${dark ? "bg-[#130d28] border-violet-900" : "bg-white border-purple-100"}`}
    >
      <p
        className={`text-sm font-medium ${dark ? "text-violet-300" : "text-indigo-600"}`}
      >
        {voice.title}
      </p>

      <p
        className={`text-xs mt-1 ${dark ? "text-violet-600" : "text-slate-400"}`}
      >
        {voice.createdAt}
      </p>

      <audio controls src={voice.audioUrl} className="w-full mt-4" />
    </div>
  );
}

function PostCard({ post, dark }) {
  return (
    <div
      className={`border rounded-2xl p-5 shadow-sm
      ${dark ? "bg-[#130d28] border-violet-900" : "bg-white border-purple-100"}`}
    >
      <h3 className={`font-semibold ${dark ? "text-white" : "text-slate-800"}`}>
        {post.title}
      </h3>

      <p
        className={`text-sm mt-2 ${dark ? "text-violet-300" : "text-slate-500"}`}
      >
        {post.content}
      </p>

      <p
        className={`text-xs mt-4 ${dark ? "text-violet-600" : "text-slate-400"}`}
      >
        {post.createdAt}
      </p>
    </div>
  );
}

function EmptyBox({ text, dark }) {
  return (
    <div
      className={`h-[320px] rounded-2xl border-2 border-dashed flex items-center justify-center text-sm
      ${
        dark
          ? "border-violet-800 bg-[#130d28]/70 text-violet-500"
          : "border-purple-200 bg-white/60 text-slate-400"
      }`}
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
