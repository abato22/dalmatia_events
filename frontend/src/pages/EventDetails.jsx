import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

function EventDetails() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const token = localStorage.getItem("token");

  const fetchEvent = async () => {
    const response = await axios.get(
      `http://localhost:3000/events/${id}`
    );
    setEvent(response.data);
  };

  const fetchReviews = async () => {
    const response = await axios.get(
      `http://localhost:3000/reviews/event/${id}`
    );
    setReviews(response.data);
  };

  useEffect(() => {
    fetchEvent();
    fetchReviews();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        "http://localhost:3000/reviews",
        {
          event_id: id,
          rating,
          comment
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setComment("");
      setRating(5);
      fetchEvent();    // refresh rating
      fetchReviews();  // refresh reviews list
    } catch (err) {
      alert("You already reviewed this event or error occurred.");
    }
  };

  if (!event) return <p>Loading...</p>;

  return (
    <div>
      <h2>{event.title}</h2>
      <p>{event.description}</p>
      <p><strong>Place:</strong> {event.place_name}</p>
      <p><strong>Category:</strong> {event.category_name}</p>
      <p><strong>Rating:</strong> {event.average_rating} ⭐ ({event.reviews_count})</p>

      <hr />

      <h3>Reviews</h3>

      {reviews.length === 0 ? (
        <p>No reviews yet.</p>
      ) : (
        reviews.map((review) => (
          <div key={review.id} style={{ marginBottom: "10px" }}>
            <strong>{review.username}</strong> - {review.rating} ⭐
            <p>{review.comment}</p>
          </div>
        ))
      )}

      <hr />

      {token ? (
        <form onSubmit={handleSubmit}>
          <h3>Add Review</h3>

          <select
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
          >
            <option value={1}>1 ⭐</option>
            <option value={2}>2 ⭐</option>
            <option value={3}>3 ⭐</option>
            <option value={4}>4 ⭐</option>
            <option value={5}>5 ⭐</option>
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

export default EventDetails;
