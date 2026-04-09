# Dalmatia Events

A full-stack web application for discovering and sharing events across Dalmatia, Croatia.  

Users can explore events on an interactive map, create their own events, review events, and manage a personal wishlist.

The platform focuses on providing a **location-based event discovery experience** using modern web technologies and geospatial features.

---

## Features

### Explore Events
- Interactive map of Dalmatia using Leaflet  
- Municipality boundaries displayed with GeoJSON  
- Event markers placed on exact map locations  

**Filter events by:**
- Municipality  
- Category  
- Date range  

---

### Event Details
- Full event information  
- Event ratings and reviews  
- Add/remove event from wishlist  
- Easy navigation back to the map  

---

### User Authentication
- User registration  
- Secure login with JWT  
- Password hashing with bcrypt  
- Auto-login after registration  

---

### Create and Manage Events

Users can:
- Create new events  
- Update future events  
- Delete events  

**Event creation includes:**
- Organizer contact information  
- Category selection  
- Municipality selection  
- Exact location pin on the map  
- Price *(optional)*  
- Description *(optional)*  
- Image link *(optional)*  

**Events are automatically categorized as:**
- Past  
- Current  
- Future  

---

### Wishlist

Users can:
- Add events to their wishlist  
- Remove events  
- View wishlist events as cards  
- Navigate directly to event details  

---

### Reviews & Ratings

Users can:
- Rate events *(1–5 stars)*  
- Leave comments  
- See average rating and review count  

---

### Map Features
- Municipality boundaries of Dalmatia  
- Event markers  
- Restricted map navigation to Dalmatia region  
- Custom event marker icons  

---

## Technologies Used

### Frontend
- React  
- React Router  
- Axios  
- React-Leaflet  
- Leaflet  
- React Hot Toast  

---

### Backend
- Node.js  
- Express.js  
- PostgreSQL  
- PostGIS *(geospatial queries)*  
- JWT authentication  
- bcrypt *(password hashing)*  

---

### Database

**PostgreSQL with PostGIS extension used for:**
- Storing event coordinates  
- Spatial queries  
- Municipality boundaries  
