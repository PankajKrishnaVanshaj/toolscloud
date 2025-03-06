// components/ScreenResolutionTester.js
'use client';

import React, { useState, useEffect } from 'react';

const ScreenResolutionTester = () => {
  const [screenInfo, setScreenInfo] = useState({
    screenWidth: 0,
    screenHeight: 0,
    windowWidth: 0,
    windowHeight: 0,
    pixelRatio: 0,
    colorDepth: 0,
  });

  const updateScreenInfo = () => {
    setScreenInfo({
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      pixelRatio: window.devicePixelRatio,
      colorDepth: window.screen.colorDepth,
    });
  };

  useEffect(() => {
    // Initial update
    updateScreenInfo();

    // Add resize event listener
    window.addEventListener('resize', updateScreenInfo);

    // Cleanup
    return () => window.removeEventListener('resize', updateScreenInfo);
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Screen Resolution Tester</h1>

      <div className="space-y-6">
        {/* Screen Resolution */}
        <div className="bg-gray-50 p-4 rounded-md">
          <h2 className="text-lg font-semibold mb-2 text-center text-blue-600">
            Display Information
          </h2>
          <div className="grid grid-cols-1 gap-2 text-sm">
            <p>
              <span className="font-medium">Screen Resolution:</span> 
              {` ${screenInfo.screenWidth} x ${screenInfo.screenHeight} pixels`}
            </p>
            <p>
              <span className="font-medium">Window Size:</span> 
              {` ${screenInfo.windowWidth} x ${screenInfo.windowHeight} pixels`}
            </p>
            <p>
              <span className="font-medium">Device Pixel Ratio:</span> 
              {` ${screenInfo.pixelRatio}x`}
            </p>
            <p>
              <span className="font-medium">Color Depth:</span> 
              {` ${screenInfo.colorDepth} bits`}
            </p>
          </div>
        </div>

        {/* Visual Test Area */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Resolution Test Area
          </h3>
          <div 
            className="w-full h-32 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center text-gray-500"
            style={{ 
              backgroundImage: 'linear-gradient(45deg, #eee 25%, transparent 25%), linear-gradient(-45deg, #eee 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #eee 75%), linear-gradient(-45deg, transparent 75%, #eee 75%)',
              backgroundSize: '20px 20px',
              backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
            }}
          >
            Resize your window to see changes
          </div>
        </div>

        {/* Refresh Button */}
        <div className="flex justify-center">
          <button
            onClick={updateScreenInfo}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
          >
            Refresh
          </button>
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-6 text-center">
        Note: Window size updates in real-time as you resize your browser. Screen resolution is your device's full display size.
      </p>
    </div>
  );
};

export default ScreenResolutionTester;