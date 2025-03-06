// components/VirtualBubbleLevel.js
'use client';

import React, { useState, useEffect, useRef } from 'react';

const VirtualBubbleLevel = () => {
  const [angleX, setAngleX] = useState(0); // Tilt left/right
  const [angleY, setAngleY] = useState(0); // Tilt forward/back
  const [hasPermission, setHasPermission] = useState(false);
  const containerRef = useRef(null);

  // Request device orientation permission (mobile devices)
  const requestOrientationPermission = async () => {
    if (typeof DeviceOrientationEvent !== 'undefined' && 
        typeof DeviceOrientationEvent.requestPermission === 'function') {
      try {
        const permission = await DeviceOrientationEvent.requestPermission();
        if (permission === 'granted') {
          setHasPermission(true);
          window.addEventListener('deviceorientation', handleOrientation);
        }
      } catch (error) {
        console.error('Permission denied', error);
      }
    } else {
      // Fallback for browsers that don't require permission
      setHasPermission(true);
      window.addEventListener('deviceorientation', handleOrientation);
    }
  };

  // Handle device orientation
  const handleOrientation = (event) => {
    const beta = event.beta || 0;  // X-axis (front-back tilt)
    const gamma = event.gamma || 0; // Y-axis (left-right tilt)
    setAngleX(Math.min(Math.max(gamma, -45), 45)); // Limit to ±45°
    setAngleY(Math.min(Math.max(beta, -45), 45));
  };

  // Fallback: Mouse movement for desktop
  const handleMouseMove = (e) => {
    if (containerRef.current && !hasPermission) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      setAngleX((x / rect.width) * 90); // Scale to ±45°
      setAngleY((y / rect.height) * 90);
    }
  };

  // Clean up event listener
  useEffect(() => {
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);

  // Calculate bubble position
  const bubbleX = (angleX / 45) * 50; // Convert to percentage (-50 to 50)
  const bubbleY = (angleY / 45) * 50;

  const isLevel = Math.abs(angleX) < 2 && Math.abs(angleY) < 2;

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Virtual Bubble Level</h1>

      <div className="space-y-4">
        {/* Level Container */}
        <div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          className="relative w-full h-64 bg-gray-200 rounded-lg overflow-hidden border-2 border-gray-400"
        >
          {/* Grid Lines */}
          <div className="absolute inset-0 flex justify-center items-center">
            <div className="w-px h-full bg-gray-400"></div>
            <div className="h-px w-full bg-gray-400 absolute"></div>
          </div>

          {/* Bubble */}
          <div
            className={`absolute w-12 h-12 rounded-full transition-all duration-100 ${
              isLevel ? 'bg-green-500' : 'bg-blue-500'
            }`}
            style={{
              left: `calc(50% + ${bubbleX}% - 1.5rem)`,
              top: `calc(50% + ${bubbleY}% - 1.5rem)`,
            }}
          ></div>
        </div>

        {/* Readings */}
        <div className="text-center">
          <p className="text-sm">
            X-Axis (Left/Right): <span className="font-medium">{angleX.toFixed(1)}°</span>
          </p>
          <p className="text-sm">
            Y-Axis (Front/Back): <span className="font-medium">{angleY.toFixed(1)}°</span>
          </p>
          <p className="text-sm mt-2">
            Status: <span className={`font-medium ${isLevel ? 'text-green-600' : 'text-red-600'}`}>
              {isLevel ? 'Level' : 'Not Level'}
            </span>
          </p>
        </div>

        {/* Permission Button */}
        {!hasPermission && (
          <button
            onClick={requestOrientationPermission}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Use Device Orientation (Mobile)
          </button>
        )}

        {/* Instructions */}
        <p className="text-xs text-gray-500 mt-4">
          {hasPermission
            ? 'Tilt your device to move the bubble.'
            : 'Move your mouse over the square to simulate tilt, or click the button on mobile to use device orientation.'}
        </p>
      </div>
    </div>
  );
};

export default VirtualBubbleLevel;