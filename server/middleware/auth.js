const jwt = require("jsonwebtoken");

// ============================================================
// JWT SECRET — Dùng cùng chuỗi với authRoutes.js của Leader
// ============================================================
const JWT_SECRET = "bloghub_secret";

const verifyToken = (req, res, next) => {
  try {
    // Lấy token: header gửi dạng "Bearer eyJhb..."
    // split(' ')[1] cắt bỏ phần "Bearer " lấy token thực sự
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Bạn chưa đăng nhập",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token không hợp lệ",
      });
    }

    // Giải mã token — lấy ra { id: userId }
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // req.user.id = ObjectId của user
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Token hết hạn hoặc không hợp lệ",
    });
  }
};

module.exports = verifyToken;
