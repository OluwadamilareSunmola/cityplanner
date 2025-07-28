import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";
import MapComponent from "../components/MapComponent.jsx";

function CreatePlan() {
  const navigate = useNavigate();
  const location = useLocation();
  const event = location.state?.event;

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
            <div className="activities">
              <h3>Current Activites</h3>
              <ol>
                <li>1</li>
                <li>2</li>
                <li>3</li>
                <li>4</li>
                <li>5</li>
              </ol>
              <h3>Activities</h3>
              <div className="search-activities">
                <p>Item 1</p>
                <p>Item 2</p>
                <p>Item 3</p>
                <p>Item 4</p>
                <p>Item 5</p>
                <p>Item 6</p>
                <p>Item 7</p>
                <p>Item 8</p>
                <p>Item 9</p>
                <p>Item 10</p>
              </div>
            </div>
            <div className="buttons">
              <button className="return" onClick={() => navigate("/events")}>Return</button>
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

export default CreatePlan;
