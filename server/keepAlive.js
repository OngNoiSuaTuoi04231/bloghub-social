const axios = require("axios");

const PING_URL = "https://bloghub-social-api.onrender.com/api/health";
const INTERVAL = 14 * 60 * 1000; // ping mỗi 14 phút

const keepAlive = () => {
  setInterval(async () => {
    try {
      await axios.get(PING_URL);
      console.log("Keep alive ping sent");
    } catch (err) {
      console.log("Keep alive failed:", err.message);
    }
  }, INTERVAL);
};

module.exports = keepAlive;
