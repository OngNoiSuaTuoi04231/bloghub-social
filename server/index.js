// ============================================================
// SERVER CHÍNH — Kết hợp M1 (authRoutes) + M3 (postRoutes + Socket.io)
// Theo đúng style của Leader: require("./db") ở đầu, hardcode port
// ============================================================
require("./db");

const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const authRoutes = require("./routes/authRoutes"); // của M2/Leader
const postRoutes = require("./routes/postRoutes"); // của M3

const app = express();
const server = http.createServer(app);

// ============================================================
// SOCKET.IO — Real-time comment
// ============================================================
const io = new Server(server, {
  cors: { origin: "*", credentials: true },
});

io.on("connection", (socket) => {
  // Client gọi khi mở phần comment của 1 bài viết
  socket.on("join_post_room", (postId) => {
    socket.join(`post_${postId}`);
  });

  // Client gọi khi đóng phần comment
  socket.on("leave_post_room", (postId) => {
    socket.leave(`post_${postId}`);
  });
});

// Inject io vào req để postRoutes có thể emit real-time
app.use((req, res, next) => {
  req.io = io;
  next();
});

// ============================================================
// MIDDLEWARE
// ============================================================
app.use(cors());
app.use(express.json());

// ============================================================
// ROUTES
// ============================================================
app.use("/api/auth", authRoutes); // /api/auth/login, /register, /profile
app.use("/api/posts", postRoutes); // /api/posts, /api/posts/create, ...

app.get("/", (req, res) => {
  res.send("Server running...");
});

// ============================================================
// ERROR HANDLER — bắt lỗi tập trung, không crash server
// ============================================================
app.use((err, req, res, next) => {
  console.log("Lỗi hệ thống:", err.message);
  res
    .status(500)
    .json({ success: false, message: err.message || "Lỗi nội bộ Server" });
});

// ============================================================
// START — cổng 5000 như Leader
// ============================================================
server.listen(5000, () => {
  console.log("Server running port 5000");
});
