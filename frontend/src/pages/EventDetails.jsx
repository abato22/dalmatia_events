import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [event, setEvent] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [inWishlist, setInWishlist] = useState(false);

  /* ================= FETCH ================= */

  const fetchEvent = async () => {
    const response = await axios.get(`http://localhost:3000/events/${id}`);
    setEvent(response.data);
  };

  const fetchReviews = async () => {
    const response = await axios.get(`http://localhost:3000/reviews/event/${id}`);
    setReviews(response.data);
  };

  useEffect(() => {
    fetchEvent();
    fetchReviews();
  }, [id]);

  /* ================= WISHLIST CHECK ================= */

  useEffect(() => {
    const checkWishlist = async () => {
      if (!token || !event) return;

      try {
        const res = await axios.get(
          "http://localhost:3000/wishlist",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setInWishlist(res.data.some(e => e.id === event.id));
      } catch {}
    };

    checkWishlist();
  }, [event, token]);

  /* ================= REVIEW ================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        "http://localhost:3000/reviews",
        { event_id: id, rating, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setComment("");
      setRating(5);
      fetchEvent();
      fetchReviews();
      toast.success("Review added");

    } catch {
      toast.error("You already reviewed this event or error occurred.");
    }
  };

  /* ================= WISHLIST TOGGLE ================= */

  const toggleWishlist = async () => {
    if (!token) {
      toast.error("Login required");
      return;
    }

    try {
      if (inWishlist) {
        await axios.delete(
          `http://localhost:3000/wishlist/${event.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setInWishlist(false);
        toast.success("Removed from wishlist");

      } else {
          await axios.post(
            `http://localhost:3000/wishlist/${event.id}`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          );

        setInWishlist(true);
        toast.success("Added to wishlist");
      }

    } catch {
      toast.error("Wishlist action failed");
    }
  };

  function formatDate(date) {
    if (!date) return "";
    return new Date(date).toLocaleDateString("hr-HR");
  }

  /* ================= UI ================= */

  if (!event) return <p>Loading...</p>;

  return (
    <div style={page}>
      <div style={container}>

        {/* BACK */}
        <button
          onClick={() => {
            if (window.history.length > 1) navigate(-1);
            else navigate("/explore");
          }}
          style={backBtn}
        >
          ← Back to Explore
        </button>

        {/* HEADER CARD */}
        <div style={heroCard}>
          <div style={headerRow}>
            <h1 style={title}>{event.title}</h1>

            <button onClick={toggleWishlist} style={wishlistBtn(inWishlist)}>
              {inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
            </button>
          </div>

          <p style={description}>{event.description}</p>

          <div style={metaGrid}>
            <div><strong>Place</strong><br />{event.place_name}</div>
            <div><strong>Category</strong><br />{event.category_name}</div>
            <div><strong>Rating</strong><br />{event.average_rating} ⭐ ({event.reviews_count})</div>
            <div>
              <strong>Date</strong><br />
              {formatDate(event.date_start)}
              {event.date_end ? ` — ${formatDate(event.date_end)}` : ""}
            </div>
          </div>
        </div>

        {/* REVIEWS */}
        <div style={sectionCard}>
          <h3 style={sectionTitle}>Reviews</h3>

          {reviews.length === 0 ? (
            <div style={emptyBox}>No reviews yet.</div>
          ) : (
            reviews.map(review => (
              <div key={review.id} style={reviewCard}>
                <div style={reviewHeader}>
                  <strong>{review.username}</strong>
                  <span>{review.rating} ⭐</span>
                </div>
                <p style={reviewText}>{review.comment}</p>
              </div>
            ))
          )}
        </div>

        {/* ADD REVIEW */}
        <div style={sectionCard}>
          {token ? (
            <form onSubmit={handleSubmit}>
              <h3 style={sectionTitle}>Add Review</h3>

              <div style={reviewFormRow}>
                <select
                  style={input}
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                >
                  {[1,2,3,4,5].map(n => (
                    <option key={n} value={n}>{n} ⭐</option>
                  ))}
                </select>
              </div>

              <textarea
                style={textarea}
                placeholder="Write your comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
              />

              <button style={primaryBtn} type="submit">
                Submit Review
              </button>
            </form>
          ) : (
            <div style={emptyBox}>
              You must login to add a review.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

const page = { paddingBottom: 60 };

const container = {
  maxWidth: 900,
  margin: "0 auto",
  padding: "0 20px"
};

const backBtn = {
  marginBottom: 16,
  padding: "8px 14px",
  borderRadius: 10,
  border: "1px solid #e2e8f0",
  background: "white",
  cursor: "pointer",
  fontWeight: 600
};

/* HERO */

const heroCard = {
  background: "white",
  borderRadius: 24,
  padding: 24,
  border: "1px solid #eef2f7",
  boxShadow: "0 20px 60px rgba(0,0,0,0.06)",
  marginBottom: 20
};

const title = { fontSize: 32, fontWeight: 800 };

const description = {
  color: "#475569",
  marginTop: 10,
  marginBottom: 16
};

const headerRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12
};

const wishlistBtn = (active) => ({
  padding: "10px 16px",
  borderRadius: 12,
  border: "none",
  background: active ? "#ef4444" : "linear-gradient(135deg,#2563eb,#4f46e5)",
  color: "white",
  fontWeight: 700,
  cursor: "pointer",
  whiteSpace: "nowrap"
});

/* META */

const metaGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))",
  gap: 14,
  fontSize: 14
};

/* SECTIONS */

const sectionCard = {
  background: "white",
  borderRadius: 20,
  padding: 20,
  border: "1px solid #eef2f7",
  marginBottom: 20,
  boxShadow: "0 12px 30px rgba(0,0,0,0.05)"
};

const sectionTitle = { fontWeight: 800, marginBottom: 12 };

/* REVIEWS */

const reviewCard = {
  padding: 12,
  borderRadius: 12,
  border: "1px solid #eef2f7",
  marginBottom: 10
};

const reviewHeader = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: 4
};

const reviewText = { color: "#475569" };

/* FORM */

const reviewFormRow = { marginBottom: 10 };

const input = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #e2e8f0"
};

const textarea = {
  width: "100%",
  minHeight: 90,
  padding: 12,
  borderRadius: 12,
  border: "1px solid #e2e8f0",
  marginBottom: 12
};

const primaryBtn = {
  padding: "12px 18px",
  borderRadius: 12,
  border: "none",
  background: "linear-gradient(135deg,#2563eb,#4f46e5)",
  color: "white",
  fontWeight: 700,
  cursor: "pointer"
};

const emptyBox = {
  padding: 20,
  textAlign: "center",
  borderRadius: 12,
  border: "1px dashed #e2e8f0",
  color: "#64748b"
};

export default EventDetails;