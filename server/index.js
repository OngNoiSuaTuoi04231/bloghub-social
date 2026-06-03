require("dotenv").config();
require("./db");

const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const axios = require("axios");

const authRoutes = require("./routes/authRoutes");
const postRoutes = require("./routes/postRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const adminRoutes = require("./routes/adminRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();
const server = http.createServer(app);

const corsOptions = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
};

const io = new Server(server, {
  cors: corsOptions,
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join_user_room", (userId) => {
    if (!userId) return;
    socket.join(userId);
    console.log("User joined room:", userId);
  });

  socket.on("join_post_room", (postId) => {
    if (!postId) return;
    socket.join(`post_${postId}`);
    console.log("User joined post room:", `post_${postId}`);
  });

  socket.on("leave_post_room", (postId) => {
    if (!postId) return;
    socket.leave(`post_${postId}`);
    console.log("User left post room:", `post_${postId}`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use(cors(corsOptions));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);

app.get("/", (req, res) => {
  res.send("BlogHub server is running");
});

// FIX 1: Health check route để ping giữ server tỉnh
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// FIX 2: Tự ping mỗi 14 phút để Render không spin down
const PING_URL = "https://bloghub-social-api.onrender.com/api/health";
setInterval(
  async () => {
    try {
      await axios.get(PING_URL);
      console.log("Keep alive ping OK");
    } catch (err) {
      console.log("Keep alive failed:", err.message);
    }
  },
  14 * 60 * 1000,
);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
