import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import MapComponent from '../components/MapComponent.jsx';
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import { getDocs, collection } from "firebase/firestore";

export default function Map() {
  const [coordinates, setCoordinates] = useState([40.7128, -74.0060]); // default to New York City

  const [events, setEvents] = useState({});

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
        console.log("Fetched saved events:", eventsData);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
      navigator.geolocation.getCurrentPosition(
          (position) => {
              const lat = position.coords.latitude;
              const lon = position.coords.longitude;
              setCoordinates([lat, lon]);
          },
          (error) => {
              // display an error if we cant get the users position
              console.error('Error getting user location:', error);
          }
      );
  }, []);

  return (
    <div className="wrapper-home">
      <Sidebar />
      <div className="map-container">
        <MapComponent coordinates={coordinates} events={events} />
      </div>
    </div>
  );
}