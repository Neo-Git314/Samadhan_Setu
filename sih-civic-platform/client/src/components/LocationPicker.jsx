import React from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

const PIN_ICON = L.divIcon({
  className: 'custom-pin',
  html: `
    <div style="
      width: 28px;
      height: 28px;
      border-radius: 50% 50% 50% 0;
      background: #ff6f00;
      transform: rotate(-45deg);
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid #ffffff;
      box-shadow: 0 4px 10px rgba(0,0,0,0.5);
    ">
      <div style="width: 8px; height: 8px; background: #ffffff; border-radius: 50%;"></div>
    </div>
  `,
  iconSize: [28, 28],
  iconAnchor: [14, 28]
});

function MapClickHandler({ position, onPositionChange }) {
  useMapEvents({
    click(e) {
      if (onPositionChange) {
        onPositionChange(e.latlng.lat, e.latlng.lng);
      }
    }
  });
  return position ? <Marker position={position} icon={PIN_ICON} /> : null;
}

export default function LocationPicker({
  lat = 23.6102,
  lng = 85.2799,
  onChange,
  height = '240px'
}) {
  return (
    <div
      style={{ height }}
      className="w-full rounded-2xl overflow-hidden border border-surface-container-highest relative z-0"
    >
      <MapContainer
        center={[lat, lng]}
        zoom={11}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        <MapClickHandler
          position={[lat, lng]}
          onPositionChange={onChange}
        />
      </MapContainer>
    </div>
  );
}
