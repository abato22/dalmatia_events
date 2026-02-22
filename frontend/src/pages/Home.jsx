import { Link } from "react-router-dom";

function Home() {
  return (
    <div>
      <h1>Dalmatia Events</h1>
      <p>Discover events across Dalmatia.</p>
      <Link to="/login">Login</Link> |{" "}
      <Link to="/register">Register</Link>
    </div>
  );
}

export default Home;
