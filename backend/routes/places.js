const express = require("express");
const router = express.Router();
const pool = require("../db");

// ===============================
// GET ALL PLACES (for dropdown)
// ===============================
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, type, county_id FROM places ORDER BY name ASC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});


// ===============================
// GET PLACES AS GEOJSON (for map)
// ===============================
router.get("/geo", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id,
        name,
        type,
        county_id,
        ST_AsGeoJSON(geom) as geometry
      FROM places
    `);

    const geojson = {
      type: "FeatureCollection",
      features: result.rows.map(row => ({
        type: "Feature",
        properties: {
          id: row.id,
          name: row.name,
          type: row.type,
          county_id: row.county_id
        },
        geometry: JSON.parse(row.geometry)
      }))
    };

    res.json(geojson);

  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

module.exports = router;
