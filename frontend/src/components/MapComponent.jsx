// src/components/LeafletMap.js
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import { useEffect } from 'react';

// handle map center updates
function ChangeView({ center, zoom }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);

  return;
}

export default function MapComponent({ coordinates }) {
  if (!coordinates || coordinates.length !== 2) {
    coordinates = [40.7128, -74.0060]; // default to New York City if no coordinates provided
  }

  return <>
    <MapContainer center={coordinates} zoom={13} style={{ height: '100%', width: '100%' }}>
      <ChangeView center={coordinates} zoom={13} />
      <TileLayer
    url={`https://api.maptiler.com/maps/outdoor-v2/{z}/{x}/{y}.png?key=${import.meta.env.VITE_MAPTILER_API_KEY}`}
    attribution='© MapTiler © OpenStreetMap contributors'
  />
      <CircleMarker
        center={coordinates}
        radius={8}
        pathOptions={{ 
          color: '#3388ff',
          weight: 1,
          fillColor: '#3388ff',
          fillOpacity: 0.6
        }}
      >
        <Popup>New York City</Popup>
      </CircleMarker>
    </MapContainer>
  </>
}