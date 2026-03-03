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
import markerShadow from "leaflet/dist/images/marker-shadow.png";

/* DESIGN TOKENS */
const DALMA_BLUE = "#2563eb";
const DALMA_YELLOW = "#facc15";
const TEXT_MAIN = "#0f172a";
const TEXT_MUTED = "#64748b";

const yellowPin = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-yellow.png",
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function MyEvents() {
  const token = localStorage.getItem("token");
  const [events, setEvents] = useState({ past: [], current: [], future: [] });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  const fetchMyEvents = async () => {
    try {
      const res = await axios.get("http://localhost:3000/events/my", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEvents(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchMyEvents();
  }, [token]);

  const deleteEvent = async (id) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    try {
      await axios.delete(`http://localhost:3000/events/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchMyEvents();
    } catch {
      alert("Error deleting event");
    }
  };

  if (!token) return <div style={msgContainer}>Please log in to manage events.</div>;
  if (loading) return <div style={msgContainer}>Loading your dashboard...</div>;

  return (
    <div style={pageWrapper}>
      <div style={container}>
        {/* HEADER */}
        <div style={pageHeader}>
          <div>
            <h1 style={pageTitle}>My Events</h1>
            <p style={pageSubtitle}>Dashboard for managing your local Dalmatian experiences.</p>
          </div>
          <button
            onClick={() => { setEditingEvent(null); setShowModal(true); }}
            style={primaryBtn}
          >
            + Create New Event
          </button>
        </div>

        {/* BOARD */}
        <div style={board}>
          <Column title="Past" events={events.past} onDelete={deleteEvent} />
          <Column title="Current" events={events.current} onDelete={deleteEvent} accent={DALMA_BLUE} />
          <Column
            title="Future"
            events={events.future}
            onDelete={deleteEvent}
            onEdit={(event) => { setEditingEvent(event); setShowModal(true); }}
            editable
            accent={DALMA_YELLOW}
          />
        </div>

        {/* MODAL */}
        {showModal && (
          <CreateEventModal
            key={editingEvent?.id || "new"}
            editingEvent={editingEvent}
            onClose={() => { setShowModal(false); setEditingEvent(null); }}
            onSaved={async () => { await fetchMyEvents(); setShowModal(false); setEditingEvent(null); }}
          />
        )}
      </div>
    </div>
  );
}

function Column({ title, events, onDelete, editable, onEdit, accent }) {
  return (
    <div style={column}>
      <div style={columnHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ ...statusDot, background: accent || '#cbd5e1' }} />
          <h3 style={columnTitle}>{title}</h3>
        </div>
        <span style={countBadge}>{events.length}</span>
      </div>

      <div style={cardList}>
        {events.length === 0 ? (
          <div style={emptyColumn}>No {title.toLowerCase()} events</div>
        ) : (
          events.map(event => (
            <div key={event.id} style={eventCard}>
              <h4 style={eventTitle}>{event.title}</h4>
              <div style={eventMeta}>📍 {event.place_name}</div>
              <div style={eventMeta}>📅 {new Date(event.date_start).toLocaleDateString("hr-HR")}</div>

              <div style={cardActions}>
                {editable && (
                  <button style={actionBtnEdit} onClick={() => onEdit(event)}>Edit</button>
                )}
                <button style={actionBtnDelete} onClick={() => onDelete(event.id)}>Delete</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function CreateEventModal({ onClose, editingEvent, onSaved }) {
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
    const fetchData = async () => {
      const [pRes, cRes] = await Promise.all([
        axios.get("http://localhost:3000/places"),
        axios.get("http://localhost:3000/categories")
      ]);
      setPlaces(pRes.data);
      setCategories(cRes.data);
    };
    fetchData();
    if (editingEvent?.location_point?.coordinates) {
      setMarkerPosition({
        lat: editingEvent.location_point.coordinates[1],
        lng: editingEvent.location_point.coordinates[0]
      });
    }
  }, [editingEvent]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const selectedPlace = places.find(p => p.id === Number(form.place_id));

  const handleSubmit = async () => {
    try {
      const payload = { ...form, price: form.price === "" ? null : Number(form.price) };
      if (form.latitude == null) { delete payload.latitude; delete payload.longitude; }
      const method = editingEvent ? 'put' : 'post';
      const url = editingEvent ? `http://localhost:3000/events/${editingEvent.id}` : "http://localhost:3000/events";
      const res = await axios[method](url, payload, { headers: { Authorization: `Bearer ${token}` } });
      onSaved(res.data);
    } catch (err) {
      alert(err.response?.data?.message || "Error saving event");
    }
  };

  return (
    <div style={overlayStyle}>
      <div style={modalCard}>
        <div style={modalHeader}>
          <div>
            <h3 style={modalTitle}>{editingEvent ? "Update Event" : "Create New Event"}</h3>
            <p style={modalSubtitle}>Set the details and pinpoint the exact location.</p>
          </div>
          <button style={closeBtn} onClick={onClose}>✕</button>
        </div>

        <div style={modalScrollArea}>
          <div style={formSectionTitle}>Organizer Information</div>
          <div style={formGrid}>
            <input style={input} name="organizer_name" placeholder="Name" value={form.organizer_name} onChange={handleChange} />
            <input style={input} name="organizer_surname" placeholder="Surname" value={form.organizer_surname} onChange={handleChange} />
            <input style={input} name="organizer_email" placeholder="E-mail" value={form.organizer_email} onChange={handleChange} />
            <input style={input} name="organizer_phone" placeholder="Phone" value={form.organizer_phone} onChange={handleChange} />
          </div>

          <div style={formSectionTitle}>Event Details</div>
          <div style={formGrid}>
            <input style={inputFull} name="title" placeholder="Event Title" value={form.title} onChange={handleChange} />
            <textarea style={textarea} name="description" placeholder="What is this event about?" value={form.description} onChange={handleChange} />
            <select style={input} name="place_id" value={form.place_id} onChange={handleChange}>
              <option value="">Select Municipality</option>
              {places.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <select style={input} name="category_id" value={form.category_id} onChange={handleChange}>
              <option value="">Select Category</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input
                style={input}
                name="date_start"
                value={form.date_start}
                min={today}
                onChange={handleChange}
                placeholder="Start Date"
                type={form.date_start ? "date" : "text"} // Switches type when value exists
                onFocus={(e) => (e.target.type = "date")}
                onBlur={(e) => !form.date_start && (e.target.type = "text")}
            />
            <input
                style={input}
                name="date_end"
                value={form.date_end}
                min={form.date_start || today}
                onChange={handleChange}
                placeholder="End Date"
                type={form.date_end ? "date" : "text"}
                onFocus={(e) => (e.target.type = "date")}
                onBlur={(e) => !form.date_end && (e.target.type = "text")}
            />
            <input style={inputFull} name="price" type="number" placeholder="Price (€) - Leave empty if free" value={form.price ?? ""} onChange={handleChange} />
          </div>

          <div style={formSectionTitle}>Location Picker</div>
          <div style={mapWrapper}>
            <MapContainer center={[43.5, 16.5]} zoom={8} style={{ height: "100%", width: "100%" }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <GeoJSON data={municipalitiesData} style={(f) => ({
                color: selectedPlace && f.properties.NAME_2 === selectedPlace.name ? DALMA_BLUE : "#cbd5e1",
                weight: selectedPlace && f.properties.NAME_2 === selectedPlace.name ? 2 : 1,
                fillOpacity: selectedPlace && f.properties.NAME_2 === selectedPlace.name ? 0.1 : 0.02
              })} />
              <ZoomToMunicipality selectedPlace={selectedPlace} />
              <LocationPicker selectedPlace={selectedPlace} markerPosition={markerPosition} setMarkerPosition={setMarkerPosition} setForm={setForm} />
            </MapContainer>
          </div>
        </div>

        <div style={modalActions}>
          <button style={secondaryBtn} onClick={onClose}>Cancel</button>
          <button style={primaryBtn} onClick={handleSubmit}>{editingEvent ? "Save Changes" : "Publish Event"}</button>
        </div>
      </div>
    </div>
  );
}

/* HELPER COMPONENTS (LEAFLET LOGIC) */
function ZoomToMunicipality({ selectedPlace }) {
  const map = useMapEvents({});
  useEffect(() => {
    if (!selectedPlace) return;
    const feature = municipalitiesData.features.find(f => f.properties.NAME_2 === selectedPlace.name);
    if (feature) map.fitBounds(L.geoJSON(feature).getBounds());
  }, [selectedPlace, map]);
  return null;
}

function LocationPicker({ selectedPlace, markerPosition, setMarkerPosition, setForm }) {
  useMapEvents({
    click(e) {
      if (!selectedPlace) return alert("Please select a municipality first.");
      const feature = municipalitiesData.features.find(f => f.properties.NAME_2 === selectedPlace.name);
      if (feature && L.geoJSON(feature).getBounds().contains(e.latlng)) {
        setMarkerPosition(e.latlng);
        setForm(prev => ({ ...prev, latitude: e.latlng.lat, longitude: e.latlng.lng }));
      } else {
        alert("Please click inside the boundaries of " + selectedPlace.name);
      }
    }
  });
  return markerPosition ? <Marker position={markerPosition} icon={yellowPin} /> : null;
}

/* STYLES */
const pageWrapper = { background: "#f8fafc", minHeight: "100vh", paddingTop: "40px", fontFamily: "inherit" };
const container = { maxWidth: 1240, margin: "0 auto", padding: "0 24px" };
const msgContainer = { textAlign: 'center', padding: '100px', fontSize: '18px', color: TEXT_MUTED };

const pageHeader = { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "40px" };
const pageTitle = { fontSize: "36px", fontWeight: 800, color: TEXT_MAIN, margin: 0 };
const pageSubtitle = { color: TEXT_MUTED, fontSize: "18px", marginTop: "8px" };

const board = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px", alignItems: "start" };
const column = { background: "#f1f5f9", borderRadius: "24px", padding: "20px", display: "flex", flexDirection: "column", minHeight: "500px" };
const columnHeader = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", padding: "0 4px" };
const columnTitle = { fontSize: "18px", fontWeight: 700, color: TEXT_MAIN };
const statusDot = { width: "8px", height: "8px", borderRadius: "50%" };
const countBadge = { background: "#ffffff", padding: "4px 12px", borderRadius: "100px", fontSize: "12px", fontWeight: 700, color: TEXT_MUTED, boxShadow: "0 2px 4px rgba(0,0,0,0.05)" };

const cardList = { display: "flex", flexDirection: "column", gap: "16px" };
const eventCard = { background: "#ffffff", padding: "20px", borderRadius: "16px", boxShadow: "0 4px 12px rgba(15, 23, 42, 0.04)", border: "1px solid #e2e8f0" };
const eventTitle = { fontSize: "18px", fontWeight: 700, marginBottom: "8px", color: TEXT_MAIN };
const eventMeta = { fontSize: "14px", color: TEXT_MUTED, marginBottom: "4px" };
const cardActions = { display: "flex", gap: "10px", marginTop: "16px", borderTop: "1px solid #f1f5f9", paddingTop: "12px" };

const emptyColumn = { textAlign: "center", padding: "40px 20px", color: TEXT_MUTED, fontSize: "14px", border: "2px dashed #cbd5e1", borderRadius: "16px" };

/* MODAL & FORM */
const overlayStyle = { position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(8px)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 20000, padding: "20px" };
const modalCard = { width: "700px", maxWidth: "100%", maxHeight: "90vh", background: "#fff", borderRadius: "32px", padding: "32px", display: "flex", flexDirection: "column", position: "relative", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" };
const modalHeader = { display: "flex", justifyContent: "space-between", marginBottom: "24px" };
const modalTitle = { fontSize: "24px", fontWeight: 800, color: TEXT_MAIN };
const modalSubtitle = { color: TEXT_MUTED, fontSize: "15px" };
const modalScrollArea = { overflowY: "auto", paddingRight: "8px" , flex: 1};
const formSectionTitle = { fontSize: "14px", fontWeight: 700, textTransform: "uppercase", color: DALMA_BLUE, letterSpacing: "0.05em", margin: "24px 0 12px 0" };
const formGrid = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" };

const input = { padding: "12px 16px", borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "15px", outline: "none", transition: "border-color 0.2s" };
const inputFull = { ...input, gridColumn: "1 / -1" };
const textarea = { ...inputFull, minHeight: "100px", resize: "none" };
const mapWrapper = { height: "250px", borderRadius: "20px", overflow: "hidden", border: "1px solid #e2e8f0", marginBottom: "20px" };

const modalActions = { display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "32px", borderTop: "1px solid #f1f5f9", paddingTop: "24px" };

/* BUTTONS */
const primaryBtn = { background: DALMA_BLUE, color: "#fff", border: "none", padding: "12px 24px", borderRadius: "100px", fontWeight: 700, cursor: "pointer", boxShadow: "0 10px 15px -3px rgba(37, 99, 235, 0.3)" };
const secondaryBtn = { background: "#fff", color: TEXT_MAIN, border: "1px solid #e2e8f0", padding: "12px 24px", borderRadius: "100px", fontWeight: 600, cursor: "pointer" };
const closeBtn = { background: "#f1f5f9", border: "none", width: "36px", height: "36px", borderRadius: "50%", cursor: "pointer", fontWeight: 800 };

const actionBtnEdit = { flex: 1, background: "#f1f5f9", border: "none", padding: "8px", borderRadius: "8px", fontWeight: 600, color: DALMA_BLUE, cursor: "pointer" };
const actionBtnDelete = { flex: 1, background: "#fff1f2", border: "none", padding: "8px", borderRadius: "8px", fontWeight: 600, color: "#e11d48", cursor: "pointer" };

export default MyEvents;