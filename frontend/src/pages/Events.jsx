import Sidebar from "../components/Sidebar.jsx";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { getDocs, collection } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

function Events() {
  const [savedEvents, setSavedEvents] = useState({});
  const [events, setEvents] = useState({});
  const navigate = useNavigate()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      try {
        const querySnapshot = await getDocs(
          collection(db, "users", user.uid, "savedEvents")
        );

        const eventsData = {};
        querySnapshot.forEach((doc) => {
          eventsData[doc.id] = doc.data();
        });

        setEvents(eventsData);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    });

    return () => unsubscribe();
  }, []);

  const [filters, setFilters] = useState({
    text: "",
    type: "",
    genre: "",
    time: "",
  });

  const filteredEvents = Object.entries(events).filter(([id, event]) => {
    const search = filters.text.toLowerCase();

    const matchesSearch =
      search === "" ||
      event.name.toLowerCase().includes(search) ||
      event.description.toLowerCase().includes(search) ||
      event.location.toLowerCase().includes(search) ||
      event.type.toLowerCase().includes(search) ||
      event.address.toLowerCase().includes(search);

    const matchesType = filters.type === "" || event.type === filters.type;
    const matchesGenre = filters.genre === "" || event.genre === filters.genre;
    const matchesTime =
      filters.time === "" || isInTimeRange(event.time, filters.time);

    return matchesSearch && matchesType && matchesGenre && matchesTime;
  });

  return (
    <div className="wrapper-home">
      <Sidebar />
      <div className="container-form">
        <div className="filter-section">
          <h2 className="title">Find Events</h2>
          <input
            type="text"
            placeholder="Search..."
            value={filters.text}
            onChange={(e) => setFilters({ ...filters, text: e.target.value })}
          />
          <form
            className="event-filter-form"
            onSubmit={(e) => e.preventDefault()}
          >
            <label htmlFor="event-type">Type</label>
            <select
              id="event-type"
              name="type"
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            >
              <option value="">-- Select Type --</option>
              <option value="music">Music</option>
              <option value="sports">Sports</option>
              <option value="theater">Theater</option>
              <option value="other">Other</option>
            </select>

            <label htmlFor="genre">Genre</label>
            <select
              id="genre"
              name="genre"
              value={filters.genre}
              onChange={(e) =>
                setFilters({ ...filters, genre: e.target.value })
              }
            >
              <option value="">-- Select Genre --</option>
              <option value="rock">Rock</option>
              <option value="hiphop">Hip-Hop</option>
              <option value="classical">Classical</option>
              <option value="comedy">Comedy</option>
            </select>

            <label htmlFor="time-range">When</label>
            <select
              id="time-range"
              name="time"
              value={filters.time}
              onChange={(e) => setFilters({ ...filters, time: e.target.value })}
            >
              <option value="">-- Select Time Range --</option>
              <option value="month">This Month</option>
              <option value="6months">Next 6 Months</option>
              <option value="year">Next Year</option>
            </select>
          </form>
        </div>

        <div className="info">
          {filteredEvents.length === 0 ? (
            <p>No events found.</p>
          ) : (
            filteredEvents.map(([id, event]) => (
              <div
                key={id}
                className="event-block"
                onClick={() => setSelectedEvent(event)}
              >
                <h3>{event.name}</h3>
                <p>
                  <strong>Description:</strong> {event.description}
                </p>
                <ul>
                  <p>
                    <strong>Location:</strong> {event.location}
                  </p>
                  <p>
                    <strong>Type:</strong> {event.type}
                  </p>
                  <p>
                    <strong>Genre:</strong> {event.genre}
                  </p>
                  <p>
                    <strong>Time:</strong> {event.time}
                  </p>
                  <p>
                    <strong>Address:</strong> {event.address}
                  </p>
                </ul>
                <button
                  onClick={() => navigate("/details", { state: { event } })}
                >
                  Plan
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Events;
