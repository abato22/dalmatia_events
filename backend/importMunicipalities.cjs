const fs = require("fs");
const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "dalmatia_events",
  password: "taman230",
  port: 5432,
});

const countyMap = {
  "Zadarska": 1,
  "Šibensko-Kninska": 2,
  "Splitsko-Dalmatinska": 3,
  "Dubrovacko-Neretvanska": 4
};

async function importData() {
  const data = JSON.parse(
    fs.readFileSync("../frontend/src/data/dalmatia-municipalities.json", "utf8")
  );

  for (const feature of data.features) {
    const name = feature.properties.NAME_2;
    const countyName = feature.properties.NAME_1;
    const county_id = countyMap[countyName];

    if (!county_id) continue;

    const type =
      feature.properties.ENGTYPE_2?.toLowerCase().includes("city")
        ? "city"
        : "municipality";

    const geometry = JSON.stringify(feature.geometry);

    await pool.query(
      `
      INSERT INTO places (name, type, county_id, geom)
      VALUES (
        $1,
        $2,
        $3,
        ST_SetSRID(ST_GeomFromGeoJSON($4), 4326)
      )
      ON CONFLICT (name)
      DO UPDATE SET
        geom = EXCLUDED.geom
      `,
      [name, type, county_id, geometry]
    );

    console.log("Inserted:", name);
  }

  console.log("Import finished.");
  process.exit();
}

importData();
