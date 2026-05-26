const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    let token = req.headers.authorization;
    if (!token) return res.status(401).json({ message: "Bạn chưa đăng nhập" });
    if (token.startsWith("Bearer ")) token = token.split(" ")[1];
    req.user = jwt.verify(token, "bloghub_secret");
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token không hợp lệ" });
  }
};
module.exports = authMiddleware;