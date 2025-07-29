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

function PopUpComponent({ name, address, type }) {
  return (
    <Popup>
      <div className="pb-2">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 pb-4">{name}</h3>
        <div className="flex flex-col gap-4">

              <div className="bg-purple-50 rounded-lg p-4 border border-purple-100 md:col-span-1">
                <div className="flex items-center gap-3">
                  <div>
                    <div className="text-xs font-semibold text-purple-700 uppercase tracking-wide mb-1">Address</div>
                    <div className="text-sm text-gray-900">{address}</div>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                <div className="flex items-center gap-3">
                  <div>
                    <div className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-1">Type</div>
                    <div className="text-sm text-gray-900 uppercase">{type}</div>
                  </div>
                </div>
              </div>
            </div>
        </div>
        </Popup>
  );

}

export default function MapComponent({ coordinates, eventData, placesData, zoom = 13 }) {
  if (!coordinates || coordinates.length !== 2) {
    coordinates = [40.7128, -74.0060]; // default to New York City if no coordinates provided
  }

  console.log("placesData", placesData);

  return <>
    <MapContainer center={coordinates} zoom={zoom} style={{ height: '100%', width: '100%' }}>
      <ChangeView center={coordinates} zoom={zoom} />
      <TileLayer
    url={`https://api.maptiler.com/maps/outdoor-v2/{z}/{x}/{y}.png?key=${import.meta.env.VITE_MAPTILER_API_KEY}`}
    attribution='© MapTiler © OpenStreetMap contributors'
  />

    <CircleMarker
        center={coordinates}
        radius={8}
        pathOptions={{
          color: '#6488ea',
          weight: 1,
          fillColor: '#6488ea',
          fillOpacity: 0.6
        }}
      >
        <PopUpComponent 
          name={eventData.name}
          address={eventData.address}
          type={eventData.type}
        /> 
      </CircleMarker>

    {placesData && placesData.places_data && placesData.places_data.features.map((place, index) => {
      if (coordinates[0] === place.geometry.coordinates[1] && coordinates[1] === place.geometry.coordinates[0]) {
        return null; // skip the event location itself
      }

      let color;

      if (place.properties.category === "catering") {
        color = '#ffb52b';
      } else if (place.properties.category === "entertainment") {
        color = '#cf3e56';
      } else if (place.properties.category === "building") {
        color = '#95a5a6';
      } else if (place.properties.category === "tourism") {
        color = '#3498db';
      } else if (place.properties.category === "highway") {
        color = '#9c9c9c';
      } else if (place.properties.category === "populated_place") {
        color = '#9b59b6';
      } else {
        color = '#28a745'; // default color for other types
      }

      return (
      <CircleMarker
        key={index}
        center={[place.geometry.coordinates[1], place.geometry.coordinates[0]]}
        radius={8}
        pathOptions={{ 
          color: color,
          weight: 1,
          fillColor: color,
          fillOpacity: 0.6
        }}
      >
        <PopUpComponent 
          name={place.properties.name}
          address={place.properties.address}
          type={place.properties.category || "Unknown"}
        />
      </CircleMarker>
    )})}
    </MapContainer>
  </>
}