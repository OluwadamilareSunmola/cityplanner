import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { addDoc, collection } from "firebase/firestore";
import Sidebar from "../components/Sidebar.jsx";

function isInTimeRange(eventTime, selectedRange) {
  if (!eventTime || selectedRange === "") return true;

  const eventDate = new Date(eventTime);
  const now = new Date();

  if (isNaN(eventDate)) {
    return true; // If invalid date, don't filter out
  }

  // Helper to add months safely
  function addMonths(date, months) {
    const d = new Date(date);
    d.setMonth(d.getMonth() + months);
    return d;
  }

  switch (selectedRange) {
    case "thisWeek": {
      // from now to 7 days later
      const oneWeekFromNow = new Date(now);
      oneWeekFromNow.setDate(now.getDate() + 7);
      return eventDate >= now && eventDate <= oneWeekFromNow;
    }
    case "nextMonth": {
      // from now to 1 month later
      const oneMonthFromNow = addMonths(now, 1);
      return eventDate >= now && eventDate <= oneMonthFromNow;
    }
    case "sixMonths": {
      // from now to 6 months later
      const sixMonthsFromNow = addMonths(now, 6);
      return eventDate >= now && eventDate <= sixMonthsFromNow;
    }
    case "year": {
      // from now to 12 months later
      const oneYearFromNow = addMonths(now, 12);
      return eventDate >= now && eventDate <= oneYearFromNow;
    }
    default:
      return true;
  }
}

function Home() {
  const [events, setEvents] = useState({});
  const [location, setLocation] = useState("El Paso"); // city used to fetch events
  const [searchInput, setSearchInput] = useState("El Paso"); // controlled input value

  const navigate = useNavigate();

  useEffect(() => {
    fetch(`http://127.0.0.1:5000/events?city=${location}`)
      .then((res) => res.json())
      .then((data) => {
        const eventsObj = {};
        data.forEach((event, index) => {
          eventsObj[index] = {
            name: event.name,
            type: event.segment,
            genre: event.genre,
            description: event.description || "No description provided.",
            location: event.venue || "Unknown",
            address: event.address || "No address",
            time: event.localdate || "Unknown",
            url: event.url,
            lat: event.lat,
            lng: event.lng,
          };
        });
        setEvents(eventsObj);
      })
      .catch((err) => console.error("Failed to fetch events:", err));
  }, [location]);

  const handleSaveEvent = async (id) => {
    const user = auth.currentUser;
    if (!user) {
      alert("Please log in to save events.");
      return;
    }

    const selectedEvent = events[id];

    try {
      await addDoc(collection(db, "users", user.uid, "savedEvents"), {
        ...selectedEvent,
        savedAt: new Date(),
      });

      alert("Event saved!");
    } catch (error) {
      console.error("Error saving event:", error);
      alert("Failed to save event.");
    }
  };

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
        <div className="filter-section mb-10">
          <h2 className="title">Find Events</h2>
          <input
            className="w-140 h-9 rounded-sm mb-4"
            type="text"
            placeholder="Search..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                // Update the location to trigger fetch
                setLocation(searchInput.trim());
              }
            }}
          />
          <form
            className="event-filter-form flex-row flex"
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="flex flex-col items-center mx-7">
              <label className="text-md" htmlFor="event-type">
                Type
              </label>
              <select
                className="w-40 h-6 rounded-sm mb-4"
                id="event-type"
                name="type"
                value={filters.type}
                onChange={(e) =>
                  setFilters({ ...filters, type: e.target.value })
                }
              >
                <option value="">All Types</option>
                <option value="Music">Music</option>
                <option value="Sports">Sports</option>
                <option value="Arts & Theatre">Arts & Theatre</option>
                <option value="Miscellaneous">Miscellaneous</option>
              </select>
            </div>

            <div className="flex flex-col items-center mx-7">
              <label className="text-md" htmlFor="genre">
                Genre
              </label>
              <select
                className="w-40 h-6 rounded-sm mb-4"
                id="genre"
                name="genre"
                value={filters.genre}
                onChange={(e) =>
                  setFilters({ ...filters, genre: e.target.value })
                }
              >
                <option value="">All Genres</option>
                <option value="Rock">Rock</option>
                <option value="Pop">Pop</option>
                <option value="Hip-Hop/Rap">Hip-Hop/Rap</option>
                <option value="Classical">Classical</option>
                <option value="Comedy">Comedy</option>
              </select>
            </div>

            <div className="flex flex-col items-center mx-7">
              <label className="text-md" htmlFor="time-range">
                When
              </label>
              <select
                className="w-40 h-6 rounded-sm mb-4"
                id="time-range"
                name="time"
                value={filters.time}
                onChange={(e) =>
                  setFilters({ ...filters, time: e.target.value })
                }
              >
                <option value="">All Times</option>
                <option value="thisWeek">This Week</option>
                <option value="nextMonth">Next Month</option>
                <option value="sixMonths">Next 6 Months</option>
                <option value="year">Next Year</option>
              </select>
            </div>
          </form>
        </div>

        <div className="info">
          {filteredEvents.length === 0 ? (
            <p>No events found.</p>
          ) : (
            filteredEvents.map(([id, event]) => (
              <div key={id} className="event-block">
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
                <button onClick={() => handleSaveEvent(id)}>Add</button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;
