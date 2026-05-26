import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { DarkModeProvider } from "./context/DarkModeContext";

// Import các trang của bạn
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import CreatePost from "./pages/CreatePost";
// import Layout from "./components/Layout"; // (Mở comment dòng này nếu bạn có file Layout)

function App() {
  return (
    <DarkModeProvider>
      <BrowserRouter>
        <Toaster position="top-right" />

        {/* Menu điều hướng tạm thời để test */}
        <div
          style={{ background: "#1e1b3a", padding: 15, textAlign: "center" }}
        >
          <Link to="/" style={{ color: "white", marginRight: 20 }}>
            Home
          </Link>
          <Link to="/create" style={{ color: "white", marginRight: 20 }}>
            Create Post
          </Link>
          <Link to="/login" style={{ color: "white" }}>
            Login
          </Link>
        </div>

        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Tạm thời để Home là trang chủ thay cho Layout để bạn dễ test */}
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<CreatePost />} />
        </Routes>
      </BrowserRouter>
    </DarkModeProvider>
  );
}

export default App;
