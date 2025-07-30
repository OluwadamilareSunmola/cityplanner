import Sidebar from "../components/Sidebar.jsx";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { getDocs, collection, doc, deleteDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import SearchSection from "../components/SearchSectionEvents.jsx";
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
function Events() {
  const [savedEvents, setSavedEvents] = useState({});
  const [events, setEvents] = useState({});
  const [search, setSearch] = useState("")
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

  const handleDeleteEvent = async (eventId) => {
    const user = auth.currentUser;
    if (!user) {
      alert("Please log in to delete events.");
      return;
    }

    // confirm deletion
    if (!window.confirm("Are you sure you want to remove this event?")) {
      return;
    }

    try {
      // delete from Firestore
      await deleteDoc(doc(db, "users", user.uid, "savedEvents", eventId));

      // update local state to remove the event
      setEvents(prevEvents => {
        const updatedEvents = { ...prevEvents };
        delete updatedEvents[eventId];
        return updatedEvents;
      });

      alert("Event removed successfully!");
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("Failed to remove event.");
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
          title="Saved Events"
          subtitle={`What if the moments you cherished were saved in the midst of your life?\nWhat if the events you once loved were closer than you thought?`}
        />


        <EventsContainer filteredEvents={filteredEvents}>
          {(id, event, buttonClass) => (
            <div style={{display: 'flex', gap: '10px'}}>
              <button className={buttonClass} onClick={() => navigate("/details", { state: { event } })}>
                Plan
              </button>
              <button 
                className={buttonClass} 
                style={{backgroundColor: '#dc2626', color: 'white'}}
                onClick={() => handleDeleteEvent(id)}
              >
                Remove
              </button>
            </div>
          )}
        </EventsContainer>
      </div>
    </div>
  );
}

export default Events;