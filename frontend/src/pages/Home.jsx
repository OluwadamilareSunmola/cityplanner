import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { addDoc, collection } from "firebase/firestore";
import Sidebar from "../components/Sidebar.jsx";

function Home() {
  const [events, setEvents] = useState({})
  const [location, setLocation] = useState("El Paso"); // default city

  const navigate = useNavigate();
  useEffect(() => {
    fetch(`http://127.0.0.1:5000/events?city=${location}`)
      .then(res => res.json())
      .then(data => {
        // Convert array to object for easy access by ID
        const eventsObj = {};
        data.forEach((event, index) => {
          eventsObj[index] = {
            name: event.name,
            type: "music", // you can later improve with real data
            genre: "rock", // or dynamically map
            description: event.description || "No description provided.",
            location: event.venue || "Unknown",
            address: event.address || "No address",
            time: event.datetime || "Unknown",
            url: event.url
          };
        });
        setEvents(eventsObj);
      })
      .catch(err => console.error("Failed to fetch events:", err));
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
      savedAt: new Date()
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
          <h2 className="title text-4xl">Find Events</h2>
          <p className="text-1xl font-bold text-gray-800">What if you could uncover the hidden events around you?</p>
          <p className="text-1xl font-bold pb-6 text-gray-800">What if the events you seek were closer than you think?</p>
          <input
            className="w-140 h-9 rounded-sm mb-4"
            type="text"
            placeholder="Search..."
            value={filters.text}
            onChange={(e) => setFilters({ ...filters, text: e.target.value })}
          />
          <form
            className="event-filter-form flex-row flex"
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="flex flex-col items-center mx-7">
              <label className="text-md" htmlFor="event-type">Type</label>
              <select
                className="w-40 h-6 rounded-sm mb-4"
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
            </div>

            <div className="flex flex-col items-center mx-7">
            <label className="text-md" htmlFor="genre">Genre</label>
            <select
              className="w-40 h-6 rounded-sm mb-4"
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
            </div>

            <div className="flex flex-col items-center mx-7">
              <label className="text-md" htmlFor="time-range">When</label>
              <select
                className="w-40 h-6 rounded-sm mb-4"
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
            </div>
          </form>
        </div>

        <div className="info mt-83">
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
