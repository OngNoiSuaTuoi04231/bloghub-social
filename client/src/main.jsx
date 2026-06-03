import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import axios from "axios";

axios.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    const isLoginPage = window.location.pathname === "/login";
    const isRegisterPage = window.location.pathname === "/register";
    const token = localStorage.getItem("token");

    // Chỉ redirect khi: có token + server thật sự trả 401 + không đang ở login/register
    if (status === 401 && token && !isLoginPage && !isRegisterPage) {
      localStorage.clear();
      window.location.href = "/login";
    }

    return Promise.reject(err);
  },
);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
