// components/BatteryStatusChecker.js
'use client';

import React, { useState, useEffect } from 'react';

const BatteryStatusChecker = () => {
  const [batteryStatus, setBatteryStatus] = useState({
    isSupported: false,
    level: null, // 0 to 1
    charging: null,
    chargingTime: null, // seconds
    dischargingTime: null, // seconds
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if ('getBattery' in navigator) {
      navigator.getBattery().then((battery) => {
        // Initial battery status
        setBatteryStatus({
          isSupported: true,
          level: battery.level,
          charging: battery.charging,
          chargingTime: battery.chargingTime,
          dischargingTime: battery.dischargingTime,
        });

        // Event listeners for battery changes
        battery.addEventListener('levelchange', () => {
          setBatteryStatus(prev => ({ ...prev, level: battery.level }));
        });
        battery.addEventListener('chargingchange', () => {
          setBatteryStatus(prev => ({ ...prev, charging: battery.charging }));
        });
        battery.addEventListener('chargingtimechange', () => {
          setBatteryStatus(prev => ({ ...prev, chargingTime: battery.chargingTime }));
        });
        battery.addEventListener('dischargingtimechange', () => {
          setBatteryStatus(prev => ({ ...prev, dischargingTime: battery.dischargingTime }));
        });
      }).catch((err) => {
        setError('Failed to access battery status: ' + err.message);
      });
    } else {
      setError('Battery Status API is not supported in this browser.');
    }
  }, []);

  // Format time from seconds to readable format
  const formatTime = (seconds) => {
    if (seconds === Infinity || seconds === null) return 'Unknown';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Battery Status Checker</h1>

      {batteryStatus.isSupported ? (
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-md">
            <h2 className="text-lg font-semibold mb-2 text-center">Battery Information</h2>
            <div className="grid grid-cols-1 gap-3 text-sm">
              <p>
                <span className="font-medium">Battery Level:</span>{' '}
                {batteryStatus.level !== null 
                  ? `${(batteryStatus.level * 100).toFixed(1)}%` 
                  : 'Unknown'}
              </p>
              <p>
                <span className="font-medium">Charging Status:</span>{' '}
                {batteryStatus.charging !== null 
                  ? (batteryStatus.charging ? 'Charging' : 'Not Charging') 
                  : 'Unknown'}
              </p>
              <p>
                <span className="font-medium">Time to Full Charge:</span>{' '}
                {batteryStatus.charging && batteryStatus.chargingTime !== null 
                  ? formatTime(batteryStatus.chargingTime) 
                  : 'N/A'}
              </p>
              <p>
                <span className="font-medium">Time to Discharge:</span>{' '}
                {!batteryStatus.charging && batteryStatus.dischargingTime !== null 
                  ? formatTime(batteryStatus.dischargingTime) 
                  : 'N/A'}
              </p>
            </div>

            {/* Battery Level Visual */}
            {batteryStatus.level !== null && (
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className={`h-4 rounded-full transition-all duration-500 ${
                      batteryStatus.level > 0.5 ? 'bg-green-500' : 
                      batteryStatus.level > 0.2 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${batteryStatus.level * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <p className="text-center text-gray-500">
          Battery status is not available on this device/browser.
        </p>
      )}

      {error && (
        <p className="text-sm text-red-600 text-center mt-4">{error}</p>
      )}

      <p className="text-xs text-gray-500 mt-4 text-center">
        Note: Requires browser support and may not work on all devices or in all contexts.
      </p>
    </div>
  );
};

export default BatteryStatusChecker;