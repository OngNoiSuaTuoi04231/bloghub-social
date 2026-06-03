const jwt = require("jsonwebtoken");

// FIX: dùng JWT_SECRET từ env giống auth.js, không hardcode "bloghub_secret"
// Trước đây hardcode khác với JWT_SECRET trên Render → token verify thất bại → 401
const JWT_SECRET = process.env.JWT_SECRET || "bloghub_secret";

const authMiddleware = (req, res, next) => {
  try {
    let token = req.headers.authorization;
    if (!token) return res.status(401).json({ message: "Bạn chưa đăng nhập" });
    if (token.startsWith("Bearer ")) token = token.split(" ")[1];
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token không hợp lệ" });
  }
};

module.exports = authMiddleware;
