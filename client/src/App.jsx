import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import CreatePost from "./pages/CreatePost";
// import HomeFeed from './pages/HomeFeed'; // Bạn tự tạo file này gọi API GET /api/posts nhé

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <div style={{ background: "#1e1b3a", padding: 15, textAlign: "center" }}>
        <Link to="/" style={{ color: "white", marginRight: 20 }}>
          Home
        </Link>
        <Link to="/create" style={{ color: "white" }}>
          Create Post
        </Link>
      </div>
      <Routes>
        <Route path="/create" element={<CreatePost />} />
        {/* <Route path="/" element={<HomeFeed />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
