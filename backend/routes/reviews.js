const express = require("express");
const router = express.Router();
const pool = require("../db");
const authenticateToken = require("../middleware/authMiddleware");


// ADD REVIEW
router.post("/", authenticateToken, async (req, res) => {
    const { event_id, rating, comment } = req.body;
    const user_id = req.user.id;

    try {
        const result = await pool.query(
            `INSERT INTO event_reviews (event_id, user_id, rating, comment)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [event_id, user_id, rating, comment]
        );

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(400).json({ error: "You already reviewed this event or invalid data" });
    }
});


// GET REVIEWS FOR AN EVENT
router.get("/event/:eventId", async (req, res) => {
    const { eventId } = req.params;

    try {
        const result = await pool.query(
            `SELECT r.*, u.username
             FROM event_reviews r
             JOIN users u ON r.user_id = u.id
             WHERE r.event_id = $1
             ORDER BY r.created_at DESC`,
            [eventId]
        );

        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
});


// UPDATE REVIEW
router.put("/:eventId", authenticateToken, async (req, res) => {
    const { eventId } = req.params;
    const { rating, comment } = req.body;
    const user_id = req.user.id;

    try {
        const result = await pool.query(
            `UPDATE event_reviews
             SET rating = $1, comment = $2
             WHERE event_id = $3 AND user_id = $4
             RETURNING *`,
            [rating, comment, eventId, user_id]
        );

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
});


// DELETE REVIEW
router.delete("/:eventId", authenticateToken, async (req, res) => {
    const { eventId } = req.params;
    const user_id = req.user.id;

    try {
        await pool.query(
            `DELETE FROM event_reviews
             WHERE event_id = $1 AND user_id = $2`,
            [eventId, user_id]
        );

        res.json({ message: "Review deleted" });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
});

module.exports = router;
