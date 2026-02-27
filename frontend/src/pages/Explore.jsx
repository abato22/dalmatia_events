import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useSearchParams } from "react-router-dom";

import L from "leaflet";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  GeoJSON,
  useMap
} from "react-leaflet";

const DALMATIA_BOUNDS = [
  [42.0, 14.8],
  [45.0, 18.5]
];

const removeLeafletFocusStyle = () => {
  const style = document.createElement("style");
  style.innerHTML = `.leaflet-interactive:focus { outline: none !important; }`;
  document.head.appendChild(style);
};

function FitBounds({ data }) {
  const map = useMap();
  useEffect(() => {
    if (!data) return;
    const layer = L.geoJSON(data);
    map.fitBounds(layer.getBounds(), { padding: [180, 180], maxZoom: 20 });
  }, [data, map]);
  return null;
}

function ZoomToSelected({ data, selectedPlace }) {
  const map = useMap();
  useEffect(() => {
    if (!data || !selectedPlace) return;
    const selectedFeature = data.features.find(
      (f) => String(f.properties.id) === String(selectedPlace)
    );
    if (selectedFeature) {
      const layer = L.geoJSON(selectedFeature);
      map.fitBounds(layer.getBounds(), {
        padding: [40, 40],
        animate: true,
        duration: 0.9
      });
    }
  }, [data, selectedPlace, map]);
  return null;
}

/* ================= PAGE ================= */

function Explore() {
  useEffect(() => removeLeafletFocusStyle(), []);

  const [events, setEvents] = useState([]);
  const [places, setPlaces] = useState([]);
  const [categories, setCategories] = useState([]);
  const [municipalities, setMunicipalities] = useState(null);

  const [searchParams, setSearchParams] = useSearchParams();

  const selectedPlace = searchParams.get("place") || "";
  const selectedCategory = searchParams.get("category") || "";
  const fromDate = searchParams.get("from") || "";
  const toDate = searchParams.get("to") || "";

  const fetchEvents = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3000/events?${searchParams.toString()}`
      );
      setEvents(response.data);
    } catch {
      console.error("Error fetching events");
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [searchParams]);

  useEffect(() => {
    const fetchData = async () => {
      const placesRes = await axios.get("http://localhost:3000/places");
      const categoriesRes = await axios.get("http://localhost:3000/categories");
      const geoRes = await axios.get("http://localhost:3000/places/geo");

      setPlaces(placesRes.data);
      setCategories(categoriesRes.data);
      setMunicipalities(geoRes.data);
    };

    fetchData();
  }, []);

  const updateParam = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) newParams.set(key, value);
    else newParams.delete(key);
    setSearchParams(newParams);
  };

  const resetFilters = () => setSearchParams({});

  function formatDate(date) {
    if (!date) return "";
    return new Date(date).toLocaleDateString("hr-HR");
  }

  return (
    <div style={page}>

      {/* HEADER */}
      <div style={container}>
        <div style={pageHeader}>
          <h1 style={pageTitle}>Explore Events</h1>
          <p style={pageSubtitle}>
            Make plans, discover places and experience Dalmatia through various events
          </p>
        </div>
      </div>

      {/* FILTERS */}
      <div style={container}>
        <div style={filtersCard}>
          <div style={filtersGrid}>
            <select style={input} value={selectedPlace}
              onChange={(e) => updateParam("place", e.target.value)}>
              <option value="">All Places</option>
              {places.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>

            <select style={input} value={selectedCategory}
              onChange={(e) => updateParam("category", e.target.value)}>
              <option value="">All Categories</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>

            <input style={input} type="date" value={fromDate}
              onChange={(e) => updateParam("from", e.target.value)} />

            <input style={input} type="date" value={toDate}
              onChange={(e) => updateParam("to", e.target.value)} />

            <button style={resetBtn} onClick={resetFilters}>Reset</button>
          </div>
        </div>
      </div>

      {/* MAIN GRID */}
      <div style={container}>
        <div style={mainGrid}>

          {/* MAP */}
          <div style={mapCard}>
            <MapContainer
              style={{ height: "100%", width: "100%" }}
              zoom={8}
              minZoom={7.5}
              maxZoom={14}
              center={[43.0, 16.5]}
              maxBounds={DALMATIA_BOUNDS}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

              {municipalities && (
                <ZoomToSelected data={municipalities} selectedPlace={selectedPlace} />
              )}

              {municipalities && (
                <GeoJSON
                  data={municipalities}
                  style={(feature) => {
                    const isSelected =
                      String(feature.properties.id) === selectedPlace;
                    return {
                      color: isSelected ? "#b91c1c" : "#1e3a8a",
                      weight: isSelected ? 3 : 1,
                      fillColor: isSelected ? "#ef4444" : "#60a5fa",
                      fillOpacity: isSelected ? 0.4 : 0.1
                    };
                  }}
                  onEachFeature={(feature, layer) => {
                    const placeId = feature.properties.id;
                    layer.on({
                      click: (e) => {
                        updateParam("place", placeId);
                        e.originalEvent?.target?.blur();
                      }
                    });
                    layer.bindTooltip(feature.properties.name);
                  }}
                />
              )}

              {events.map((event) =>
                event.location_point ? (
                  <Marker
                    key={event.id}
                    position={[
                      event.location_point.coordinates[1],
                      event.location_point.coordinates[0]
                    ]}
                  >
                    <Popup>
                      <strong>{event.title}</strong>
                      <br />
                      {event.place_name}
                      <br />
                      <Link to={`/events/${event.id}`}>View details</Link>
                    </Popup>
                  </Marker>
                ) : null
              )}
            </MapContainer>
          </div>

          {/* LIST */}
          <div style={listCol}>
            {!selectedPlace ? (
              <div style={emptyBox}>Select a place on the map.</div>
            ) : events.length === 0 ? (
              <div style={emptyBox}>No events found.</div>
            ) : (
              events.map(event => (
                <Link key={event.id} to={`/events/${event.id}`} style={eventCard}>
                  <h3 style={eventTitle}>{event.title}</h3>
                  <p style={eventDesc}>{event.description ? event.description.slice(0, 50) +
                      (event.description.length > 50 ? "..." : "") : ""}
                  </p>
                  <div style={metaRow}>
                    <span>Location: {event.place_name}</span>
                    <span>{event.average_rating} ⭐ ({event.reviews_count})</span>
                  </div>
                    <div style={dateRow}>
                      <span>
                        {formatDate(event.date_start)}
                        {event.date_end ? ` — ${formatDate(event.date_end)}` : ""}
                      </span>
                    </div>
                </Link>
              ))
            )}
          </div>

        </div>
      </div>

    </div>
  );
}

export default Explore;

/* ================= STYLES ================= */

const container = { maxWidth: 1200, margin: "0 auto", padding: "0 20px" };

const page = { paddingBottom: 60 };

const pageHeader = { marginBottom: 16 };
const pageTitle = { fontSize: 32, fontWeight: 800 };
const pageSubtitle = { color: "#64748b" };

const filtersCard = {
  background: "white",
  borderRadius: 18,
  padding: 16,
  border: "1px solid #eef2f7",
  boxShadow: "0 12px 30px rgba(0,0,0,0.05)",
  marginBottom: 20
};

const filtersGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
  gap: 12
};

const input = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #e2e8f0",
  fontSize: 14
};

const resetBtn = {
  borderRadius: 10,
  border: "1px solid #e2e8f0",
  background: "#f8fafc",
  fontWeight: 600,
  cursor: "pointer"
};

const mainGrid = {
  display: "grid",
  gridTemplateColumns: "1.2fr 0.8fr",
  gap: 20
};

const mapCard = {
  height: 520,
  borderRadius: 20,
  overflow: "hidden",
  border: "1px solid #eef2f7",
  boxShadow: "0 20px 60px rgba(0,0,0,0.06)"
};

const listCol = { display: "flex", flexDirection: "column", gap: 12 };

const eventCard = {
  background: "white",
  borderRadius: 16,
  padding: 16,
  border: "1px solid #eef2f7",
  textDecoration: "none",
  color: "#0f172a",
  boxShadow: "0 10px 26px rgba(0,0,0,0.05)"
};

const eventTitle = { fontWeight: 700 };
const eventDesc = { color: "#64748b", fontSize: 14 };

const metaRow = {
  display: "flex",
  justifyContent: "space-between",
  marginTop: 8,
  fontSize: 13,
  color: "#475569"
};

const dateRow = {
  marginTop: 6,
  fontSize: 13,
  fontWeight: 600,
  color: "#334155"
};

const emptyBox = {
  background: "white",
  padding: 20,
  borderRadius: 16,
  border: "1px dashed #e2e8f0",
  textAlign: "center",
  color: "#64748b"
};