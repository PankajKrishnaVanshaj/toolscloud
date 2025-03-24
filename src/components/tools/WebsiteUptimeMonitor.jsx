"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaPlay, FaStop, FaSync, FaDownload, FaClock } from "react-icons/fa";

const WebsiteUptimeMonitor = () => {
  const [url, setUrl] = useState("");
  const [monitoring, setMonitoring] = useState(false);
  const [statusHistory, setStatusHistory] = useState([]);
  const [currentStatus, setCurrentStatus] = useState(null);
  const [error, setError] = useState("");
  const [intervalSeconds, setIntervalSeconds] = useState(30);
  const [soundAlert, setSoundAlert] = useState(false);
  const [uptimePercentage, setUptimePercentage] = useState(null);

  // Check website status
  const checkStatus = useCallback(async (websiteUrl) => {
    try {
      const startTime = Date.now();
      const response = await fetch(
        `https://api.allorigins.win/raw?url=${encodeURIComponent(websiteUrl)}`,
        {
          mode: "cors",
          cache: "no-cache",
        }
      );
      const endTime = Date.now();

      const newStatus = {
        timestamp: new Date().toLocaleString(),
        isUp: response.ok,
        status: response.status,
        responseTime: endTime - startTime,
      };

      setCurrentStatus(newStatus);
      setStatusHistory((prev) => [newStatus, ...prev].slice(0, 50)); // Keep last 50 checks
      setError("");

      // Calculate uptime percentage
      const totalChecks = statusHistory.length + 1;
      const upChecks = statusHistory.filter((s) => s.isUp).length + (newStatus.isUp ? 1 : 0);
      setUptimePercentage(((upChecks / totalChecks) * 100).toFixed(2));

      // Play sound if site goes down and sound alert is enabled
      if (!newStatus.isUp && soundAlert) {
        new Audio("/alert.mp3").play().catch(() => console.log("Audio playback failed"));
      }
    } catch (err) {
      const newStatus = {
        timestamp: new Date().toLocaleString(),
        isUp: false,
        status: "Error",
        responseTime: 0,
      };
      setCurrentStatus(newStatus);
      setStatusHistory((prev) => [newStatus, ...prev].slice(0, 50));
      setError("Failed to check website status.");
      setUptimePercentage(
        ((statusHistory.filter((s) => s.isUp).length / (statusHistory.length + 1)) * 100).toFixed(2)
      );
    }
  }, [statusHistory, soundAlert]);

  // Start/stop monitoring
  const toggleMonitoring = () => {
    if (!url || !/^(https?:\/\/)/i.test(url)) {
      setError("Please enter a valid URL starting with http:// or https://");
      return;
    }
    setMonitoring((prev) => !prev);
    if (!monitoring) {
      checkStatus(url); // Initial check
    }
  };

  // Periodic checking
  useEffect(() => {
    let interval;
    if (monitoring && url) {
      interval = setInterval(() => checkStatus(url), intervalSeconds * 1000);
    }
    return () => clearInterval(interval);
  }, [monitoring, url, intervalSeconds, checkStatus]);

  // Reset everything
  const reset = () => {
    setUrl("");
    setMonitoring(false);
    setStatusHistory([]);
    setCurrentStatus(null);
    setError("");
    setUptimePercentage(null);
    setIntervalSeconds(30);
    setSoundAlert(false);
  };

  // Download status history as CSV
  const downloadHistory = () => {
    const csvContent = [
      "Timestamp,Status,Response Time (ms)",
      ...statusHistory.map(
        (status) =>
          `${status.timestamp},${status.isUp ? "Up" : "Down"},${status.responseTime}`
      ),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `uptime-history-${Date.now()}.csv`;
    link.click();
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Website Uptime Monitor
        </h1>

        <div className="space-y-6">
          {/* Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Website URL
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                disabled={monitoring}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Check Interval (seconds)
              </label>
              <input
                type="number"
                min="5"
                max="300"
                value={intervalSeconds}
                onChange={(e) => setIntervalSeconds(Math.max(5, Math.min(300, e.target.value)))}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                disabled={monitoring}
              />
            </div>
          </div>

          {/* Additional Settings */}
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={soundAlert}
                onChange={(e) => setSoundAlert(e.target.checked)}
                className="mr-2 accent-blue-500"
                disabled={monitoring}
              />
              <span className="text-sm text-gray-700">Sound Alert on Downtime</span>
            </label>
            <div className="flex gap-2 flex-1 justify-end">
              <button
                onClick={toggleMonitoring}
                className={`flex-1 sm:flex-none py-2 px-4 rounded-md text-white transition-colors flex items-center justify-center ${
                  monitoring
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {monitoring ? <FaStop className="mr-2" /> : <FaPlay className="mr-2" />}
                {monitoring ? "Stop" : "Start"} Monitoring
              </button>
              <button
                onClick={reset}
                className="flex-1 sm:flex-none py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center justify-center"
              >
                <FaSync className="mr-2" /> Reset
              </button>
            </div>
          </div>

          {/* Current Status */}
          {currentStatus && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-2">Current Status</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                <p>
                  <span className="font-medium">Status:</span>{" "}
                  <span className={currentStatus.isUp ? "text-green-600" : "text-red-600"}>
                    {currentStatus.isUp ? "Online" : "Offline"} ({currentStatus.status})
                  </span>
                </p>
                <p>
                  <span className="font-medium">Response Time:</span> {currentStatus.responseTime} ms
                </p>
                <p>
                  <span className="font-medium">Last Checked:</span> {currentStatus.timestamp}
                </p>
                {uptimePercentage && (
                  <p>
                    <span className="font-medium">Uptime:</span> {uptimePercentage}%
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Status History */}
          {statusHistory.length > 0 && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold">Recent Checks (Last 50)</h2>
                <button
                  onClick={downloadHistory}
                  className="py-1 px-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
                >
                  <FaDownload className="mr-2" /> Export CSV
                </button>
              </div>
              <div className="max-h-64 overflow-y-auto border rounded-lg bg-gray-50 p-2">
                {statusHistory.map((status, index) => (
                  <div
                    key={index}
                    className="text-sm py-1 border-b last:border-b-0 flex justify-between"
                  >
                    <span>
                      {status.timestamp} -{" "}
                      <span className={status.isUp ? "text-green-600" : "text-red-600"}>
                        {status.isUp ? "Up" : "Down"}
                      </span>
                    </span>
                    <span>{status.responseTime} ms</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && <p className="text-sm text-red-600 text-center">{error}</p>}

          {/* Features */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>Real-time website status monitoring</li>
              <li>Customizable check interval (5-300 seconds)</li>
              <li>Sound alert on downtime</li>
              <li>Uptime percentage calculation</li>
              <li>Export history as CSV</li>
            </ul>
          </div>

         
        </div>
      </div>
    </div>
  );
};

export default WebsiteUptimeMonitor;