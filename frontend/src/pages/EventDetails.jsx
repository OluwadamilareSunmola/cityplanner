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

  const formatDateTime = (timestamp) => {
      if (timestamp === "Unknown" || !timestamp) {
        return "Unknown";
      }

        const date = new Date(timestamp);

        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric', 
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

  console.log(event);

  return (
    <div className="wrapper-home">
  <Sidebar />
  <div className="container-form items-center">
    <div className="p-6 flex flex-row gap-8 justify-center items-center">

          <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm h-150 relative">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Event Details</h1>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{event.name}</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                <div className="flex items-center gap-3">
                  <div>
                    <div className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1">Time</div>
                    <div className="text-sm text-gray-900">{formatDateTime(event.time)}</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                <div className="flex items-center gap-3">
                  <div>
                    <div className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-1">Type</div>
                    <div className="text-sm text-gray-900 uppercase">{event.type}</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-100 md:col-span-1">
                <div className="flex items-center gap-3">
                  <div>
                    <div className="text-xs font-semibold text-purple-700 uppercase tracking-wide mb-1">Address</div>
                    <div className="text-sm text-gray-900">{event.address}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">About This Event</h3>
              <p className="text-gray-600 leading-relaxed">
                {event.description || "No description provided for this event."}
              </p>
            </div>

            {loading && <p>Loading nearby places...</p>}
            {error && <p style={{color: 'red'}}>Error loading places: {error}</p>}

            <div className="activities">
            <h3>Nearby Activities</h3>
              {placesData && placesData.places_data && placesData.places_data.features && (
                <div>
                  <p>Found {placesData.places_data.properties.total_places} places nearby</p>
                </div>
              )}
            </div>

            <div className="flex gap-4 bottom-5 absolute">
              <button 
                onClick={() => navigate('/events', { state: { event, placesData  } })}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold duration-200 transition-colors flex-1 cursor-pointer"
              >
                Return
              </button>

            </div>
          </div>
        </div>


          <div className="bg-white rounded-xl border border-gray-200 p-6 pb-13 shadow-sm top-6 h-150 w-150">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Location</h3>
            <div className="bg-gray-100 rounded-lg mb-4 h-full w-full overflow-hidden">
              <MapComponent coordinates={[event.lat, event.lng]} zoom={17} eventData={event} placesData={placesData} />
            </div>
          </div>

      </div>
  </div>
  );
}

export default EventDetails;