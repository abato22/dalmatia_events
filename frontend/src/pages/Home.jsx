import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const heroImgs = [
  "/hero1.jpg",
  "/hero2.jpg",
  "/hero3.jpg",
  "/hero4.jpg",
  "/hero5.jpg"
];

function Home() {
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [heroHover, setHeroHover] = useState(false);
  const [createHover, setCreateHover] = useState(false);

  useEffect(() => {
    const fetchPreview = async () => {
      try {
        const res = await axios.get("http://localhost:3000/events?limit=6");
        setEvents(res.data.slice(0, 6));
      } catch {
        console.log("Preview load failed");
      }
    };

    fetchPreview();
  }, []);

  return (
    <div>

      {/* HERO */}
      <section style={heroWrapper}>
        <div style={heroImages}>
          {heroImgs.map((src, i) => (
            <img key={i} src={src} alt="" style={heroImg} />
          ))}
        </div>

        <div style={heroOverlay} />

        <div style={heroContent}>
          <h1 style={heroTitle}>Discover events across Dalmatia</h1>
          <p style={heroText}>
            Find concerts, festivals, sport and local experiences near you.
          </p>

          <button
            style={{
              ...ctaPrimary,
              background: heroHover ? DALMA_YELLOW : DALMA_BLUE,
              color: heroHover ? "#0f172a" : "white"
            }}
            onMouseEnter={() => setHeroHover(true)}
            onMouseLeave={() => setHeroHover(false)}
            onClick={() => navigate("/explore")}
          >
            Explore Events
          </button>
        </div>
      </section>


      {/* UPCOMING EVENTS */}
      <section style={section}>
        <div style={container}>
          <SectionHeader
            title="Upcoming Events"
            subtitle="A quick look at what’s happening soon."
          />

          {events.length === 0 ? (
            <p style={muted}>No upcoming events.</p>
          ) : (
            <div style={grid}>
              {events.map(event => (
                <EventPreviewCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      </section>


      {/* WHY */}
      <section style={sectionAlt}>
        <div style={container}>
          <SectionHeader
            title="Why use this app?"
            subtitle="Everything you need to discover and manage events."
          />

          <div style={whyGrid}>
            <WhyCard
              title="Discover local events"
              text="Find things happening across Dalmatia."
            />
            <WhyCard
              title="Save to wishlist"
              text="Keep track of events you want to visit."
            />
            <WhyCard
              title="Create events"
              text="Share your own events with others."
            />
          </div>
        </div>
      </section>


      {/* CTA */}
      <section style={section}>
        <div style={containerSmall}>
          <div style={ctaPanel}>
            <h2 style={ctaTitle}>Organizing an event?</h2>
            <p style={ctaText}>Share it with the community.</p>

            <button
              style={{
                ...ctaSecondary,
                background: createHover ? DALMA_YELLOW : DALMA_BLUE,
                color: createHover ? "#0f172a" : "white",
                border: "none"
              }}
              onMouseEnter={() => setCreateHover(true)}
              onMouseLeave={() => setCreateHover(false)}
              onClick={() =>
                token ? navigate("/my-events") : navigate("/login")
              }
            >
              Create Event
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

/* COMPONENTS */

function WhyCard({ title, text }) {
  return (
    <div style={whyCard}>
      <h3 style={cardTitle}>{title}</h3>
      <p style={cardText}>{text}</p>
    </div>
  );
}

function EventPreviewCard({ event }) {
  const [hover, setHover] = useState(false);

  return (
    <Link
      to={`/events/${event.id}`}
      style={{
        ...card,
        background: hover ? DALMA_YELLOW : "white",
        transform: hover ? "translateY(-2px)" : "translateY(0)",
        boxShadow: hover
          ? "0 16px 40px rgba(0,0,0,0.12)"
          : "0 8px 24px rgba(0,0,0,0.06)"
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <h3 style={cardTitle}>{event.title}</h3>
      <p style={cardMeta}>{event.place_name}</p>
      <p style={cardMeta}>{formatDate(event.date_start)}</p>
    </Link>
  );
}

function SectionHeader({ title, subtitle }) {
  return (
    <div style={sectionHeader}>
      <h2 style={sectionTitle}>{title}</h2>
      <p style={sectionSubtitle}>{subtitle}</p>
    </div>
  );
}

/* HELPERS */

function formatDate(date) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("hr-HR");
}

export default Home;

/* DESIGN TOKENS */

const container = { maxWidth: 1200, margin: "0 auto", padding: "0 20px" };
const containerSmall = { maxWidth: 760, margin: "0 auto", padding: "0 20px" };

const section = { padding: "80px 0" };
const sectionAlt = { padding: "80px 0", background: "#f6f8fb" };

const muted = { color: "#4988e1" };

const DALMA_BLUE = "#2563eb";
const DALMA_YELLOW = "#facc15";

/* HERO */

const heroWrapper = {
  position: "relative",
  height: 500,
  width: "100vw",
  marginLeft: "calc(50% - 50vw)",
  overflow: "hidden",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  color: "black"
};

const heroImages = {
  position: "absolute",
  inset: 0,
  display: "grid",
  gridTemplateColumns: "repeat(5,1fr)"
};

const heroImg = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  opacity: 0.5
};

const heroOverlay = {
  position: "absolute",
  inset: 0,
};

const heroContent = {
  position: "relative",
  zIndex: 2,
  maxWidth: 760,
  padding: 36,
  borderRadius: 24,
  backdropFilter: "blur(7px)",
  background: "rgba(255,255,255,0.08)",
  boxShadow: "0 30px 80px rgba(0,0,0,0.35)"
};

const heroTitle = {
  fontSize: 42,
  fontWeight: 800,
  marginBottom: 12,
  letterSpacing: -0.5
};

const heroText = {
  fontSize: 18,
  opacity: 0.9
};

/* SECTION HEADER */

const sectionHeader = {
  marginBottom: 28,
  maxWidth: 520
};

const sectionTitle = {
  fontSize: 28,
  fontWeight: 800,
  marginBottom: 6
};

const sectionSubtitle = {
  color: "#64748b"
};

/* GRID */

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))",
  gap: 24
};

/* CARDS */

const card = {
  borderRadius: 18,
  padding: 20,
  fontWeight: 700,
  fontSize: 20,
  textDecoration: "none",
  color: "#0f172a",
  background: "#facc15",
  border: "1px solid #eef2f7",
  boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
  transition: "all .18s ease"
};

const cardTitle = {
  fontWeight: 700,
  marginBottom: 6
};

const cardMeta = {
  fontSize: 20,
  fontWeight: 700,
  color: "rgb(71, 85, 105)"
};

const cardText = { color: "#475569" };

/* WHY */

const whyGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
  gap: 24
};

const whyCard = {
  background: "#facc15",
  fontWeight: 700,
  fontSize: 20,
  padding: 26,
  borderRadius: 18,
  border: "1px solid #eef2f7",
  boxShadow: "0 14px 40px rgba(0,0,0,0.05)"
};

/* CTA PANEL */

const ctaPanel = {
  textAlign: "center",
  padding: 40,
  borderRadius: 24,
  background: "#f6f8fb",
  border: "1px solid #eef2f7",
  boxShadow: "0 30px 80px rgba(0,0,0,0.06)"
};

const ctaTitle = { fontSize: 28, fontWeight: 800 };
const ctaText = { color: "#64748b", marginBottom: 16 };

/* BUTTONS */

const ctaPrimary = {
  marginTop: 22,
  padding: "14px 28px",
  borderRadius: 12,
  border: "none",
  background: "linear-gradient(135deg,#2563eb,#4f46e5)",
  color: "white",
  fontSize: 16,
  fontWeight: 700,
  cursor: "pointer",
  boxShadow: "0 14px 30px rgba(37,99,235,0.35)",
  transition: "all .18s ease"
};

const ctaSecondary = {
  padding: "14px 28px",
  borderRadius: 12,
  border: "1px solid #e2e8f0",
  background: "white",
  color: "#0f172a",
  fontSize: 16,
  fontWeight: 700,
  cursor: "pointer",
  boxShadow: "0 10px 24px rgba(0,0,0,0.06)"
};