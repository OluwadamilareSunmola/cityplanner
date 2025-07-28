import { useNavigate } from 'react-router-dom';
import { auth } from "../firebase";

function Sidebar() {
  const navigate = useNavigate();

  const user = auth.currentUser;

  const login_text = user ? "Log Out" : "Log In";

  return (
    <div className="sidebar">
      <h2 className="sidebar-title">CityPulse</h2>
      <nav className="sidebar-nav">
        <div className="sidebar-link" onClick={() => navigate('/home')}>Home</div>
        <div className="sidebar-link" onClick={() => navigate('/map')}>Map</div>
        <div className="sidebar-link" onClick={() => navigate('/events')}>Saved Events</div>
        <div className="sidebar-link" onClick={() => navigate('/')}>{login_text}</div>
      </nav>
    </div>
  );
}

export default Sidebar;