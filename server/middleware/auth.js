const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "bloghub_secret";

const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "You are not logged in",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = decoded;
    next();
  } catch (error) {
    console.log("Auth error:", error.message);

    return res.status(401).json({
      success: false,
      message: "Token expired or invalid",
    });
  }
};

module.exports = verifyToken;
