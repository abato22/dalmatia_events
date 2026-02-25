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
        <h2>Login</h2>

        <input
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          style={input}
        />

        <div style={{ position: "relative" }}>
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Password"
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

        <button disabled={loading} style={button}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <button
          type="button"
          style={secondaryBtn}
          onClick={() => navigate("/")}
        >
          ← Back to Home
        </button>

        <p>
          No account? <Link to="/register">Register</Link>
        </p>
      </form>
    </div>
  );
}

export default Login;

/* styles */

const wrapper = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "80vh"
};

const card = {
  width: 320,
  padding: 24,
  border: "1px solid #ddd",
  borderRadius: 12,
  display: "flex",
  flexDirection: "column",
  gap: 10,
  background: "white"
};

const input = {
  padding: 10,
  borderRadius: 8,
  border: "1px solid #ccc",
  width: "100%"
};

const button = {
  padding: 10,
  borderRadius: 8,
  border: "none",
  background: "#2563eb",
  color: "white",
  cursor: "pointer"
};

const secondaryBtn = {
  padding: 10,
  borderRadius: 8,
  border: "1px solid #ccc",
  background: "white",
  cursor: "pointer"
};

const eyeBtn = {
  position: "absolute",
  right: 8,
  top: 6,
  border: "none",
  background: "transparent",
  cursor: "pointer"
};