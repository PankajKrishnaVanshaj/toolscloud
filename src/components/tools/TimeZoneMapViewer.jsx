"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { FaSearchPlus, FaSearchMinus, FaSync, FaClock } from "react-icons/fa";

// Fix Leaflet icon issue in Next.js
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function TimeZoneMapViewer() {
  const [selectedTimeZone, setSelectedTimeZone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );
  const [currentTime, setCurrentTime] = useState("");
  const [timeZones, setTimeZones] = useState([]);
  const [zoomLevel, setZoomLevel] = useState(2);
  const [mapStyle, setMapStyle] = useState("default");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const mapRef = useRef(null);

  // Load time zone data
  useEffect(() => {
    setIsLoading(true);
    fetch(
      "https://raw.githubusercontent.com/evansiroky/timezone-boundary-builder/master/output/combined-simplified.json"
    )
      .then((response) => response.json())
      .then((data) => {
        setTimeZones(data.features);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load time zones:", err);
        setIsLoading(false);
      });
  }, []);

  // Update current time
  useEffect(() => {
    const updateTime = () => {
      const time = new Intl.DateTimeFormat("en-US", {
        timeZone: selectedTimeZone,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
        timeZoneName: "short",
      }).format(new Date());
      setCurrentTime(time);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [selectedTimeZone]);

  // Map updater component
  const MapUpdater = () => {
    const map = useMap();
    useEffect(() => {
      if (selectedTimeZone && timeZones.length > 0) {
        const tzFeature = timeZones.find(
          (tz) => tz.properties.tzid === selectedTimeZone
        );
        if (tzFeature) {
          const bounds = L.geoJSON(tzFeature).getBounds();
          map.fitBounds(bounds);
        }
      }
      map.setZoom(zoomLevel);
    }, [map, selectedTimeZone, zoomLevel]);
    return null;
  };

  // Map interactions
  const onEachFeature = (feature, layer) => {
    layer.on({
      click: () => setSelectedTimeZone(feature.properties.tzid),
      mouseover: (e) => layer.bindPopup(feature.properties.tzid).openPopup(),
      mouseout: (e) => layer.closePopup(),
    });
  };

  const styleFeature = (feature) => ({
    fillColor: feature.properties.tzid === selectedTimeZone ? "#FF6B6B" : "#4ECDC4",
    weight: 1,
    opacity: 1,
    color: "white",
    fillOpacity: 0.7,
  });

  // Map styles
  const mapStyles = {
    default: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    satellite: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
  };

  // Filtered time zones for search
  const filteredTimeZones = Intl.supportedValuesOf("timeZone").filter((tz) =>
    tz.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Reset to default
  const resetMap = () => {
    setSelectedTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    setZoomLevel(2);
    setMapStyle("default");
    setSearchQuery("");
  };

  // Zoom controls
  const adjustZoom = (amount) => {
    setZoomLevel((prev) => Math.max(1, Math.min(10, prev + amount)));
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-xl p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Time Zone Map Viewer
        </h1>

        {/* Controls */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Time Zone
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g., America/New_York"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={selectedTimeZone}
              onChange={(e) => setSelectedTimeZone(e.target.value)}
              className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 max-h-40 overflow-y-auto"
            >
              {filteredTimeZones.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Time
            </label>
            <div className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md flex items-center">
              <FaClock className="mr-2 text-gray-500" />
              {currentTime}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Map Style
            </label>
            <select
              value={mapStyle}
              onChange={(e) => setMapStyle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="default">Default</option>
              <option value="satellite">Satellite</option>
              <option value="dark">Dark</option>
            </select>
            <div className="mt-2 flex items-center gap-2">
              <button
                onClick={() => adjustZoom(-1)}
                className="p-2 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                <FaSearchMinus />
              </button>
              <span className="text-sm text-gray-600">Zoom: {zoomLevel}</span>
              <button
                onClick={() => adjustZoom(1)}
                className="p-2 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                <FaSearchPlus />
              </button>
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="relative h-[500px] w-full rounded-lg overflow-hidden shadow-md">
          <MapContainer
            center={[0, 0]}
            zoom={zoomLevel}
            style={{ height: "100%", width: "100%" }}
            ref={mapRef}
          >
            <TileLayer
              url={mapStyles[mapStyle]}
              attribution={
                mapStyle === "satellite"
                  ? "© Esri"
                  : "© <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
              }
            />
            {timeZones.length > 0 && (
              <GeoJSON data={timeZones} style={styleFeature} onEachFeature={onEachFeature} />
            )}
            <MapUpdater />
          </MapContainer>
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-75">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={resetMap}
            className="py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center"
          >
            <FaSync className="mr-2" /> Reset Map
          </button>
        </div>

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Interactive time zone map with clickable regions</li>
            <li>Searchable time zone dropdown</li>
            <li>Real-time clock with time zone name</li>
            <li>Multiple map styles: Default, Satellite, Dark</li>
            <li>Zoom controls (1-10 levels)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}