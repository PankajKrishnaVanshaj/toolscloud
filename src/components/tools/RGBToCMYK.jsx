// app/components/RGBToCMYK.jsx
'use client';

import React, { useState, useEffect } from 'react';

const RGBToCMYK = () => {
  const [rgb, setRgb] = useState({ r: 255, g: 107, b: 107 });
  const [hex, setHex] = useState('#FF6B6B');
  const [cmyk, setCmyk] = useState({ c: 0, m: 0, y: 0, k: 0 });

  // Convert RGB to HEX
  const rgbToHex = (r, g, b) => {
    return '#' + [r, g, b].map(x => {
      const hex = Math.round(x).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('').toUpperCase();
  };

  // Convert HEX to RGB
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  };

  // Convert RGB to CMYK
  const rgbToCmyk = (r, g, b) => {
    r = r / 255; g = g / 255; b = b / 255;
    const k = 1 - Math.max(r, g, b);
    if (k === 1) return { c: 0, m: 0, y: 0, k: 100 }; // Pure black
    const c = (1 - r - k) / (1 - k);
    const m = (1 - g - k) / (1 - k);
    const y = (1 - b - k) / (1 - k);
    return {
      c: Math.round(c * 100),
      m: Math.round(m * 100),
      y: Math.round(y * 100),
      k: Math.round(k * 100)
    };
  };

  // Update state based on RGB input
  const handleRgbChange = (channel, value) => {
    const newRgb = { ...rgb, [channel]: Math.max(0, Math.min(255, parseInt(value) || 0)) };
    setRgb(newRgb);
    setHex(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
  };

  // Update state based on HEX input
  const handleHexChange = (value) => {
    setHex(value);
    if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
      const newRgb = hexToRgb(value);
      setRgb(newRgb);
    }
  };

  // Update CMYK whenever RGB changes
  useEffect(() => {
    const newCmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);
    setCmyk(newCmyk);
  }, [rgb]);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          RGB to CMYK Converter
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                HEX Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={hex}
                  onChange={(e) => handleHexChange(e.target.value)}
                  className="w-12 h-12 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={hex}
                  onChange={(e) => handleHexChange(e.target.value)}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 uppercase"
                  placeholder="#FF6B6B"
                />
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-2">RGB Input</h2>
              <div className="space-y-4">
                {['r', 'g', 'b'].map(channel => (
                  <div key={channel}>
                    <label className="block text-sm text-gray-600 capitalize">
                      {channel}: {rgb[channel]}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="255"
                      value={rgb[channel]}
                      onChange={(e) => handleRgbChange(channel, e.target.value)}
                      className="w-full"
                      style={{ accentColor: channel === 'r' ? 'red' : channel === 'g' ? 'green' : 'blue' }}
                    />
                    <input
                      type="number"
                      min="0"
                      max="255"
                      value={rgb[channel]}
                      onChange={(e) => handleRgbChange(channel, e.target.value)}
                      className="w-full p-1 border rounded focus:ring-2 focus:ring-blue-500 mt-1"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Result Section */}
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-2">Color Preview</h2>
              <div
                className="w-full h-24 rounded-lg shadow-inner mb-2"
                style={{ backgroundColor: hex }}
              />
              <p className="text-sm text-center">
                HEX: {hex}
                <button
                  onClick={() => navigator.clipboard.writeText(hex)}
                  className="ml-2 text-blue-500 hover:underline text-xs"
                >
                  Copy
                </button>
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-2">CMYK Result</h2>
              <div className="grid grid-cols-2 gap-2">
                {['c', 'm', 'y', 'k'].map(channel => (
                  <div key={channel}>
                    <label className="block text-sm text-gray-600 capitalize">
                      {channel === 'c' ? 'Cyan' : channel === 'm' ? 'Magenta' : channel === 'y' ? 'Yellow' : 'Black'} (%)
                    </label>
                    <input
                      type="number"
                      value={cmyk[channel]}
                      className="w-full p-1 border rounded bg-gray-100"
                      disabled
                    />
                  </div>
                ))}
              </div>
              <p className="text-sm mt-2">
                CMYK: {cmyk.c}%, {cmyk.m}%, {cmyk.y}%, {cmyk.k}%
                <button
                  onClick={() => navigator.clipboard.writeText(`${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%`)}
                  className="ml-2 text-blue-500 hover:underline text-xs"
                >
                  Copy
                </button>
              </p>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">About RGB to CMYK Conversion</h2>
          <div className="text-sm text-gray-700">
            <p>Converts RGB (screen colors) to CMYK (print colors):</p>
            <ul className="list-disc ml-5 mt-1">
              <li>RGB: Red, Green, Blue (0-255)</li>
              <li>CMYK: Cyan, Magenta, Yellow, Key/Black (0-100%)</li>
              <li>Uses standard formula: C = (1-R-K)/(1-K), etc.</li>
            </ul>
            <p className="mt-1">Note: Actual print results may vary due to color profiles and device differences.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RGBToCMYK;