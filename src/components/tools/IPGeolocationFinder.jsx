// components/IPGeolocationFinder.js
'use client';

import React, { useState } from 'react';

const IPGeolocationFinder = () => {
  const [ipAddress, setIpAddress] = useState('');
  const [geoData, setGeoData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchGeoData = async (ip) => {
    setLoading(true);
    setError('');
    setGeoData(null);
    
    try {
      const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,message,country,regionName,city,zip,lat,lon,isp,query`);
      const data = await response.json();
      
      if (data.status === 'success') {
        setGeoData(data);
      } else {
        setError(data.message || 'Invalid IP address or API error');
      }
    } catch (err) {
      setError('Failed to fetch geolocation data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (ipAddress.trim()) {
      fetchGeoData(ipAddress.trim());
    } else {
      setError('Please enter an IP address');
    }
  };

  // Get user's current IP
  const handleGetCurrentIP = () => {
    setIpAddress('');
    fetchGeoData(''); // Empty string will fetch user's IP
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">IP Geolocation Finder</h1>

      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={ipAddress}
            onChange={(e) => setIpAddress(e.target.value)}
            placeholder="Enter IP address (e.g., 8.8.8.8)"
            className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400"
          >
            {loading ? 'Searching...' : 'Find Location'}
          </button>
        </div>
        <button
          type="button"
          onClick={handleGetCurrentIP}
          className="mt-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors w-full sm:w-auto"
        >
          Use My IP
        </button>
      </form>

      {error && (
        <p className="text-red-600 text-center mb-4">{error}</p>
      )}

      {geoData && (
        <div className="bg-gray-50 p-4 rounded-md">
          <h2 className="text-lg font-semibold mb-3 text-center text-blue-600">
            Geolocation Results
          </h2>
          <div className="grid grid-cols-1 gap-2 text-sm">
            <p><span className="font-medium">IP Address:</span> {geoData.query}</p>
            <p><span className="font-medium">Country:</span> {geoData.country}</p>
            <p><span className="font-medium">Region:</span> {geoData.regionName}</p>
            <p><span className="font-medium">City:</span> {geoData.city}</p>
            <p><span className="font-medium">ZIP Code:</span> {geoData.zip || 'N/A'}</p>
            <p><span className="font-medium">Latitude:</span> {geoData.lat}</p>
            <p><span className="font-medium">Longitude:</span> {geoData.lon}</p>
            <p><span className="font-medium">ISP:</span> {geoData.isp}</p>
          </div>
          <a
            href={`https://www.google.com/maps?q=${geoData.lat},${geoData.lon}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 block text-center text-blue-500 hover:underline"
          >
            View on Google Maps
          </a>
        </div>
      )}

      <p className="text-xs text-gray-500 mt-4 text-center">
        Powered by ip-api.com | Data may not be 100% accurate
      </p>
    </div>
  );
};

export default IPGeolocationFinder;