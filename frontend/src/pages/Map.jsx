import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import MapComponent from '../components/MapComponent.jsx';

export default function Map() {
  const [coordinates, setCoordinates] = useState([40.7128, -74.0060]); // default to New York City

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

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(`http://127.0.0.1:5000/search/geo?lat=${coordinates[0]}&lon=${coordinates[1]}&radius=50&unit=miles`);
      const data = await res.json();
      console.log(data);
    };

    fetchData();
  }, [coordinates]);

  return (
    <div className="wrapper-home">
      <Sidebar />
      <div className="map-container">
        <MapComponent coordinates={coordinates} />
      </div>
    </div>
  );
}