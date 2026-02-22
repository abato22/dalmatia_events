const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Dalmatia Events API is running!");
});

const eventsRoutes = require("./routes/events");
app.use("/events", eventsRoutes);

const authRoutes = require("./routes/auth");
app.use("/auth", authRoutes);

const wishlistRoutes = require("./routes/wishlist");
app.use("/wishlist", wishlistRoutes);

const reviewRoutes = require("./routes/reviews");
app.use("/reviews", reviewRoutes);

const placesRoutes = require("./routes/places");
app.use("/places", placesRoutes);

const categoriesRoutes = require("./routes/categories");
app.use("/categories", categoriesRoutes);


const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
