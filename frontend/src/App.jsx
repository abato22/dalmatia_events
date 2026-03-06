import { Routes, Route, useLocation } from "react-router-dom"; // Added useLocation
import { useEffect } from "react"; // Added useEffect
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Explore from "./pages/Explore";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MyEvents from "./pages/MyEvents";
import Wishlist from "./pages/Wishlist";
import EventDetails from "./pages/EventDetails";

// --- THE FIX ---
// This component scrolls to top every time the URL changes
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  return (
    <>
      <ScrollToTop /> {/* Place it here so it runs on every route change */}
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/my-events" element={<MyEvents />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/events/:id" element={<EventDetails />} />
        </Route>

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </>
  );
}

export default App;