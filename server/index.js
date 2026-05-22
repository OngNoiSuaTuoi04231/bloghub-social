require("./db");

const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

// Routes
const authRoutes = require("./routes/authRoutes");
const postRoutes = require("./routes/postRoutes");

const app = express();
const server = http.createServer(app);

// ======================
// SOCKET.IO CONFIG
// ======================

const io = new Server(server, {
  cors: {
    origin: "*",
    credentials: true,
  },
});

// Socket connection
io.on("connection", (socket) => {
  console.log("🔌 User connected");

  // Join room theo bài viết
  socket.on("join_post_room", (postId) => {
    socket.join(`post_${postId}`);
    console.log(`📌 Joined room: post_${postId}`);
  });

  // Leave room
  socket.on("leave_post_room", (postId) => {
    socket.leave(`post_${postId}`);
    console.log(`❌ Left room: post_${postId}`);
  });

  // Disconnect
  socket.on("disconnect", () => {
    console.log("⚠️ User disconnected");
  });
});

// Gắn io vào request
app.use((req, res, next) => {
  req.io = io;
  next();
});

// ======================
// MIDDLEWARE
// ======================

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

app.use(express.json());

// ======================
// ROUTES
// ======================

// Auth API
app.use("/api/auth", authRoutes);

// Post API
app.use("/api/posts", postRoutes);

// Home route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "🚀 BlogHub Server running...",
  });
});

// ======================
// ERROR HANDLER
// ======================

app.use((err, req, res, next) => {
  console.error("💥 Server Error:", err.message);

  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// ======================
// SERVER START
// ======================

const PORT = 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running port ${PORT}`);
});
