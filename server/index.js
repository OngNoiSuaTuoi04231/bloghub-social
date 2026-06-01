require("dotenv").config();
require("./db");

const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const authRoutes = require("./routes/authRoutes");
const postRoutes = require("./routes/postRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const adminRoutes = require("./routes/adminRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();
const server = http.createServer(app);

// Cấu hình CORS mở để deploy không bị lỗi
const corsOptions = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
};

const io = new Server(server, {
  cors: corsOptions,
});

// LẮNG NGHE SỰ KIỆN SOCKET.IO (RẤT QUAN TRỌNG CHO REALTIME)
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Cho phép user tham gia phòng riêng dựa trên userId để nhận thông báo
  socket.on("join_user_room", (userId) => {
    if (!userId) return;

    socket.join(userId);
    console.log("User joined room:", userId);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Gắn io vào req để các file Route (như postRoutes, userRoutes) có thể dùng req.io.emit
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use(cors(corsOptions));
app.use(express.json());

// ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);

// Route kiểm tra server
app.get("/", (req, res) => {
  res.send("BlogHub server is running");
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
