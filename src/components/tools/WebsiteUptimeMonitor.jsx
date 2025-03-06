// components/WebsiteUptimeMonitor.js
'use client';

import React, { useState, useEffect } from 'react';

const WebsiteUptimeMonitor = () => {
  const [url, setUrl] = useState('');
  const [monitoring, setMonitoring] = useState(false);
  const [statusHistory, setStatusHistory] = useState([]);
  const [currentStatus, setCurrentStatus] = useState(null);
  const [error, setError] = useState('');

  // Check website status
  const checkStatus = async (websiteUrl) => {
    try {
      const startTime = Date.now();
      const response = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(websiteUrl)}`, {
        mode: 'cors',
        cache: 'no-cache',
      });
      const endTime = Date.now();
      
      const newStatus = {
        timestamp: new Date().toLocaleString(),
        isUp: response.ok,
        status: response.status,
        responseTime: endTime - startTime,
      };
      
      setCurrentStatus(newStatus);
      setStatusHistory(prev => [newStatus, ...prev].slice(0, 10)); // Keep last 10 checks
      setError('');
    } catch (err) {
      const newStatus = {
        timestamp: new Date().toLocaleString(),
        isUp: false,
        status: 'Error',
        responseTime: 0,
      };
      setCurrentStatus(newStatus);
      setStatusHistory(prev => [newStatus, ...prev].slice(0, 10));
      setError('Failed to check website status.');
    }
  };

  // Start/stop monitoring
  const toggleMonitoring = () => {
    if (!url) {
      setError('Please enter a valid URL');
      return;
    }
    setMonitoring(!monitoring);
    if (!monitoring) {
      checkStatus(url); // Initial check
    }
  };

  // Periodic checking when monitoring
  useEffect(() => {
    let interval;
    if (monitoring && url) {
      interval = setInterval(() => checkStatus(url), 30000); // Check every 30 seconds
    }
    return () => clearInterval(interval);
  }, [monitoring, url]);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Website Uptime Monitor</h1>

      <div className="space-y-4">
        {/* URL Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Website URL
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={toggleMonitoring}
              className={`px-4 py-2 rounded-md text-white transition-colors ${
                monitoring 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {monitoring ? 'Stop Monitoring' : 'Start Monitoring'}
            </button>
          </div>
        </div>

        {/* Current Status */}
        {currentStatus && (
          <div className="bg-gray-50 p-4 rounded-md">
            <h2 className="text-lg font-semibold mb-2">Current Status</h2>
            <div className="space-y-1 text-sm">
              <p>
                <span className="font-medium">Status:</span>{' '}
                <span className={currentStatus.isUp ? 'text-green-600' : 'text-red-600'}>
                  {currentStatus.isUp ? 'Online' : 'Offline'} ({currentStatus.status})
                </span>
              </p>
              <p>
                <span className="font-medium">Response Time:</span> {currentStatus.responseTime} ms
              </p>
              <p>
                <span className="font-medium">Last Checked:</span> {currentStatus.timestamp}
              </p>
            </div>
          </div>
        )}

        {/* Status History */}
        {statusHistory.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-2">Recent Checks (Last 10)</h2>
            <div className="max-h-[200px] overflow-y-auto border rounded-md bg-gray-50 p-2">
              {statusHistory.map((status, index) => (
                <div
                  key={index}
                  className="text-sm py-1 border-b last:border-b-0 flex justify-between"
                >
                  <span>
                    {status.timestamp} -{' '}
                    <span className={status.isUp ? 'text-green-600' : 'text-red-600'}>
                      {status.isUp ? 'Up' : 'Down'}
                    </span>
                  </span>
                  <span>{status.responseTime} ms</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <p className="text-sm text-red-600 text-center">{error}</p>
        )}

        {/* Note */}
        <p className="text-xs text-gray-500 mt-4">
          Note: This tool checks website status every 30 seconds while monitoring.
          It uses a proxy service (api.allorigins.win) to avoid CORS issues.
          For production use, consider a dedicated backend service.
        </p>
      </div>
    </div>
  );
};

export default WebsiteUptimeMonitor;