import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

function Layout() {
  const navigate = useNavigate();
  const location = useLocation();

  const [token, setToken] = useState(localStorage.getItem("token"));
  const [hovered, setHovered] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Close menu when route changes
  useEffect(() => {
    setToken(localStorage.getItem("token"));
    setIsMenuOpen(false);
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

  // HELPER FOR THE BUTTON STYLE
  const getAuthButtonStyle = (isMobile = false) => {
    const isAuthHovered = hovered === 'auth-btn';
    const baseWidth = isMobile ? '90%' : 'auto';
    
    return {
      ...(isMobile ? authBtnMobile : authBtn),
      width: baseWidth,
      background: token ? "#ef4444" : DALMA_BLUE, // Red for Logout, Blue for Login
      color: "white",
      transform: isAuthHovered ? "translateY(-4px)" : "translateY(0)",
      boxShadow: isAuthHovered 
        ? "0 12px 20px -5px rgba(0, 0, 0, 0.2)" 
        : "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
      transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)" // Bouncy "pop" effect
    };
  };

  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/explore", label: "Explore" },
    { path: "/my-events", label: "My Events" },
    { path: "/wishlist", label: "Wishlist" },
  ];

  const renderNavItem = (path, label, isMobile = false) => {
    const active = location.pathname === path;
    const hover = hovered === (isMobile ? `mobile-${path}` : path);

    return (
      <Link
        key={path}
        to={path}
        style={{
          ...navLink,
          ...(isMobile ? mobileNavLink : {}),
          background: active ? DALMA_BLUE : hover ? DALMA_YELLOW : "transparent",
          color: active ? "white" : "#0f172a",
          transform: hover ? "translateY(-2px)" : "translateY(0)",
        }}
        onMouseEnter={() => setHovered(isMobile ? `mobile-${path}` : path)}
        onMouseLeave={() => setHovered(null)}
      >
        {label}
      </Link>
    );
  };

  return (
    <>
      <style>{`
        @media (max-width: 868px) {
          .desktop-nav { display: none !important; }
          .hamburger { display: flex !important; }
        }
      `}</style>

      <nav style={navWrapper}>
        <div style={navInner}>
          {/* LOGO */}
          <Link to="/" style={logo}>
            <div style={logoIconBox}><img src="/logo-icon.jpg" alt="" style={logoImg} /></div>
            <div style={logoTextWrapper}>
              <span style={{ color: DALMA_BLUE }}>Dalmatia</span>
              <span style={{ color: DALMA_YELLOW }}>Events</span>
            </div>
          </Link>

          {/* DESKTOP NAV */}
          <div className="desktop-nav" style={center}>
            {navLinks.map(link => renderNavItem(link.path, link.label))}
          </div>

          {/* RIGHT SECTION */}
          <div style={right}>
            <div className="desktop-nav">
              <button 
                onClick={handleAuthClick} 
                style={getAuthButtonStyle()}
                onMouseEnter={() => setHovered('auth-btn')}
                onMouseLeave={() => setHovered(null)}
              >
                {token ? "Logout" : "Log In / Sign Up"}
              </button>
            </div>

            {/* HAMBURGER BUTTON */}
            <button 
              className="hamburger" 
              style={hamburgerBtn} 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <div style={{...bar, transform: isMenuOpen ? 'rotate(45deg) translate(5px, 6px)' : 'none'}} />
              <div style={{...bar, opacity: isMenuOpen ? 0 : 1}} />
              <div style={{...bar, transform: isMenuOpen ? 'rotate(-45deg) translate(5px, -6px)' : 'none'}} />
            </button>
          </div>
        </div>

        {/* MOBILE MENU DROPDOWN */}
        {isMenuOpen && (
          <div style={mobileMenuOverlay}>
            {navLinks.map(link => renderNavItem(link.path, link.label, true))}
            
            {/* Centered Mobile Auth Button */}
            <button 
              onClick={handleAuthClick} 
              style={getAuthButtonStyle(true)}
              onMouseEnter={() => setHovered('auth-btn')}
              onMouseLeave={() => setHovered(null)}
            >
              {token ? "Logout" : "Log In / Sign Up"}
            </button>
          </div>
        )}
      </nav>

      <div style={pageContainer}>
        <main style={content}><Outlet /></main>
        <footer style={footer}>
          <div style={footerContainer}>
            <p style={{ fontWeight: 700, marginBottom: '8px' }}>Dalmatia Events</p>
            <p>© 2026. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </>
  );
}

/* ================= STYLES ================= */

const DALMA_BLUE = "#2563eb";
const DALMA_YELLOW = "#facc15";

const navWrapper = {
  position: "fixed", top: 0, left: 0, width: "100%", height: 80,
  backdropFilter: "blur(12px)", background: "rgba(255, 255, 255, 0.9)",
  borderBottom: "1px solid #e2e8f0", zIndex: 10000
};

const navInner = {
  maxWidth: 1200, margin: "0 auto", padding: "0 24px", height: "100%",
  display: "flex", justifyContent: "space-between", alignItems: "center"
};

const logo = { display: "flex", alignItems: "center", gap: 10, textDecoration: "none" };
const logoIconBox = { width: 32, height: 32, borderRadius: 8, overflow: 'hidden' };
const logoImg = { width: "100%", height: "100%", objectFit: "cover" };
const logoTextWrapper = { fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em" };

const center = { display: "flex", gap: "8px" };

const navLink = {
  padding: "10px 18px", borderRadius: "12px", textDecoration: "none",
  fontSize: "15px", fontWeight: 700, transition: "all 0.2s ease", color: "#0f172a"
};

const authBtn = {
  padding: "12px 28px",
  borderRadius: "14px",
  border: "none",
  fontWeight: 700,
  fontSize: "16px",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center"
};

const authBtnMobile = {
  ...authBtn,
  margin: "10px 0",
  padding: "16px 0", // Vertical padding only for symmetry
  alignSelf: "center" // Ensures it stays centered in the flex column
};

const right = { display: "flex", alignItems: "center", gap: "15px" };

const hamburgerBtn = {
  display: "none", flexDirection: "column", gap: "5px", background: "none",
  border: "none", cursor: "pointer", padding: "8px", zIndex: 10001
};

const bar = { width: "24px", height: "3px", background: "#0f172a", transition: "0.3s", borderRadius: "2px" };

/* --- UPDATED MOBILE STYLES --- */

const mobileMenuOverlay = {
  position: "absolute",
  top: 80,
  left: 0,
  width: "100%",
  background: "#ffffff",
  padding: "24px 0",
  display: "flex",
  flexDirection: "column",
  alignItems: "center", // Critical for horizontal centering
  gap: "8px",
  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
  borderBottom: "2px solid #f1f5f9",
  zIndex: 10002
};

const mobileNavLink = {
  width: '90%',           // Gives it space so it doesn't touch screen edges
  textAlign: 'center',
  fontSize: '18px',
  padding: '14px 0',      // Balanced padding for a symmetrical "pill"
  borderRadius: '16px',   // Explicitly set for mobile to ensure it's rounded
  display: 'block',       // Ensures the background color fills the space correctly
  boxSizing: 'border-box' // Prevents padding from breaking the width
};

const pageContainer = { display: "flex", flexDirection: "column", minHeight: "100vh" };
const content = { flex: 1, paddingTop: 80 };
const footer = { padding: "40px 24px", background: "#f8fafc", borderTop: "1px solid #e2e8f0", textAlign: "center" };
const footerContainer = { maxWidth: 1200, margin: "0 auto", color: "#64748b", fontSize: "14px" };

export default Layout;