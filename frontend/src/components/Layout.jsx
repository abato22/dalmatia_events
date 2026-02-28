import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

function Layout() {
  const navigate = useNavigate();
  const location = useLocation();

  const [token, setToken] = useState(localStorage.getItem("token"));
  const [hovered, setHovered] = useState(null);

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

  const navItem = (path, label) => {
    const active = isActive(path);
    const hover = hovered === path;

    return (
      <Link
        key={path}
        to={path}
        style={{
          ...navLink,
          background: active
            ? DALMA_BLUE
            : hover
            ? DALMA_YELLOW
            : "transparent",
          color: active ? "white" : hover ? "#0f172a" : "#334155"
        }}
        onMouseEnter={() => setHovered(path)}
        onMouseLeave={() => setHovered(null)}
      >
        {label}
      </Link>
    );
  };

  return (
    <>
      <nav style={navWrapper}>
        <div style={navInner}>

          {/* LOGO */}
          <Link to="/" style={logo}>
            <img src="/logo-icon.jpg" alt="" style={logoImg} />
            <span style={logoDalmatia}>Dalmatia</span>
            <span style={logoEvents}>Events</span>
          </Link>

          {/* NAV */}
          <div style={center}>
            {navItem("/", "Home")}
            {navItem("/explore", "Explore")}
            {navItem("/my-events", "My Events")}
            {navItem("/wishlist", "Wishlist")}
          </div>

          {/* AUTH */}
          <div style={right}>
            <button onClick={handleAuthClick} style={authBtn}>
              {token ? "Logout" : "Log In / Sign Up"}
            </button>
          </div>

        </div>
      </nav>

      <div style={pageWrapper}>
        <main style={content}>
          <Outlet />
        </main>

        <footer style={footer}>
          © 2026 Dalmatia Events. All rights reserved.
        </footer>
      </div>
    </>
  );
}

export default Layout;

/* ================= COLORS ================= */

const DALMA_BLUE = "#2563eb";
const DALMA_YELLOW = "#facc15";

/* ================= CONTAINER ================= */

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

/* ================= LOGO ================= */

const logo = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  textDecoration: "none",
  fontWeight: 800,
  fontSize: 30
};

const logoImg = {
  width: 28,
  height: 28
};

const logoDalmatia = {
  color: DALMA_BLUE,
  fontWeight: 800
};

const logoEvents = {
  color: DALMA_YELLOW,
  fontWeight: 800
};

/* ================= NAV LINKS ================= */

const center = {
  display: "flex",
  justifyContent: "center",
  gap: 10
};

const navLink = {
  padding: "8px 14px",
  borderRadius: 10,
  textDecoration: "none",
  fontSize: 20,
  fontWeight: 600,
  transition: "all .18s ease",
  cursor: "pointer"
};

const right = {
  display: "flex",
  justifyContent: "flex-end"
};

/* ================= AUTH BUTTON ================= */

const authBtn = {
  padding: "10px 18px",
  borderRadius: 10,
  border: "none",
  background: DALMA_BLUE,
  color: "white",
  fontWeight: 600,
  fontSize: 20,
  cursor: "pointer",
};

/* ================= CONTENT ================= */

const content = {
  paddingTop: 96,
  minHeight: "100vh",
  background: "#ffffff"
};

const pageWrapper = {
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column"
};

const footer = {
  marginTop: "auto",
  padding: "24px 20px",
  textAlign: "center",
  fontSize: 14,
  color: "#64748b",
  borderTop: "1px solid #eef2f7",
  background: "#fafcff"
};