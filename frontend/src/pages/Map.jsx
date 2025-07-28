import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar.jsx';
import MapComponent from '../components/MapComponent.jsx';

export default function Map() {
  return (
    <div className="wrapper-home">
      <Sidebar />
      <div className="map-container">
        <MapComponent />
      </div>
    </div>
  );
}