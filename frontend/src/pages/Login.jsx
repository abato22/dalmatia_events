import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [btnHover, setBtnHover] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!form.username || !form.password) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        "http://localhost:3000/auth/login",
        form
      );

      localStorage.setItem("token", res.data.token);
      toast.success("Welcome back 👋");
      navigate("/explore");

    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={wrapper}>
      <form onSubmit={handleLogin} style={card}>

        <div style={header}>
          <h1 style={title}>Welcome back</h1>
          <p style={subtitle}>Login to continue exploring events.</p>
        </div>

        <div style={formGroup}>
          <label style={label}>Username</label>
          <input
            name="username"
            value={form.username}
            onChange={handleChange}
            style={input}
          />
        </div>

        <div style={formGroup}>
          <label style={label}>Password</label>
          <div style={{ position: "relative" }}>
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={handleChange}
              style={input}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={eyeBtn}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <button
          disabled={loading}
          style={{
            ...primaryBtn,
            background: btnHover ? DALMA_YELLOW : DALMA_BLUE,
            color: btnHover ? "#0f172a" : "white"
          }}
          onMouseEnter={() => setBtnHover(true)}
          onMouseLeave={() => setBtnHover(false)}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <button
          type="button"
          style={secondaryBtn}
          onClick={() => navigate("/")}
        >
          ← Back to Home
        </button>

        <p style={registerText}>
          No account? <Link to="/register" style={registerLink}>Register</Link>
        </p>

      </form>
    </div>
  );
}

export default Login;

/* ================= COLORS ================= */

const DALMA_BLUE = "#2563eb";
const DALMA_YELLOW = "#facc15";

/* ================= STYLES ================= */

const wrapper = {
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "linear-gradient(135deg,#eff6ff,#fefce8)"
};

const card = {
  width: 380,
  padding: 32,
  borderRadius: 24,
  background: "white",
  boxShadow: "0 30px 80px rgba(0,0,0,0.08)",
  border: "1px solid #eef2f7",
  display: "flex",
  flexDirection: "column",
  gap: 18
};

const header = {
  marginBottom: 10
};

const title = {
  fontSize: 28,
  fontWeight: 800
};

const subtitle = {
  color: "#64748b",
  fontSize: 14
};

const formGroup = {
  display: "flex",
  flexDirection: "column",
  gap: 6
};

const label = {
  fontSize: 13,
  fontWeight: 600,
  color: "#334155"
};

const input = {
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid #e2e8f0",
  fontSize: 14,
  width: "100%"
};

const primaryBtn = {
  padding: "12px",
  borderRadius: 14,
  border: "none",
  fontWeight: 700,
  cursor: "pointer",
  transition: "all .18s ease"
};

const secondaryBtn = {
  padding: "10px",
  borderRadius: 12,
  border: "1px solid #e2e8f0",
  background: "white",
  fontWeight: 600,
  cursor: "pointer"
};

const registerText = {
  textAlign: "center",
  fontSize: 14,
  color: "#475569"
};

const registerLink = {
  color: DALMA_BLUE,
  fontWeight: 600,
  textDecoration: "none"
};

const eyeBtn = {
  position: "absolute",
  right: 10,
  top: 10,
  border: "none",
  background: "transparent",
  cursor: "pointer",
  fontSize: 12,
  color: "#64748b"
};