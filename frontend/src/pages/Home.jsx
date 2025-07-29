import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { addDoc, collection } from "firebase/firestore";
import Sidebar from "../components/Sidebar.jsx";
import SearchSection from "../components/SearchSection.jsx";
import EventsContainer from "../components/EventsContainer.jsx";

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
