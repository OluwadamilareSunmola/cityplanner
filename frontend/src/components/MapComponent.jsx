// src/components/LeafletMap.js
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function MapComponent() {
  return <>
    <MapContainer center={[40.7128, -74.0060]} zoom={13} style={{ height: '100%', width: '100%' }}>
      <TileLayer
    url={`https://api.maptiler.com/maps/outdoor-v2/{z}/{x}/{y}.png?key=${import.meta.env.VITE_MAPTILER_API_KEY}`}
    attribution='© MapTiler © OpenStreetMap contributors'
  />
      <CircleMarker
        center={[40.7128, -74.0060]}
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