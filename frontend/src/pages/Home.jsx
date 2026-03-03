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
    <div style={pageWrapper}>
    <style>{`
        .hero-image-container {
          display: flex;
          flex-direction: row;
          width: 100%;
          height: 100%;
        }
        .hero-img-item {
          width: 20%; /* Desktop: 5 images */
          height: 100%;
          object-fit: cover;
          opacity: 0.4;
          transition: all 0.5s ease;
        }
        /* Mobile: Only show the first image or stack them */
        @media (max-width: 768px) {
          .hero-img-item {
            width: 100%;
          }
          .hero-img-item:not(:first-child) {
            display: none; /* Hides the other 4 on small screens */
          }
        }
      `}</style>
      {/* HERO */}
      <section style={heroWrapper}>
        <div style={heroImages}>
          {heroImgs.map((src, i) => (
            <img key={i} src={src} alt="" className="hero-img-item" style={heroImg} />
          ))}
        </div>

        <div style={heroOverlay} />

        <div style={heroContent}>
          <h1 style={heroTitle}>Discover events across Dalmatia</h1>
          <p style={heroText}>
            Find concerts, festivals, sports, and local experiences near you.
          </p>

          <button
            style={{
              ...ctaPrimary,
              background: heroHover ? DALMA_YELLOW : DALMA_BLUE,
              color: heroHover ? "#0f172a" : "white",
              transform: heroHover ? "translateY(-2px)" : "translateY(0)"
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
            subtitle="A quick look at what’s happening soon in your area."
          />

          {events.length === 0 ? (
            <div style={emptyState}>
              <p style={muted}>No upcoming events found at the moment.</p>
            </div>
          ) : (
            <div style={grid}>
              {events.map(event => (
                <EventPreviewCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* WHY USE THIS APP */}
      <section style={sectionAlt}>
        <div style={container}>
          <SectionHeader
            title="Why use this app?"
            subtitle="Everything you need to discover and manage local events."
          />

          <div style={whyGrid}>
            <WhyCard
              icon="🌍"
              title="Discover local events"
              text="Find hidden gems and massive festivals happening across Dalmatia."
            />
            <WhyCard
              icon="❤️"
              title="Save to wishlist"
              text="Keep track of the experiences you don't want to miss."
            />
            <WhyCard
              icon="🎉"
              title="Create events"
              text="Host your own gatherings and share them with the community."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={section}>
        <div style={containerSmall}>
          <div style={ctaPanel}>
            <h2 style={ctaTitle}>Organizing an event?</h2>
            <p style={ctaText}>Share it with the community and reach a wider audience today.</p>

            <button
              style={{
                ...ctaSecondary,
                background: createHover ? DALMA_YELLOW : "#ffffff",
                color: "#0f172a",
                transform: createHover ? "translateY(-2px)" : "translateY(0)",
                borderColor: createHover ? DALMA_YELLOW : "#e2e8f0"
              }}
              onMouseEnter={() => setCreateHover(true)}
              onMouseLeave={() => setCreateHover(false)}
              onClick={() =>
                token ? navigate("/my-events") : navigate("/login")
              }
            >
              Create Your Event
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

/* COMPONENTS */

function WhyCard({ icon, title, text }) {
  const [hover, setHover] = useState(false);
  return (
    <div 
      style={{
        ...whyCard,
        transform: hover ? "translateY(-4px)" : "translateY(0)",
        boxShadow: hover ? "0 20px 40px rgba(0,0,0,0.08)" : "0 4px 6px rgba(0,0,0,0.02)"
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div style={iconWrapper}>{icon}</div>
      <h3 style={whyCardTitle}>{title}</h3>
      <p style={whyCardText}>{text}</p>
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
        transform: hover ? "translateY(-6px)" : "translateY(0)",
        boxShadow: hover
          ? "0 20px 40px rgba(0,0,0,0.12)"
          : "0 4px 6px rgba(0,0,0,0.04)",
        borderColor: hover ? DALMA_YELLOW : "#e2e8f0",
        backgroundColor: hover ? DALMA_YELLOW : "#e2e8f0",
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div style={cardContent}>
        <h3 style={cardTitle}>{event.title}</h3>
        <div style={cardDetails}>
          <span style={cardTag}>{event.place_name}</span>
          <span style={cardDate}>{formatDate(event.date_start)}</span>
        </div>
      </div>
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
  return new Date(date).toLocaleDateString("hr-HR", {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric'
  });
}

export default Home;

/* DESIGN TOKENS & STYLES */

const DALMA_BLUE = "#2563eb";
const DALMA_YELLOW = "#facc15";
const TEXT_MAIN = "#0f172a";
const TEXT_MUTED = "#64748b";

const pageWrapper = {
  fontFamily: "system-ui, -apple-system, sans-serif",
  color: TEXT_MAIN,
  backgroundColor: "#ffffff"
};

const container = { maxWidth: 1200, margin: "0 auto", padding: "0 24px" };
const containerSmall = { maxWidth: 800, margin: "0 auto", padding: "0 24px" };

const section = { padding: "96px 0" };
const sectionAlt = { padding: "96px 0", background: "#f8fafc" };

const emptyState = {
  padding: "48px",
  textAlign: "center",
  background: "#f8fafc",
  borderRadius: "16px",
  border: "1px dashed #cbd5e1"
};

const muted = { color: TEXT_MUTED, fontSize: "16px" };

/* HERO */

const heroImages = {
  position: "absolute",
  inset: 0,
  background: "#000",
  display: "flex",
};

const heroImg = {
  borderRight: "1px solid rgba(255,255,255,0.1)",
};

const heroWrapper = {
  position: "relative",
  height: "65vh",
  minHeight: "500px",
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  overflow: "hidden",
  borderRadius: "0 0 40px 40px",
  backgroundColor: "#0f172a"
};

const heroOverlay = {
  position: "absolute",
  inset: 0,
  background: "linear-gradient(to bottom, rgba(15,23,42,0.2), rgba(15,23,42,0.8))"
};

const heroContent = {
  position: "relative",
  zIndex: 2,
  maxWidth: "800px",
  padding: "0 24px",
  color: "#ffffff"
};

const heroTitle = {
  fontSize: "clamp(36px, 5vw, 56px)",
  fontWeight: 800,
  marginBottom: "16px",
  letterSpacing: "-0.02em",
  lineHeight: 1.1
};

const heroText = {
  fontSize: "clamp(16px, 2vw, 20px)",
  opacity: 0.9,
  marginBottom: "40px",
  fontWeight: 400
};

/* SECTION HEADER */

const sectionHeader = {
  marginBottom: "48px",
  textAlign: "center",
  display: "flex",
  flexDirection: "column",
  alignItems: "center"
};

const sectionTitle = {
  fontSize: "36px",
  fontWeight: 800,
  marginBottom: "12px",
  letterSpacing: "-0.02em",
  color: TEXT_MAIN
};

const sectionSubtitle = {
  color: TEXT_MUTED,
  fontSize: "18px",
  maxWidth: "600px"
};

/* GRID */

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
  gap: "32px"
};

/* EVENT CARDS */

const card = {
  display: "block",
  borderRadius: "20px",
  textDecoration: "none",
  background: "#ffffff",
  border: "2px solid #f1f5f9",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  overflow: "hidden"
};

const cardContent = {
  padding: "28px"
};

const cardTitle = {
  fontSize: "22px",
  fontWeight: 700,
  marginBottom: "16px",
  color: TEXT_MAIN,
  lineHeight: 1.3
};

const cardDetails = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  paddingTop: "16px",
  borderTop: "1px solid #f1f5f9"
};

const cardTag = {
  fontSize: "14px",
  fontWeight: 600,
  color: DALMA_BLUE,
  background: "#eff6ff",
  padding: "6px 12px",
  borderRadius: "20px"
};

const cardDate = {
  fontSize: "14px",
  fontWeight: 500,
  color: TEXT_MUTED
};

/* WHY CARDS */

const whyGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: "32px"
};

const whyCard = {
  background: "#ffffff",
  padding: "40px 32px",
  borderRadius: "24px",
  border: "1px solid #f1f5f9",
  transition: "all 0.3s ease",
  textAlign: "center"
};

const iconWrapper = {
  fontSize: "40px",
  marginBottom: "20px"
};

const whyCardTitle = {
  fontSize: "20px",
  fontWeight: 700,
  marginBottom: "12px",
  color: TEXT_MAIN
};

const whyCardText = {
  color: TEXT_MUTED,
  lineHeight: 1.6,
  fontSize: "16px"
};

/* CTA PANEL */

const ctaPanel = {
  textAlign: "center",
  padding: "64px 40px",
  borderRadius: "32px",
  background: "linear-gradient(135deg, #1e293b, #0f172a)",
  color: "#ffffff",
  boxShadow: "0 20px 40px rgba(15, 23, 42, 0.15)"
};

const ctaTitle = { 
  fontSize: "36px", 
  fontWeight: 800,
  marginBottom: "12px"
};

const ctaText = { 
  color: "#94a3b8", 
  fontSize: "18px",
  marginBottom: "32px" 
};

/* BUTTONS */

const ctaPrimary = {
  padding: "16px 36px",
  borderRadius: "100px",
  border: "none",
  fontSize: "18px",
  fontWeight: 600,
  cursor: "pointer",
  transition: "all 0.2s ease",
  boxShadow: "0 10px 25px rgba(37, 99, 235, 0.4)"
};

const ctaSecondary = {
  padding: "16px 36px",
  borderRadius: "100px",
  border: "2px solid",
  fontSize: "18px",
  fontWeight: 600,
  cursor: "pointer",
  transition: "all 0.2s ease",
};