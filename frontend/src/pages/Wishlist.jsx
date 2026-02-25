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
    <div>
      <h2>My Wishlist</h2>

      {events.length === 0 ? (
        <p>No events in wishlist yet.</p>
      ) : (
        <div style={grid}>
          {events.map(event => (
            <div key={event.id} style={cardWrapper}>
              <div
                style={card}
                onClick={() => navigate(`/events/${event.id}`)}
              >
                <h3>{event.title}</h3>
                <p>{event.place_name}</p>
                <p>
                  {formatDate(event.date_start)} — {formatDate(event.date_end)}
                </p>
              </div>

              <button
                style={removeBtn}
                onClick={() => removeFromWishlist(event.id)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Wishlist;


/* helpers */

function formatDate(date) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("hr-HR");
}

/* styles */

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
  gap: 20,
  marginTop: 20
};

const card = {
  border: "1px solid #ddd",
  borderRadius: 12,
  padding: 16,
  cursor: "pointer",
  background: "white",
  transition: "0.2s"
};

const cardWrapper = {
  position: "relative"
};

const removeBtn = {
  position: "absolute",
  top: 10,
  right: 10,
  padding: "4px 8px",
  fontSize: 12,
  borderRadius: 6,
  border: "none",
  background: "#ef4444",
  color: "white",
  cursor: "pointer"
};