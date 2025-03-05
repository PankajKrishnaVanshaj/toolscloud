// app/components/ColorTemperatureConverter.jsx
'use client';

import React, { useState, useEffect } from 'react';

const ColorTemperatureConverter = () => {
  const [kelvin, setKelvin] = useState(6500); // Default to daylight
  const [hex, setHex] = useState('');
  const [rgb, setRgb] = useState({ r: 0, g: 0, b: 0 });

  // Convert Kelvin to RGB (approximation based on black-body radiation)
  const kelvinToRgb = (temp) => {
    temp = Math.max(1000, Math.min(40000, temp)); // Limit range: 1000K to 40000K
    temp /= 100;

    let r, g, b;

    // Red
    if (temp <= 66) {
      r = 255;
    } else {
      r = 329.698727446 * Math.pow(temp - 60, -0.1332047592);
      r = Math.max(0, Math.min(255, r));
    }

    // Green
    if (temp <= 66) {
      g = 99.4708025861 * Math.log(temp) - 161.1195681661;
    } else {
      g = 288.1221695283 * Math.pow(temp - 60, -0.0755148492);
    }
    g = Math.max(0, Math.min(255, g));

    // Blue
    if (temp >= 66) {
      b = 255;
    } else if (temp <= 19) {
      b = 0;
    } else {
      b = 138.5177312231 * Math.log(temp - 10) - 305.0447927307;
    }
    b = Math.max(0, Math.min(255, b));

    return { r: Math.round(r), g: Math.round(g), b: Math.round(b) };
  };

  // Convert RGB to HEX
  const rgbToHex = (r, g, b) => {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('').toUpperCase();
  };

  // Update color values when Kelvin changes
  useEffect(() => {
    const rgbValue = kelvinToRgb(kelvin);
    setRgb(rgbValue);
    setHex(rgbToHex(rgbValue.r, rgbValue.g, rgbValue.b));
  }, [kelvin]);

  // Handle Kelvin input change
  const handleKelvinChange = (value) => {
    const num = parseInt(value) || 0;
    setKelvin(Math.max(1000, Math.min(40000, num)));
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Color Temperature Converter
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Input */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color Temperature (Kelvin)
              </label>
              <input
                type="number"
                value={kelvin}
                onChange={(e) => handleKelvinChange(e.target.value)}
                min="1000"
                max="40000"
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                placeholder="1000 - 40000"
              />
              <p className="text-xs text-gray-500 mt-1">
                Range: 1000K (warm) to 40000K (cool)
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-2">Preview</h2>
              <div
                className="h-32 rounded-lg shadow-inner flex items-center justify-center text-white text-lg font-medium"
                style={{ backgroundColor: hex }}
              >
                {kelvin}K
              </div>
            </div>
          </div>

          {/* Result */}
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-2">Converted Color</h2>
              <div className="space-y-3">
                <p className="text-sm">
                  HEX: {hex}
                  <button
                    onClick={() => navigator.clipboard.writeText(hex)}
                    className="ml-2 text-blue-500 hover:underline text-xs"
                  >
                    Copy
                  </button>
                </p>
                <p className="text-sm">
                  RGB: {rgb.r}, {rgb.g}, {rgb.b}
                  <button
                    onClick={() => navigator.clipboard.writeText(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`)}
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
          <h2 className="text-lg font-semibold mb-2">About Color Temperature</h2>
          <div className="text-sm text-gray-700">
            <p>Converts Kelvin temperature to RGB/HEX based on black-body radiation:</p>
            <ul className="list-disc ml-5 mt-1">
              <li>1000K-2000K: Warm (candlelight, incandescent)</li>
              <li>3000K-4000K: Neutral (warm white, halogen)</li>
              <li>5000K-6500K: Cool (daylight)</li>
              <li>7000K+: Very cool (overcast sky)</li>
            </ul>
            <p className="mt-1">Note: This is an approximation; actual color may vary slightly.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorTemperatureConverter;