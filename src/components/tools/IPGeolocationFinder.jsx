"use client";
import React, { useState, useCallback } from "react";
import { FaSearch, FaMapMarkerAlt, FaSync, FaCopy } from "react-icons/fa";

const IPGeolocationFinder = () => {
  const [ipAddress, setIpAddress] = useState("");
  const [geoData, setGeoData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [mapZoom, setMapZoom] = useState(10);

  // Fetch geolocation data
  const fetchGeoData = useCallback(async (ip) => {
    setLoading(true);
    setError("");
    setGeoData(null);

    try {
      const response = await fetch(
        `http://ip-api.com/json/${ip}?fields=status,message,country,regionName,city,zip,lat,lon,isp,query,timezone,org`
      );
      const data = await response.json();

      if (data.status === "success") {
        setGeoData(data);
        setHistory((prev) => [
          { ip: data.query, timestamp: new Date().toLocaleString(), ...data },
          ...prev.slice(0, 4), // Keep last 5 searches
        ]);
      } else {
        setError(data.message || "Invalid IP address or API error");
      }
    } catch (err) {
      setError("Failed to fetch geolocation data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (ipAddress.trim()) {
      fetchGeoData(ipAddress.trim());
    } else {
      setError("Please enter an IP address");
    }
  };

  // Get user's current IP
  const handleGetCurrentIP = () => {
    setIpAddress("");
    fetchGeoData(""); // Empty string fetches user's IP
  };

  // Reset form
  const reset = () => {
    setIpAddress("");
    setGeoData(null);
    setError("");
  };

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          IP Geolocation Finder
        </h1>

        {/* Search Form */}
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={ipAddress}
              onChange={(e) => setIpAddress(e.target.value)}
              placeholder="Enter IP address (e.g., 8.8.8.8)"
              className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
              disabled={loading}
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400 flex items-center justify-center"
              >
                <FaSearch className="mr-2" />
                {loading ? "Searching..." : "Find Location"}
              </button>
              <button
                type="button"
                onClick={handleGetCurrentIP}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:bg-green-400 flex items-center justify-center"
              >
                <FaMapMarkerAlt className="mr-2" /> My IP
              </button>
              <button
                type="button"
                onClick={reset}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:bg-red-400 flex items-center justify-center"
              >
                <FaSync className="mr-2" /> Reset
              </button>
            </div>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <p className="text-red-600 text-center mb-4 text-sm">{error}</p>
        )}

        {/* Geolocation Results */}
        {geoData && (
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-3 text-center text-blue-600">
                Geolocation Results
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                {[
                  { label: "IP Address", value: geoData.query },
                  { label: "Country", value: geoData.country },
                  { label: "Region", value: geoData.regionName },
                  { label: "City", value: geoData.city },
                  { label: "ZIP Code", value: geoData.zip || "N/A" },
                  { label: "Latitude", value: geoData.lat },
                  { label: "Longitude", value: geoData.lon },
                  { label: "ISP", value: geoData.isp },
                  { label: "Organization", value: geoData.org || "N/A" },
                  { label: "Timezone", value: geoData.timezone },
                ].map(({ label, value }) => (
                  <p key={label} className="flex items-center justify-between">
                    <span className="font-medium">{label}:</span>
                    <span className="flex items-center gap-2">
                      {value}
                      <button
                        onClick={() => copyToClipboard(value)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <FaCopy size={12} />
                      </button>
                    </span>
                  </p>
                ))}
              </div>
              <a
                href={`https://www.google.com/maps?q=${geoData.lat},${geoData.lon}&z=${mapZoom}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 block text-center text-blue-500 hover:underline"
              >
                View on Google Maps
              </a>
            </div>

            {/* Map Zoom Control */}
            <div className="flex justify-center items-center gap-4">
              <label className="text-sm font-medium text-gray-700">
                Map Zoom ({mapZoom})
              </label>
              <input
                type="range"
                min="1"
                max="18"
                value={mapZoom}
                onChange={(e) => setMapZoom(parseInt(e.target.value))}
                className="w-48 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            {/* Embedded Map Preview */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <iframe
                src={`https://www.google.com/maps/embed/v1/place?key=YOUR_GOOGLE_MAPS_API_KEY&q=${geoData.lat},${geoData.lon}&zoom=${mapZoom}`}
                width="100%"
                height="300"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                className="rounded-md"
              />
            </div>
          </div>
        )}

        {/* Search History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-2">Search History</h3>
            <ul className="text-sm text-gray-600 space-y-2 max-h-40 overflow-y-auto">
              {history.map((entry, index) => (
                <li
                  key={index}
                  className="flex justify-between items-center hover:bg-gray-100 p-1 rounded cursor-pointer"
                  onClick={() => {
                    setIpAddress(entry.ip);
                    setGeoData(entry);
                  }}
                >
                  <span>{entry.ip} - {entry.city}, {entry.country}</span>
                  <span className="text-xs text-gray-400">{entry.timestamp}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Lookup geolocation by IP address</li>
            <li>Get current IP location</li>
            <li>Copy data to clipboard</li>
            <li>Google Maps integration with zoom control</li>
            <li>Search history (last 5 searches)</li>
          </ul>
        </div>

        
      </div>
    </div>
  );
};

export default IPGeolocationFinder;