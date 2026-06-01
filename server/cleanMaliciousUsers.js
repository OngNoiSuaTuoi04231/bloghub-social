const mongoose = require("mongoose");
const User = require("./models/User");

const MONGO_URI =
  "mongodb://bloghub_user:12345677@ac-k6sfvmg-shard-00-00.8ftc67m.mongodb.net:27017,ac-k6sfvmg-shard-00-01.8ftc67m.mongodb.net:27017,ac-k6sfvmg-shard-00-02.8ftc67m.mongodb.net:27017/?ssl=true&replicaSet=atlas-l30jvw-shard-0&authSource=admin&appName=Cluster0";
// ↑ Thay <db_password> bằng mật khẩu thật của bloghub_user

const MALICIOUS_PATTERNS = [
  /<script/i,
  /javascript:/i,
  /document\.addEventListener/i,
  /document\.cookie/i,
  /eval\(/i,
  /<!DOCTYP/i,
  /window\.location/i,
  /onload=/i,
];

const isMalicious = (text) => {
  if (!text) return false;
  return MALICIOUS_PATTERNS.some((p) => p.test(text));
};

async function cleanMaliciousUsers() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Đã kết nối MongoDB");

    const users = await User.find({ role: { $ne: "admin" } });
    let deletedCount = 0;

    for (const user of users) {
      if (
        isMalicious(user.username) ||
        isMalicious(user.bio) ||
        isMalicious(user.email)
      ) {
        console.log(`🗑️  Xóa: ${user.email} | username: ${user.username}`);
        await User.deleteOne({ _id: user._id });
        deletedCount++;
      }
    }

    console.log(`\n✅ Hoàn tất. Đã xóa ${deletedCount} tài khoản độc hại.`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Lỗi:", err.message);
    process.exit(1);
  }
}

cleanMaliciousUsers();
