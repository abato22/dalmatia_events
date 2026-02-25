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

  /* ================= UI ================= */

  if (!event) return <p>Loading...</p>;

  return (
    <div>
      <button
        onClick={() => {
          if (window.history.length > 1) navigate(-1);
          else navigate("/explore");
        }}
        style={backBtn}
      >
        ← Back to Explore
      </button>

      <div style={headerRow}>
        <h2>{event.title}</h2>

        <button onClick={toggleWishlist} style={wishlistBtn(inWishlist)}>
          {inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
        </button>
      </div>

      <p>{event.description}</p>
      <p><strong>Place:</strong> {event.place_name}</p>
      <p><strong>Category:</strong> {event.category_name}</p>
      <p><strong>Rating:</strong> {event.average_rating} ⭐ ({event.reviews_count})</p>

      <hr />

      <h3>Reviews</h3>

      {reviews.length === 0 ? (
        <p>No reviews yet.</p>
      ) : (
        reviews.map(review => (
          <div key={review.id} style={{ marginBottom: 10 }}>
            <strong>{review.username}</strong> — {review.rating} ⭐
            <p>{review.comment}</p>
          </div>
        ))
      )}

      <hr />

      {token ? (
        <form onSubmit={handleSubmit}>
          <h3>Add Review</h3>

          <select value={rating} onChange={(e) => setRating(Number(e.target.value))}>
            {[1,2,3,4,5].map(n => (
              <option key={n} value={n}>{n} ⭐</option>
            ))}
          </select>

          <br /><br />

          <textarea
            placeholder="Write your comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
          />

          <br /><br />

          <button type="submit">Submit Review</button>
        </form>
      ) : (
        <p>You must login to add a review.</p>
      )}
    </div>
  );
}

/* ================= STYLES ================= */

const headerRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center"
};

const wishlistBtn = (active) => ({
  padding: "8px 14px",
  borderRadius: 8,
  border: "none",
  background: active ? "#ef4444" : "#2563eb",
  color: "white",
  cursor: "pointer"
});

const backBtn = {
  marginBottom: 20,
  padding: "6px 12px",
  borderRadius: 6,
  border: "1px solid #ccc",
  background: "white",
  cursor: "pointer"
};

export default EventDetails;