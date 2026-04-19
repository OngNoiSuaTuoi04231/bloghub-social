const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// API test
app.get("/", (req, res) => {
  res.send("Backend BlogHub running...");
});

app.listen(5000, () => {
  console.log("Server running port 5000");
});