import React, { useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';

// Custom SVG map pin icons to avoid Leaflet static image asset issues
const createCustomPin = (color) => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="
        width: 30px;
        height: 30px;
        border-radius: 50% 50% 50% 0;
        background: ${color};
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid #ffffff;
        box-shadow: 0 4px 10px rgba(0,0,0,0.5);
      ">
        <div style="
          width: 10px;
          height: 10px;
          background: #ffffff;
          border-radius: 50%;
        "></div>
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -32]
  });
};

const RED_PIN = createCustomPin('#ef4444');
const AMBER_PIN = createCustomPin('#f59e0b');
const GREEN_PIN = createCustomPin('#10b981');

// Known default district coordinate fallbacks in Jharkhand
const DISTRICT_COORDINATES = {
  Ranchi: { lat: 23.3441, lng: 85.3096 },
  Dhanbad: { lat: 23.7957, lng: 86.4304 },
  'East Singhbhum (Jamshedpur)': { lat: 22.8046, lng: 86.2029 },
  Jamshedpur: { lat: 22.8046, lng: 86.2029 },
  Bokaro: { lat: 23.6693, lng: 86.1511 },
  Hazaribagh: { lat: 23.9937, lng: 85.3619 },
  Deoghar: { lat: 24.4826, lng: 86.7001 },
  Ramgarh: { lat: 23.6300, lng: 85.5126 },
  Palamu: { lat: 24.0374, lng: 84.0729 },
  Giridih: { lat: 24.1866, lng: 86.3079 },
  Dumka: { lat: 24.2690, lng: 87.2530 }
};

export default function JharkhandGisMap({ complaints = [] }) {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('ALL');

  // Center of Jharkhand
  const jharkhandCenter = [23.6102, 85.2799];

  // Process coordinates ensuring every complaint has a valid Jharkhand location
  const mappedComplaints = useMemo(() => {
    return complaints.map((c, idx) => {
      let lat = c.location?.lat;
      let lng = c.location?.lng;

      if (!lat || !lng || (lat === 0 && lng === 0)) {
        const districtFallback = DISTRICT_COORDINATES[c.district] || DISTRICT_COORDINATES.Ranchi;
        // Jitter slightly so overlapping points are visible
        lat = districtFallback.lat + (Math.sin(idx) * 0.03);
        lng = districtFallback.lng + (Math.cos(idx) * 0.03);
      }

      // Determine status pin color
      // 🔴 Red: Critical SLA (<12h) or Unassigned / pending
      // 🟡 Amber: Under University R&D / in_progress / assigned
      // 🟢 Green: Resolved
      let pin = RED_PIN;
      let statusGroup = 'CRITICAL';
      const statusLower = (c.status || '').toLowerCase();
      const isResolved = statusLower === 'resolved';
      const isUnderRD = ['assigned', 'in_progress', 'proposed', 'approved', 'testing'].includes(statusLower);

      if (isResolved) {
        pin = GREEN_PIN;
        statusGroup = 'RESOLVED';
      } else if (isUnderRD) {
        pin = AMBER_PIN;
        statusGroup = 'RD';
      } else {
        pin = RED_PIN;
        statusGroup = 'CRITICAL';
      }

      return {
        ...c,
        computedLat: lat,
        computedLng: lng,
        pin,
        statusGroup
      };
    });
  }, [complaints]);

  const filteredItems = useMemo(() => {
    if (filter === 'ALL') return mappedComplaints;
    return mappedComplaints.filter((c) => c.statusGroup === filter);
  }, [mappedComplaints, filter]);

  return (
    <div className="bg-surface-container-low border border-surface-container-highest rounded-2xl sm:rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="material-symbols-outlined text-primary text-xl">map</span>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-on-surface">
              Jharkhand District GIS Grievance Telemetry
            </h3>
            <p className="text-xs text-secondary">
              Real-time geocoded municipal incident density across 24 administrative districts
            </p>
          </div>
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1.5 bg-surface-container p-1 rounded-xl border border-surface-container-highest text-xs">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              filter === 'ALL'
                ? 'bg-surface-container-high text-on-surface font-bold shadow-sm'
                : 'text-secondary hover:text-on-surface'
            }`}
          >
            All ({mappedComplaints.length})
          </button>
          <button
            onClick={() => setFilter('CRITICAL')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium transition-all ${
              filter === 'CRITICAL'
                ? 'bg-red-500/20 text-red-400 font-bold border border-red-500/40 shadow-sm'
                : 'text-secondary hover:text-on-surface'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            Critical / Pending
          </button>
          <button
            onClick={() => setFilter('RD')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium transition-all ${
              filter === 'RD'
                ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40 shadow-sm'
                : 'text-secondary hover:text-on-surface'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            Under University R&D
          </button>
          <button
            onClick={() => setFilter('RESOLVED')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium transition-all ${
              filter === 'RESOLVED'
                ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40 shadow-sm'
                : 'text-secondary hover:text-on-surface'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            Resolved
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div className="w-full h-[460px] rounded-2xl overflow-hidden border border-surface-container-highest relative z-0">
        <MapContainer
          center={jharkhandCenter}
          zoom={8}
          scrollWheelZoom={false}
          className="w-full h-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {filteredItems.map((c) => {
            const urn = c.urn || `SAM-2026-${(c._id || '').slice(-6).toUpperCase()}`;
            return (
              <Marker
                key={c._id}
                position={[c.computedLat, c.computedLng]}
                icon={c.pin}
              >
                <Popup className="custom-leaflet-popup">
                  <div className="p-1 space-y-2 text-slate-900 max-w-[260px]">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="px-2 py-0.5 rounded bg-slate-100 font-mono text-primary">
                        {urn}
                      </span>
                      <span className="capitalize font-semibold text-slate-600">
                        {c.district}
                      </span>
                    </div>

                    <h4 className="font-bold text-xs text-slate-900 line-clamp-2 leading-tight">
                      {c.title}
                    </h4>

                    <div className="text-[11px] text-slate-600 space-y-0.5">
                      <div>
                        <strong>Category:</strong> {c.category || 'General Civic'}
                      </div>
                      <div>
                        <strong>Status:</strong>{' '}
                        <span className="capitalize font-semibold">
                          {c.status}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => navigate(`/complaints/${c._id}`)}
                      className="w-full mt-2 py-1.5 px-2 bg-orange-600 hover:bg-orange-700 text-white rounded text-xs font-bold text-center transition-colors flex items-center justify-center gap-1 shadow-sm"
                    >
                      <span>View Dossier</span>
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}
