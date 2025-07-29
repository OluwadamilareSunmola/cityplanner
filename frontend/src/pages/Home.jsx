import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { addDoc, collection } from "firebase/firestore";
import Sidebar from "../components/Sidebar.jsx";
import SearchSection from "../components/SearchSection.jsx";
import EventsContainer from "../components/EventsContainer.jsx";

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
        <SearchSection
          filters={filters}
          setFilters={setFilters}
          title={"Find Events"}
          subtitle={"What if you could uncover the hidden events around you?\n  \
            What if the events you seek were closer than you think?"}
          />

        <EventsContainer filteredEvents={filteredEvents}>
          {(id, event, buttonClass) => (
            <button className={buttonClass} onClick={() => handleSaveEvent(id)}>Add</button>
          )}
        </EventsContainer>
      </div>
    </div>
  );
}

export default Home;
