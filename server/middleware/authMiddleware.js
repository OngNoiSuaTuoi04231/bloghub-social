const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    // Lấy token từ header
    const token = req.headers.authorization;

    // Nếu không có token
    if (!token) {
      return res.status(401).json({
        message: "Bạn chưa đăng nhập"
      });
    }

    // Kiểm tra token hợp lệ
    const decoded = jwt.verify(token, "bloghub_secret");

    // Lưu thông tin user vào req
    req.user = decoded;

    // Cho đi tiếp route
    next();

  } catch (error) {
    return res.status(401).json({
      message: "Token không hợp lệ"
    });
  }
};

module.exports = authMiddleware;