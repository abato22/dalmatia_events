import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

function Layout() {
  const navigate = useNavigate();
  const location = useLocation();

  const [token, setToken] = useState(localStorage.getItem("token"));

  useEffect(() => {
    setToken(localStorage.getItem("token"));
  }, [location]);

  const handleAuthClick = () => {
    if (token) {
      localStorage.removeItem("token");
      setToken(null);
      navigate("/");
    } else {
      navigate("/login");
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav style={navWrapper}>
        <div style={navInner}>

          <Link to="/" style={logo}>
            Dalmatia Events
          </Link>

          <div style={center}>
            <Link to="/" style={navLink(isActive("/"))}>Home</Link>
            <Link to="/explore" style={navLink(isActive("/explore"))}>Explore</Link>
            <Link to="/my-events" style={navLink(isActive("/my-events"))}>My Events</Link>
            <Link to="/wishlist" style={navLink(isActive("/wishlist"))}>Wishlist</Link>
          </div>

          <div style={right}>
            <button onClick={handleAuthClick} style={authBtn(token)}>
              {token ? "Logout" : "Log In / Sign Up"}
            </button>
          </div>

        </div>
      </nav>

      <main style={content}>
        <Outlet />
      </main>
    </>
  );
}

export default Layout;

/* ================= DESIGN TOKENS ================= */

const container = {
  maxWidth: 1200,
  margin: "0 auto",
  padding: "0 20px"
};

/* ================= NAVBAR ================= */

const navWrapper = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: 72,
  backdropFilter: "blur(10px)",
  background: "rgba(255,255,255,0.75)",
  borderBottom: "1px solid #eef2f7",
  zIndex: 10000
};

const navInner = {
  ...container,
  height: "100%",
  display: "grid",
  gridTemplateColumns: "auto 1fr auto",
  alignItems: "center"
};

const logo = {
  fontWeight: 800,
  fontSize: 18,
  textDecoration: "none",
  color: "#0f172a",
  letterSpacing: -0.2
};

const center = {
  display: "flex",
  justifyContent: "center",
  gap: 10
};

const navLink = (active) => ({
  padding: "8px 14px",
  borderRadius: 10,
  textDecoration: "none",
  fontSize: 14,
  fontWeight: 600,
  color: active ? "#1e293b" : "#475569",
  background: active ? "#f1f5f9" : "transparent",
  transition: "all .18s ease"
});

const right = {
  display: "flex",
  justifyContent: "flex-end"
};

/* ================= AUTH BUTTON ================= */

const authBtn = (token) => ({
  padding: "10px 18px",
  borderRadius: 12,
  border: token ? "1px solid #e2e8f0" : "none",
  background: token
    ? "white"
    : "linear-gradient(135deg,#2563eb,#4f46e5)",
  color: token ? "#0f172a" : "white",
  fontWeight: 700,
  fontSize: 14,
  cursor: "pointer",
  boxShadow: token
    ? "0 6px 18px rgba(0,0,0,0.06)"
    : "0 12px 26px rgba(37,99,235,0.35)",
  transition: "all .18s ease"
});

/* ================= CONTENT ================= */

const content = {
  paddingTop: 96,
  minHeight: "100vh",
  background: "#ffffff"
};