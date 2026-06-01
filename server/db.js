const mongoose = require("mongoose");
require("dotenv").config();

const uri = process.env.MONGO_URI;

mongoose
  .connect(uri)
  .then(() => console.log("MongoDB connected to BlogHub Database"))
  .catch((err) => console.log("DB Error:", err));

module.exports = mongoose;
