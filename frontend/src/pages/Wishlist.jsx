import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

function Wishlist() {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredId, setHoveredId] = useState(null); // Track which card is hovered

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!token) return;

      try {
        const res = await axios.get(
          "http://localhost:3000/wishlist",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setEvents(res.data);
      } catch (err) {
        toast.error("Failed to load wishlist");
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [token]);

  if (!token) return (
    <div style={messageContainer}>
      <div style={lockIcon}>🔒</div>
      <p style={messageText}>You must be logged in to view your wishlist.</p>
      <button style={primaryBtn} onClick={() => navigate("/login")}>Go to Login</button>
    </div>
  );

  if (loading) return (
    <div style={loadingWrapper}>
      <div style={spinner}></div>
      <p>Loading your saved events...</p>
    </div>
  );

  const removeFromWishlist = async (e, eventId) => {
    e.stopPropagation(); // Prevents navigating to details when clicking remove
    try {
      await axios.delete(
        `http://localhost:3000/wishlist/${eventId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setEvents(prev => prev.filter(e => e.id !== eventId));
      toast.success("Removed from wishlist");
    } catch {
      toast.error("Failed to remove");
    }
  };

  function formatDate(date) {
    if (!date) return "";
    return new Date(date).toLocaleDateString("hr-HR", {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  return (
    <div style={page}>
      <div style={container}>

        {/* HEADER */}
        <div style={pageHeader}>
          <div style={titleGroup}>
            <h1 style={pageTitle}>My Wishlist</h1>
            <div style={countBadge}>{events.length} {events.length === 1 ? 'Event' : 'Events'}</div>
          </div>
          <p style={pageSubtitle}>Everything you've saved for your next adventure in Dalmatia.</p>
        </div>

        {/* CONTENT */}
        {events.length === 0 ? (
          <div style={emptyState}>
            <div style={emptyIcon}>✨</div>
            <h3 style={emptyTitle}>Your wishlist is empty</h3>
            <p style={emptyText}>
              Explore events and tap the heart icon to save them here.
            </p>
            <button 
              style={exploreBtn} 
              onClick={() => navigate("/explore")}
            >
              Start Exploring
            </button>
          </div>
        ) : (
          <div style={grid}>
            {events.map(event => (
              <div 
                key={event.id} 
                style={{
                    ...card,
                    transform: hoveredId === event.id ? "translateY(-8px)" : "translateY(0)",
                    boxShadow: hoveredId === event.id ? "0 20px 25px -5px rgba(0, 0, 0, 0.1)" : "0 4px 6px -1px rgba(0, 0, 0, 0.05)"
                }}
                onMouseEnter={() => setHoveredId(event.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => navigate(`/events/${event.id}`)}
              >
                {/* REMOVE BUTTON */}
                <button
                  style={removeBtn}
                  onClick={(e) => removeFromWishlist(e, event.id)}
                  title="Remove from wishlist"
                >
                  ✕
                </button>

                <div style={cardContent}>
                  <div style={categoryLabel}>{event.category_name || "Event"}</div>
                  <h3 style={cardTitle}>{event.title}</h3>
                  
                  <div style={metaInfo}>
                    <div style={metaItem}>
                      <span style={icon}>📍</span> {event.place_name}
                    </div>
                    <div style={metaItem}>
                      <span style={icon}>📅</span> {formatDate(event.date_start)}
                    </div>
                  </div>
                </div>

                <div style={cardFooter}>
                    <span style={viewDetailText}>View Details →</span>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const DALMA_BLUE = "#2563eb";

const page = { 
    background: "#f8fafc", 
    minHeight: "100vh", 
    padding: "60px 0",
    fontFamily: "system-ui, -apple-system, sans-serif" 
};

const container = { maxWidth: 1200, margin: "0 auto", padding: "0 24px" };

const pageHeader = { marginBottom: 40 };
const titleGroup = { display: "flex", alignItems: "center", gap: 16, marginBottom: 8 };
const pageTitle = { fontSize: 36, fontWeight: 800, color: "#0f172a", margin: 0, letterSpacing: "-0.02em" };
const countBadge = { background: "#e0e7ff", color: DALMA_BLUE, padding: "4px 12px", borderRadius: "100px", fontWeight: 700, fontSize: 14 };
const pageSubtitle = { color: "#64748b", fontSize: 18, margin: 0 };

/* GRID */
const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
  gap: 32
};

/* CARD */
const card = {
  position: "relative",
  background: "white",
  borderRadius: 24,
  border: "1px solid #e2e8f0",
  cursor: "pointer",
  display: "flex",
  flexDirection: "column",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  overflow: "hidden"
};

const cardContent = { padding: "28px", flex: 1 };
const categoryLabel = { fontSize: 12, fontWeight: 800, textTransform: "uppercase", color: DALMA_BLUE, letterSpacing: "0.05em", marginBottom: 12 };
const cardTitle = { fontSize: 20, fontWeight: 700, color: "#1e293b", margin: "0 0 16px 0", lineHeight: 1.4 };

const metaInfo = { display: "flex", flexDirection: "column", gap: 8 };
const metaItem = { display: "flex", alignItems: "center", gap: 8, color: "#64748b", fontSize: 15, fontWeight: 500 };
const icon = { fontSize: 16 };

const cardFooter = { padding: "16px 28px", borderTop: "1px solid #f1f5f9", background: "#fafafa" };
const viewDetailText = { fontSize: 14, fontWeight: 700, color: DALMA_BLUE };

/* REMOVE BUTTON */
const removeBtn = {
  position: "absolute",
  top: 16,
  right: 16,
  width: 32,
  height: 32,
  borderRadius: "50%",
  border: "none",
  background: "rgba(255, 255, 255, 0.9)",
  color: "#64748b",
  fontSize: 14,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "all 0.2s",
  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  zIndex: 2,
  ":hover": { background: "#ef4444", color: "white" } // Note: inline doesn't support :hover, but standard JS logic does
};

/* EMPTY STATE */
const emptyState = {
  textAlign: "center",
  padding: "100px 40px",
  borderRadius: 32,
  background: "white",
  border: "2px dashed #e2e8f0"
};

const emptyIcon = { fontSize: 48, marginBottom: 20 };
const emptyTitle = { fontSize: 24, fontWeight: 700, color: "#0f172a", marginBottom: 12 };
const emptyText = { color: "#64748b", fontSize: 16, marginBottom: 32, maxWidth: 400, margin: "0 auto 32px" };
const exploreBtn = { background: DALMA_BLUE, color: "white", border: "none", padding: "14px 28px", borderRadius: 12, fontWeight: 700, cursor: "pointer", transition: "all 0.2s" };

/* LOADING / AUTH MESSAGE */
const loadingWrapper = { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60vh", color: "#64748b" };
const spinner = { width: 40, height: 40, border: "4px solid #e2e8f0", borderTop: `4px solid ${DALMA_BLUE}`, borderRadius: "50%", animation: "spin 1s linear infinite", marginBottom: 16 };
const messageContainer = { textAlign: "center", padding: "100px 20px" };
const lockIcon = { fontSize: 40, marginBottom: 16 };
const messageText = { fontSize: 18, color: "#64748b", marginBottom: 24 };
const primaryBtn = { background: DALMA_BLUE, color: "white", border: "none", padding: "12px 24px", borderRadius: 10, fontWeight: 600, cursor: "pointer" };

export default Wishlist;