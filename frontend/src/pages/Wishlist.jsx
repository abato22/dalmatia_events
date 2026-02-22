import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Wishlist() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must login first.");
      navigate("/login", { replace: true });
    }
  }, []);

  return <h2>Wishlist</h2>;
}

export default Wishlist;
