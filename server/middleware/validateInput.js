// middleware/validateInput.js
// Validate độ dài, định dạng input của user

const validateRegister = (req, res, next) => {
  const { username, email, password } = req.body;

  if (!username || username.trim().length < 3) {
    return res.status(400).json({ message: "Username tối thiểu 3 ký tự" });
  }
  if (username.length > 50) {
    return res.status(400).json({ message: "Username tối đa 50 ký tự" });
  }
  // Chặn username có ký tự đặc biệt HTML
  if (/<|>|&|"/.test(username)) {
    return res.status(400).json({ message: "Username không hợp lệ" });
  }

  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ message: "Email không hợp lệ" });
  }

  if (!password || password.length < 6) {
    return res.status(400).json({ message: "Mật khẩu tối thiểu 6 ký tự" });
  }
  if (password.length > 100) {
    return res.status(400).json({ message: "Mật khẩu quá dài" });
  }

  next();
};

const validatePost = (req, res, next) => {
  const { title, content } = req.body;

  if (!title || title.trim().length === 0) {
    return res.status(400).json({ message: "Tiêu đề không được trống" });
  }
  if (title.length > 200) {
    return res.status(400).json({ message: "Tiêu đề tối đa 200 ký tự" });
  }

  if (!content || content.trim().length === 0) {
    return res.status(400).json({ message: "Nội dung không được trống" });
  }
  if (content.length > 10000) {
    return res.status(400).json({ message: "Nội dung tối đa 10.000 ký tự" });
  }

  next();
};

const validateComment = (req, res, next) => {
  const { content } = req.body;

  if (!content || content.trim().length === 0) {
    return res.status(400).json({ message: "Bình luận không được trống" });
  }
  if (content.length > 1000) {
    return res.status(400).json({ message: "Bình luận tối đa 1.000 ký tự" });
  }

  next();
};

const validateProfile = (req, res, next) => {
  const { bio } = req.body;

  if (bio && bio.length > 500) {
    return res.status(400).json({ message: "Bio tối đa 500 ký tự" });
  }

  next();
};

module.exports = {
  validateRegister,
  validatePost,
  validateComment,
  validateProfile,
};
