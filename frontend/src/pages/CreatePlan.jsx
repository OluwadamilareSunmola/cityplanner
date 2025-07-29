import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar.jsx";
import MapComponent from "../components/MapComponent.jsx";

function CreatePlan() {
  const navigate = useNavigate();
  const location = useLocation();
  const event = location.state?.event;

  // State for nearby places data
  const [placesData, setPlacesData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (event && event.lat && event.lng) {
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
        radius: 1500,
        limit: 20
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
          <button onClick={() => navigate("/events")}>Go Back</button>
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
            
            {loading && <p>Loading nearby places...</p>}
            {error && <p style={{color: 'red'}}>Error: {error}</p>}
            
            <div className="activities">
              <h3>Current Activities</h3>
              <ol>
                <li>1</li>
                <li>2</li>
                <li>3</li>
                <li>4</li>
                <li>5</li>
              </ol>
              
              <h3>Nearby Places</h3>
              <div className="search-activities">
                {placesData && placesData.places_data && placesData.places_data.features ? (
                  placesData.places_data.features
                    .filter(feature => feature.properties.type !== 'event') // Exclude the event marker
                    .slice(0, 10) // Show first 10 places
                    .map((place, index) => (
                      <p key={place.properties.id || index}>
                        {place.properties.name} ({place.properties.category})
                      </p>
                    ))
                ) : (
                  Array.from({length: 10}, (_, i) => (
                    <p key={i}>Loading place {i + 1}...</p>
                  ))
                )}
              </div>
            </div>
            
            <div className="buttons">
              <button className="return" onClick={() => navigate("/events")}>Return</button>
              {placesData && (
                <button onClick={() => console.log('Full places data:', placesData)}>
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

export default CreatePlan;