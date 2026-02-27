import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

function Wishlist() {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (!token) return <p>You must be logged in to see wishlist.</p>;
  if (loading) return <p>Loading...</p>;

  const removeFromWishlist = async (eventId) => {
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

  return (
    <div style={page}>
      <div style={container}>

        {/* HEADER */}
        <div style={pageHeader}>
          <div>
            <h1 style={pageTitle}>My Wishlist</h1>
            <p style={pageSubtitle}>
              Events you saved to attend
            </p>
          </div>
        </div>

        {/* CONTENT */}
        {events.length === 0 ? (
          <div style={emptyState}>
            <div style={emptyIcon}>♡</div>
            <h3 style={emptyTitle}>No saved events yet</h3>
            <p style={emptyText}>
              When you find events you like, save them to your wishlist.
            </p>
          </div>
        ) : (
          <div style={grid}>
            {events.map(event => (
              <div key={event.id} style={cardWrapper}>

                <button
                  style={removeBtn}
                  onClick={() => removeFromWishlist(event.id)}
                >
                  Remove
                </button>

                <div
                  style={card}
                  onClick={() => navigate(`/events/${event.id}`)}
                >
                  <h3 style={cardTitle}>{event.title}</h3>

                  <div style={meta}>{event.place_name}</div>

                  <div style={dateRow}>
                    {formatDate(event.date_start)}
                    {event.date_end ? ` — ${formatDate(event.date_end)}` : ""}
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

export default Wishlist;


/* helpers */

function formatDate(date) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("hr-HR");
}

/* PAGE */

const page = { paddingBottom: 60 };

const container = {
  maxWidth: 1200,
  margin: "0 auto",
  padding: "0 20px"
};

const pageHeader = { marginBottom: 18 };

const pageTitle = { fontSize: 32, fontWeight: 800 };

const pageSubtitle = { color: "#64748b", marginTop: 4 };

/* GRID */

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
  gap: 24
};

/* CARD */

const cardWrapper = { position: "relative" };

const card = {
  borderRadius: 18,
  padding: 18,
  cursor: "pointer",
  background: "white",
  border: "1px solid #eef2f7",
  boxShadow: "0 10px 28px rgba(0,0,0,0.05)",
  transition: "all .18s ease"
};

const cardTitle = {
  fontWeight: 700,
  marginBottom: 6
};

const meta = {
  fontSize: 14,
  color: "#64748b"
};

const dateRow = {
  marginTop: 8,
  fontSize: 13,
  fontWeight: 600,
  color: "#334155"
};

/* REMOVE */

const removeBtn = {
  position: "absolute",
  top: 10,
  right: 10,
  padding: "6px 10px",
  fontSize: 12,
  borderRadius: 999,
  border: "none",
  background: "#ef4444",
  color: "white",
  cursor: "pointer",
  fontWeight: 600,
  boxShadow: "0 6px 14px rgba(239,68,68,0.35)"
};

/* EMPTY STATE */

const emptyState = {
  textAlign: "center",
  padding: "80px 20px",
  borderRadius: 20,
  border: "1px dashed #e2e8f0",
  background: "#fafcff"
};

const emptyIcon = {
  fontSize: 32,
  marginBottom: 10,
  opacity: 0.6
};

const emptyTitle = { fontWeight: 700, marginBottom: 6 };

const emptyText = { color: "#64748b" };