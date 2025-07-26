import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar.jsx';

function Home() {
    const [events, setEvents] = useState({
    "1": { name: "Concert", location: "El Paso", time: "7 PM" },
    "2": { name: "Art Show", location: "Las Cruces", time: "3 PM" },
    "3": { name: "Tech Meetup", location: "UTEP", time: "6 PM" },
  });

  return (
    <div className='wrapper-home'>
      <Sidebar/>
      <div className="container">
      {/* Step 2: Render one block per entry */}
      {Object.entries(events).map(([id, event]) => (
        <div key={id} className="event-block">
          <h3>{event.name}</h3>
          <p><strong>Location:</strong> {event.location}</p>
          <p><strong>Time:</strong> {event.time}</p>
        </div>
      ))}
    </div>
    </div>
  );
}

export default Home;