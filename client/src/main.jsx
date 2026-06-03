import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import axios from "axios";

axios.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    const token = localStorage.getItem("token");
    const path = window.location.pathname;

    if (status === 401 && token && path !== "/login" && path !== "/register") {
      localStorage.clear();
      window.location.href = "/login";
    }

    return Promise.reject(err);
  },
);

createRoot(document.getElementById("root")).render(<App />);
