const mongoose = require("mongoose");
const dns = require("dns");

// ============================================================
// FIX NODE v17+ / v24: Buộc dùng IPv4 cho DNS lookup
// Node 17 trở lên đổi thứ tự DNS: ưu tiên IPv6 trước IPv4
// MongoDB Atlas SRV chỉ hoạt động với IPv4
// dns.setDefaultResultOrder("ipv4first") sửa đúng vấn đề này
// ============================================================
dns.setDefaultResultOrder("ipv4first");

const uri =
  "mongodb://nguyenthanhtrung21122005_db_user:123456788@clusterttrunghinni-shard-00-00.bpilvrv.mongodb.net:27017,clusterttrunghinni-shard-00-01.bpilvrv.mongodb.net:27017,...?ssl=true&replicaSet=...&authSource=adminmongodb+srv://nguyenthanhtrung21122005_db_user:123456788@clusterttrunghinni.bpilvrv.mongodb.net/?appName=Clusterttrunghinni";

mongoose
  .connect(uri, {
    family: 4, // Buộc socket dùng IPv4
    serverSelectionTimeoutMS: 8000, // Timeout 8 giây
    connectTimeoutMS: 10000,
  })
  .then(() => console.log("✅ MongoDB connected — Clusterttrunghinni"))
  .catch((err) => console.log("❌ DB Error:", err.message));

module.exports = mongoose;
