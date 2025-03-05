// app/components/CMYKToRGB.jsx
'use client';

import React, { useState, useEffect } from 'react';

const CMYKToRGB = () => {
  const [cmyk, setCmyk] = useState({ c: 0, m: 0, y: 0, k: 0 });
  const [rgb, setRgb] = useState({ r: 0, g: 0, b: 0 });
  const [hex, setHex] = useState('#000000');

  // Convert CMYK to RGB
  const cmykToRgb = (c, m, y, k) => {
    // Normalize CMYK values from percentage (0-100) to 0-1 range
    c = c / 100;
    m = m / 100;
    y = y / 100;
    k = k / 100;

    // CMYK to RGB conversion formula
    const r = 255 * (1 - c) * (1 - k);
    const g = 255 * (1 - m) * (1 - k);
    const b = 255 * (1 - y) * (1 - k);

    return {
      r: Math.round(r),
      g: Math.round(g),
      b: Math.round(b)
    };
  };

  // Convert RGB to HEX
  const rgbToHex = (r, g, b) => {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('').toUpperCase();
  };

  // Update RGB and HEX when CMYK changes
  useEffect(() => {
    const newRgb = cmykToRgb(cmyk.c, cmyk.m, cmyk.y, cmyk.k);
    setRgb(newRgb);
    setHex(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
  }, [cmyk]);

  // Handle CMYK input changes
  const handleCmykChange = (channel, value) => {
    const numValue = Math.max(0, Math.min(100, parseInt(value) || 0));
    setCmyk(prev => ({ ...prev, [channel]: numValue }));
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          CMYK to RGB Converter
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* CMYK Input */}
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-2">CMYK Values</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {['c', 'm', 'y', 'k'].map(channel => (
                  <div key={channel}>
                    <label className="block text-sm text-gray-600 capitalize">
                      {channel === 'c' ? 'Cyan' : channel === 'm' ? 'Magenta' : channel === 'y' ? 'Yellow' : 'Black'} (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={cmyk[channel]}
                      onChange={(e) => handleCmykChange(channel, e.target.value)}
                      className="w-full p-1 border rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RGB and HEX Output */}
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-2">Converted Color</h2>
              <div
                className="w-full h-24 rounded-lg shadow-inner mb-2"
                style={{ backgroundColor: hex }}
              />
              <div className="space-y-2 text-sm">
                <p>
                  RGB: {rgb.r}, {rgb.g}, {rgb.b}
                  <button
                    onClick={() => navigator.clipboard.writeText(`${rgb.r}, ${rgb.g}, ${rgb.b}`)}
                    className="ml-2 text-blue-500 hover:underline text-xs"
                  >
                    Copy
                  </button>
                </p>
                <p>
                  HEX: {hex}
                  <button
                    onClick={() => navigator.clipboard.writeText(hex)}
                    className="ml-2 text-blue-500 hover:underline text-xs"
                  >
                    Copy
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">About CMYK to RGB Conversion</h2>
          <div className="text-sm text-gray-700">
            <p>Converts CMYK (print color model) to RGB (screen color model):</p>
            <ul className="list-disc ml-5 mt-1">
              <li>CMYK: Cyan, Magenta, Yellow, Key/Black (0-100%)</li>
              <li>RGB: Red, Green, Blue (0-255)</li>
              <li>Formula: R = 255 × (1-C) × (1-K), etc.</li>
            </ul>
            <p className="mt-1">Note: Conversion assumes a simple subtractive model; actual results may vary with color profiles.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CMYKToRGB;