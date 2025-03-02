'use client';

import React, { useState } from 'react';

const ResolutionConverter = () => {
  const [widthPx, setWidthPx] = useState('');
  const [heightPx, setHeightPx] = useState('');
  const [dpi, setDpi] = useState('96'); // Default DPI for web
  const [unit, setUnit] = useState('in'); // Default physical unit

  // Conversion factors to inches
  const lengthConversion = {
    in: 1,
    cm: 0.393701,
    mm: 0.0393701
  };

  const lengthDisplayNames = {
    in: 'inches (in)',
    cm: 'centimeters (cm)',
    mm: 'millimeters (mm)'
  };

  const calculatePhysicalSize = () => {
    if (!widthPx || !heightPx || !dpi || isNaN(widthPx) || isNaN(heightPx) || isNaN(dpi)) {
      return null;
    }

    const widthInches = widthPx / dpi;
    const heightInches = heightPx / dpi;

    return {
      in: { width: widthInches, height: heightInches },
      cm: { width: widthInches * lengthConversion.cm, height: heightInches * lengthConversion.cm },
      mm: { width: widthInches * lengthConversion.mm, height: heightInches * lengthConversion.mm }
    };
  };

  const calculateAspectRatio = () => {
    if (!widthPx || !heightPx || isNaN(widthPx) || isNaN(heightPx)) return null;
    
    const gcd = (a, b) => b ? gcd(b, a % b) : a;
    const divisor = gcd(widthPx, heightPx);
    return `${widthPx / divisor}:${heightPx / divisor}`;
  };

  const calculatePixelCount = () => {
    if (!widthPx || !heightPx || isNaN(widthPx) || isNaN(heightPx)) return null;
    return widthPx * heightPx;
  };

  const physicalSize = calculatePhysicalSize();
  const aspectRatio = calculateAspectRatio();
  const pixelCount = calculatePixelCount();

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Resolution Converter
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Width (px)
              </label>
              <input
                type="number"
                value={widthPx}
                onChange={(e) => setWidthPx(e.target.value)}
                placeholder="Enter width"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Height (px)
              </label>
              <input
                type="number"
                value={heightPx}
                onChange={(e) => setHeightPx(e.target.value)}
                placeholder="Enter height"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                DPI
              </label>
              <input
                type="number"
                value={dpi}
                onChange={(e) => setDpi(e.target.value)}
                placeholder="Enter DPI"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Unit Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Physical Unit
            </label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.keys(lengthConversion).map((u) => (
                <option key={u} value={u}>{lengthDisplayNames[u]}</option>
              ))}
            </select>
          </div>

          {/* Results Section */}
          {(widthPx || heightPx) && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 bg-gray-50 rounded-md">
                <h2 className="text-lg font-semibold mb-2">Resolution Info:</h2>
                <div className="space-y-2 text-sm">
                  <p>Resolution: {widthPx} × {heightPx} px</p>
                  {pixelCount && <p>Total Pixels: {pixelCount.toLocaleString()} px</p>}
                  {aspectRatio && <p>Aspect Ratio: {aspectRatio}</p>}
                </div>
              </div>

              {physicalSize && (
                <div className="p-4 bg-blue-50 rounded-md">
                  <h2 className="text-lg font-semibold mb-2">Physical Size:</h2>
                  <div className="space-y-2 text-sm">
                    <p>
                      {lengthDisplayNames[unit]}: {physicalSize[unit].width.toFixed(2)} ×{' '}
                      {physicalSize[unit].height.toFixed(2)}
                    </p>
                    <p>PPI/DPI: {dpi}</p>
                    <p className="text-gray-600">
                      Diagonal: {Math.sqrt(
                        physicalSize[unit].width ** 2 + physicalSize[unit].height ** 2
                      ).toFixed(2)} {unit}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-6 text-sm text-gray-600">
          <details>
            <summary className="cursor-pointer font-medium">Useful Information</summary>
            <ul className="list-disc list-inside mt-2">
              <li>Common DPI: Web (96), Print (300)</li>
              <li>1 in = 2.54 cm = 25.4 mm</li>
              <li>Physical Size = Pixels ÷ DPI</li>
              <li>Common ratios: 16:9, 4:3, 1:1</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default ResolutionConverter;