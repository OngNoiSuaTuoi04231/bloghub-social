require("./db");

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");

const authRoutes = require("./routes/authRoutes");
const User = require("./models/User");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);


// AUTO CREATE ADMIN
async function createAdmin() {
  try {
    const adminExist = await User.findOne({
      email: "admin@gmail.com",
    });

    if (!adminExist) {

      const hashedPassword = await bcrypt.hash("admin123", 10);

      await User.create({
        username: "admin",
        email: "admin@gmail.com",
        password: hashedPassword,
        role: "admin",
      });

      console.log("Admin account created");
    } else {
      console.log("Admin already exists");
    }

  } catch (error) {
    console.log("Create admin error:", error);
  }
}

createAdmin();


app.get("/", (req, res) => {
  res.send("Server running...");
});

app.listen(5000, () => {
  console.log("Server running port 5000");
});