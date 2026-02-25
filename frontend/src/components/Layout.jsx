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
      <nav style={nav}>
        <div style={left}>
          <Link to="/" style={logo}>
            Dalmatia Events
          </Link>
        </div>

        <div style={center}>
          <Link to="/" style={navLink(isActive("/"))}>Home</Link>
          <Link to="/explore" style={navLink(isActive("/explore"))}>Explore</Link>
          <Link to="/my-events" style={navLink(isActive("/my-events"))}>My Events</Link>
          <Link to="/wishlist" style={navLink(isActive("/wishlist"))}>Wishlist</Link>
        </div>

        <div style={right}>
          <button onClick={handleAuthClick} style={authBtn}>
            {token ? "Logout" : "Log In / Sign Up"}
          </button>
        </div>
      </nav>

      <div style={content}>
        <Outlet />
      </div>
    </>
  );
}

export default Layout;


/* ================= STYLES ================= */

const nav = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: 64,
  background: "#1e293b",
  display: "grid",
  gridTemplateColumns: "auto 1fr auto", // ⭐ FIX overflow
  alignItems: "center",
  padding: "0 30px",
  boxSizing: "border-box",
  zIndex: 10000 // ⭐ ensures navbar above leaflet controls
};

const left = {
  display: "flex",
  alignItems: "center"
};

const center = {
  display: "flex",
  justifyContent: "center",
  gap: 40
};

const right = {
  display: "flex",
  justifyContent: "flex-end",
  minWidth: 160 // ⭐ prevents button cut
};

const logo = {
  color: "white",
  textDecoration: "none",
  fontWeight: "bold",
  fontSize: 18
};

const navLink = (active) => ({
  color: active ? "#38bdf8" : "white",
  textDecoration: "none",
  fontSize: 15,
  borderBottom: active ? "2px solid #38bdf8" : "2px solid transparent",
  paddingBottom: 4,
  transition: "0.2s"
});

const authBtn = {
  padding: "8px 16px", // ⭐ FIX width
  borderRadius: 8,
  border: "none",
  background: "#2563eb",
  color: "white",
  cursor: "pointer",
  whiteSpace: "nowrap" // ⭐ prevents text cut
};

const content = {
  marginTop: 80,
  padding: "20px 40px"
};