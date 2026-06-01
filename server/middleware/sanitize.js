// middleware/sanitize.js
// Làm sạch toàn bộ req.body trước khi xử lý
// Cài thư viện: npm install xss

const xss = require("xss");

// Cấu hình XSS: không cho bất kỳ tag HTML nào
const xssOptions = {
  whiteList: {}, // không cho phép tag nào
  stripIgnoreTag: true, // xóa tag không có trong whitelist
  stripIgnoreTagBody: ["script", "style"], // xóa cả nội dung bên trong
};

/**
 * Đệ quy làm sạch object/string
 */
const sanitizeValue = (value) => {
  if (typeof value === "string") {
    return xss(value.trim(), xssOptions);
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }
  if (value !== null && typeof value === "object") {
    return sanitizeObject(value);
  }
  return value;
};

const sanitizeObject = (obj) => {
  const result = {};
  for (const key of Object.keys(obj)) {
    result[key] = sanitizeValue(obj[key]);
  }
  return result;
};

/**
 * Middleware: sanitize toàn bộ req.body
 * Dùng cho tất cả route POST/PUT/PATCH
 */
const sanitizeBody = (req, res, next) => {
  if (req.body && typeof req.body === "object") {
    req.body = sanitizeObject(req.body);
  }
  next();
};

module.exports = { sanitizeBody, sanitizeValue };
