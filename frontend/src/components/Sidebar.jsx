import { useNavigate } from 'react-router-dom';

function Sidebar() {
  const navigate = useNavigate();

  return (
    <div className="sidebar">
      <h2 className="sidebar-title">My Event App</h2>
      <nav className="sidebar-nav">
        <div className="sidebar-link" onClick={() => navigate('/home')}>Home</div>
        <div className="sidebar-link" onClick={() => navigate('/map')}>Map</div>
        <div className="sidebar-link" onClick={() => navigate('/events')}>Saved Events</div>
      </nav>
    </div>
  );
}

export default Sidebar;