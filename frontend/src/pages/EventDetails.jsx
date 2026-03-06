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
  const [isHovered, setIsHovered] = useState(false); // New state for back button hover

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
    return new Date(date).toLocaleDateString("hr-HR", {
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  /* ================= UI ================= */

  if (!event) return (
    <div style={loadingWrapper}>
      <div style={spinner}></div>
      <p>Loading experience...</p>
    </div>
  );

  return (
    <div style={page}>
      <div style={container}>

        {/* TOP NAVIGATION */}
        <div style={topNav}>
          <button
            onClick={() => {
              if (window.history.length > 1) navigate(-1);
              else navigate("/explore");
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{ 
              ...backBtn, 
              color: isHovered ? "#2563eb" : "#64748b", // Hover logic applied here
              transform: isHovered ? "translateX(-4px)" : "translateX(0)" 
            }}
          >
            ← Back to Explore
          </button>
        </div>

        {/* HERO SECTION (Text Only) */}
        <div style={heroSection}>
          <div style={heroContent}>
            <span style={categoryBadge}>{event.category_name}</span>
            <div style={heroHeaderRow}>
              <h1 style={title}>{event.title}</h1>
            </div>
            <p style={locationSubtitle}>📍 {event.place_name}</p>
            
            <div style={actionRow}>
              <button onClick={toggleWishlist} style={wishlistBtn(inWishlist)}>
                {inWishlist ? "♥ Saved to Wishlist" : "♡ Add to Wishlist"}
              </button>
              <div style={ratingBadge}>
                ⭐ {event.average_rating ? Number(event.average_rating).toFixed(1) : "New"} 
                <span style={reviewCount}>({event.reviews_count} reviews)</span>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT GRID */}
        <div style={contentGrid}>
          
          {/* LEFT COLUMN: Details & About */}
          <div style={mainCol}>
            <div style={card}>
              <h3 style={sectionTitle}>About this event</h3>
              <p style={description}>{event.description}</p>
            </div>

            {/* REVIEWS SECTION */}
            <div style={card}>
              <div style={sectionHeader}>
                <h3 style={sectionTitle}>Guest Reviews</h3>
                <span style={ratingBadgeSmall}>⭐ {event.average_rating || "0"}</span>
              </div>

              {reviews.length === 0 ? (
                <div style={emptyState}>
                  <div style={emptyIcon}>💬</div>
                  <p>No reviews yet. Be the first to share your experience!</p>
                </div>
              ) : (
                <div style={reviewList}>
                  {reviews.map(review => (
                    <div key={review.id} style={reviewCard}>
                      <div style={reviewHeader}>
                        <div style={reviewerInfo}>
                          <div style={avatar}>{review.username.charAt(0).toUpperCase()}</div>
                          <strong style={reviewerName}>{review.username}</strong>
                        </div>
                        <div style={stars}>
                          {"⭐".repeat(review.rating)}
                          <span style={emptyStars}>{"⭐".repeat(5 - review.rating)}</span>
                        </div>
                      </div>
                      <p style={reviewText}>{review.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Sidebar Meta & Forms */}
          <div style={sidebarCol}>
            
            {/* DATE & TIME CARD */}
            <div style={card}>
              <h3 style={sectionTitleSmall}>When & Where</h3>
              <div style={metaItem}>
                <span style={metaIcon}>📅</span>
                <div>
                  <div style={metaLabel}>Starts</div>
                  <div style={metaValue}>{formatDate(event.date_start)}</div>
                </div>
              </div>
              {event.date_end && (
                <div style={metaItem}>
                  <span style={metaIcon}>🏁</span>
                  <div>
                    <div style={metaLabel}>Ends</div>
                    <div style={metaValue}>{formatDate(event.date_end)}</div>
                  </div>
                </div>
              )}
              <div style={metaItem}>
                <span style={metaIcon}>📍</span>
                <div>
                  <div style={metaLabel}>Location</div>
                  <div style={metaValue}>{event.place_name}</div>
                </div>
              </div>
            </div>

            {/* ADD REVIEW FORM */}
            <div style={card}>
              <h3 style={sectionTitleSmall}>Leave a Review</h3>
              {token ? (
                <form onSubmit={handleSubmit} style={formContainer}>
                  <label style={inputLabel}>Rating</label>
                  <select
                    style={selectInput}
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                  >
                    <option value={5}>5 ⭐ - Excellent</option>
                    <option value={4}>4 ⭐ - Very Good</option>
                    <option value={3}>3 ⭐ - Average</option>
                    <option value={2}>2 ⭐ - Poor</option>
                    <option value={1}>1 ⭐ - Terrible</option>
                  </select>

                  <label style={inputLabel}>Your experience</label>
                  <textarea
                    style={textarea}
                    placeholder="What did you love about it?"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                  />

                  <button style={primaryBtn} type="submit">
                    Post Review
                  </button>
                </form>
              ) : (
                <div style={loginPrompt}>
                  <p>You must be logged in to leave a review.</p>
                </div>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

/* ================= STYLES ================= */

// Global/Layout
const page = { background: "#f8fafc", minHeight: "100vh", padding: "40px 0", fontFamily: "system-ui, -apple-system, sans-serif", color: "#0f172a" };
const container = { maxWidth: 1100, margin: "0 auto", padding: "0 24px" };
const topNav = { marginBottom: 24 };

const loadingWrapper = { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", color: "#64748b" };
const spinner = { width: 40, height: 40, border: "4px solid #e2e8f0", borderTop: "4px solid #2563eb", borderRadius: "50%", animation: "spin 1s linear infinite", marginBottom: 16 };

// Buttons
const backBtn = { background: "transparent", border: "none", fontWeight: 600, fontSize: 15, cursor: "pointer", padding: 0, display: "inline-flex", alignItems: "center", gap: 8, transition: "all 0.2s ease-in-out" };
const wishlistBtn = (active) => ({ padding: "12px 24px", borderRadius: 100, border: "none", background: active ? "#fee2e2" : "#2563eb", color: active ? "#ef4444" : "white", fontWeight: 700, fontSize: 15, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8, transition: "all 0.2s" });
const primaryBtn = { width: "100%", padding: "14px", borderRadius: 12, border: "none", background: "#0f172a", color: "white", fontWeight: 600, fontSize: 16, cursor: "pointer", transition: "background 0.2s" };

// Hero Section
const heroSection = { background: "white", borderRadius: 24, border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", marginBottom: 32 };
const heroContent = { padding: "40px" };
const categoryBadge = { display: "inline-block", background: "#e0e7ff", color: "#2563eb", padding: "6px 14px", borderRadius: 100, fontWeight: 700, fontSize: 13, marginBottom: 16 };
const heroHeaderRow = { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 };
const title = { fontSize: 36, fontWeight: 800, margin: "0 0 12px 0", lineHeight: 1.2, letterSpacing: "-0.02em" };
const locationSubtitle = { fontSize: 18, color: "#64748b", margin: "0 0 24px 0", fontWeight: 500 };
const actionRow = { display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap", borderTop: "1px solid #f1f5f9", paddingTop: 24 };

// Ratings
const ratingBadge = { fontSize: 18, fontWeight: 700, color: "#0f172a", display: "flex", alignItems: "center", gap: 6 };
const ratingBadgeSmall = { fontSize: 16, fontWeight: 700, background: "#fef3c7", color: "#d97706", padding: "4px 12px", borderRadius: 100 };
const reviewCount = { color: "#64748b", fontWeight: 400, fontSize: 15 };

// Grid Layout
const contentGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 32, alignItems: "start" };
const mainCol = { display: "flex", flexDirection: "column", gap: 32, gridColumn: "span 2" }; 
const sidebarCol = { display: "flex", flexDirection: "column", gap: 24 };

// Cards & Content
const card = { background: "white", borderRadius: 24, padding: 32, border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" };
const sectionHeader = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 };
const sectionTitle = { fontSize: 22, fontWeight: 700, margin: "0 0 16px 0" };
const sectionTitleSmall = { fontSize: 18, fontWeight: 700, margin: "0 0 20px 0" };
const description = { color: "#334155", fontSize: 16, lineHeight: 1.7 };

// Meta Items (Sidebar)
const metaItem = { display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 20 };
const metaIcon = { fontSize: 24, background: "#f1f5f9", width: 48, height: 48, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 12 };
const metaLabel = { fontSize: 13, color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 };
const metaValue = { fontSize: 15, fontWeight: 600, color: "#0f172a" };

// Reviews
const reviewList = { display: "flex", flexDirection: "column", gap: 20 };
const reviewCard = { padding: 20, borderRadius: 16, border: "1px solid #f1f5f9", background: "#f8fafc" };
const reviewHeader = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 };
const reviewerInfo = { display: "flex", alignItems: "center", gap: 12 };
const avatar = { width: 40, height: 40, borderRadius: "50%", background: "#2563eb", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 16 };
const reviewerName = { fontSize: 15, color: "#0f172a" };
const stars = { fontSize: 14 };
const emptyState = { textAlign: "center", padding: "40px 20px", color: "#64748b" };
const emptyIcon = { fontSize: 40, marginBottom: 12, opacity: 0.5 };
const emptyStars = { opacity: 0.2 };
const reviewText = { color: "#475569", lineHeight: 1.6, margin: 0 };

// Forms
const formContainer = { display: "flex", flexDirection: "column", gap: 16 };
const inputLabel = { fontSize: 14, fontWeight: 600, color: "#0f172a", marginBottom: -8 };
const selectInput = { padding: "14px", borderRadius: 12, border: "1px solid #cbd5e1", fontSize: 15, outline: "none", width: "100%", background: "white" };
const textarea = { width: "100%", minHeight: 120, padding: 16, borderRadius: 12, border: "1px solid #cbd5e1", fontSize: 15, resize: "vertical", outline: "none", fontFamily: "inherit" };
const loginPrompt = { background: "#f1f5f9", padding: 24, borderRadius: 16, textAlign: "center", color: "#475569", fontWeight: 500 };

export default EventDetails;