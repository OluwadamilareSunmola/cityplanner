import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar.jsx";
import MapComponent from "../components/MapComponent.jsx";

function EventDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const event = location.state?.event;

  // State for nearby places data
  const [placesData, setPlacesData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (event && (event.lat || event.latitude) && (event.lng || event.longitude)) {
      fetchNearbyPlaces();
    }
  }, [event]);

  const fetchNearbyPlaces = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Prepare the API call parameters
      const params = new URLSearchParams({
        event_id: event.id || Math.random().toString(36).substr(2, 9),
        event_name: event.name,
        lat: event.lat || event.latitude,
        lng: event.lng || event.longitude,
        address: event.address || '',
        venue: event.location || event.venue || '',
        datetime: event.time || '',
        url: event.url || '',
        radius: 1000,
        limit: 15
      });

      // Add search types
      const types = ['restaurants', 'bars', 'entertainment', 'attractions'];
      types.forEach(type => {
        params.append('types', type);
      });

      const response = await fetch(`http://127.0.0.1:5000/event-with-places?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setPlacesData(data);
      console.log('Places data received:', data);
      
    } catch (err) {
      setError(err.message);
      console.error('Error fetching nearby places:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!event) {
    return (
      <div className="wrapper-home">
        <Sidebar />
        <div className="container-form">
          <h2>No Event Selected</h2>
          <button onClick={() => navigate('/events')}>Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="wrapper-home">
      <Sidebar />
      <div className="container-form">
        <div className="planner">
          <div className="planer-data">
            <h2>Event Details</h2>
            <h3>{event.name}</h3>
            <ul>
              <p><strong>Time:</strong> {event.time}</p>
              <p><strong>Address:</strong> {event.address}</p>
              <p><strong>Type:</strong> {event.type}</p>
            </ul>
            <p className="description">{event.description}</p>
            
            {loading && <p>Loading nearby places...</p>}
            {error && <p style={{color: 'red'}}>Error loading places: {error}</p>}
            
            <div className="activities">
              <h3>Nearby Activities</h3>
              {placesData && placesData.places_data && placesData.places_data.features && (
                <div>
                  <p>Found {placesData.places_data.properties.total_places} places nearby</p>
                  {/* You can add more UI here to display the places */}
                </div>
              )}
            </div>
            
            <div className="buttons">
              <button onClick={() => navigate('/events')}>Return</button>
              <button onClick={() => navigate('/plan', { state: { event, placesData } })}>Edit</button>
              {placesData && (
                <button onClick={() => console.log('Places data:', placesData)}>
                  Debug: Log Places Data
                </button>
              )}
            </div>
          </div>
          <div className="map">
            <MapComponent eventData={event} placesData={placesData} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventDetails;