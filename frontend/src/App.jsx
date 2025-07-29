import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css'
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Map from './pages/Map';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';


function App() {
  return (
    <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/home" element={<Home />} />
          <Route path="/map" element={<Map />} />
          <Route path="/events" element={<Events />} />
          <Route path="/details" element={<EventDetails/>} />

        </Routes>
    </Router>
  );
}

export default App;