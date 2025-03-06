// components/VirtualLevelTool.js
'use client';

import React, { useState, useEffect } from 'react';

const VirtualLevelTool = () => {
  const [angles, setAngles] = useState({ alpha: 0, beta: 0, gamma: 0 });
  const [isSupported, setIsSupported] = useState(true);
  const [permissionGranted, setPermissionGranted] = useState(false);

  // Request permission and start listening to device orientation
  const requestPermission = async () => {
    if (typeof DeviceOrientationEvent !== 'undefined' && 
        typeof DeviceOrientationEvent.requestPermission === 'function') {
      try {
        const permission = await DeviceOrientationEvent.requestPermission();
        if (permission === 'granted') {
          setPermissionGranted(true);
          window.addEventListener('deviceorientation', handleOrientation);
        }
      } catch (error) {
        setIsSupported(false);
      }
    } else if ('ondeviceorientation' in window) {
      // For browsers that don't require explicit permission
      setPermissionGranted(true);
      window.addEventListener('deviceorientation', handleOrientation);
    } else {
      setIsSupported(false);
    }
  };

  // Handle orientation changes
  const handleOrientation = (event) => {
    setAngles({
      alpha: event.alpha || 0, // Z-axis rotation (0-360°)
      beta: event.beta || 0,   // X-axis rotation (-180° to 180°)
      gamma: event.gamma || 0  // Y-axis rotation (-90° to 90°)
    });
  };

  // Cleanup event listener
  useEffect(() => {
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);

  // Calculate bubble position
  const bubblePosition = {
    x: Math.min(Math.max(angles.gamma * 2, -90), 90), // Horizontal tilt
    y: Math.min(Math.max(angles.beta * 2, -90), 90)   // Vertical tilt
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Virtual Level Tool</h1>

      {!permissionGranted && isSupported && (
        <div className="text-center">
          <button
            onClick={requestPermission}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Enable Level Tool
          </button>
          <p className="mt-2 text-sm text-gray-500">
            Click to grant motion sensor permission
          </p>
        </div>
      )}

      {!isSupported && (
        <p className="text-center text-red-600">
          Device orientation is not supported on this device/browser.
        </p>
      )}

      {permissionGranted && (
        <div className="space-y-6">
          {/* Level Visualization */}
          <div className="relative w-64 h-64 mx-auto">
            {/* Level Frame */}
            <div className="absolute inset-0 border-4 border-gray-700 rounded-full bg-gray-100">
              {/* Horizontal Line */}
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-400"></div>
              {/* Vertical Line */}
              <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-400"></div>
              {/* Center Mark */}
              <div className="absolute left-1/2 top-1/2 w-2 h-2 bg-red-500 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
            </div>
            {/* Bubble */}
            <div
              className="absolute w-12 h-12 bg-blue-500 rounded-full opacity-70 transition-all duration-100"
              style={{
                left: `calc(50% + ${bubblePosition.x}px - 1.5rem)`,
                top: `calc(50% + ${bubblePosition.y}px - 1.5rem)`,
              }}
            />
          </div>

          {/* Angle Readings */}
          <div className="text-center">
            <p className="text-sm">
              <span className="font-medium">Horizontal Tilt (γ):</span> {angles.gamma.toFixed(1)}°
            </p>
            <p className="text-sm">
              <span className="font-medium">Vertical Tilt (β):</span> {angles.beta.toFixed(1)}°
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Green zone: ±2° from level
            </p>
          </div>

          {/* Level Indicator */}
          <div className="text-center">
            {Math.abs(angles.gamma) <= 2 && Math.abs(angles.beta) <= 2 ? (
              <p className="text-green-600 font-semibold">LEVEL</p>
            ) : (
              <p className="text-red-600 font-semibold">NOT LEVEL</p>
            )}
          </div>
        </div>
      )}

      <p className="text-xs text-gray-500 mt-4 text-center">
        Note: Requires a device with motion sensors. Best used on mobile devices.
      </p>
    </div>
  );
};

export default VirtualLevelTool;