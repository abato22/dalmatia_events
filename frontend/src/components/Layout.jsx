import { Link, Outlet, useNavigate } from "react-router-dom";

function Layout() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      
      {/* Sidebar */}
      <div
        style={{
          width: "250px",
          background: "#1e293b",
          color: "white",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between"
        }}
      >
        <div>
          <h2>Dalmatia</h2>

          <nav
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px"
            }}
          >
            <Link to="/" style={{ color: "white" }}>
              Home
            </Link>

            <Link to="/explore" style={{ color: "white" }}>
              Explore
            </Link>

            <Link to="/my-events" style={{ color: "white" }}>
              My Events
            </Link>

            <Link to="/wishlist" style={{ color: "white" }}>
              Wishlist
            </Link>
          </nav>
        </div>

        {/* Bottom Button */}
        <div>
          {token ? (
            <button onClick={handleLogout}>
              Logout
            </button>
          ) : (
            <button onClick={() => navigate("/login")}>
              Login
            </button>
          )}
        </div>
      </div>

      {/* Page Content */}
      <div style={{ flex: 1, padding: "20px" }}>
        <Outlet />
      </div>
    </div>
  );
}

export default Layout;
