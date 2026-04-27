import { useState } from "react";
import axios from "axios";

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!username || !email || !password) {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/register",
        {
          username,
          email,
          password
        }
      );

      alert(res.data.message);

      setUsername("");
      setEmail("");
      setPassword("");

    } catch (error) {
      alert(error.response?.data?.message || "Đăng ký thất bại");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.box}>
        <h1 style={styles.title}>BlogHub</h1>
        <p style={styles.subTitle}>Tạo tài khoản mới</p>

        <form onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="Tên người dùng..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={styles.input}
          />

          <input
            type="email"
            placeholder="Nhập email..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
          />

          <input
            type="password"
            placeholder="Nhập mật khẩu..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
          />

          <button type="submit" style={styles.button}>
            Đăng ký
          </button>
        </form>

        <p style={styles.text}>
          Đã có tài khoản? <span style={styles.link}>Đăng nhập</span>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    background: "#000",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  box: {
    width: "380px",
    background: "#111",
    padding: "35px",
    borderRadius: "16px",
    boxShadow: "0 0 15px rgba(255,255,255,0.1)",
  },

  title: {
    color: "#fff",
    textAlign: "center",
    marginBottom: "10px",
  },

  subTitle: {
    color: "#aaa",
    textAlign: "center",
    marginBottom: "25px",
  },

  input: {
    width: "100%",
    padding: "12px",
    marginBottom: "15px",
    borderRadius: "10px",
    border: "none",
    outline: "none",
    fontSize: "15px",
  },

  button: {
    width: "100%",
    padding: "12px",
    background: "#fff",
    color: "#000",
    border: "none",
    borderRadius: "10px",
    fontWeight: "bold",
    cursor: "pointer",
  },

  text: {
    color: "#aaa",
    textAlign: "center",
    marginTop: "20px",
  },

  link: {
    color: "#fff",
    cursor: "pointer",
    fontWeight: "bold",
  },
};

export default Register;