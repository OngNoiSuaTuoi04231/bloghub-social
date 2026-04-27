const mongoose = require("mongoose");

const uri = "mongodb+srv://bloghub_user:12345677@cluster0.8ftc67m.mongodb.net/bloghub?retryWrites=true&w=majority";

mongoose.connect(uri)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log("DB Error:", err));

module.exports = mongoose;