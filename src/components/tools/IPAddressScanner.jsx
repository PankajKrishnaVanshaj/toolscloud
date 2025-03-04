// components/IPAddressScanner.js
'use client';

import React, { useState } from 'react';

const IPAddressScanner = () => {
  const [ipInput, setIpInput] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // IP Validation regex (IPv4)
  const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

  // Fetch IP information from ipapi.co
  const fetchIPInfo = async (ip) => {
    try {
      setLoading(true);
      const response = await fetch(`https://ipapi.co/${ip}/json/`);
      if (!response.ok) throw new Error('Failed to fetch IP information');
      const data = await response.json();
      return data;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get user's current IP
  const getCurrentIP = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://api.ipify.org?format=json');
      if (!response.ok) throw new Error('Failed to fetch current IP');
      const data = await response.json();
      return data.ip;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Handle scan
  const handleScan = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);

    if (!ipInput) {
      setError('Please enter an IP address');
      return;
    }

    if (!ipRegex.test(ipInput)) {
      setError('Invalid IPv4 address format');
      return;
    }

    try {
      const ipInfo = await fetchIPInfo(ipInput);
      if (ipInfo.error) {
        setError(ipInfo.reason);
        return;
      }
      setResult({
        ip: ipInfo.ip,
        city: ipInfo.city,
        region: ipInfo.region,
        country: ipInfo.country_name,
        isp: ipInfo.org,
        latitude: ipInfo.latitude,
        longitude: ipInfo.longitude,
        timezone: ipInfo.timezone,
        asn: ipInfo.asn
      });
    } catch (err) {
      setError('Error fetching IP information: ' + err.message);
    }
  };

  // Handle current IP scan
  const handleCurrentIPScan = async () => {
    setError('');
    setResult(null);
    try {
      const currentIP = await getCurrentIP();
      setIpInput(currentIP);
      const ipInfo = await fetchIPInfo(currentIP);
      setResult({
        ip: ipInfo.ip,
        city: ipInfo.city,
        region: ipInfo.region,
        country: ipInfo.country_name,
        isp: ipInfo.org,
        latitude: ipInfo.latitude,
        longitude: ipInfo.longitude,
        timezone: ipInfo.timezone,
        asn: ipInfo.asn
      });
    } catch (err) {
      setError('Error fetching current IP information: ' + err.message);
    }
  };

  // Copy result to clipboard
  const copyToClipboard = () => {
    if (result) {
      const text = JSON.stringify(result, null, 2);
      navigator.clipboard.writeText(text);
    }
  };

  // Clear all
  const clearAll = () => {
    setIpInput('');
    setResult(null);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <h1 className="text-2xl font-bold text-center mb-6">IP Address Scanner</h1>
        
        <div className="space-y-6">
          {/* IP Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              IP Address (IPv4)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={ipInput}
                onChange={(e) => setIpInput(e.target.value)}
                className="flex-1 p-2 border rounded focus:ring focus:ring-blue-200"
                placeholder="Enter IP address (e.g., 8.8.8.8)"
              />
              <button
                type="button"
                onClick={handleCurrentIPScan}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Use My IP
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <button
              onClick={handleScan}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400"
            >
              {loading ? 'Scanning...' : 'Scan IP'}
            </button>
            <button
              type="button"
              onClick={clearAll}
              className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Clear
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          {/* Results */}
          {result && (
            <div className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold">Scan Results</h2>
                <button
                  onClick={copyToClipboard}
                  className="px-2 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  Copy
                </button>
              </div>
              <div className="bg-gray-50 p-4 rounded border">
                <p><span className="font-medium">IP:</span> {result.ip}</p>
                <p><span className="font-medium">City:</span> {result.city || 'N/A'}</p>
                <p><span className="font-medium">Region:</span> {result.region || 'N/A'}</p>
                <p><span className="font-medium">Country:</span> {result.country || 'N/A'}</p>
                <p><span className="font-medium">ISP:</span> {result.isp || 'N/A'}</p>
                <p><span className="font-medium">Latitude:</span> {result.latitude || 'N/A'}</p>
                <p><span className="font-medium">Longitude:</span> {result.longitude || 'N/A'}</p>
                <p><span className="font-medium">Timezone:</span> {result.timezone || 'N/A'}</p>
                <p><span className="font-medium">ASN:</span> {result.asn || 'N/A'}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IPAddressScanner;