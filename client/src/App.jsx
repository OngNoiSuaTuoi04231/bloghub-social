import Admin from "./pages/Admin";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CreatePost from "./pages/CreatePost";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Notification from "./pages/Notification";
import PostDetail from "./pages/PostDetail";

import Layout from "./components/Layout";
import { DarkModeProvider } from "./context/DarkModeContext";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import { AnimatePresence } from "framer-motion";

function AdminRoute({ children }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (role !== "admin") {
    return <Navigate to="/home" replace />;
  }

  return children;
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Default */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Không có Header */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* USER pages */}
        <Route element={<Layout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/createpost" element={<CreatePost />} />
          <Route path="/notification" element={<Notification />} />
          <Route path="/post/:id" element={<PostDetail />} />
          <Route path="/profile/:userId" element={<Profile />} />
        </Route>

        {/* ADMIN page riêng */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <Admin />
            </AdminRoute>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <DarkModeProvider>
      <BrowserRouter>
        <AnimatedRoutes />
      </BrowserRouter>
    </DarkModeProvider>
  );
}

export default App;