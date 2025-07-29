import Sidebar from "../components/Sidebar.jsx";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { getDocs, collection } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import SearchSection from "../components/SearchSection.jsx";
import EventsContainer from "../components/EventsContainer.jsx";

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
        <SearchSection
          filters={filters}
          setFilters={setFilters}
          title={"Saved Events"}
          subtitle={"What if the moments you cherished were saved in the midst of your life?\n  \
                    What if the events you once loved were closer than you thought?"}
          />

        <EventsContainer filteredEvents={filteredEvents}>
                  {(id, event, buttonClass) => (
                    <button className={buttonClass} onClick={() => navigate("/details", { state: { event } })}>Plan</button>
                  )}
        </EventsContainer>
      </div>
    </div>
  );
}

export default Events;
