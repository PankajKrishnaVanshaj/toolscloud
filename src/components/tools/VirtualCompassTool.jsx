// components/VirtualCompassTool.js
'use client';

import React, { useState, useEffect } from 'react';

const VirtualCompassTool = () => {
  const [heading, setHeading] = useState(null);
  const [error, setError] = useState('');
  const [isManual, setIsManual] = useState(false);
  const [manualHeading, setManualHeading] = useState(0);

  // Handle device orientation
  useEffect(() => {
    if (!isManual && 'DeviceOrientationEvent' in window) {
      const handleOrientation = (event) => {
        // Use webkitCompassHeading for iOS, alpha for others
        const direction = event.webkitCompassHeading || (360 - event.alpha);
        if (direction !== null && direction !== undefined) {
          setHeading(direction.toFixed(1));
          setError('');
        }
      };

      // Request permission on iOS
      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission()
          .then(permissionState => {
            if (permissionState === 'granted') {
              window.addEventListener('deviceorientation', handleOrientation);
            } else {
              setError('Permission denied. Using manual mode.');
              setIsManual(true);
            }
          })
          .catch(err => {
            setError('Error requesting permission. Using manual mode.');
            setIsManual(true);
          });
      } else {
        // Non-iOS devices
        window.addEventListener('deviceorientation', handleOrientation);
      }

      return () => {
        window.removeEventListener('deviceorientation', handleOrientation);
      };
    } else if (!isManual) {
      setError('Device orientation not supported. Using manual mode.');
      setIsManual(true);
    }
  }, [isManual]);

  // Calculate cardinal direction
  const getCardinalDirection = (deg) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(deg / 45) % 8;
    return directions[index];
  };

  // Compass needle rotation style
  const needleStyle = {
    transform: `rotate(${(isManual ? manualHeading : heading) || 0}deg)`,
    transition: 'transform 0.2s ease-out'
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Virtual Compass Tool</h1>

      <div className="relative flex justify-center mb-6">
        {/* Compass Circle */}
        <div className="w-64 h-64 rounded-full border-4 border-gray-300 flex items-center justify-center relative bg-gray-50">
          {/* Cardinal Directions */}
          <span className="absolute top-0 left-1/2 -translate-x-1/2 text-gray-600">N</span>
          <span className="absolute bottom-0 left-1/2 -translate-x-1/2 text-gray-600">S</span>
          <span className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-600">W</span>
          <span className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-600">E</span>

          {/* Compass Needle */}
          <div
            className="absolute w-2 h-28 bg-red-500 rounded-full origin-bottom"
            style={needleStyle}
          >
            <div className="absolute top-0 w-2 h-12 bg-red-700 rounded-t-full" />
          </div>
        </div>
      </div>

      {/* Heading Display */}
      <div className="text-center mb-4">
        <p className="text-lg font-semibold">
          Heading: {isManual ? manualHeading : heading || 'N/A'}°
        </p>
        <p className="text-gray-600">
          Direction: {isManual ? getCardinalDirection(manualHeading) : heading ? getCardinalDirection(heading) : 'N/A'}
        </p>
      </div>

      {/* Manual Mode Controls */}
      {isManual && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Manual Heading (0-360°)
          </label>
          <input
            type="range"
            min="0"
            max="360"
            value={manualHeading}
            onChange={(e) => setManualHeading(Number(e.target.value))}
            className="w-full"
          />
          <input
            type="number"
            min="0"
            max="360"
            value={manualHeading}
            onChange={(e) => setManualHeading(Math.min(360, Math.max(0, Number(e.target.value))))}
            className="mt-2 w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      {/* Toggle Manual Mode */}
      <div className="flex justify-center mb-4">
        <button
          onClick={() => setIsManual(!isManual)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          {isManual ? 'Try Device Mode' : 'Switch to Manual Mode'}
        </button>
      </div>

      {/* Error Message */}
      {error && <p className="text-sm text-red-600 text-center">{error}</p>}

      <p className="text-xs text-gray-500 mt-4 text-center">
        Note: Device mode requires a compatible device with orientation sensors and
        permission. Manual mode available as fallback.
      </p>
    </div>
  );
};

export default VirtualCompassTool;