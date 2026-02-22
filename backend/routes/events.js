const express = require("express");
const router = express.Router();
const pool = require("../db");
const authMiddleware = require("../middleware/authMiddleware");


// ===============================
// GET MY EVENTS (PAST / CURRENT / FUTURE)
// ===============================
router.get("/my", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `
      SELECT 
        e.*,
        p.name AS place_name,
        c.name AS category_name,
        ST_AsGeoJSON(e.location_point) AS location_point
      FROM events e
      JOIN places p ON e.place_id = p.id
      JOIN categories c ON e.category_id = c.id
      WHERE e.created_by = $1
      ORDER BY e.date_start ASC
      `,
      [userId]
    );

    const now = new Date();

    const events = result.rows.map(e => ({
      ...e,
      location_point: e.location_point
        ? JSON.parse(e.location_point)
        : null
    }));

    const past = [];
    const current = [];
    const future = [];

    events.forEach(e => {
      if (new Date(e.date_end) < now) past.push(e);
      else if (new Date(e.date_start) > now) future.push(e);
      else current.push(e);
    });

    res.json({ past, current, future });

  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});


// ===============================
// EVENTS NEAR LOCATION (DISTANCE BASED)
// ===============================
router.get("/nearby", async (req, res) => {
  try {
    const { lat, lng, radius } = req.query;

    if (!lat || !lng || !radius) {
      return res.status(400).json({ message: "Missing lat, lng or radius." });
    }

    const result = await pool.query(
      `
      SELECT 
        e.*,
        p.name AS place_name,
        c.name AS category_name,
        ST_AsGeoJSON(e.location_point) AS location_point,
        ST_DistanceSphere(
          e.location_point,
          ST_SetSRID(ST_MakePoint($1,$2),4326)
        ) as distance
      FROM events e
      JOIN places p ON e.place_id = p.id
      JOIN categories c ON e.category_id = c.id
      WHERE ST_DistanceSphere(
        e.location_point,
        ST_SetSRID(ST_MakePoint($1,$2),4326)
      ) <= $3
      ORDER BY distance ASC
      `,
      [lng, lat, radius]
    );

    const events = result.rows.map(event => ({
      ...event,
      location_point: event.location_point
        ? JSON.parse(event.location_point)
        : null
    }));

    res.json(events);

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});


// ===============================
// FILTER EVENTS (SPATIAL MUNICIPALITY)
// ===============================
router.get("/", async (req, res) => {
  try {
    const { place, category, from, to } = req.query;

    let query = `
      SELECT 
        e.id,
        e.title,
        e.description,
        e.date_start,
        e.date_end,
        e.average_rating,
        e.reviews_count,
        p.name AS place_name,
        c.name AS category_name,
        ST_AsGeoJSON(e.location_point) AS location_point
      FROM events e
      JOIN places p ON e.place_id = p.id
      JOIN categories c ON e.category_id = c.id
      WHERE 1=1
    `;

    let values = [];
    let counter = 1;

    if (place) {
      query += `
        AND ST_Intersects(
          (SELECT geom FROM places WHERE id = $${counter}),
          e.location_point
        )
      `;
      values.push(place);
      counter++;
    }

    if (category) {
      query += ` AND e.category_id = $${counter}`;
      values.push(category);
      counter++;
    }

    if (from) {
      query += ` AND e.date_start >= $${counter}`;
      values.push(from);
      counter++;
    }

    if (to) {
      query += ` AND e.date_end <= $${counter}`;
      values.push(to);
      counter++;
    }

    query += " ORDER BY e.date_start ASC";

    const result = await pool.query(query, values);

    const events = result.rows.map(event => ({
      ...event,
      location_point: event.location_point
        ? JSON.parse(event.location_point)
        : null
    }));

    res.json(events);

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});


// ===============================
// CREATE EVENT
// ===============================
router.post("/", authMiddleware, async (req, res) => {
  try {
    const {
      organizer_name,
      organizer_surname,
      organizer_email,
      organizer_phone,
      title,
      description,
      place_id,
      category_id,
      price,
      date_start,
      date_end,
      latitude,
      longitude,
      image_url
    } = req.body;

    if (
      !organizer_name ||
      !organizer_surname ||
      !organizer_email ||
      !organizer_phone ||
      !title ||
      !place_id ||
      !category_id ||
      !date_start ||
      !date_end ||
      latitude == null ||
      longitude == null ||
      price == null
    ) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    if (new Date(date_start) > new Date(date_end)) {
      return res.status(400).json({ message: "Start date cannot be after end date." });
    }

    if (price < 0) {
      return res.status(400).json({ message: "Price cannot be negative." });
    }

    const check = await pool.query(
      `
      SELECT ST_Intersects(
        geom,
        ST_SetSRID(ST_MakePoint($1, $2), 4326)
      ) AS inside
      FROM places
      WHERE id = $3
      `,
      [longitude, latitude, place_id]
    );

    if (!check.rows[0]?.inside) {
      return res.status(400).json({
        message: "Location is outside selected municipality boundaries."
      });
    }

    const newEvent = await pool.query(
      `INSERT INTO events 
        (
          organizer_name,
          organizer_surname,
          organizer_email,
          organizer_phone,
          title,
          description,
          place_id,
          category_id,
          price,
          date_start,
          date_end,
          image_url,
          created_by,
          location_point
        ) 
       VALUES (
          $1,$2,$3,$4,
          $5,$6,$7,$8,$9,$10,$11,$12,
          $13,
          ST_SetSRID(ST_MakePoint($14,$15),4326)
       )
       RETURNING *`,
      [
        organizer_name,
        organizer_surname,
        organizer_email,
        organizer_phone,
        title,
        description,
        place_id,
        category_id,
        price === "" ? null : price,
        date_start,
        date_end,
        image_url,
        req.user.id,
        longitude,
        latitude
      ]
    );

    res.json(newEvent.rows[0]);

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});


// ===============================
// UPDATE EVENT (ONLY FUTURE)
// ===============================
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const eventId = req.params.id;

    const eventResult = await pool.query(
      "SELECT * FROM events WHERE id = $1",
      [eventId]
    );

    if (eventResult.rows.length === 0) {
      return res.status(404).json({ message: "Event not found" });
    }

    const existing = eventResult.rows[0];

    if (existing.created_by !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (new Date(existing.date_start) <= new Date()) {
      return res.status(400).json({ message: "Only future events can be updated." });
    }

    const {
      organizer_name,
      organizer_surname,
      organizer_email,
      organizer_phone,
      title,
      description,
      place_id,
      category_id,
      price,
      date_start,
      date_end,
      image_url
    } = req.body;

    // ⭐ IMPORTANT: fallback to existing values to avoid undefined → 500
    await pool.query(
      `
      UPDATE events
      SET
        organizer_name=$1,
        organizer_surname=$2,
        organizer_email=$3,
        organizer_phone=$4,
        title=$5,
        description=$6,
        place_id=$7,
        category_id=$8,
        price=$9,
        date_start=$10,
        date_end=$11,
        image_url=$12
      WHERE id=$13
      `,
      [
        organizer_name ?? existing.organizer_name,
        organizer_surname ?? existing.organizer_surname,
        organizer_email ?? existing.organizer_email,
        organizer_phone ?? existing.organizer_phone,
        title ?? existing.title,
        description ?? existing.description,
        place_id ?? existing.place_id,
        category_id ?? existing.category_id,
        price === "" ? null : (price ?? existing.price),
        date_start ?? existing.date_start,
        date_end ?? existing.date_end,
        image_url ?? existing.image_url,
        eventId
      ]
    );

    const fullEvent = await pool.query(
      `
      SELECT 
        e.*,
        p.name AS place_name,
        c.name AS category_name,
        ST_AsGeoJSON(e.location_point) AS location_point
      FROM events e
      JOIN places p ON e.place_id = p.id
      JOIN categories c ON e.category_id = c.id
      WHERE e.id = $1
      `,
      [eventId]
    );

    const enrichedEvent = {
      ...fullEvent.rows[0],
      location_point: fullEvent.rows[0].location_point
        ? JSON.parse(fullEvent.rows[0].location_point)
        : null
    };

    res.json(enrichedEvent);

  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});


// ===============================
// DELETE EVENT
// ===============================
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const eventId = req.params.id;

    const event = await pool.query(
      "SELECT * FROM events WHERE id = $1",
      [eventId]
    );

    if (event.rows.length === 0) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.rows[0].created_by !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await pool.query("DELETE FROM events WHERE id = $1", [eventId]);

    res.json({ message: "Event deleted" });

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});


// ===============================
// GET SINGLE EVENT
// ===============================
router.get("/:id", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        e.*,
        p.name AS place_name,
        c.name AS category_name,
        ST_AsGeoJSON(e.location_point) AS location_point
      FROM events e
      JOIN places p ON e.place_id = p.id
      JOIN categories c ON e.category_id = c.id
      WHERE e.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Event not found" });
    }

    const event = {
      ...result.rows[0],
      location_point: result.rows[0].location_point
        ? JSON.parse(result.rows[0].location_point)
        : null
    };

    res.json(event);

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
