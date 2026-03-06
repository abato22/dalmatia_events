import { useEffect, useState, useRef } from "react";
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

import "leaflet/dist/leaflet.css";

const yellowPin = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-yellow.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 35],
  iconAnchor: [12, 31],
  popupAnchor: [1, -34],
  shadowSize: [21, 21]
});

const DALMATIA_BOUNDS = [
  [42.0, 14.4],
  [45.0, 18.65]
];

let isMapDragging = false;

// We updated this to inject our shadow/dimming effects on the map tiles
const injectCustomMapStyles = () => {
  const style = document.createElement("style");
  style.innerHTML = `
    .leaflet-interactive:focus { outline: none !important; }
    .leaflet-tile-pane { 
      filter: brightness(0.6) contrast(1.1) grayscale(0.7) !important; 
    }
    
    /* CSS Hover for the color (The fix that worked) */
    path.leaflet-interactive:hover {
      fill: #ef4444 !important;
      fill-opacity: 0.35 !important;
      stroke: #ffffff !important;
      stroke-width: 3px !important;
    }

    /* Transition for smooth color fading */
    path.leaflet-interactive {
      transition: fill 0.2s, fill-opacity 0.2s, stroke-width 0.2s;
    }

    /* Make the tooltip look nice */
    .leaflet-tooltip {
      background: #0f172a !important;
      color: white !important;
      border: none !important;
      border-radius: 6px !important;
      padding: 4px 8px !important;
      font-weight: 600 !important;
      box-shadow: 0 4px 6px rgba(0,0,0,0.3) !important;
    }
    .leaflet-tooltip-top:before { border-top-color: #0f172a !important; }
  `;
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

function SafeMapWatcher() {
  const map = useMap();
  
  useEffect(() => {
    const handleMoveStart = () => {
      isMapDragging = true;
      // Instantly hide our custom HTML tooltip
      const tooltip = document.getElementById("custom-map-tooltip");
      if (tooltip) tooltip.style.display = "none";
    };

    const handleMoveEnd = () => {
      isMapDragging = false;
    };

    map.on("movestart dragstart zoomstart", handleMoveStart);
    map.on("moveend dragend zoomend", handleMoveEnd);

    return () => {
      map.off("movestart dragstart zoomstart", handleMoveStart);
      map.off("moveend dragend zoomend", handleMoveEnd);
    };
  }, [map]);

  return null;
}

/* ================= PAGE ================= */

function Explore() {
  useEffect(() => injectCustomMapStyles(), []);

  const [events, setEvents] = useState([]);
  const [places, setPlaces] = useState([]);
  const [categories, setCategories] = useState([]);
  const [municipalities, setMunicipalities] = useState(null);

  const [searchParams, setSearchParams] = useSearchParams();

  const selectedPlace = searchParams.get("place") || "";
  const selectedCategory = searchParams.get("category") || "";
  const fromDate = searchParams.get("from") || "";
  const toDate = searchParams.get("to") || "";

  // We use a Ref to track the selection so the Leaflet events 
  // always know the "current" selected ID without needing a re-render/key change.
  const geoJsonRef = useRef(null);
  const selectedPlaceRef = useRef(selectedPlace);

  // Sync the ref whenever the state changes
  useEffect(() => {
    selectedPlaceRef.current = selectedPlace;
    // Manually trigger a style refresh across the map when selection changes
    if (geoJsonRef.current) {
      geoJsonRef.current.setStyle(getLayerStyle);
    }
  }, [selectedPlace]);

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
    return new Date(date).toLocaleDateString("hr-HR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  }

  // Define the style logic in a standalone function so both 
  // the 'style' prop and 'mouseout' can use it.
  const getLayerStyle = (feature) => {
    const isSelected = String(feature.properties.id) === selectedPlaceRef.current;
    return {
      color: isSelected ? "#ffffff" : "#e2e8f0",
      weight: isSelected ? 3 : 1.5,
      fillColor: isSelected ? "#ef4444" : "#3b82f6",
      fillOpacity: isSelected ? 0.35 : 0.35,
    };
  };

  return (
    <div style={page}>
      <div style={container}>
        
        {/* HEADER */}
        <div style={pageHeader}>
          <h1 style={pageTitle}>Explore Dalmatia</h1>
          <p style={pageSubtitle}>
            Discover places, make plans, and experience the best local events.
          </p>
        </div>

        {/* FILTERS */}
        <div style={filtersCard}>
          <div style={filtersGrid}>
            <div style={inputGroup}>
              <label style={inputLabel}>Location</label>
              <select style={input} value={selectedPlace}
                onChange={(e) => updateParam("place", e.target.value)}>
                <option value="">All Places</option>
                {places.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>

            <div style={inputGroup}>
              <label style={inputLabel}>Category</label>
              <select style={input} value={selectedCategory}
                onChange={(e) => updateParam("category", e.target.value)}>
                <option value="">All Categories</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div style={inputGroup}>
              <label style={inputLabel}>From Date</label>
              <input style={input} type="date" value={fromDate}
                onChange={(e) => updateParam("from", e.target.value)} />
            </div>

            <div style={inputGroup}>
              <label style={inputLabel}>To Date</label>
              <input style={input} type="date" value={toDate}
                onChange={(e) => updateParam("to", e.target.value)} />
            </div>

            <div style={{...inputGroup, justifyContent: "flex-end"}}>
              <button style={resetBtn} onClick={resetFilters}>Reset Filters</button>
            </div>
          </div>
        </div>

        {/* MAIN LAYOUT */}
        <div style={mainLayout}>

          <div 
            id="custom-map-tooltip" 
            style={{
              position: "fixed",
              display: "none",
              zIndex: 9999,
              pointerEvents: "none",
              background: "#0f172a",
              color: "#ffffff",
              padding: "5px 10px",
              borderRadius: "6px",
              fontSize: "13px",
              fontWeight: 600,
              boxShadow: "0 4px 6px rgba(0,0,0,0.2)"
            }}
          ></div>
          
          {/* MAP */}
          <div style={mapWrapper}>
            <MapContainer
              style={{ height: "100%", width: "100%", backgroundColor: "#1e293b" }}
              zoom={8}
              minZoom={7.5}
              maxZoom={16}
              center={[43.0, 15.5]}
              maxBounds={DALMATIA_BOUNDS}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

              <SafeMapWatcher />

              {municipalities && (
                <ZoomToSelected data={municipalities} selectedPlace={selectedPlace} />
              )}

              {municipalities && (
                <GeoJSON
                  ref={geoJsonRef}
                  data={municipalities}
                  // This function handles the "Permanent" state (Blue vs Selected Red)
                  style={(feature) => {
                    const isSelected = String(feature.properties.id) === selectedPlaceRef.current;
                    return {
                      color: isSelected ? "#ffffff" : "#e2e8f0",
                      weight: isSelected ? 3 : 1.5,
                      fillColor: isSelected ? "#ef4444" : "#3b82f6",
                      fillOpacity: isSelected ? 0.35 : 0.35,
                    };
                  }}
                  onEachFeature={(feature, layer) => {
                    layer.on({
                      click: () => updateParam("place", String(feature.properties.id)),
                      
                      mouseover: (e) => {
                        // If dragging, absolutely do not show the tooltip
                        if (isMapDragging) return;
                        
                        const tooltip = document.getElementById("custom-map-tooltip");
                        if (tooltip) {
                          tooltip.style.display = "block";
                          tooltip.innerText = feature.properties.name;
                          tooltip.style.left = e.originalEvent.clientX + 15 + "px";
                          tooltip.style.top = e.originalEvent.clientY - 30 + "px";
                        }
                      },
                      
                      mousemove: (e) => {
                        if (isMapDragging) return;
                        
                        const tooltip = document.getElementById("custom-map-tooltip");
                        if (tooltip && tooltip.style.display === "block") {
                          tooltip.style.left = e.originalEvent.clientX + 15 + "px";
                          tooltip.style.top = e.originalEvent.clientY - 30 + "px";
                        }
                      },
                      
                      mouseout: () => {
                        const tooltip = document.getElementById("custom-map-tooltip");
                        if (tooltip) tooltip.style.display = "none";
                      }
                    });
                  }}
                />
              )}

              {events.map((event) =>
                event.location_point ? (
                  <Marker
                    key={event.id}
                    icon={yellowPin}
                    position={[
                      event.location_point.coordinates[1],
                      event.location_point.coordinates[0]
                    ]}
                  >
                    <Popup className="modern-popup">
                      <strong style={{ display: 'block', fontSize: '15px', marginBottom: '4px', color: '#0f172a' }}>{event.title}</strong>
                      <span style={{ color: '#64748b', fontSize: '13px' }}>{event.place_name}</span>
                      <div style={{ marginTop: '8px' }}>
                        <Link to={`/events/${event.id}`} style={popupLink}>View details &rarr;</Link>
                      </div>
                    </Popup>
                  </Marker>
                ) : null
              )}
            </MapContainer>
          </div>

          {/* LIST */}
          <div style={listCol}>
            <div style={listHeader}>
              <h2 style={listTitle}>
                {selectedPlace ? "Events in this area" : "Featured Events"}
              </h2>
              <span style={eventCount}>{events.length} found</span>
            </div>

            <div style={scrollableList}>
              {!selectedPlace && events.length === 0 ? (
                <div style={emptyStateBox}>
                  <p style={emptyStateText}>Select a place on the map to see events.</p>
                </div>
              ) : events.length === 0 ? (
                <div style={emptyStateBox}>
                  <p style={emptyStateText}>No events found matching your filters.</p>
                </div>
              ) : (
                events.map(event => (
                  <Link key={event.id} to={`/events/${event.id}`} style={eventCard}>
                    <div style={cardHeader}>
                      <h3 style={eventTitle}>{event.title}</h3>
                      <span style={ratingBadge}>
                        ⭐ {event.average_rating || "N/A"} <span style={{ opacity: 0.7, fontSize: '11px' }}>({event.reviews_count || 0})</span>
                      </span>
                    </div>
                    
                    <p style={eventDesc}>
                      {event.description 
                        ? event.description.slice(0, 75) + (event.description.length > 75 ? "..." : "") 
                        : "No description available."}
                    </p>
                    
                    <div style={cardFooter}>
                      <span style={footerItem}>
                        📍 {event.place_name}
                      </span>
                      <span style={footerItem}>
                        📅 {formatDate(event.date_start)}
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
    </div>
  );
}

export default Explore;

/* ================= STYLES ================= */

const page = { 
  backgroundColor: "#f8fafc", 
  minHeight: "100vh",
  padding: "40px 0 80px 0",
  fontFamily: "system-ui, -apple-system, sans-serif"
};

const container = { 
  maxWidth: 1300, 
  margin: "0 auto", 
  padding: "0 24px" 
};

/* --- Header --- */
const pageHeader = { 
  marginBottom: 28,
  textAlign: "left"
};
const pageTitle = { 
  fontSize: 36, 
  fontWeight: 800, 
  color: "#0f172a",
  letterSpacing: "-0.5px",
  margin: "0 0 8px 0"
};
const pageSubtitle = { 
  fontSize: 16,
  color: "#64748b",
  margin: 0
};

/* --- Filters --- */
const filtersCard = {
  background: "#ffffff",
  borderRadius: 16,
  padding: "20px 24px",
  border: "1px solid #e2e8f0",
  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -2px rgba(0,0,0,0.02)",
  marginBottom: 24
};

const filtersGrid = {
  display: "flex",
  flexWrap: "wrap",
  gap: 16,
  alignItems: "flex-end"
};

const inputGroup = {
  display: "flex",
  flexDirection: "column",
  flex: "1 1 180px",
  minWidth: 160
};

const inputLabel = {
  fontSize: 12,
  fontWeight: 600,
  color: "#475569",
  marginBottom: 6,
  textTransform: "uppercase",
  letterSpacing: "0.5px"
};

const input = {
  padding: "12px 14px",
  borderRadius: 10,
  border: "1px solid #cbd5e1",
  fontSize: 14,
  color: "#1e293b",
  backgroundColor: "#fcfcfd",
  outline: "none",
  transition: "border-color 0.2s"
};

const resetBtn = {
  padding: "12px 24px",
  borderRadius: 10,
  border: "none",
  background: "#0f172a",
  color: "#ffffff",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
  height: "43px",
  transition: "background 0.2s",
  width: "100%"
};

/* --- Main Layout --- */
const mainLayout = {
  display: "flex",
  flexWrap: "wrap",
  gap: 24,
  alignItems: "flex-start"
};

/* --- Map --- */
const mapWrapper = {
  flex: "1 1 600px",
  height: "calc(100vh - 280px)",
  minHeight: 500,
  borderRadius: 20,
  overflow: "hidden",
  border: "1px solid #e2e8f0",
  boxShadow: "0 10px 15px -3px rgba(0,0,0,0.04), 0 4px 6px -4px rgba(0,0,0,0.02)",
  background: "#1e293b" // Dark skeleton color to match our dimming effect
};

const popupLink = {
  display: "inline-block",
  color: "#2563eb",
  textDecoration: "none",
  fontWeight: 600,
  fontSize: "13px"
};

/* --- List --- */
const listCol = { 
  flex: "1 1 400px",
  display: "flex", 
  flexDirection: "column", 
  gap: 16,
  height: "calc(100vh - 280px)",
  minHeight: 500
};

const listHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  paddingBottom: 8,
  borderBottom: "1px solid #e2e8f0"
};

const listTitle = {
  margin: 0,
  fontSize: 18,
  fontWeight: 700,
  color: "#0f172a"
};

const eventCount = {
  fontSize: 13,
  fontWeight: 600,
  color: "#64748b",
  backgroundColor: "#f1f5f9",
  padding: "4px 10px",
  borderRadius: 20
};

const scrollableList = {
  display: "flex",
  flexDirection: "column",
  gap: 14,
  overflowY: "auto",
  paddingRight: 6,
  paddingBottom: 20
};

/* --- Event Card --- */
const eventCard = {
  display: "flex",
  flexDirection: "column",
  background: "#ffffff",
  borderRadius: 14,
  padding: 18,
  border: "1px solid #e2e8f0",
  textDecoration: "none",
  color: "inherit",
  transition: "transform 0.15s ease, box-shadow 0.15s ease",
  boxShadow: "0 1px 3px 0 rgba(0,0,0,0.05)"
};

const cardHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 12,
  marginBottom: 8
};

const eventTitle = { 
  margin: 0,
  fontWeight: 700, 
  fontSize: 16,
  color: "#0f172a",
  lineHeight: 1.3
};

const ratingBadge = {
  whiteSpace: "nowrap",
  fontSize: 13,
  fontWeight: 600,
  color: "#b45309",
  background: "#fef3c7",
  padding: "4px 8px",
  borderRadius: 8
};

const eventDesc = { 
  margin: "0 0 16px 0",
  color: "#64748b", 
  fontSize: 14,
  lineHeight: 1.5
};

const cardFooter = {
  display: "flex",
  flexWrap: "wrap",
  gap: 12,
  marginTop: "auto",
  paddingTop: 12,
  borderTop: "1px dashed #e2e8f0"
};

const footerItem = {
  fontSize: 13,
  fontWeight: 500,
  color: "#475569",
  display: "flex",
  alignItems: "center",
  gap: 4
};

const emptyStateBox = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#ffffff",
  height: 150,
  borderRadius: 14,
  border: "2px dashed #cbd5e1",
  textAlign: "center"
};

const emptyStateText = {
  color: "#64748b",
  fontSize: 15,
  fontWeight: 500
};