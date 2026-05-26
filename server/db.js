const mongoose = require("mongoose");

const uri =
  "mongodb://bloghub_user:12345677@ac-k6sfvmg-shard-00-00.8ftc67m.mongodb.net:27017,ac-k6sfvmg-shard-00-01.8ftc67m.mongodb.net:27017,ac-k6sfvmg-shard-00-02.8ftc67m.mongodb.net:27017/?ssl=true&replicaSet=atlas-l30jvw-shard-0&authSource=admin&appName=Cluster0";

mongoose
  .connect(uri)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("DB Error:", err));

module.exports = mongoose;
