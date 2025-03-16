"use client";
import React, { useState, useCallback } from "react";
import { FaCopy, FaSync, FaMapMarkerAlt, FaSearch } from "react-icons/fa";

const IPAddressScanner = () => {
  const [ipInput, setIpInput] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [scanHistory, setScanHistory] = useState([]);
  const [showMap, setShowMap] = useState(false);

  // IP Validation regex (IPv4)
  const ipRegex =
    /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

  // Fetch IP information from ipapi.co
  const fetchIPInfo = useCallback(async (ip) => {
    try {
      setLoading(true);
      const response = await fetch(`https://ipapi.co/${ip}/json/`);
      if (!response.ok) throw new Error("Failed to fetch IP information");
      const data = await response.json();
      if (data.error) throw new Error(data.reason);
      return data;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get user's current IP
  const getCurrentIP = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("https://api.ipify.org?format=json");
      if (!response.ok) throw new Error("Failed to fetch current IP");
      const data = await response.json();
      return data.ip;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle scan
  const handleScan = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);

    if (!ipInput) {
      setError("Please enter an IP address");
      return;
    }

    if (!ipRegex.test(ipInput)) {
      setError("Invalid IPv4 address format");
      return;
    }

    try {
      const ipInfo = await fetchIPInfo(ipInput);
      const scanResult = {
        ip: ipInfo.ip,
        city: ipInfo.city,
        region: ipInfo.region,
        country: ipInfo.country_name,
        isp: ipInfo.org,
        latitude: ipInfo.latitude,
        longitude: ipInfo.longitude,
        timezone: ipInfo.timezone,
        asn: ipInfo.asn,
        timestamp: new Date().toLocaleString(),
      };
      setResult(scanResult);
      setScanHistory((prev) => [scanResult, ...prev.slice(0, 9)]); // Keep last 10 scans
    } catch (err) {
      setError("Error fetching IP information: " + err.message);
    }
  };

  // Handle current IP scan
  const handleCurrentIPScan = async () => {
    setError("");
    setResult(null);
    try {
      const currentIP = await getCurrentIP();
      setIpInput(currentIP);
      const ipInfo = await fetchIPInfo(currentIP);
      const scanResult = {
        ip: ipInfo.ip,
        city: ipInfo.city,
        region: ipInfo.region,
        country: ipInfo.country_name,
        isp: ipInfo.org,
        latitude: ipInfo.latitude,
        longitude: ipInfo.longitude,
        timezone: ipInfo.timezone,
        asn: ipInfo.asn,
        timestamp: new Date().toLocaleString(),
      };
      setResult(scanResult);
      setScanHistory((prev) => [scanResult, ...prev.slice(0, 9)]);
    } catch (err) {
      setError("Error fetching current IP information: " + err.message);
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
    setIpInput("");
    setResult(null);
    setError("");
    setScanHistory([]);
    setShowMap(false);
  };

  // Load history result
  const loadHistoryResult = (historyItem) => {
    setResult(historyItem);
    setIpInput(historyItem.ip);
    setError("");
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          IP Address Scanner
        </h1>

        <div className="space-y-6">
          {/* IP Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              IP Address (IPv4)
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={ipInput}
                onChange={(e) => setIpInput(e.target.value)}
                className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 8.8.8.8"
                disabled={loading}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleScan}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center"
                >
                  <FaSearch className="mr-2" />
                  {loading ? "Scanning..." : "Scan IP"}
                </button>
                <button
                  onClick={handleCurrentIPScan}
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  Use My IP
                </button>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm text-center">
              {error}
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-800">Scan Results</h2>
                <div className="flex gap-2">
                  <button
                    onClick={copyToClipboard}
                    className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <FaCopy className="mr-2" /> Copy
                  </button>
                  {result.latitude && result.longitude && (
                    <button
                      onClick={() => setShowMap(!showMap)}
                      className="px-3 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center"
                    >
                      <FaMapMarkerAlt className="mr-2" /> {showMap ? "Hide Map" : "Show Map"}
                    </button>
                  )}
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border">
                {Object.entries(result)
                  .filter(([key]) => key !== "timestamp")
                  .map(([key, value]) => (
                    <p key={key}>
                      <span className="font-medium capitalize">{key}:</span>{" "}
                      {value || "N/A"}
                    </p>
                  ))}
              </div>
              {showMap && result.latitude && result.longitude && (
                <iframe
                  width="100%"
                  height="300"
                  frameBorder="0"
                  style={{ border: 0 }}
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${result.longitude - 0.01},${result.latitude - 0.01},${result.longitude + 0.01},${result.latitude + 0.01}&layer=mapnik&marker=${result.latitude},${result.longitude}`}
                  allowFullScreen
                ></iframe>
              )}
            </div>
          )}

          {/* Scan History */}
          {scanHistory.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Scan History</h3>
              <div className="max-h-48 overflow-y-auto bg-gray-50 p-4 rounded-lg border">
                <ul className="space-y-2">
                  {scanHistory.map((item, index) => (
                    <li
                      key={index}
                      className="flex justify-between items-center p-2 bg-white rounded-md shadow-sm hover:bg-gray-100 cursor-pointer"
                      onClick={() => loadHistoryResult(item)}
                    >
                      <span>{item.ip}</span>
                      <span className="text-sm text-gray-500">{item.timestamp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-center">
            <button
              onClick={clearAll}
              className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center"
            >
              <FaSync className="mr-2" /> Clear All
            </button>
          </div>

          {/* Features */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>Scan any IPv4 address or use your current IP</li>
              <li>Detailed geolocation and network information</li>
              <li>Interactive map view</li>
              <li>Scan history (last 10 scans)</li>
              <li>Copy results to clipboard</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IPAddressScanner;