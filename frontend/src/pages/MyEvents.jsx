import { useEffect, useState } from "react";
import axios from "axios";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  GeoJSON
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import municipalitiesData from "../data/dalmatia-municipalities.json";

function MyEvents() {
  const token = localStorage.getItem("token");

  const [events, setEvents] = useState({
    past: [],
    current: [],
    future: []
  });

  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  if (!token) {
    return <p>You must be logged in to see this page.</p>;
  }

  const fetchMyEvents = async () => {
    try {
      const res = await axios.get(
        "http://localhost:3000/events/my",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setEvents(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyEvents();
  }, [token]);

  const deleteEvent = async (id) => {
    try {
      await axios.delete(
        `http://localhost:3000/events/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      fetchMyEvents();

    } catch {
      alert("Error deleting event");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div style={page}>
      <div style={container}>

        {/* HEADER */}
        <div style={pageHeader}>
          <div>
            <h1 style={pageTitle}>My Events</h1>
            <p style={pageSubtitle}>
              Manage events you created — edit upcoming ones or review past events.
            </p>
          </div>

          <button
            onClick={() => {
              setEditingEvent(null);
              setShowModal(true);
            }}
            style={primaryBtn}
          >
            + Create Event
          </button>
        </div>

        {/* BOARD */}
        <div style={board}>
          <Column title="Past" events={events.past} onDelete={deleteEvent} />

          <Column title="Current" events={events.current} onDelete={deleteEvent} />

          <Column
            title="Future"
            events={events.future}
            onDelete={deleteEvent}
            onEdit={(event) => {
              setEditingEvent(event);
              setShowModal(true);
            }}
            editable
          />
        </div>

        {/* MODAL */}
        {showModal && (
          <CreateEventModal
            key={editingEvent?.id || "new"}
            editingEvent={editingEvent}
            onClose={() => {
              setShowModal(false);
              setEditingEvent(null);
            }}
            onSaved={async () => {
              await fetchMyEvents();
              setShowModal(false);
              setEditingEvent(null);
            }}
          />
        )}

      </div>
    </div>
  );
}

function Column({ title, events, onDelete, editable, onEdit }) {
  return (
    <div style={column}>
      <div style={columnHeader}>
        <h3 style={columnTitle}>{title}</h3>
        <span style={countBadge}>{events.length}</span>
      </div>

      {events.length === 0 && (
        <div style={emptyColumn}>No events</div>
      )}

      {events.map(event => (
        <div key={event.id} style={eventCard}>
          <h4 style={eventTitle}>{event.title}</h4>

          <div style={eventMeta}>{event.place_name}</div>
          <div style={eventMeta}>
            {new Date(event.date_start).toLocaleDateString()}
          </div>

          <div style={cardActions}>
            {editable && (
              <button style={secondaryBtn} onClick={() => onEdit(event)}>
                Update
              </button>
            )}

            <button style={dangerBtn} onClick={() => onDelete(event.id)}>
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function CreateEventModal({ onClose, onCreated, editingEvent, onSaved }) {
  const token = localStorage.getItem("token");

  const [places, setPlaces] = useState([]);
  const [categories, setCategories] = useState([]);
  const [markerPosition, setMarkerPosition] = useState(null);

  const today = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    organizer_name: editingEvent?.organizer_name || "",
    organizer_surname: editingEvent?.organizer_surname || "",
    organizer_email: editingEvent?.organizer_email || "",
    organizer_phone: editingEvent?.organizer_phone || "",
    title: editingEvent?.title || "",
    description: editingEvent?.description || "",
    place_id: editingEvent?.place_id || "",
    category_id: editingEvent?.category_id || "",
    price: editingEvent?.price || "",
    date_start: editingEvent?.date_start?.slice(0, 10) || "",
    date_end: editingEvent?.date_end?.slice(0, 10) || "",
    latitude: null,
    longitude: null,
    image_url: editingEvent?.image_url || ""
  });

  useEffect(() => {
    if (!editingEvent) return;

    setForm({
      organizer_name: editingEvent.organizer_name || "",
      organizer_surname: editingEvent.organizer_surname || "",
      organizer_email: editingEvent.organizer_email || "",
      organizer_phone: editingEvent.organizer_phone || "",
      title: editingEvent.title || "",
      description: editingEvent.description || "",
      place_id: editingEvent.place_id || "",
      category_id: editingEvent.category_id || "",
      price: editingEvent.price ?? "",
      date_start: editingEvent.date_start?.slice(0, 10) || "",
      date_end: editingEvent.date_end?.slice(0, 10) || "",
      latitude: null,
      longitude: null,
      image_url: editingEvent.image_url || ""
    });

    // also restore marker position
    if (editingEvent.location_point?.coordinates) {
      setMarkerPosition({
        lat: editingEvent.location_point.coordinates[1],
        lng: editingEvent.location_point.coordinates[0]
      });
    }

  }, [editingEvent]);

  useEffect(() => {
    const fetchData = async () => {
      const placesRes = await axios.get("http://localhost:3000/places");
      const categoriesRes = await axios.get("http://localhost:3000/categories");

      setPlaces(placesRes.data);
      setCategories(categoriesRes.data);
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const selectedPlace = places.find(
    p => p.id === Number(form.place_id)
  );

  function ZoomToMunicipality({ selectedPlace }) {
    const map = useMapEvents({});

    useEffect(() => {
      if (!selectedPlace) return;

      const feature = municipalitiesData.features.find(
        f => f.properties.NAME_2 === selectedPlace.name
      );

      if (!feature) return;

      const layer = L.geoJSON(feature);
      map.fitBounds(layer.getBounds());

    }, [selectedPlace, map]);

    return null;
  }

  function LocationPicker() {
    useMapEvents({
      click(e) {
        if (!selectedPlace) {
          alert("Please select municipality first.");
          return;
        }

        const feature = municipalitiesData.features.find(
          f => f.properties.NAME_2 === selectedPlace.name
        );

        if (!feature) return;

        const polygonLayer = L.geoJSON(feature);
        const bounds = polygonLayer.getBounds();

        if (!bounds.contains(e.latlng)) {
          alert("You must click inside selected municipality.");
          return;
        }

        setMarkerPosition(e.latlng);

        setForm(prev => ({
          ...prev,
          latitude: e.latlng.lat,
          longitude: e.latlng.lng
        }));
      }
    });

    return markerPosition ? (
      <Marker position={markerPosition} />
    ) : null;
  }

  const handleSubmit = async () => {
    try {
      const payload = {
        ...form,
        price:
          form.price === "" || form.price === null
            ? null
            : Number(form.price)
      };

      // ⭐ ONLY send location if user picked new marker
      if (form.latitude == null || form.longitude == null) {
        delete payload.latitude;
        delete payload.longitude;
      }

      const res = editingEvent
        ? await axios.put(
            `http://localhost:3000/events/${editingEvent.id}`,
            payload,
            { headers: { Authorization: `Bearer ${token}` } }
          )
        : await axios.post(
            "http://localhost:3000/events",
            payload,
            { headers: { Authorization: `Bearer ${token}` } }
          );

      onSaved(res.data);

    } catch (err) {
      console.error(err); // ⭐ IMPORTANT — keep this
      alert(err.response?.data?.message || "Error saving event");
    }
  };

  return (
    <div style={overlayStyle}>
      <div style={modalCard}>

        {/* HEADER */}
        <div style={modalHeader}>
          <div>
            <h3 style={modalTitle}>
              {editingEvent ? "Update Event" : "Create Event"}
            </h3>
            <p style={modalSubtitle}>
              Fill event details and pick location on the map.
            </p>
          </div>

          <button style={closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* FORM */}
        <div style={formGrid}>

          <input style={input} name="organizer_name" placeholder="Name" value={form.organizer_name} onChange={handleChange} />
          <input style={input} name="organizer_surname" placeholder="Surname" value={form.organizer_surname} onChange={handleChange} />
          <input style={input} name="organizer_email" placeholder="E-mail" value={form.organizer_email} onChange={handleChange} />
          <input style={input} name="organizer_phone" placeholder="Phone" value={form.organizer_phone} onChange={handleChange} />

          <input style={inputFull} name="title" placeholder="Event Title" value={form.title} onChange={handleChange} />
          <textarea style={textarea} name="description" placeholder="Description" value={form.description} onChange={handleChange} />

          <select style={input} name="place_id" value={form.place_id} onChange={handleChange}>
            <option value="">Select Municipality</option>
            {places.map(place => (
              <option key={place.id} value={place.id}>{place.name}</option>
            ))}
          </select>

          <select style={input} name="category_id" value={form.category_id} onChange={handleChange}>
            <option value="">Select Category</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>

          <input style={input} type="date" name="date_start" value={form.date_start} min={today} onChange={handleChange} />
          <input style={input} type="date" name="date_end" value={form.date_end} min={form.date_start || today} onChange={handleChange} />

          <input style={input} name="price" type="number" placeholder="Price (€)" value={form.price ?? ""} onChange={handleChange} />
        </div>

        {/* MAP */}
        <div style={mapWrapper}>
          <MapContainer center={[43.5, 16.5]} zoom={8} style={{ height: "100%", width: "100%" }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            <GeoJSON
              data={municipalitiesData}
              style={(feature) => ({
                color:
                  selectedPlace &&
                  feature.properties.NAME_2 === selectedPlace.name
                    ? "#ef4444"
                    : "#1e3a8a",
                weight:
                  selectedPlace &&
                  feature.properties.NAME_2 === selectedPlace.name
                    ? 3
                    : 1,
                fillOpacity:
                  selectedPlace &&
                  feature.properties.NAME_2 === selectedPlace.name
                    ? 0.2
                    : 0.05
              })}
            />

            <ZoomToMunicipality selectedPlace={selectedPlace} />
            <LocationPicker />
          </MapContainer>
        </div>

        {/* ACTIONS */}
        <div style={modalActions}>
          <button style={secondaryBtn} onClick={onClose}>Cancel</button>
          <button style={primaryBtn} onClick={handleSubmit}>
            {editingEvent ? "Save Changes" : "Create Event"}
          </button>
        </div>

      </div>
    </div>
  );
}

/* PAGE */

const page = { paddingBottom: 60 };

const container = {
  maxWidth: 1200,
  margin: "0 auto",
  padding: "0 20px"
};

const pageHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 24
};

const pageTitle = { fontSize: 32, fontWeight: 800 };
const pageSubtitle = { color: "#64748b", marginTop: 4 };

/* BOARD */

const board = {
  display: "grid",
  gridTemplateColumns: "repeat(3,1fr)",
  gap: 20
};

const column = {
  background: "#f8fafc",
  padding: 16,
  borderRadius: 20,
  border: "1px solid #eef2f7",
  minHeight: 320
};

const columnHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 12
};

const columnTitle = { fontWeight: 800 };

const countBadge = {
  background: "white",
  borderRadius: 999,
  padding: "2px 10px",
  fontSize: 12,
  border: "1px solid #e2e8f0"
};

const emptyColumn = {
  padding: 20,
  textAlign: "center",
  color: "#64748b"
};

/* EVENT CARD */

const eventCard = {
  background: "white",
  borderRadius: 16,
  padding: 14,
  marginBottom: 12,
  border: "1px solid #eef2f7",
  boxShadow: "0 8px 24px rgba(0,0,0,0.05)"
};

const eventTitle = { fontWeight: 700, marginBottom: 4 };

const eventMeta = {
  fontSize: 13,
  color: "#64748b"
};

const cardActions = {
  display: "flex",
  gap: 8,
  marginTop: 10
};

const dangerBtn = {
  borderRadius: 10,
  border: "none",
  background: "#ef4444",
  color: "white",
  padding: "6px 10px",
  cursor: "pointer",
  fontWeight: 600
};




const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(2,6,23,0.55)",
  backdropFilter: "blur(4px)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 20000
};

const modalCard = {
  width: 620,
  maxHeight: "92vh",
  overflowY: "auto",
  background: "white",
  borderRadius: 24,
  padding: 24,
  boxShadow: "0 40px 120px rgba(0,0,0,0.35)"
};

const modalHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  marginBottom: 16
};

const modalTitle = { fontSize: 22, fontWeight: 800 };
const modalSubtitle = { color: "#64748b", fontSize: 14 };

const closeBtn = {
  border: "none",
  background: "#f1f5f9",
  borderRadius: 10,
  width: 32,
  height: 32,
  cursor: "pointer",
  fontWeight: 700
};

/* FORM */

const formGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(2,1fr)",
  gap: 10,
  marginBottom: 14
};

const input = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #e2e8f0"
};

const inputFull = { ...input, gridColumn: "1 / -1" };

const textarea = {
  ...input,
  gridColumn: "1 / -1",
  minHeight: 90,
  resize: "vertical"
};

/* MAP */

const mapWrapper = {
  height: 280,
  borderRadius: 18,
  overflow: "hidden",
  border: "1px solid #eef2f7",
  marginTop: 6
};

/* ACTIONS */

const modalActions = {
  display: "flex",
  justifyContent: "flex-end",
  gap: 10,
  marginTop: 16
};

const primaryBtn = {
  padding: "12px 18px",
  borderRadius: 12,
  border: "none",
  background: "linear-gradient(135deg,#2563eb,#4f46e5)",
  color: "white",
  fontWeight: 700,
  cursor: "pointer"
};

const secondaryBtn = {
  padding: "12px 18px",
  borderRadius: 12,
  border: "1px solid #e2e8f0",
  background: "white",
  fontWeight: 600,
  cursor: "pointer"
};

export default MyEvents;
