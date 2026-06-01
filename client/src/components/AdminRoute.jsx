// client/src/components/AdminRoute.jsx
// Bảo vệ trang /admin ở phía frontend
// Sao chép file này vào: client/src/components/AdminRoute.jsx

import { Navigate } from "react-router-dom";

/**
 * AdminRoute: chỉ cho vào nếu đã đăng nhập VÀ có role = 'admin'
 *
 * Cách dùng trong App.jsx:
 *   import AdminRoute from './components/AdminRoute';
 *
 *   <Route path="/admin" element={
 *     <AdminRoute>
 *       <Admin />
 *     </AdminRoute>
 *   } />
 */
const AdminRoute = ({ children }) => {
  // Lấy token và role từ localStorage (đổi key cho đúng với code bạn đang dùng)
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  // Chưa đăng nhập → về trang login
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Đã đăng nhập nhưng không phải admin → về trang chủ
  if (user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  // OK → cho vào
  return children;
};

export default AdminRoute;
