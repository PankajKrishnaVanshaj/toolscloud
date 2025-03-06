// components/BrowserCompatibilityChecker.js
'use client';

import React, { useState, useEffect } from 'react';

const BrowserCompatibilityChecker = () => {
  const [browserInfo, setBrowserInfo] = useState(null);
  const [compatibility, setCompatibility] = useState(null);

  const detectBrowser = () => {
    const ua = navigator.userAgent;
    let browserName = 'Unknown';
    let version = 'Unknown';

    // Browser detection logic
    if (/chrome|crios/i.test(ua) && !/opr|edge/i.test(ua)) {
      browserName = 'Chrome';
      const match = ua.match(/Chrome\/(\d+\.\d+)/i);
      version = match ? match[1] : 'Unknown';
    } else if (/firefox|fxios/i.test(ua)) {
      browserName = 'Firefox';
      const match = ua.match(/Firefox\/(\d+\.\d+)/i);
      version = match ? match[1] : 'Unknown';
    } else if (/safari/i.test(ua) && !/chrome|crios/i.test(ua)) {
      browserName = 'Safari';
      const match = ua.match(/Version\/(\d+\.\d+)/i);
      version = match ? match[1] : 'Unknown';
    } else if (/opr/i.test(ua)) {
      browserName = 'Opera';
      const match = ua.match(/OPR\/(\d+\.\d+)/i);
      version = match ? match[1] : 'Unknown';
    } else if (/edg/i.test(ua)) {
      browserName = 'Edge';
      const match = ua.match(/Edg\/(\d+\.\d+)/i);
      version = match ? match[1] : 'Unknown';
    } else if (/msie|trident/i.test(ua)) {
      browserName = 'Internet Explorer';
      const match = ua.match(/(?:MSIE |rv:)(\d+\.\d+)/i);
      version = match ? match[1] : 'Unknown';
    }

    setBrowserInfo({ name: browserName, version });

    // Basic compatibility checks
    const features = {
      webGL: !!window.WebGLRenderingContext,
      localStorage: !!window.localStorage,
      serviceWorkers: 'serviceWorker' in navigator,
      webSockets: !!window.WebSocket,
      fetchAPI: !!window.fetch,
      cssGrid: CSS.supports('display', 'grid'),
      es6Modules: 'noModule' in HTMLScriptElement.prototype,
    };

    setCompatibility(features);
  };

  useEffect(() => {
    detectBrowser();
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Browser Compatibility Checker</h1>

      {browserInfo && (
        <div className="space-y-6">
          {/* Browser Info */}
          <div className="bg-gray-50 p-4 rounded-md">
            <h2 className="text-lg font-semibold mb-2 text-center text-blue-600">
              Your Browser
            </h2>
            <p className="text-center">
              <span className="font-medium">Name:</span> {browserInfo.name}
            </p>
            <p className="text-center">
              <span className="font-medium">Version:</span> {browserInfo.version}
            </p>
          </div>

          {/* Compatibility Features */}
          {compatibility && (
            <div className="bg-gray-50 p-4 rounded-md">
              <h2 className="text-lg font-semibold mb-3 text-center">Feature Support</h2>
              <ul className="grid grid-cols-1 gap-2 text-sm">
                {Object.entries(compatibility).map(([feature, supported]) => (
                  <li key={feature} className="flex items-center justify-between">
                    <span>{feature.replace(/([A-Z])/g, ' $1').trim()}:</span>
                    <span className={supported ? 'text-green-600' : 'text-red-600'}>
                      {supported ? '✓ Supported' : '✗ Not Supported'}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {!browserInfo && (
        <p className="text-center text-gray-500">
          Detecting your browser...
        </p>
      )}

      <p className="text-xs text-gray-500 mt-6 text-center">
        Note: This tool provides basic browser detection and feature checks. 
        Some results may vary based on browser settings or extensions.
      </p>

      <div className="mt-4 flex justify-center">
        <button
          onClick={detectBrowser}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
        >
          Refresh Detection
        </button>
      </div>
    </div>
  );
};

export default BrowserCompatibilityChecker;