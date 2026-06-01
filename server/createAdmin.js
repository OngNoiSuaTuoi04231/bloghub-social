const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

const MONGO_URI =
  "mongodb://bloghub_user:12345677@ac-k6sfvmg-shard-00-00.8ftc67m.mongodb.net:27017,ac-k6sfvmg-shard-00-01.8ftc67m.mongodb.net:27017,ac-k6sfvmg-shard-00-02.8ftc67m.mongodb.net:27017/bloghub?ssl=true&replicaSet=atlas-l30jvw-shard-0&authSource=admin&appName=Cluster0";
// ↑ Thay <db_password> bằng mật khẩu thật của bloghub_user

const ADMIN_EMAIL = "admin@bloghub.com";
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "Admin@2025!"; // ← đổi sau khi đăng nhập

async function createAdmin() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Đã kết nối MongoDB");

    await User.deleteOne({ email: ADMIN_EMAIL });
    console.log("🗑️  Đã xóa admin cũ (nếu có)");

    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);

    const admin = await User.create({
      username: ADMIN_USERNAME,
      email: ADMIN_EMAIL,
      password: hashedPassword,
      role: "admin",
      bio: "",
      avatar: "",
    });

    console.log("✅ Tạo admin thành công:", admin.email);
    console.log("   Password:", ADMIN_PASSWORD);
    console.log("\n⚠️  Đổi mật khẩu ngay sau khi đăng nhập!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Lỗi:", err.message);
    process.exit(1);
  }
}

createAdmin();
