const adminAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Bạn chưa đăng nhập",
    });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Không có quyền truy cập",
    });
  }

  next();
};

module.exports = adminAuth;
