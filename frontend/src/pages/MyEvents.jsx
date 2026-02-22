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
    <div>
      <h2>My Events</h2>

      <button
        onClick={() => {
          setEditingEvent(null);
          setShowModal(true);
        }}
        style={buttonStyle}
      >
        Create New Event
      </button>

      <div style={{ display: "flex", gap: "20px" }}>
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

      {showModal && (
        <CreateEventModal
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
  );
}

function Column({ title, events, onDelete, editable, onEdit }) {
  return (
    <div style={{ flex: 1 }}>
      <h3>{title}</h3>
      {events.length === 0 && <p>No events</p>}

      {events.map(event => (
        <div key={event.id} style={cardStyle}>
          <h4>{event.title}</h4>
          <p>{event.place_name}</p>
          <p>{new Date(event.date_start).toLocaleDateString()}</p>

          {editable && (
            <button onClick={() => onEdit(event)}>
              Update
            </button>
          )}

          <button
            style={{ background: "red", color: "white" }}
            onClick={() => onDelete(event.id)}
          >
            Delete
          </button>
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
      <div style={modalStyle}>
        <h3>Create Event</h3>

        <input name="organizer_name" placeholder="Name" onChange={handleChange} />
        <input name="organizer_surname" placeholder="Surname" onChange={handleChange} />
        <input name="organizer_email" placeholder="Email" onChange={handleChange} />
        <input name="organizer_phone" placeholder="Phone" onChange={handleChange} />

        <input name="title" placeholder="Event Title" onChange={handleChange} />
        <textarea name="description" placeholder="Description" onChange={handleChange} />

        <select name="place_id" onChange={handleChange}>
          <option value="">Select Municipality</option>
          {places.map(place => (
            <option key={place.id} value={place.id}>
              {place.name}
            </option>
          ))}
        </select>

        <select name="category_id" onChange={handleChange}>
          <option value="">Select Category</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        <input name="price" type="number" placeholder="Price (€)" onChange={handleChange} />

        <input type="date" name="date_start" onChange={handleChange} />
        <input type="date" name="date_end" onChange={handleChange} />

        <input name="image_url" placeholder="Image URL (optional)" onChange={handleChange} />

        <div style={{ height: "300px", marginTop: "10px" }}>
          <MapContainer
            center={[43.5, 16.5]}
            zoom={8}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            <GeoJSON
              data={municipalitiesData}
              style={(feature) => ({
                color:
                  selectedPlace &&
                  feature.properties.NAME_2 === selectedPlace.name
                    ? "red"
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

        <div style={{ marginTop: "10px" }}>
          <button onClick={handleSubmit}>Create</button>
          <button onClick={onClose} style={{ marginLeft: "10px" }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

const buttonStyle = {
  marginBottom: "20px",
  padding: "10px 15px",
  background: "#1e3a8a",
  color: "white",
  border: "none",
  cursor: "pointer"
};

const cardStyle = {
  border: "1px solid #ccc",
  padding: "10px",
  marginBottom: "10px"
};

const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center"
};

const modalStyle = {
  background: "white",
  padding: "20px",
  width: "450px",
  maxHeight: "90vh",
  overflowY: "auto"
};

export default MyEvents;
