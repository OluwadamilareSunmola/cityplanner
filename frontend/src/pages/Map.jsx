import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar.jsx';
import MapComponent from '../components/MapComponent.jsx';

export default function Map() {
    const [coordinates, setCoordinates] = useState([40.7128, -74.0060]); // default to New York City
  
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
  
        setCoordinates([lat, lon]);
        
        const res = fetch(`http://127.0.0.1:5000/search/geo?lat=${lat}&lon=${lon}&radius=5&unit=miles`);
  
        res.then(response => response.json())
          .then(data => {
            console.log(data);
          });
  
      },
      (error) => {
          // display an error if we cant get the users position
          console.error('Error getting user location:', error);
      }
  );

  return (
    <div className="wrapper-home">
      <Sidebar />
      <div className="map-container">
        <MapComponent />
      </div>
    </div>
  );
}