const express = require("express");
const router = express.Router();
const pool = require("../db");
const authMiddleware = require("../middleware/authMiddleware");


// ADD EVENT TO WISHLIST
router.post("/:eventId", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const eventId = req.params.eventId;

    // prevent duplicates
    const exists = await pool.query(
      "SELECT * FROM wishlist WHERE user_id=$1 AND event_id=$2",
      [userId, eventId]
    );

    if (exists.rows.length > 0) {
      return res.status(400).json({ message: "Already in wishlist" });
    }

    await pool.query(
      "INSERT INTO wishlist (user_id, event_id) VALUES ($1,$2)",
      [userId, eventId]
    );

    res.json({ message: "Added to wishlist" });

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});


// REMOVE FROM WISHLIST
router.delete("/:eventId", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const eventId = req.params.eventId;

    await pool.query(
      "DELETE FROM wishlist WHERE user_id=$1 AND event_id=$2",
      [userId, eventId]
    );

    res.json({ message: "Removed from wishlist" });

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});


// GET MY WISHLIST EVENTS
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT events.* 
       FROM wishlist
       JOIN events ON wishlist.event_id = events.id
       WHERE wishlist.user_id = $1`,
      [userId]
    );

    res.json(result.rows);

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
