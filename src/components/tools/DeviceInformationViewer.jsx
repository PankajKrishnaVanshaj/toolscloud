// components/DeviceInformationViewer.js
'use client';

import React, { useState, useEffect } from 'react';

const DeviceInformationViewer = () => {
  const [deviceInfo, setDeviceInfo] = useState({});
  const [error, setError] = useState('');

  const fetchDeviceInfo = async () => {
    try {
      const info = {
        // Basic Navigator properties
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language || navigator.userLanguage,
        cookiesEnabled: navigator.cookieEnabled ? 'Yes' : 'No',
        onlineStatus: navigator.onLine ? 'Online' : 'Offline',
        
        // Screen properties
        screenWidth: `${window.screen.width}px`,
        screenHeight: `${window.screen.height}px`,
        colorDepth: `${window.screen.colorDepth} bits`,
        
        // Device memory (if available)
        deviceMemory: navigator.deviceMemory ? `${navigator.deviceMemory} GB` : 'Not supported',
        
        // CPU cores (if available)
        hardwareConcurrency: navigator.hardwareConcurrency 
          ? `${navigator.hardwareConcurrency} cores` 
          : 'Not supported',
        
        // Connection info (if available)
        connection: navigator.connection 
          ? {
              effectiveType: navigator.connection.effectiveType,
              downlink: `${navigator.connection.downlink} Mbps`,
              rtt: `${navigator.connection.rtt} ms`
            } 
          : 'Not supported',
      };

      // Try to get battery info if available
      if ('getBattery' in navigator) {
        const battery = await navigator.getBattery();
        info.battery = {
          level: `${(battery.level * 100).toFixed(0)}%`,
          charging: battery.charging ? 'Yes' : 'No',
        };
      } else {
        info.battery = 'Not supported';
      }

      setDeviceInfo(info);
      setError('');
    } catch (err) {
      setError('Error fetching device information: ' + err.message);
    }
  };

  useEffect(() => {
    fetchDeviceInfo();
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Device Information Viewer</h1>

      <div className="space-y-6">
        {/* Basic Info */}
        <section>
          <h2 className="text-lg font-semibold mb-2">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-md">
            <InfoItem label="User Agent" value={deviceInfo.userAgent} />
            <InfoItem label="Platform" value={deviceInfo.platform} />
            <InfoItem label="Language" value={deviceInfo.language} />
            <InfoItem label="Cookies Enabled" value={deviceInfo.cookiesEnabled} />
            <InfoItem label="Online Status" value={deviceInfo.onlineStatus} />
          </div>
        </section>

        {/* Screen Info */}
        <section>
          <h2 className="text-lg font-semibold mb-2">Screen Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-md">
            <InfoItem label="Width" value={deviceInfo.screenWidth} />
            <InfoItem label="Height" value={deviceInfo.screenHeight} />
            <InfoItem label="Color Depth" value={deviceInfo.colorDepth} />
          </div>
        </section>

        {/* Hardware Info */}
        <section>
          <h2 className="text-lg font-semibold mb-2">Hardware Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-md">
            <InfoItem label="Device Memory" value={deviceInfo.deviceMemory} />
            <InfoItem label="CPU Cores" value={deviceInfo.hardwareConcurrency} />
          </div>
        </section>

        {/* Connection Info */}
        {deviceInfo.connection !== 'Not supported' && (
          <section>
            <h2 className="text-lg font-semibold mb-2">Connection Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-md">
              <InfoItem label="Effective Type" value={deviceInfo.connection?.effectiveType} />
              <InfoItem label="Downlink" value={deviceInfo.connection?.downlink} />
              <InfoItem label="Round-Trip Time" value={deviceInfo.connection?.rtt} />
            </div>
          </section>
        )}

        {/* Battery Info */}
        {deviceInfo.battery !== 'Not supported' && (
          <section>
            <h2 className="text-lg font-semibold mb-2">Battery Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-md">
              <InfoItem label="Level" value={deviceInfo.battery?.level} />
              <InfoItem label="Charging" value={deviceInfo.battery?.charging} />
            </div>
          </section>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600 text-center mt-4">{error}</p>
      )}

      <p className="text-xs text-gray-500 mt-4 text-center">
        Note: Some information may not be available depending on your browser and permissions.
      </p>
    </div>
  );
};

// Helper component for displaying info items
const InfoItem = ({ label, value }) => (
  <div>
    <span className="font-medium text-gray-700">{label}:</span>{' '}
    <span className="text-gray-600">{value || 'Loading...'}</span>
  </div>
);

export default DeviceInformationViewer;