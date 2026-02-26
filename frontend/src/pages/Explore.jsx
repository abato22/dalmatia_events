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
  [42.1, 14.8], // southwest (lat, lng)
  [44.8, 18.5]  // northeast
];


// Remove focus outline only for Leaflet interactive paths
const removeLeafletFocusStyle = () => {
  const style = document.createElement("style");
  style.innerHTML = `
    .leaflet-interactive:focus {
      outline: none !important;
    }
  `;
  document.head.appendChild(style);
};


// Auto-fit helper
function FitBounds({ data }) {
  const map = useMap();

  useEffect(() => {
    if (!data) return;
    const layer = L.geoJSON(data);
    map.fitBounds(layer.getBounds(), {
      padding: [180, 180],
      maxZoom: 20
    });
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
        duration: 0.9,
        easeLinearity: 0.25
      });
    }
  }, [data, selectedPlace, map]);

  return null;
}


function Explore() {

  useEffect(() => {
    removeLeafletFocusStyle();
  }, []);

  const [events, setEvents] = useState([]);
  const [places, setPlaces] = useState([]);
  const [categories, setCategories] = useState([]);
  const [municipalities, setMunicipalities] = useState(null);

  const [searchParams, setSearchParams] = useSearchParams();

  const selectedPlace = searchParams.get("place") || "";
  const selectedCategory = searchParams.get("category") || "";
  const fromDate = searchParams.get("from") || "";
  const toDate = searchParams.get("to") || "";

  // Fetch events
  const fetchEvents = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3000/events?${searchParams.toString()}`
      );
      setEvents(response.data);
    } catch (err) {
      console.error("Error fetching events");
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [searchParams]);

  // Load filters + municipalities
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

  const resetFilters = () => {
    setSearchParams({});
  };

  return (
    <div>
      <h2>Explore Events</h2>

      {/* FILTERS */}
      <div style={{ marginBottom: "20px" }}>
        <select
          value={selectedPlace}
          onChange={(e) => updateParam("place", e.target.value)}
        >
          <option value="">All Places</option>
          {places.map((place) => (
            <option key={place.id} value={place.id}>
              {place.name}
            </option>
          ))}
        </select>

        <select
          value={selectedCategory}
          onChange={(e) => updateParam("category", e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={fromDate}
          onChange={(e) => updateParam("from", e.target.value)}
        />

        <input
          type="date"
          value={toDate}
          onChange={(e) => updateParam("to", e.target.value)}
        />

        <button onClick={resetFilters}>Reset</button>
      </div>

      {/* MAP */}
      <div style={{ height: "500px", marginBottom: "20px" }}>
        <MapContainer
          style={{ height: "100%", width: "100%" }}
          zoom={8}
          minZoom={8}
          maxZoom={14}
          center={[43.5, 16.5]}
          maxBounds={DALMATIA_BOUNDS}       
          maxBoundsViscosity={1.0}  
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {municipalities && (
            <ZoomToSelected
              data={municipalities}
              selectedPlace={selectedPlace}
            />
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
                  mouseover: (e) => {
                    if (String(placeId) !== selectedPlace) {
                      e.target.setStyle({
                        fillOpacity: 0.3,
                        weight: 2
                      });
                    }
                  },
                  mouseout: (e) => {
                    if (String(placeId) !== selectedPlace) {
                      e.target.setStyle({
                        fillOpacity: 0.1,
                        weight: 1
                      });
                    }
                  },
                  click: (e) => {
                    updateParam("place", placeId);

                    // 🔥 Remove focus outline immediately
                    if (e.originalEvent && e.originalEvent.target) {
                      e.originalEvent.target.blur();
                    }
                  }
                });

                layer.bindTooltip(feature.properties.name);
              }}
            />
          )}


          {/* Event markers */}
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
                  <Link to={`/events/${event.id}`}>
                    View details
                  </Link>
                </Popup>
              </Marker>
            ) : null
          )}
        </MapContainer>
      </div>

      {/* EVENTS LIST */}
      {events.length === 0 ? (
        <p>No events found.</p>
      ) : (
        events.map((event) => (
          <Link
            key={event.id}
            to={`/events/${event.id}`}
            style={{ textDecoration: "none", color: "black" }}
          >
            <div
              style={{
                border: "1px solid #ccc",
                padding: "10px",
                marginBottom: "10px",
                cursor: "pointer"
              }}
            >
              <h3>{event.title}</h3>
              <p>{event.description}</p>
              <p><strong>Place:</strong> {event.place_name}</p>
              <p>
                <strong>Rating:</strong> {event.average_rating} ⭐ ({event.reviews_count})
              </p>
            </div>
          </Link>
        ))
      )}
    </div>
  );
}

export default Explore;
