import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";
import MapComponent from "../components/MapComponent.jsx";

function EventDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const event = location.state?.event;

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
            <div className="activities">
              <h3>Activities</h3>
              {/* You can list event.activities if you have that field */}
            </div>
            <div className="buttons">
              <button onClick={() => navigate('/events')}>Return</button>
              <button onClick={() => navigate('/plan', { state: { event } })}>Edit</button>
            </div>
          </div>
          <div className="map">
            <MapComponent />
            {/* Optional: use event.location to center the map */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventDetails;