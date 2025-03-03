'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet icon issue in Next.js
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function TimeZoneMapViewer() {
  const [selectedTimeZone, setSelectedTimeZone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [currentTime, setCurrentTime] = useState('');
  const [timeZones, setTimeZones] = useState([]);
  const mapRef = useRef(null);

  useEffect(() => {
    fetch('https://raw.githubusercontent.com/evansiroky/timezone-boundary-builder/master/output/combined-simplified.json')
      .then(response => response.json())
      .then(data => setTimeZones(data.features))
      .catch(err => console.error('Failed to load time zones:', err));
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const time = new Intl.DateTimeFormat('en-US', {
        timeZone: selectedTimeZone,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      }).format(new Date());
      setCurrentTime(time);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [selectedTimeZone]);

  const MapUpdater = () => {
    const map = useMap();
    useEffect(() => {
      if (selectedTimeZone && timeZones.length > 0) {
        const tzFeature = timeZones.find(tz => tz.properties.tzid === selectedTimeZone);
        if (tzFeature) {
          const bounds = L.geoJSON(tzFeature).getBounds();
          map.fitBounds(bounds);
        }
      }
    }, [map, selectedTimeZone]);
    return null;
  };

  const onEachFeature = (feature, layer) => {
    layer.on({
      click: () => setSelectedTimeZone(feature.properties.tzid),
      mouseover: (e) => layer.bindPopup(feature.properties.tzid).openPopup(),
      mouseout: (e) => layer.closePopup(),
    });
  };

  const styleFeature = (feature) => ({
    fillColor: feature.properties.tzid === selectedTimeZone ? '#FF6B6B' : '#4ECDC4',
    weight: 1,
    opacity: 1,
    color: 'white',
    fillOpacity: 0.7,
  });

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Time Zone Map Viewer
        </h1>
        <div className="grid gap-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Time Zone
              </label>
              <select
                value={selectedTimeZone}
                onChange={(e) => setSelectedTimeZone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Intl.supportedValuesOf('timeZone').map((tz) => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Time
              </label>
              <div className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md">
                {currentTime}
              </div>
            </div>
          </div>
          <div className="h-[500px] w-full">
            <MapContainer
              center={[0, 0]}
              zoom={2}
              style={{ height: '100%', width: '100%' }}
              ref={mapRef}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              {timeZones.length > 0 && (
                <GeoJSON
                  data={timeZones}
                  style={styleFeature}
                  onEachFeature={onEachFeature}
                />
              )}
              <MapUpdater />
            </MapContainer>
          </div>
        </div>
        <div className="mt-6 text-sm text-gray-600">
          <details>
            <summary className="cursor-pointer font-medium">Features & Usage</summary>
            <ul className="list-disc list-inside mt-2">
              <li>Interactive world map with time zone boundaries</li>
              <li>Click a zone to select it</li>
              <li>Hover for time zone name</li>
              <li>Real-time clock for selected zone</li>
              <li>Zoom and pan to explore</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};