import { Navigate } from "react-router-dom";

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role"); // Login.jsx lưu "role" riêng

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (role !== "admin") {
    return <Navigate to="/home" replace />;
  }

  return children;
};

export default AdminRoute;
