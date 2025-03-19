"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaBatteryFull, FaBatteryHalf, FaBatteryQuarter, FaPlug, FaClock } from "react-icons/fa";

const BatteryStatusChecker = () => {
  const [batteryStatus, setBatteryStatus] = useState({
    isSupported: false,
    level: null, // 0 to 1
    charging: null,
    chargingTime: null, // seconds
    dischargingTime: null, // seconds
  });
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [refreshRate, setRefreshRate] = useState(5000); // ms
  const [isMonitoring, setIsMonitoring] = useState(false);

  // Initialize battery status and listeners
  useEffect(() => {
    if ("getBattery" in navigator) {
      navigator.getBattery().then((battery) => {
        const updateStatus = () => {
          setBatteryStatus({
            isSupported: true,
            level: battery.level,
            charging: battery.charging,
            chargingTime: battery.chargingTime,
            dischargingTime: battery.dischargingTime,
          });
          setHistory((prev) => [
            {
              timestamp: new Date().toLocaleTimeString(),
              level: battery.level,
              charging: battery.charging,
            },
            ...prev.slice(0, 9), // Keep last 10 entries
          ]);
        };

        updateStatus(); // Initial update

        // Event listeners
        battery.addEventListener("levelchange", updateStatus);
        battery.addEventListener("chargingchange", updateStatus);
        battery.addEventListener("chargingtimechange", updateStatus);
        battery.addEventListener("dischargingtimechange", updateStatus);

        return () => {
          battery.removeEventListener("levelchange", updateStatus);
          battery.removeEventListener("chargingchange", updateStatus);
          battery.removeEventListener("chargingtimechange", updateStatus);
          battery.removeEventListener("dischargingtimechange", updateStatus);
        };
      }).catch((err) => {
        setError("Failed to access battery status: " + err.message);
      });
    } else {
      setError("Battery Status API is not supported in this browser.");
    }
  }, []);

  // Auto-refresh monitoring
  useEffect(() => {
    let interval;
    if (isMonitoring && batteryStatus.isSupported) {
      interval = setInterval(() => {
        navigator.getBattery().then((battery) => {
          setBatteryStatus({
            isSupported: true,
            level: battery.level,
            charging: battery.charging,
            chargingTime: battery.chargingTime,
            dischargingTime: battery.dischargingTime,
          });
        });
      }, refreshRate);
    }
    return () => clearInterval(interval);
  }, [isMonitoring, refreshRate, batteryStatus.isSupported]);

  // Format time from seconds to readable format
  const formatTime = (seconds) => {
    if (seconds === Infinity || seconds === null) return "Unknown";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  // Toggle monitoring
  const toggleMonitoring = () => setIsMonitoring((prev) => !prev);

  // Clear history
  const clearHistory = () => setHistory([]);

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Battery Status Checker
        </h1>

        {batteryStatus.isSupported ? (
          <div className="space-y-6">
            {/* Battery Information */}
            <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold mb-4 text-center text-gray-700">
                Current Battery Status
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <p className="flex items-center">
                  <FaBatteryFull className="mr-2 text-blue-500" />
                  <span className="font-medium">Level:</span>{" "}
                  {batteryStatus.level !== null
                    ? `${(batteryStatus.level * 100).toFixed(1)}%`
                    : "Unknown"}
                </p>
                <p className="flex items-center">
                  <FaPlug className="mr-2 text-blue-500" />
                  <span className="font-medium">Charging:</span>{" "}
                  {batteryStatus.charging !== null
                    ? batteryStatus.charging
                      ? "Charging"
                      : "Not Charging"
                    : "Unknown"}
                </p>
                <p className="flex items-center">
                  <FaClock className="mr-2 text-blue-500" />
                  <span className="font-medium">Time to Full:</span>{" "}
                  {batteryStatus.charging && batteryStatus.chargingTime !== null
                    ? formatTime(batteryStatus.chargingTime)
                    : "N/A"}
                </p>
                <p className="flex items-center">
                  <FaClock className="mr-2 text-blue-500" />
                  <span className="font-medium">Time to Empty:</span>{" "}
                  {!batteryStatus.charging && batteryStatus.dischargingTime !== null
                    ? formatTime(batteryStatus.dischargingTime)
                    : "N/A"}
                </p>
              </div>

              {/* Battery Level Visual */}
              {batteryStatus.level !== null && (
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-6 relative">
                    <div
                      className={`h-6 rounded-full transition-all duration-500 ${
                        batteryStatus.level > 0.5
                          ? "bg-green-500"
                          : batteryStatus.level > 0.2
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                      style={{ width: `${batteryStatus.level * 100}%` }}
                    />
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white">
                      {(batteryStatus.level * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Monitoring Controls */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Refresh Rate (ms)
                </label>
                <input
                  type="number"
                  min="1000"
                  max="30000"
                  step="1000"
                  value={refreshRate}
                  onChange={(e) => setRefreshRate(Math.max(1000, Math.min(30000, e.target.value)))}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={toggleMonitoring}
                className={`flex-1 py-2 px-4 rounded-md text-white transition-colors ${
                  isMonitoring
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {isMonitoring ? "Stop Monitoring" : "Start Monitoring"}
              </button>
            </div>

            {/* History */}
            {history.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold text-gray-700">Battery History</h3>
                  <button
                    onClick={clearHistory}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Clear History
                  </button>
                </div>
                <ul className="text-sm text-gray-600 space-y-2 max-h-40 overflow-y-auto">
                  {history.map((entry, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <span>{entry.timestamp}</span> -{" "}
                      <span>
                        {entry.level !== null ? `${(entry.level * 100).toFixed(1)}%` : "Unknown"}
                      </span>
                      <span>({entry.charging ? "Charging" : "Not Charging"})</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <p className="text-gray-500 italic">
              Battery status is not available on this device/browser.
            </p>
          </div>
        )}

        {error && (
          <p className="text-sm text-red-600 text-center mt-4">{error}</p>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Real-time battery level, charging status, and time estimates</li>
            <li>Visual battery level indicator</li>
            <li>Monitoring with customizable refresh rate</li>
            <li>Battery status history tracking</li>
          </ul>
        </div>

        
      </div>
    </div>
  );
};

export default BatteryStatusChecker;